import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from fastapi import FastAPI
from contextlib import asynccontextmanager
from .routers import register


app = FastAPI()


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

@app.get("/ping")
async def ping():
    return{"message":"pong"}


if __name__ =="__main__":
    uvicorn.run(app,host="0.0.0.0",port = 8000)