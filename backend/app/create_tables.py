# create_tables.py
from app.database import engine, Base
from app import models  # ensure all models are imported


Base.metadata.create_all(engine)
print("Tables created in test.db")
