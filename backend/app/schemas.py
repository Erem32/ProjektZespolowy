from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RoomCreate(BaseModel):
    name: str
    password: str

class RoomOut(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

class JoinRoomRequest(BaseModel):
    user_id: int
    password: str

class JoinRoomResponse(BaseModel):
    color: str

class ClaimSquareRequest(BaseModel):
    user_id: int

class ClaimSquareResponse(BaseModel):
    id: int
    index: int
    owner_id: Optional[int]
    color: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class SquareOut(BaseModel):
    id: int
    index: int
    owner_id: Optional[int]
    color: Optional[str]

    model_config = ConfigDict(from_attributes=True)
