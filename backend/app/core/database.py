from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import get_settings

settings = get_settings()

# Fallback to sqlite if postgres driver missing or URL invalid
try:
    engine = create_engine(settings.database_url, pool_pre_ping=True)
    # test connection
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print(f"[database] connected to {settings.database_url[:30]}...")
except Exception as e:
    print(f"[database] postgres connect failed ({e}), falling back to sqlite:///./raahai.db")
    engine = create_engine("sqlite:///./raahai.db", connect_args={"check_same_thread": False}, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
