# backend/app/routers/rooms.py
from fastapi import APIRouter, HTTPException
from sqlalchemy import select, insert, update
from app.database import database
from app.models import Room, User
from app.schemas import RoomCreate, RoomOut, JoinRoomRequest, JoinRoomResponse
import hashlib
import random

router = APIRouter(prefix="/rooms", tags=["rooms"])

# Prosty zestaw kolorów, które losujemy nowym użytkownikom
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
    Tworzy nowy pokój z nazwą i hasłem.
    Zwraca ID i nazwę pokoju.
    """
    hashed = hash_pw(payload.password)
    stmt = insert(Room).values(name=payload.name, password=hashed)
    room_id = await database.execute(stmt)
    return RoomOut(id=room_id, name=payload.name)


@router.get("", response_model=list[RoomOut])
async def list_rooms():
    """
    Zwraca listę wszystkich pokoi (bez haseł!).
    """
    # Pobieramy tylko kolumny id oraz name
    stmt = select(Room.id, Room.name)
    rows = await database.fetch_all(stmt)
    return [RoomOut(id=r["id"], name=r["name"]) for r in rows]


@router.post("/{room_id}/join", response_model=JoinRoomResponse)
async def join_room(room_id: int, payload: JoinRoomRequest):
    """
    Umożliwia dołączenie do pokoju:
      1. Weryfikacja istnienia pokoju
      2. Weryfikacja hasła
      3. Pobranie lub przydzielenie koloru użytkownikowi
    """
    # 1) Pobierz pokój i jego zahaszowane hasło
    q_room = select(Room).where(Room.id == room_id)
    room = await database.fetch_one(q_room)
    if not room:
        raise HTTPException(status_code=404, detail="Pokój nie istnieje")

    # 2) Sprawdź hasło
    if hash_pw(payload.password) != room["password"]:
        raise HTTPException(status_code=403, detail="Nieprawidłowe hasło")

    # 3) Pobierz użytkownika
    q_user = select(User).where(User.id == payload.user_id)
    user = await database.fetch_one(q_user)
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie istnieje")

    # 4) Przydziel kolor (jeśli jeszcze nie ma)
    user_color = user["color"]
    if not user_color:
        user_color = pick_random_color()
        stmt_update = (
            update(User)
            .where(User.id == payload.user_id)
            .values(color=user_color)
        )
        await database.execute(stmt_update)

    return JoinRoomResponse(color=user_color)
