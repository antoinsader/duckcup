

"""Application configuration settings using pydantic_settings for environment variable management and validation."""


import os
from pydantic import Field, SecretStr, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )
    # ===== Environment =====
    is_prod: bool = Field(default=False, alias="IS_PROD")
    port: int = Field(default=8080, alias="PORT")
    host: str = Field(default="localhost", alias="HOST")
    ssl_protected: bool = Field(default=False, alias="SSL_PROTECTED")
    testing: bool = Field(default=False, alias="TESTING")
    ollama_host : str = Field(default="http://localhost:11434", alias="OLLAMA_HOST")

    allowed_prod_user_ds_num: int = Field(default=3, alias="ALLOWED_PROD_USER_DS_NUM")

    default_ollama_embedding_model: str ="all-minilm"
    default_st_embedding_model: str = "all-MiniLM-L6-v2"


    # ===== Database =====
    database_url: str = Field(alias="DATABASE_URL", default="sqlite:///./data/sql_app.db")
    test_database_url: str = Field(alias="TEST_DATABASE_URL", default="sqlite:///./data/sql_app_test.db")

    # ===== Secrets =====
    jwt_secret_key: SecretStr = Field(alias="JWT_SECRET_KEY")
    backend_secrets_encryption_key: SecretStr = Field(alias="BACKEND_SECRETS_ENCRYPTION_KEY")
    special_password: SecretStr = Field(alias="SPECIAL_PASSWORD")

    # ===== Google OAuth =====
    google_client_id: str = Field(alias="GOOGLE_CLIENT_ID")
    google_client_secret: SecretStr = Field(alias="GOOGLE_CLIENT_SECRET")

    # ===== URLs =====
    frontend_url: str = Field(alias="FRONTEND_URL")

    # ===== Storage =====
    
    user_datasets_content_dir: str = Field(default="./data/users_datasets/", alias="USER_DATASETS_CONTENT_DIR")
    meta_dir: str = "./application/meta_data"
    rsa_keys_dir: str = "./data/rsa_keys"
    temp_keys_db_path: str = Field(str, alias="TEMP_KEYS_DB_PATH")
    public_datasets_path: str = "./application/public_datasets"


    def model_post_init(self, __context):
        # Ensure directories exist
        os.makedirs(self.user_datasets_content_dir, exist_ok=True)
        os.makedirs(self.rsa_keys_dir, exist_ok=True)

    @computed_field
    @property
    def api_url(self) -> str:
        protocol = "https" if self.ssl_protected else "http"
        return f"{protocol}://{self.host}:{self.port}"

settings = Settings()