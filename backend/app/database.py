# app/database.py

import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from databases import Database  # ← correct import

# Read the URL from env or fall back to SQLite for local dev
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# Create the SQLAlchemy engine (for table creation, migrations, etc.)
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Collect table metadata here
metadata = MetaData()

# Base class for your ORM models
Base = declarative_base(metadata=metadata)

# Async database connection manager
database = Database(DATABASE_URL)
