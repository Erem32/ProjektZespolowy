# backend/app/routers/rooms.py
from typing import List
from fastapi import APIRouter, HTTPException
from sqlalchemy import select, insert, update
from app.database import database
from app.models import Room, User, Square
from app.schemas import (
    RoomCreate,
    RoomOut,
    JoinRoomRequest,
    JoinRoomResponse,
    SquareOut,
    ClaimSquareRequest,
    ClaimSquareResponse,
)
import hashlib, random

router = APIRouter(prefix="/rooms", tags=["rooms"])

# Simple palette for new users
COLORS = [
    "#e6194b", "#3cb44b", "#ffe119", "#4363d8",
    "#f58231", "#911eb4", "#46f0f0", "#f032e6"
]

def hash_pw(plain: str) -> str:
    return hashlib.sha256(plain.encode()).hexdigest()

def pick_random_color() -> str:
    return random.choice(COLORS)


@router.post("", response_model=RoomOut)
async def create_room(payload: RoomCreate):
    """
    Tworzy nowy pokój z nazwą i hasłem, 
    a następnie generuje 25 pustych pól do gry.
    """
    hashed = hash_pw(payload.password)
    # 1) Create the room
    result = await database.execute(insert(Room).values(
        name=payload.name, password=hashed
    ))
    room_id = int(result)

    # 2) Generate a 5×5 board: squares with indexes 0..24
    squares_to_insert = [
        {"room_id": room_id, "index": idx, "owner_id": None}
        for idx in range(25)
    ]
    await database.execute_many(
        insert(Square),
        squares_to_insert
    )

    return RoomOut(id=room_id, name=payload.name)

@router.get("", response_model=List[RoomOut])
async def list_rooms():
    rows = await database.fetch_all(select(Room.id, Room.name))
    return [RoomOut(id=r["id"], name=r["name"]) for r in rows]


@router.post("/{room_id}/join", response_model=JoinRoomResponse)
async def join_room(room_id: int, payload: JoinRoomRequest):
    room = await database.fetch_one(select(Room).where(Room.id == room_id))
    if not room:
        raise HTTPException(404, "Pokój nie istnieje")

    if hash_pw(payload.password) != room["password"]:
        raise HTTPException(403, "Nieprawidłowe hasło")

    user = await database.fetch_one(select(User).where(User.id == payload.user_id))
    if not user:
        raise HTTPException(404, "Użytkownik nie istnieje")

    color = user["color"]
    if not color:
        color = pick_random_color()
        await database.execute(
            update(User)
            .where(User.id == payload.user_id)
            .values(color=color)
        )

    return JoinRoomResponse(color=color)


@router.get("/{room_id}/squares", response_model=list[SquareOut])
async def list_squares(room_id: int):
    """
    Return all squares for a room, including who (if anyone) owns it and that user's color.
    """
    # build a select that LEFT OUTER JOINs User onto Square
    query = (
        select(
            Square.id,
            Square.index,
            Square.owner_id,
            User.color
        )
        .select_from(Square)                                # from squares
        .outerjoin(User, Square.owner_id == User.id)       # left join users
        .where(Square.room_id == room_id)
        .order_by(Square.index)
    )
    rows = await database.fetch_all(query)
    return [
        SquareOut(
            id=r["id"],
            index=r["index"],
            owner_id=r["owner_id"],
            color=r["color"],
        )
        for r in rows
    ]

@router.post("/{room_id}/squares/{square_index}/claim", response_model=ClaimSquareResponse)
async def claim_square(room_id: int, square_index: int, payload: ClaimSquareRequest):
    # verify room
    room = await database.fetch_one(select(Room).where(Room.id == room_id))
    if not room:
        raise HTTPException(404, "Pokój nie istnieje")

    # fetch the square by index
    sq = await database.fetch_one(
        select(Square).where(
            Square.room_id == room_id,
            Square.index == square_index
        )
    )
    if not sq:
        raise HTTPException(404, "Kwadrat nie istnieje")

    if sq["owner_id"] is not None:
        raise HTTPException(409, "Kwadrat już zajęty")

    # claim it
    await database.execute(
        update(Square)
        .where(Square.id == sq["id"])
        .values(owner_id=payload.user_id)
    )

    # get user’s color
    user = await database.fetch_one(
        select(User).where(User.id == payload.user_id)
    )
    if not user:
        raise HTTPException(404, "Użytkownik nie istnieje")

    return ClaimSquareResponse(
        id=sq["id"],
        index=sq["index"],
        owner_id=payload.user_id,
        color=user["color"],
    )
