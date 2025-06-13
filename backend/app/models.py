from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    color = Column(String, nullable=True)

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False, default="")
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    category = Column(String, nullable=False, default="gym/fitness")  # NEW: which challenge-set this game uses

class Square(Base):
    __tablename__ = "squares"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    index = Column(Integer, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    text = Column(String, nullable=False)  # store the challenge text

class Challenge(Base):
    __tablename__ = "challenges"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category = Column(String, nullable=False, index=True)   # e.g. "gym/fitness" or "sightseeing"
    text = Column(String, nullable=False)  # the challenge description

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    text = Column(Text, nullable=True)
    image_path = Column(String, nullable=True)

    status = Column(String, nullable=False, default="pending", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    square_index = Column(Integer, nullable=True, index=True)
