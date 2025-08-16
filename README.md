# Welding Workshop — Expo React Native Web + FastAPI + PostgreSQL

A full-stack web application for a local welding workshop with modern database architecture.

## 🗄️ **Database Architecture**

This project now uses **PostgreSQL** instead of JSON storage for:
- **Portfolio**: Project showcase items with metadata
- **Catalogue**: Available services and pricing
- **Contact**: Business contact information  
- **Admin**: User authentication and access control

## 🚀 **Quick Start**

### **1. Backend with PostgreSQL (Docker)**
```bash
# Start PostgreSQL and Backend
docker-compose up --build

# Backend API: http://localhost:8000
# PostgreSQL: localhost:5432
```

### **2. Frontend**
```bash
cd frontend
npm install
npm run web
```

### **3. Initialize Database**
After starting the backend, initialize the database with default data:
```bash
curl -X POST http://localhost:8000/admin/init-db
```

## 🔧 **Alternative Setup (Without Docker)**

### **1. Install PostgreSQL Locally**
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql`
- **Ubuntu**: `sudo apt-get install postgresql postgresql-contrib`

### **2. Create Database**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE welding_workshop;
\q
```

### **3. Configure Environment**
```bash
cd backend
cp env.example .env
# Edit .env with your database credentials
```

### **4. Install Dependencies & Run**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🔐 **Admin Access**
- **Default credentials**: admin / changeme
- **Admin Panel**: Use the web interface to upload portfolio items and manage content
- **File Storage**: Images/videos stored in `backend/app/static/portfolio` or `/catalogue`

## 📊 **API Endpoints**
- `GET /portfolio` - Retrieve portfolio items
- `GET /catalogue` - Retrieve service catalogue  
- `GET /contact` - Retrieve contact information
- `POST /admin/upload` - Admin file upload (authenticated)
- `POST /admin/init-db` - Initialize database with default data

## 🗄️ **Database Schema**
- **Portfolio**: title, description, file_url, file_type, category, timestamps
- **Catalogue**: name, description, price, media_url, active status, timestamps
- **Contact**: phone, whatsapp, address, maps_url, email, timestamps
- **Admin**: username, password_hash, active status, timestamps

## 🔄 **Database Migrations**
```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

## 🐳 **Docker Services**
- **PostgreSQL 15**: Database with persistent volume
- **FastAPI Backend**: Python application with hot-reload
- **Health Checks**: Ensures database is ready before starting backend