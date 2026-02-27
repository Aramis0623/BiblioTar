from __future__ import annotations
from zoneinfo import available_timezones

from app.extensions import db
from typing import List, Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import String, Integer, Boolean
from sqlalchemy import ForeignKey



class Book(db.Model):
    __tablename__ = "books"
    id : Mapped[int] = mapped_column(primary_key=True)
    title : Mapped[str] = mapped_column(String(30))
    author : Mapped[str] = mapped_column(String(30))
    publishingYear : Mapped[int]

    available : Mapped[bool]
    status : Mapped[str] = mapped_column(String(30))



