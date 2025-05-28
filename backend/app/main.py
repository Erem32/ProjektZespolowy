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
from .routers import squares
app = FastAPI()

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

origins = ["http://localhost:3000"]

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
app.include_router(squares.router)
@app.get("/ping")
async def ping():
    return{"message":"pong"}


if __name__ =="__main__":
    uvicorn.run(app,host="0.0.0.0",port = 8000)