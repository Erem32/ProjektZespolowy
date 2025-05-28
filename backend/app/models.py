from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    color = Column(String, nullable=True)           

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    password = Column(String, nullable=False)
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)

class Square(Base):
    __tablename__ = "squares"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"))
    index = Column(Integer)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
