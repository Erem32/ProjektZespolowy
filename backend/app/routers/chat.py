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

    
    #Sprawdzenie czy kwadrat nie jest już zajęty
    if square_index is not None:
        
        square = await database.fetch_one(
            select(Square).where(
                Square.room_id == room_id,
                Square.index == square_index
            )
        )
        if not square:
            raise HTTPException(status_code=404, detail="Pole nie istnieje")
        
        if square["owner_id"] is not None:
            raise HTTPException(status_code=409, detail="Pole zostało już zajęte")
        
        pending = await database.fetch_one(
            select(ChatMessage).where(
                ChatMessage.room_id == room_id,
                ChatMessage.square_index == square_index,
                ChatMessage.status == "pending"
           )
       )
        if pending:
            raise HTTPException(status_code=409, detail="Pole jest już w trakcie weryfikacji")
    
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
#
    record = await database.fetch_one(insert_stmt)


    return ChatMessageRead(
        id=record["id"],
        room_id=record["room_id"],
        user_id=record["user_id"],
        text=record["text"],
        image_path=record["image_path"],
        status=record["status"],
        square_index=record["square_index"],
        user_color=user["color"],     
    )

@router.get("/", response_model=list[ChatMessageRead])
async def list_messages(room_id: int, status: str | None = None):
    # join ChatMessage → User to pull in their color
    stmt = (
        select(ChatMessage, User.color.label("user_color"))
        .join(User, ChatMessage.user_id == User.id)
        .where(ChatMessage.room_id == room_id)
    )
    if status:
        stmt = stmt.where(ChatMessage.status == status)
    stmt = stmt.order_by(ChatMessage.created_at)

    rows = await database.fetch_all(stmt)
    return [
        # combine the row dict with the extra user_color field
        ChatMessageRead.from_orm({**row, "user_color": row["user_color"]})
        for row in rows
    ]


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

# 2a) claim square + win-check (unchanged) …

# 2b) now grab the author’s color
    user = await database.fetch_one(
    select(User.color).where(User.id == updated["user_id"])
)

# 2c) return with user_color


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

    return ChatMessageRead(
    id=updated["id"],
    room_id=updated["room_id"],
    user_id=updated["user_id"],
    text=updated["text"],
    image_path=updated["image_path"],
    status=updated["status"],
    square_index=updated["square_index"],
    user_color=user["color"],
)

