# backend/app/routers/login.py

from fastapi import APIRouter, HTTPException
from ..schemas import LoginRequest
from app.database import database
from app.models import User
from sqlalchemy import select

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/login")
async def login_user(payload: LoginRequest):
    data = payload.model_dump()
    print("👉 Received login payload:", data)

    # Lookup user by email
    stmt = select(User).where(User.email == data["email"])
    user = await database.fetch_one(stmt)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Just echoing back for now — normally you'd verify the password here
    return {
        "message": "User found!",
        "user": dict(user)
    }
