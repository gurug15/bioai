from sqlalchemy.orm import Session
from database.models import User
from exceptions.customException import AuthError
from schemas.userModel import UserCreate, UserLogin

import bcrypt

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_bytes, hash_bytes)




def create_user(user: UserCreate, db: Session):
    existingUser = db.query(User).filter(User.email == user.email).first()
    if existingUser:
        raise AuthError("user already Exists")
    newUser = User(
        email=user.email,
        password_hash=hash_password(user.password),
        name=user.name,
    )

    db.add(newUser)
    db.commit()
    db.refresh(newUser)

    return newUser


def login_user(user: UserLogin, db: Session) -> User:
    existingUser = db.query(User).filter(User.email == user.email).first()
    if not existingUser or not verify_password(user.password, existingUser.password_hash):
        raise AuthError("Invalid email or password")

    return existingUser