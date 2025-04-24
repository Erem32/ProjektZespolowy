# backend/app/routers/register.py

from fastapi import APIRouter, HTTPException
from ..schemas import RegisterRequest
from app.database import database
from app.models import User
from sqlalchemy import insert, select
import hashlib

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/register")
async def register_user(payload: RegisterRequest):
    data = payload.model_dump()
    print("👉 Received registration payload:", data)

    # Check if user exists
    stmt = select(User).where(User.email == data["email"])
    existing = await database.fetch_one(stmt)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Fake-hash the password (demo only!)
    hashed_pw = hashlib.sha256(data["password"].encode()).hexdigest()

    # Insert into DB
    insert_stmt = insert(User).values(
        email=data["email"],
        hashed_password=hashed_pw
    )
    await database.execute(insert_stmt)

    return {
        "message": "User registered successfully!"
    }
