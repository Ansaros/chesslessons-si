import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # === BASE / AUTH ===
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 43200
    SECRET_KEY: str = os.getenv("SECRET_KEY")

    # === GENERAL SETTINGS ===
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    ALLOWED_HOSTS: list[str] = os.getenv("ALLOWED_HOSTS", "").split(",")

    # === DATABASE ===
    DATABASE_URL: str = os.getenv("DATABASE_URL")

    # === STORAGE ===
    SPACES_KEY: str = os.getenv("SPACES_KEY")
    SPACES_SECRET: str = os.getenv("SPACES_SECRET")
    SPACES_REGION: str = os.getenv("SPACES_REGION")
    SPACES_BUCKET: str = os.getenv("SPACES_BUCKET")
    SPACES_ENDPOINT: str = os.getenv("SPACES_ENDPOINT")