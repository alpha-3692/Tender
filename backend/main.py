
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.connection import Base, engine
from models.tender import TenderModel
from models.document import DocumentModel
from models.user import UserModel

from routers.tenders import router as tenders_router
from routers.documents import router as documents_router
from routers.auth import router as auth_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="TenderMitra API",
    description="AI-powered tender qualification assistant for MSMEs",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(tenders_router)
app.include_router(documents_router)
app.include_router(auth_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to TenderMitra API!",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "TenderMitra backend",
    }
