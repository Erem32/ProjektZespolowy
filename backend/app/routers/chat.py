# backend/app/routers/chat.py

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from sqlalchemy import insert, select, update
from app.database import database
from app.models import ChatMessage, Room, User, Square
from app.schemas import ChatMessageRead, ChatMessageUpdate
from app.routers.rooms import check_win
import os
import uuid

router = APIRouter(prefix="/rooms/{room_id}/messages", tags=["chat"])

# katalog na uploady
UPLOAD_DIR = os.path.join(os.getcwd(), "app", "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=ChatMessageRead)
async def send_message(
    room_id: int,
    user_id: int = Form(...),
    text: str | None = Form(None),
    file: UploadFile | None = File(None),
    square_index: int | None = Form(None),
):
    # 1) weryfikacja pokoju i usera
    room = await database.fetch_one(select(Room).where(Room.id == room_id))
    if not room:
        raise HTTPException(status_code=404, detail="Pokój nie istnieje")
    user = await database.fetch_one(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie istnieje")

    # 2) zapis pliku (jeśli jest)
    image_path = None
    if file:
        ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        dest = os.path.join(UPLOAD_DIR, filename)
        with open(dest, "wb") as out_file:
            out_file.write(await file.read())
        image_path = f"/static/uploads/{filename}"

    # 3) wstawienie rekordu z opcjonalnym square_index
    insert_stmt = (
        insert(ChatMessage)
        .values(
            room_id=room_id,
            user_id=user_id,
            text=text,
            image_path=image_path,
            status="pending",
            square_index=square_index,
        )
        .returning(ChatMessage)
    )
    record = await database.fetch_one(insert_stmt)
    return ChatMessageRead.from_orm(record)


@router.get("/", response_model=list[ChatMessageRead])
async def list_messages(room_id: int, status: str | None = None):
    q = select(ChatMessage).where(ChatMessage.room_id == room_id)
    if status:
        q = q.where(ChatMessage.status == status)
    q = q.order_by(ChatMessage.created_at)
    rows = await database.fetch_all(q)
    return [ChatMessageRead.from_orm(r) for r in rows]


@router.patch("/{message_id}", response_model=ChatMessageRead)
async def update_message_status(
    room_id: int,
    message_id: int,
    payload: ChatMessageUpdate,
):
    # 1) znajdź wiadomość
    msg = await database.fetch_one(
        select(ChatMessage).where(
            ChatMessage.id == message_id,
            ChatMessage.room_id == room_id
        )
    )
    if not msg:
        raise HTTPException(status_code=404, detail="Wiadomość nie istnieje w tym pokoju")

    # 2) update statusu
    upd_stmt = (
        update(ChatMessage)
        .where(ChatMessage.id == message_id)
        .values(status=payload.status)
        .returning(ChatMessage)
    )
    updated = await database.fetch_one(upd_stmt)

    # 3) jeśli zatwierdzono i wiadomość miała przypisany square_index → claim pola
    if payload.status == "approved" and updated["square_index"] is not None:
        # oznacz pole w tabeli squares
        await database.execute(
            update(Square)
            .where(
                Square.room_id == room_id,
                Square.index == updated["square_index"]
            )
            .values(owner_id=updated["user_id"])
        )
        # sprawdź, czy to zakończy grę
        win_pattern = await check_win(room_id, updated["user_id"])
        if win_pattern:
            # zapisz zwycięzcę w rooms
            await database.execute(
                update(Room)
                .where(Room.id == room_id)
                .values(winner_id=updated["user_id"])
            )

    return ChatMessageRead.from_orm(updated)
