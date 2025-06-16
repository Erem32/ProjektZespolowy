# backend/app/routers/rooms.py
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from sqlalchemy import select, insert, update, func, outerjoin
from app.database import database
from app.models import Room, User, Square, Challenge, RoomUser
from app.schemas import (
    RoomCreate,
    RoomOut,
    JoinRoomRequest,
    JoinRoomResponse,
    SquareOut,
    ClaimSquareRequest,
    ClaimSquareResponse,
    RoomDetail,
    Player
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
    Tworzy nowy pokój z nazwą, hasłem i kategorią,
    a następnie wypełnia planszę 25 losowymi wyzwaniami z danej kategorii.
    """
    # 1) Create room with category
    hashed = hash_pw(payload.password)
    result = await database.execute(
        insert(Room).values(
            name=payload.name,
            password=hashed,
            category=payload.category
        )
    )
    room_id = int(result)

    # 2) Fetch all challenges for that category, shuffle and pick 25
    all_chals = await database.fetch_all(
        select(Challenge).where(Challenge.category == payload.category)
    )
    random.shuffle(all_chals)
    selected = all_chals[:25]

    # 3) Insert each as a square with its text
    squares_to_insert = [
        {
            "room_id": room_id,
            "index": idx,
            "owner_id": None,
            "text": selected[idx]["text"]
        }
        for idx in range(len(selected))
    ]
    await database.execute_many(insert(Square), squares_to_insert)

    return RoomOut(id=room_id, name=payload.name, players=0)


@router.get("", response_model=List[RoomOut])
async def list_rooms():
    q = (
        select(
            Room.id,
            Room.name,
            func.count(RoomUser.user_id).label("players")
        )
        .outerjoin(RoomUser, Room.id == RoomUser.room_id)
        .group_by(Room.id, Room.name)
    )
    rows = await database.fetch_all(q)
    return [
        RoomOut(id=r["id"], name=r["name"], players=r["players"])
        for r in rows
    ]


@router.post("/{room_id}/join", response_model=JoinRoomResponse)
async def join_room(room_id: int, payload: JoinRoomRequest):
    # 1) Verify room exists
    room = await database.fetch_one(select(Room).where(Room.id == room_id))
    if not room:
        raise HTTPException(404, "Pokój nie istnieje")

    # 2) Verify password
    if hash_pw(payload.password) != room["password"]:
        raise HTTPException(403, "Nieprawidłowe hasło")

    # 3) Verify user exists
    user = await database.fetch_one(select(User).where(User.id == payload.user_id))
    if not user:
        raise HTTPException(404, "Użytkownik nie istnieje")

    # 4) If user already in this room, let them rejoin regardless of count
    exists = await database.fetch_one(
        select(RoomUser).where(
            RoomUser.room_id == room_id,
            RoomUser.user_id == payload.user_id
        )
    )
    if exists:
        # Ensure they have a color
        color = user["color"]
        return JoinRoomResponse(color=color)

    # 5) Count current players and enforce limit
    cnt = await database.fetch_one(
        select(func.count()).select_from(RoomUser)
         .where(RoomUser.room_id == room_id)
    )
    if cnt[0] >= 4:
        raise HTTPException(409, "Pokój jest pełny (max 4 graczy)")

    # 6) Assign color if missing
    color = user["color"]
    if not color:
        color = pick_random_color()
        await database.execute(
            update(User)
            .where(User.id == payload.user_id)
            .values(color=color)
        )

    # 7) Add user to room
    await database.execute(
        insert(RoomUser).values(
            room_id=room_id,
            user_id=payload.user_id
        )
    )

    return JoinRoomResponse(color=color)


@router.get("/{room_id}/squares", response_model=List[SquareOut])
async def list_squares(room_id: int):
    query = (
        select(
            Square.id,
            Square.index,
            Square.owner_id,
            User.color,
            Square.text
        )
        .select_from(Square)
        .outerjoin(User, Square.owner_id == User.id)
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
            text=r["text"],
        )
        for r in rows
    ]


WIN_PATTERNS: List[List[int]] = [
    # rows
    [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14],
    [15,16,17,18,19], [20,21,22,23,24],
    # columns
    [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22],
    [3,8,13,18,23], [4,9,14,19,24],
    # diagonals
    [0,6,12,18,24], [4,8,12,16,20],
]


async def check_win(room_id: int, user_id: int) -> Optional[List[int]]:
    rows = await database.fetch_all(
        select(Square.index)
        .where(Square.room_id == room_id, Square.owner_id == user_id)
    )
    claimed = {r["index"] for r in rows}
    for pattern in WIN_PATTERNS:
        if set(pattern).issubset(claimed):
            return pattern
    return None


@router.post("/{room_id}/squares/{square_index}/claim", response_model=ClaimSquareResponse)
async def claim_square(room_id: int, square_index: int, payload: ClaimSquareRequest):
    room = await database.fetch_one(select(Room).where(Room.id == room_id))
    if not room:
        raise HTTPException(404, "Pokój nie istnieje")
    if room["winner_id"] is not None:
        raise HTTPException(409, "Gra zakończona")

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

    await database.execute(
        update(Square)
        .where(Square.id == sq["id"])
        .values(owner_id=payload.user_id)
    )

    user = await database.fetch_one(select(User).where(User.id == payload.user_id))
    if not user:
        raise HTTPException(404, "Użytkownik nie istnieje")

    win_pattern = await check_win(room_id, payload.user_id)
    if win_pattern:
        await database.execute(
            update(Room)
            .where(Room.id == room_id)
            .values(winner_id=payload.user_id)
        )
        win = True
    else:
        win = False

    return ClaimSquareResponse(
        id=sq["id"],
        index=sq["index"],
        owner_id=payload.user_id,
        color=user["color"],
        win=win,
        winning_indices=win_pattern,
    )


@router.get("/{room_id}", response_model=RoomDetail)
async def get_room(room_id: int):
    ru_join = outerjoin(Room, RoomUser, Room.id == RoomUser.room_id)
    full_join = outerjoin(ru_join, User, Room.winner_id == User.id)

    row = await database.fetch_one(
        select(
            Room.id,
            Room.name,
            Room.winner_id,
            User.color.label("winner_color"),
            User.email.label("winner_name"),
            func.count(RoomUser.user_id).label("players_count")
        )
        .select_from(full_join)
        .where(Room.id == room_id)
        .group_by(Room.id, User.color, User.email)
    )
    if not row:
        raise HTTPException(404, "Pokój nie istnieje")

    players_rows = await database.fetch_all(
        select(User.id, User.email, User.color)
        .select_from(RoomUser)
        .join(User, RoomUser.user_id == User.id)
        .where(RoomUser.room_id == room_id)
    )
    players = [
        Player(id=p["id"], email=p["email"], color=p["color"])
        for p in players_rows
    ]

    return RoomDetail(
        id=row["id"],
        name=row["name"],
        winner_id=row["winner_id"],
        winner_color=row["winner_color"],
        winner_name=row["winner_name"],
        players_count=row["players_count"],
        players=players
    )


@router.get("/{room_id}/players", response_model=List[Player])
async def list_players(room_id: int):
    rows = await database.fetch_all(
        select(User.id, User.email, User.color)
        .select_from(RoomUser)
        .join(User, RoomUser.user_id == User.id)
        .where(RoomUser.room_id == room_id)
    )
    return [
        Player(id=r["id"], email=r["email"], color=r["color"])
        for r in rows
    ]
