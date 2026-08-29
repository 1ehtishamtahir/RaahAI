import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

try:
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_size=20,
        max_overflow=10,
        pool_timeout=30,
    )
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
except Exception:
    engine = create_engine("sqlite:///./raahai.db", connect_args={"check_same_thread": False}, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
