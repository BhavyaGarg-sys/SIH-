import os
import bcrypt
from datetime import datetime, timedelta
from jose import jwt

def _load_secret_key() -> str:
    """Load a production-safe JWT signing key without a silent default."""
    value = os.getenv("SECRET_KEY", "").strip()
    placeholders = {
        "your-secret-key-here",
        "generate-a-secure-random-string-here",
        "replace-with-a-random-secret-at-least-32-characters-long",
    }
    if not value or value.lower() in placeholders or len(value) < 32:
        raise RuntimeError(
            "SECRET_KEY must be configured with a unique value of at least 32 characters. "
            "See .env.example for a secure generation command."
        )
    return value


SECRET_KEY = _load_secret_key()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
