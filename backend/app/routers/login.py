# backend/app/routers/login.py
from fastapi import APIRouter
from ..schemas import LoginRequest

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/login")
def login_user(payload: LoginRequest):
    # turn the Pydantic model into a plain dict
    data = payload.model_dump()
    # quick print to verify you got it
    print("👉 Received login payload:", data)
    # echo back so the frontend sees it too
    return {
        "message": "Received login data!",
        "your_data": data
    }
