from fastapi import FastAPI
from app.database import database
from contextlib import asynccontextmanager




app = FastAPI()

@asynccontextmanager
async def lifespan(app:FastAPI):
    
    await database.connect()
    try:
        yield
    finally:
        await database.disconnect()


app=FastAPI(lifespan=lifespan)


@app.get("/ping")
async def ping():
    return{"message":"pong"}