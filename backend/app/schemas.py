from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Portfolio Schemas
class PortfolioBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = 'portfolio'

class PortfolioCreate(PortfolioBase):
    file_url: str
    file_type: str

class Portfolio(PortfolioBase):
    id: int
    file_url: str
    file_type: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Catalogue Schemas
class CatalogueBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Optional[str] = None

class CatalogueCreate(CatalogueBase):
    media_url: Optional[str] = None

class Catalogue(CatalogueBase):
    id: int
    media_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Contact Schema
class Contact(BaseModel):
    id: int
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    address: Optional[str] = None
    maps_url: Optional[str] = None
    email: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Admin Schema
class AdminLogin(BaseModel):
    username: str
    password: str
