from sqlalchemy.orm import Session
from . import models, schemas
from typing import List, Optional

# Portfolio operations
def get_portfolio(db: Session, skip: int = 0, limit: int = 100) -> List[models.Portfolio]:
    return db.query(models.Portfolio).order_by(models.Portfolio.created_at.desc()).offset(skip).limit(limit).all()

def create_portfolio(db: Session, portfolio: schemas.PortfolioCreate) -> models.Portfolio:
    db_portfolio = models.Portfolio(**portfolio.dict())
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio

# Catalogue operations
def get_catalogue(db: Session, skip: int = 0, limit: int = 100) -> List[models.Catalogue]:
    return db.query(models.Catalogue).filter(models.Catalogue.is_active == True).offset(skip).limit(limit).all()

def create_catalogue(db: Session, catalogue: schemas.CatalogueCreate) -> models.Catalogue:
    db_catalogue = models.Catalogue(**catalogue.dict())
    db.add(db_catalogue)
    db.commit()
    db.refresh(db_catalogue)
    return db_catalogue

# Contact operations
def get_contact(db: Session) -> Optional[models.Contact]:
    return db.query(models.Contact).first()

def update_contact(db: Session, contact_data: dict) -> models.Contact:
    contact = get_contact(db)
    if contact:
        for key, value in contact_data.items():
            setattr(contact, key, value)
        db.commit()
        db.refresh(contact)
    return contact

# Admin operations
def verify_admin(db: Session, username: str, password: str) -> bool:
    admin = db.query(models.Admin).filter(models.Admin.username == username).first()
    if admin and admin.is_active:
        # In production, use proper password hashing (bcrypt, etc.)
        return admin.password_hash == password
    return False
