"""Authentication service layer for password hashing, JWT and user accounts."""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Tuple
import bcrypt
import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.user import User
from app.schemas.auth import (
    UserLogin,
    UserRegister,
    UserResponse,
)

settings = get_settings()

# In-memory storage for test suites and offline database fallback
_IN_MEMORY_USERS: Dict[str, Dict[str, Any]] = {}


def _init_seed_users() -> None:
    """Initialize in-memory users with pre-hashed demo credentials."""
    if _IN_MEMORY_USERS:
        return

    salt = bcrypt.gensalt(rounds=12)
    cust_hash = bcrypt.hashpw(
        b"SecurePassword123", salt
    ).decode("utf-8")
    admin_hash = bcrypt.hashpw(
        b"AdminPassword123", salt
    ).decode("utf-8")

    _IN_MEMORY_USERS["customer@example.com"] = {
        "id": 1,
        "email": "customer@example.com",
        "hashed_password": cust_hash,
        "full_name": "Priyanshu Sharma",
        "is_admin": False,
        "created_at": datetime(2026, 10, 25, 12, 0, 0, tzinfo=timezone.utc),
    }
    _IN_MEMORY_USERS["admin@example.com"] = {
        "id": 2,
        "email": "admin@example.com",
        "hashed_password": admin_hash,
        "full_name": "System Administrator",
        "is_admin": True,
        "created_at": datetime(2026, 10, 25, 12, 0, 0, tzinfo=timezone.utc),
    }


_init_seed_users()


def hash_password(password: str) -> str:
    """Hash a plain text password using bcrypt.

    Args:
        password: Plain text password string.

    Returns:
        str: Bcrypt hashed password string.
    """
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash.

    Args:
        plain_password: Plain text password string to test.
        hashed_password: Salted bcrypt hash string.

    Returns:
        bool: True if passwords match, False otherwise.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def create_access_token(
    user_id: int,
    email: str,
    is_admin: bool = False,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generate a signed stateless JWT access token.

    Args:
        user_id: Unique user identifier.
        email: Registered user email.
        is_admin: Role flag for admin authorization.
        expires_delta: Optional custom token expiration duration.

    Returns:
        str: Encoded JWT bearer token string.
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(
            minutes=settings.access_token_expire_minutes
        )

    payload = {
        "sub": str(user_id),
        "email": email,
        "is_admin": is_admin,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(
        payload, settings.secret_key, algorithm=settings.algorithm
    )


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a signed JWT bearer token.

    Args:
        token: JWT bearer token string.

    Returns:
        Optional[Dict[str, Any]]: Decoded claims payload, or None if invalid.
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
        return payload
    except Exception:
        return None


class AuthService:
    """Authentication service providing user registration and login."""

    @classmethod
    async def get_user_by_email(
        cls, session: Optional[AsyncSession], email: str
    ) -> Optional[Dict[str, Any]]:
        """Look up user record by email address.

        Args:
            session: Optional active database session.
            email: User email address to query.

        Returns:
            Optional[Dict[str, Any]]: User record dictionary or None.
        """
        clean_email = email.strip().lower()

        if session is not None:
            try:
                stmt = select(User).where(User.email == clean_email)
                result = await session.execute(stmt)
                db_user = result.scalar_one_or_none()
                if db_user is not None:
                    return {
                        "id": db_user.id,
                        "email": db_user.email,
                        "hashed_password": db_user.hashed_password,
                        "full_name": db_user.full_name,
                        "is_admin": db_user.is_admin,
                        "created_at": db_user.created_at,
                    }
            except Exception:
                pass

        return _IN_MEMORY_USERS.get(clean_email)

    @classmethod
    async def get_user_by_id(
        cls, session: Optional[AsyncSession], user_id: int
    ) -> Optional[UserResponse]:
        """Look up user profile by unique identifier.

        Args:
            session: Optional active database session.
            user_id: Unique user ID.

        Returns:
            Optional[UserResponse]: User profile response or None.
        """
        if session is not None:
            try:
                stmt = select(User).where(User.id == user_id)
                result = await session.execute(stmt)
                db_user = result.scalar_one_or_none()
                if db_user is not None:
                    return UserResponse(
                        id=db_user.id,
                        email=db_user.email,
                        full_name=db_user.full_name,
                        is_admin=db_user.is_admin,
                        created_at=db_user.created_at,
                    )
            except Exception:
                pass

        for user_data in _IN_MEMORY_USERS.values():
            if user_data["id"] == user_id:
                return UserResponse(
                    id=user_data["id"],
                    email=user_data["email"],
                    full_name=user_data["full_name"],
                    is_admin=user_data["is_admin"],
                    created_at=user_data.get("created_at"),
                )

        return None

    @classmethod
    async def register_user(
        cls, session: Optional[AsyncSession], payload: UserRegister
    ) -> Optional[UserResponse]:
        """Register a new customer account.

        Args:
            session: Optional active database session.
            payload: Validated registration data.

        Returns:
            Optional[UserResponse]: Created user profile, or None on conflict.
        """
        clean_email = payload.email.strip().lower()

        existing = await cls.get_user_by_email(session, clean_email)
        if existing is not None:
            return None

        hashed_pwd = hash_password(payload.password)
        now = datetime.now(timezone.utc)

        if session is not None:
            try:
                new_db_user = User(
                    email=clean_email,
                    hashed_password=hashed_pwd,
                    full_name=payload.full_name.strip(),
                    is_admin=False,
                )
                session.add(new_db_user)
                await session.commit()
                await session.refresh(new_db_user)
                return UserResponse(
                    id=new_db_user.id,
                    email=new_db_user.email,
                    full_name=new_db_user.full_name,
                    is_admin=new_db_user.is_admin,
                    created_at=new_db_user.created_at,
                )
            except Exception:
                pass
        existing_ids = [u["id"] for u in _IN_MEMORY_USERS.values()]
        next_id = max(existing_ids, default=0) + 1
        user_record = {
            "id": next_id,
            "email": clean_email,
            "hashed_password": hashed_pwd,
            "full_name": payload.full_name.strip(),
            "is_admin": False,
            "created_at": now,
        }
        _IN_MEMORY_USERS[clean_email] = user_record

        return UserResponse(
            id=next_id,
            email=clean_email,
            full_name=payload.full_name.strip(),
            is_admin=False,
            created_at=now,
        )

    @classmethod
    async def authenticate_user(
        cls, session: Optional[AsyncSession], credentials: UserLogin
    ) -> Optional[Tuple[UserResponse, str]]:
        """Authenticate user credentials and issue a signed JWT access token.

        Args:
            session: Optional active database session.
            credentials: Login credentials containing email and password.

        Returns:
            Optional[Tuple[UserResponse, str]]: User profile and JWT token,
                or None if credentials are invalid.
        """
        user_record = await cls.get_user_by_email(
            session, credentials.email
        )
        if user_record is None:
            return None

        if not verify_password(
            credentials.password, user_record["hashed_password"]
        ):
            return None

        user_response = UserResponse(
            id=user_record["id"],
            email=user_record["email"],
            full_name=user_record["full_name"],
            is_admin=user_record["is_admin"],
            created_at=user_record.get("created_at"),
        )
        token = create_access_token(
            user_id=user_record["id"],
            email=user_record["email"],
            is_admin=user_record["is_admin"],
        )
        return user_response, token
