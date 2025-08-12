import os, json
from pathlib import Path
STORAGE_PATH = Path(__file__).parent / 'storage.json'
def load_storage():
    if not STORAGE_PATH.exists():
        data = {
            "portfolio": [],
            "catalogue": [
                {"id": 1, "name": "Steel Gates", "desc": "Custom steel gates and entrances.", "price": ""},
                {"id": 2, "name": "Window Grills", "desc": "Decorative & security grills.", "price": ""},
                {"id": 3, "name": "Balustrades", "desc": "Handrails and staircase balustrades.", "price": ""}
            ],
            "contact": {
                "phone": "+911234567890",
                "whatsapp": "https://wa.me/911234567890",
                "address": "Local Welding Workshop, Main Road, YourTown",
                "maps": "https://maps.google.com/?q=YourTown"
            },
            "admin": {"username":"admin","password":"changeme"}
        }
        STORAGE_PATH.write_text(json.dumps(data, indent=2))
        return data
    else:
        return json.loads(STORAGE_PATH.read_text())
def save_storage(data):
    STORAGE_PATH.write_text(json.dumps(data, indent=2))