from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from .. import crud, schemas, security
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    # 1) Verify credentials
    user = crud.authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2) Issue a JWT
    token = security.create_access_token(data={"sub": user.email})

    # 3) Return the token to the client
    return {"access_token": token, "token_type": "bearer"}
