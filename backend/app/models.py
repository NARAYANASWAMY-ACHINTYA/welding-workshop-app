from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Portfolio(Base):
    __tablename__ = "portfolio"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # 'image' or 'video'
    category = Column(String(100), default='portfolio')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Catalogue(Base):
    __tablename__ = "catalogue"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(String(100))
    media_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Contact(Base):
    __tablename__ = "contact"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(50))
    whatsapp = Column(String(500))
    address = Column(Text)
    maps_url = Column(String(500))
    email = Column(String(255))
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Admin(Base):
    __tablename__ = "admin"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
