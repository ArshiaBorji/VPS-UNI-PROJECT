from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import hash_password


# --- Users ---
def get_user_by_username(db: Session, username: str) -> models.User | None:
    return db.scalar(select(models.User).where(models.User.username == username))


def create_user(db: Session, data: schemas.UserCreate) -> models.User:
    user = models.User(
        username=data.username,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# --- Items (scoped to a user) ---
def list_items(db: Session, owner_id: int) -> list[models.Item]:
    stmt = (
        select(models.Item)
        .where(models.Item.owner_id == owner_id)
        .order_by(models.Item.id.desc())
    )
    return list(db.scalars(stmt))


def create_item(db: Session, owner_id: int, data: schemas.ItemCreate) -> models.Item:
    item = models.Item(name=data.name, description=data.description, owner_id=owner_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, owner_id: int, item_id: int) -> bool:
    item = db.get(models.Item, item_id)
    if item is None or item.owner_id != owner_id:
        return False
    db.delete(item)
    db.commit()
    return True