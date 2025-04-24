from fastapi import APIRouter, HTTPException
from ..schemas import LoginRequest
from app.database import database
from app.models import User
from sqlalchemy import select
import hashlib

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
        # Do not reveal whether the email exists
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    hashed_input = hashlib.sha256(data["password"].encode()).hexdigest()
    if hashed_input != user["hashed_password"]:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Successful login
    return {
        "message": "Login successful!",
        "user": {
            "id": user["id"],
            "email": user["email"],
            # omit hashed_password
        }
    }
