"""
MediSim AI - Database Connection Configuration
Author: Team BioNex - VIT Bhopal University
Purpose: Seamless multi-database engine supporting PostgreSQL in production with automatic zero-setup SQLite fallback.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Check environment for PostgreSQL URI, default to local SQLite database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./medisim_ai.db")

# SQLite requires check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency for database session management."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initializes all database tables."""
    Base.metadata.create_all(bind=engine)
