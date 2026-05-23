from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config.settings import settings

# Resilient engine setup: Try Postgres first, fallback to SQLite if offline/no server
try:
    if settings.DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            settings.DATABASE_URL,
            connect_args={"check_same_thread": False}
        )
    else:
        # Check connection using a short connection timeout
        engine = create_engine(
            settings.DATABASE_URL,
            pool_size=10,
            max_overflow=5,
            pool_timeout=3,
            pool_recycle=1800,
            pool_pre_ping=True
        )
        # Try simple ping
        with engine.connect() as conn:
            pass
        print("Successfully connected to PostgreSQL database.")
except Exception as e:
    print(f"PostgreSQL connection failed ({e}). Falling back to local SQLite database for hackathon.")
    import os
    config_dir = os.path.dirname(os.path.abspath(__file__))
    src_dir = os.path.dirname(config_dir)
    api_dir = os.path.dirname(src_dir)
    apps_dir = os.path.dirname(api_dir)
    db_path = os.path.join(apps_dir, "sentinel.db")
    sqlite_url = f"sqlite:///{db_path.replace('\\', '/')}"
    engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
