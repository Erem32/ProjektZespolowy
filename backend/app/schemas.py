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
    category: str   # NEW: must be "gym/fitness" or "sightseeing"

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
    win: bool                                      
    winning_indices: Optional[List[int]] = None 

class SquareOut(BaseModel):
    id: int
    index: int
    owner_id: Optional[int]
    color: Optional[str]
    text: str   # the challenge description

    model_config = ConfigDict(from_attributes=True)
class RoomDetail(BaseModel):
    id: int
    name: str
    winner_id: Optional[int]          # nullable FK to users.id
    winner_color: Optional[str]       # the color of the winner (if any)
    model_config = ConfigDict(from_attributes=True)
    winner_name: Optional[str] 