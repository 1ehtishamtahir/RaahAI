import secrets
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = ""
    chroma_path: str = "./chroma_db"
    chroma_collection: str = "raahai_gov_docs"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-flash-lite-latest"
    gemini_embedding_model: str = "models/text-embedding-004"
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-20b"
    cerebras_api_key: str = ""
    cerebras_model: str = "llama-3.3-70b"
    dashscope_api_key: str = ""
    qwen_model: str = "qwen-plus"
    qwen_embedding_model: str = "text-embedding-v2"
    cors_origins: str = "http://localhost:3000,http://localhost:3001"
    upload_dir: str = "./uploads"
    max_upload_mb: int = 10
    ocr_engine: str = "paddle"
    whisper_model: str = "base"
    secret_key: str = ""
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache
def get_settings() -> Settings:
    s = Settings()
    if not s.secret_key:
        s.secret_key = secrets.token_hex(32)
    if not s.database_url:
        s.database_url = "sqlite:///./raahai.db"
    return s
