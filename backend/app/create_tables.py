# create_tables.py
from .database import engine, Base
from . import models   # now picks up app/models.py because cwd includes this folder

Base.metadata.create_all(engine)
print("Tables created in test.db")
