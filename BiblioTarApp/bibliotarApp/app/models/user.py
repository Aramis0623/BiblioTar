from pydantic_core.core_schema import general_after_validator_function
from app.extensions import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import String
from sqlalchemy import Column, Table, ForeignKey
from typing import List
from werkzeug.security import generate_password_hash, check_password_hash

#from marshmallow import Schema, fields

UserRole = Table(
    "userroles",
    db.Model.metadata,
    Column("user_id", ForeignKey("users.id")),
    Column("role_id", ForeignKey("roles.id"))
)

class User(db.Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    email: Mapped[str] = mapped_column(String(30))
    password: Mapped[str] =mapped_column(String(30))
    phone: Mapped[str] = mapped_column(String(30))
    address: Mapped[str] = mapped_column(String(30))

    roles: Mapped[List["Role"]] = relationship(
        "Role",
        secondary=UserRole,
        back_populates="users",
        lazy="selectin"
)

    borrowed_books: Mapped[List["BorrowedBook"]] = relationship(
        "BorrowedBook",
        back_populates="user"
    )

    reservations: Mapped[List["Reservation"]] = relationship(
        "Reservation",
        back_populates="user"
    )

    def __repr__(self):
        return f"User(id={self.id}, name={self.name}, email={self.email})"

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)