from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.auth import create_access_token, verify_password
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def signup(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_username(db, payload.username):
        raise HTTPException(status_code=409, detail="Username already taken")

    user = crud.create_user(db, payload)
    return schemas.Token(
        access_token=create_access_token(user.id),
        user=schemas.UserRead.model_validate(user),
    )


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, payload.username)
    if user is None or not verify_password(payload.password, user.password_hash):
        # Same error either way — don't leak whether the username exists.
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    return schemas.Token(
        access_token=create_access_token(user.id),
        user=schemas.UserRead.model_validate(user),
    )