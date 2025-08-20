import os, shutil, uuid
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pathlib import Path

from .database import get_db, engine
from . import models, crud, schemas

# Create database tables
models.Base.metadata.create_all(bind=engine)

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
PORTF_DIR = STATIC_DIR / "portfolio"
CAT_DIR = STATIC_DIR / "catalogue"

for d in (STATIC_DIR, PORTF_DIR, CAT_DIR):
    d.mkdir(parents=True, exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

def admin_auth(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    """Verify admin credentials from form data"""
    if not crud.verify_admin(db, username, password):
        raise HTTPException(status_code=401, detail='Unauthorized')
    return True

@app.get('/portfolio')
async def get_portfolio(db: Session = Depends(get_db)):
    portfolio = crud.get_portfolio(db)
    # Convert SQLAlchemy objects to dictionaries
    portfolio_list = []
    for item in portfolio:
        portfolio_list.append({
            "id": item.id,
            "title": item.title,
            "description": item.description,
            "file_url": item.file_url,
            "file_type": item.file_type,
            "category": item.category,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None
        })
    return portfolio_list

@app.get('/catalogue')
async def get_catalogue(db: Session = Depends(get_db)):
    catalogue = crud.get_catalogue(db)
    # Convert SQLAlchemy objects to dictionaries
    catalogue_list = []
    for item in catalogue:
        catalogue_list.append({
            "id": item.id,
            "name": item.name,
            "description": item.description,
            "price": item.price,
            "media_url": item.media_url,
            "is_active": item.is_active,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None
        })
    return catalogue_list

@app.get('/contact')
async def get_contact(db: Session = Depends(get_db)):
    contact = crud.get_contact(db)
    if contact:
        # Convert SQLAlchemy object to dictionary
        contact_dict = {
            "id": contact.id,
            "phone": contact.phone,
            "whatsapp": contact.whatsapp,
            "address": contact.address,
            "maps_url": contact.maps_url,
            "email": contact.email,
            "updated_at": contact.updated_at.isoformat() if contact.updated_at else None
        }
        return contact_dict
    return {}

@app.post('/admin/upload')
async def admin_upload(
    title: str = Form(...), 
    description: str = Form(''), 
    category: str = Form('portfolio'), 
    file: UploadFile = File(...), 
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    # Verify admin credentials first
    if not crud.verify_admin(db, username, password):
        raise HTTPException(status_code=401, detail='Unauthorized')
    
    # Validate file type
    content_type = file.content_type
    main_type = content_type.split('/')[0]
    if main_type not in ('image', 'video'):
        raise HTTPException(status_code=400, detail='Only image/video allowed')
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    
    # Save file to appropriate directory
    if category == 'catalogue':
        dest = CAT_DIR / filename
    else:
        dest = PORTF_DIR / filename
    
    with open(dest, 'wb') as f:
        shutil.copyfileobj(file.file, f)
    
    file_url = f"/static/{'catalogue' if category=='catalogue' else 'portfolio'}/{filename}"
    file_type = 'image' if main_type == 'image' else 'video'
    
    # Create database record
    if category == 'catalogue':
        catalogue_data = schemas.CatalogueCreate(
            name=title,
            description=description,
            media_url=file_url
        )
        item = crud.create_catalogue(db, catalogue_data)
        # Convert to dictionary for JSON serialization
        item_dict = {
            "id": item.id,
            "name": item.name,
            "description": item.description,
            "media_url": item.media_url,
            "is_active": item.is_active,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None
        }
    else:
        portfolio_data = schemas.PortfolioCreate(
            title=title,
            description=description,
            file_url=file_url,
            file_type=file_type,
            category=category
        )
        item = crud.create_portfolio(db, portfolio_data)
        # Convert to dictionary for JSON serialization
        item_dict = {
            "id": item.id,
            "title": item.title,
            "description": item.description,
            "file_url": item.file_url,
            "file_type": item.file_type,
            "category": item.category,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None
        }
    
    return JSONResponse(content={"message": "Upload successful", "item": item_dict})

@app.post('/admin/init-db')
async def initialize_database(db: Session = Depends(get_db)):
    """Initialize database with default data"""
    try:
        # Check if contact exists
        if not crud.get_contact(db):
            contact = models.Contact(
                phone="+91 94487 61091",
                whatsapp="https://wa.me/9448761091",
                address="Varadaganahalli, karnataka 563127",
                maps_url="https://maps.app.goo.gl/VzLweYzC6zfpU3UF6"
            )
            db.add(contact)
        
        # Check if admin exists
        admin_exists = db.query(models.Admin).filter(models.Admin.username == "admin").first()
        if not admin_exists:
            admin = models.Admin(
                username="admin",
                password_hash="changeme"  # In production, use proper hashing
            )
            db.add(admin)
        
        # Add default catalogue items
        if not crud.get_catalogue(db):
            default_items = [
                {"name": "Steel Gates", "desc": "Custom steel gates and entrances.", "price": ""},
                {"name": "Window Grills", "desc": "Decorative & security grills.", "price": ""},
                {"name": "Balustrades", "desc": "Handrails and staircase balustrades.", "price": ""}
            ]
            
            for item in default_items:
                catalogue_item = models.Catalogue(
                    name=item["name"],
                    description=item["desc"],
                    price=item["price"]
                )
                db.add(catalogue_item)
        
        db.commit()
        return {"message": "Database initialized successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database initialization failed: {str(e)}")

@app.post('/admin/test-auth')
async def test_admin_auth(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Test endpoint to verify admin authentication"""
    if crud.verify_admin(db, username, password):
        return {"message": "Authentication successful", "status": "authorized"}
    else:
        raise HTTPException(status_code=401, detail='Authentication failed')

@app.put('/admin/contact')
async def admin_update_contact(
    username: str = Form(...),
    password: str = Form(...),
    phone: str | None = Form(None),
    whatsapp: str | None = Form(None),
    address: str | None = Form(None),
    maps_url: str | None = Form(None),
    email: str | None = Form(None),
    db: Session = Depends(get_db)
):
    if not crud.verify_admin(db, username, password):
        raise HTTPException(status_code=401, detail='Unauthorized')
    data = {k: v for k, v in {
        "phone": phone, "whatsapp": whatsapp, "address": address, "maps_url": maps_url, "email": email
    }.items() if v is not None}
    contact = crud.update_contact(db, data)
    return {"message": "Contact updated", "contact": {
        "id": contact.id, "phone": contact.phone, "whatsapp": contact.whatsapp,
        "address": contact.address, "maps_url": contact.maps_url, "email": contact.email
    }}