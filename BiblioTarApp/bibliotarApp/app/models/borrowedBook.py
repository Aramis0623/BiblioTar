from __future__ import annotations

import enum

from app.extensions import db
from typing import List, Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import String, Integer
from sqlalchemy import ForeignKey
from sqlalchemy import Enum


class StatusEnum(enum.Enum):
    ACTIVE = "active"
    PASTDUE = "pastdue"
    FINISHED = "finished"

class BorrowedBook(db.Model):
    __tablename__ = "borrowed_books"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user: Mapped["User"] = relationship("User", back_populates="borrowed_books")

    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"))
    book: Mapped["Book"] = relationship("Book", back_populates="borrowed_books")

    status: Mapped[StatusEnum] = mapped_column(Enum(StatusEnum))