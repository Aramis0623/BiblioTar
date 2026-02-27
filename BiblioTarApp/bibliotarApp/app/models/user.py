from app.extensions import db, Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import String, Integer
from sqlalchemy import ForeignKey, Column, Table
#from marshmallow import Schema, fields

UserRole = Table(
    "userroles",
    Base.metadata,
    Column("user_id", ForeignKey("users.id")),
    Column("role_id", ForeignKey("roles.id"))
)

class User(db.Model):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    email: Mapped[str] = mapped_column(String(30))
    #password: Mapped[str] = mapped_column(String(30))
    phone : Mapped[str] = mapped_column(String(30))

    roles: Mapped[List["Role"]] = relationship(secondary=UserRole, back_populates="users")

    address : Mapped[str] = mapped_column(String(30))

    borrowedBooks : Mapped[List["borrowedBook"]] = relationship(back_populates="user", lazy=True)

    

# class UserSchemaResponse(Schema):
#     id = fields.Integer()
#     name = fields.String()
#     email = fields.String()
