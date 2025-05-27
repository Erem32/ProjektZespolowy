from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        orm_mode = True

class LoginRequest(BaseModel):

    email: EmailStr       # must be a valid email format
    password: str         # plain-text password

class RoomBase(BaseModel):
    name: str

class RoomCreate(RoomBase):
    password: str    # client-supplied plain password

class RoomRead(RoomBase):
    id: int

    class Config:
        orm_mode = True