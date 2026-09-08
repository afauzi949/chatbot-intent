import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory for backend
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file
load_dotenv(BASE_DIR / ".env")


class Settings:
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "n8nuser")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "Muntilan123")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "172.22.0.2")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "intent_lab")

    # Database URL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}",
    )

    # Server binding (strictly localhost for development/testing security)
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8008"))

    # CORS Allowed Origins
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
        ).split(",")
        if origin.strip()
    ]

    RASA_URL: str = os.getenv("RASA_URL", "http://localhost:5005")
    MCP_URL: str = os.getenv("MCP_URL", "http://localhost:8000")


settings = Settings()
