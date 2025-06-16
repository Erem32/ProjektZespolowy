# backend/app/routers/chat.py
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from sqlalchemy import insert, select, update
from app.database import database
from app.models import ChatMessage, Room, User, Square
from app.schemas import ChatMessageRead, ChatMessageUpdate
from app.routers.rooms import check_win
import os, uuid

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
        raise HTTPException(404, "Pokój nie istnieje")
    user = await database.fetch_one(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(404, "Użytkownik nie istnieje")

    # 2) jeżeli to dowód na pole → sprawdzaj istnienie i stan pola
    if square_index is not None:
        square = await database.fetch_one(
            select(Square).where(
                Square.room_id == room_id,
                Square.index == square_index
            )
        )
        if not square:
            raise HTTPException(404, "Pole nie istnieje")
        if square["owner_id"] is not None:
            raise HTTPException(409, "Pole zostało już zajęte")
        pending = await database.fetch_one(
            select(ChatMessage).where(
                ChatMessage.room_id == room_id,
                ChatMessage.square_index == square_index,
                ChatMessage.status == "pending"
            )
        )
        if pending:
            raise HTTPException(409, "Pole jest już w trakcie weryfikacji")

    # 3) (opcjonalnie) walidacja typu pliku
    if file:
        ctype = file.content_type
        if not (ctype.startswith("image/") or ctype.startswith("video/")):
            raise HTTPException(400, "Tylko pliki graficzne i wideo są wspierane")

    # 4) zapis pliku
    image_path = None
    if file:
        ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        dest = os.path.join(UPLOAD_DIR, filename)
        with open(dest, "wb") as out_f:
            out_f.write(await file.read())
        image_path = f"/static/uploads/{filename}"

    # 5) wstawienie rekordu; status zależy od tego, czy to dowód na pole
    msg_status = "pending" if square_index is not None else "approved"
    insert_stmt = (
        insert(ChatMessage)
        .values(
            room_id=room_id,
            user_id=user_id,
            text=text,
            image_path=image_path,
            status=msg_status,
            square_index=square_index,
        )
        .returning(ChatMessage)
    )
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
    # pobiera wszystkie wiadomości (opcjonalnie filtrowane po statusie)
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
        ChatMessageRead.from_orm({**row, "user_color": row["user_color"]})
        for row in rows
    ]

@router.patch("/{message_id}", response_model=ChatMessageRead)
async def update_message_status(
    room_id: int,
    message_id: int,
    payload: ChatMessageUpdate,
):
    # 1) znajdź wiadomość i zaktualizuj status
    msg = await database.fetch_one(
        select(ChatMessage).where(
            ChatMessage.id == message_id,
            ChatMessage.room_id == room_id
        )
    )
    if not msg:
        raise HTTPException(404, "Wiadomość nie istnieje w tym pokoju")

    upd = await database.fetch_one(
        update(ChatMessage)
        .where(ChatMessage.id == message_id)
        .values(status=payload.status)
        .returning(ChatMessage)
    )

    # 2) jeśli to zatwierdzenie dowodu → przypisz pole i sprawdź zwycięstwo
    if payload.status == "approved" and upd["square_index"] is not None:
        await database.execute(
            update(Square)
            .where(
                Square.room_id == room_id,
                Square.index == upd["square_index"]
            )
            .values(owner_id=upd["user_id"])
        )
        win_pat = await check_win(room_id, upd["user_id"])
        if win_pat:
            await database.execute(
                update(Room)
                .where(Room.id == room_id)
                .values(winner_id=upd["user_id"])
            )

    # 3) dopełnij user_color
    user = await database.fetch_one(select(User.color).where(User.id == upd["user_id"]))

    return ChatMessageRead(
        id=upd["id"],
        room_id=upd["room_id"],
        user_id=upd["user_id"],
        text=upd["text"],
        image_path=upd["image_path"],
        status=upd["status"],
        square_index=upd["square_index"],
        user_color=user["color"],
    )
