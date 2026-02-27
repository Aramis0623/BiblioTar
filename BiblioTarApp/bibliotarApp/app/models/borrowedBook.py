from __future__ import annotations

import enum

from app.extensions import db
from typing import List, Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import String, Integer
from sqlalchemy import ForeignKey

class StatusEnum(enum.Enum):
    ACTIVE = "active"
    PASTDUE = "pastdue"
    FINISHED = "finished"

class BorrowedBook(db.Model):
    __tablename__ = "BorrowedBooks"
    id: Mapped[int] = mapped_column(primary_key=True)

    user_id : Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    user : Mapped["User"] = relationship(back_populates= "BorrowedBooks")

    status : Mapped[StatusEnum] = mapped_column()
    book : Mapped["Book"] = relationship(back_populates= "BorrowedBooks")
