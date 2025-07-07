from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from ..db.session import Base, engine
from pydantic import BaseModel

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)    

# Pydantic model for creating a user
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

# Pydantic model for reading user data (without password)
class UserOut(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

# Pydantic model for the token
class Token(BaseModel):
    access_token: str
    token_type: str    