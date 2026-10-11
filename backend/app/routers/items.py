from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/api/items", tags=["items"])


@router.get("", response_model=list[schemas.ItemRead])
def list_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.list_items(db, current_user.id)


@router.post("", response_model=schemas.ItemRead, status_code=status.HTTP_201_CREATED)
def create_item(
    payload: schemas.ItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.create_item(db, current_user.id, payload)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not crud.delete_item(db, current_user.id, item_id):
        raise HTTPException(status_code=404, detail="Item not found")
    return None