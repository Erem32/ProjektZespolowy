# backend/app/routers/register.py

from fastapi import APIRouter
from ..schemas import RegisterRequest

router = APIRouter(
    prefix="/auth",      # all routes here start with /auth
    tags=["auth"],
)

@router.post("/register")
def register_user(payload: RegisterRequest):
    # ✅ Use model_dump() instead of dict()
    data = payload.model_dump()
    print("👉 Received payload:", data)
    return {
        "message": "Received registration data!",
        "your_data": data
    }
