from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserResponse)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    # 1) Check if email is already taken
    if crud.get_user_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2) Create a new user (hashes password, inserts row)
    user = crud.create_user(db, name=payload.name, email=payload.email, password=payload.password)

    # 3) Return the newly created user (id, name, email)
    return user
