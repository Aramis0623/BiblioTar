from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import String, Integer
from sqlalchemy import ForeignKey
from app.extensions import db

class Reservation(db.Model):
    __tablename__ = "reservations"
    id: Mapped[int] = mapped_column(primary_key=True)

    user_id : Mapped[int] = mapped_column(ForeignKey("users.id"))
    user : Mapped["User"] = relationship(back_populates="reservations")

    book_id : Mapped[int] = mapped_column(ForeignKey("books.id"))
    book : Mapped["Book"] = relationship(back_populates="reservations")



