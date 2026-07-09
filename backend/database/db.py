from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase  # DeclarativeBase is the SQLAlchemy 2.0 standard

from config.envs import SQLALCHEMY_DATABASE_URL


engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()