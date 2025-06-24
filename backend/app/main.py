import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from fastapi import FastAPI
from contextlib import asynccontextmanager
from .routers import register,login
from app.database import engine, Base
from app import models
from fastapi import FastAPI
from app.database import database
from app.routers import rooms
from app.routers import chat
from fastapi.staticfiles import StaticFiles
app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


# Create tables on startup
models.Base.metadata.create_all(bind=engine)




# @asynccontextmanager
# async def lifespan(app:FastAPI):
    
#     await database.connect()
#     try:
#         yield
#     finally:
#         await database.disconnect()


# app=FastAPI(lifespan=lifespan)
origins = [
    "http://localhost:3000",
    "https://bingofrontend.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods =["*"],
    allow_headers =["*"],
)

app.include_router(register.router)
app.include_router(login.router)
app.include_router(rooms.router)
app.include_router(chat.router)

@app.get("/ping")
async def ping():
    return{"message":"pong"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
