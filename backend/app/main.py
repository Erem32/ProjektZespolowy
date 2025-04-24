import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models import User,Room,Square     # and any other models
from .database import engine, Base
# import the routers that handle /auth/register and /auth/login
from .routers import register, login

# this will create the SQLite file (test.db) and any tables defined by our models
Base.metadata.create_all(bind=engine)

# create the FastAPI app
app = FastAPI()

# set up CORS so our React frontend (running on localhost:3000) can make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount the authentication routers
app.include_router(register.router)
app.include_router(login.router)

# a simple endpoint to verify the server is up
@app.get("/ping")
async def ping():
    return {"message": "pong"}

# if we run this module directly, start the Uvicorn server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
