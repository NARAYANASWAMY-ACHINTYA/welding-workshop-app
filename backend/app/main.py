import os, shutil, uuid
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from .utils import load_storage, save_storage
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
PORTF_DIR = STATIC_DIR / "portfolio"
CAT_DIR = STATIC_DIR / "catalogue"
for d in (STATIC_DIR, PORTF_DIR, CAT_DIR):
    d.mkdir(parents=True, exist_ok=True)
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
def admin_auth(username: str = Form(None), password: str = Form(None)):
    storage = load_storage()
    admin = storage.get('admin', {})
    if username != admin.get('username') or password != admin.get('password'):
        raise HTTPException(status_code=401, detail='Unauthorized')
    return True
@app.get('/portfolio')
async def get_portfolio():
    storage = load_storage()
    return JSONResponse(content=storage.get('portfolio', []))
@app.get('/catalogue')
async def get_catalogue():
    storage = load_storage()
    return JSONResponse(content=storage.get('catalogue', []))
@app.get('/contact')
async def get_contact():
    storage = load_storage()
    return JSONResponse(content=storage.get('contact', {}))
@app.post('/admin/upload')
async def admin_upload(title: str = Form(...), description: str = Form(''), category: str = Form('portfolio'), file: UploadFile = File(...), auth: bool = Depends(admin_auth)):
    t = file.content_type
    main = t.split('/')[0]
    if main not in ('image','video'):
        raise HTTPException(status_code=400, detail='Only image/video allowed')
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    if category == 'catalogue':
        dest = CAT_DIR / filename
    else:
        dest = PORTF_DIR / filename
    with open(dest, 'wb') as f:
        shutil.copyfileobj(file.file, f)
    ftype = 'image' if main == 'image' else 'video'
    item = {'id': uuid.uuid4().hex, 'url': f"/static/{'catalogue' if category=='catalogue' else 'portfolio'}/{filename}", 'title': title, 'description': description, 'type': ftype, 'category': category}
    storage = load_storage()
    if category == 'catalogue':
        cat = storage.get('catalogue', [])
        cat.append({ 'id': max([c.get('id',0) for c in cat]+[0])+1, 'name': title, 'desc': description, 'price': '' , 'media': item['url']})
        storage['catalogue'] = cat
    else:
        storage.setdefault('portfolio', []).insert(0, item)
    save_storage(storage)
    return JSONResponse(content=item)