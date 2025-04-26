import uvicorn
from fastapi import FastAPI, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from starlette.responses import JSONResponse
import logging


# from endpoints import router as api_router
from keys import ORIGINS
from models.mongodb.Doctor import Doctor
from models.mongodb.EEGDataRecord import EEGDataRecord
from models.mongodb.Patient import Patient
from pydantic_schemas.Email import EmailSchema
from routes import router as api_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

if __name__ == '__main__':
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
