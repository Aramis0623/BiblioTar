from datetime import date, timedelta

from sqlalchemy import or_

from app.extensions import db
from app.models.book import Book
from app.models.borrowedBook import BorrowedBook, StatusEnum
from app.models.reservation import Reservation
from app.models.user import User


class LibrarianService:

    @staticmethod
    def _due_date(book):
        if not book.dateBorrowed:
            return None

        return book.dateBorrowed + timedelta(days=book.daysBorrowed)

    @staticmethod
    def _borrow_response(borrow, fine=0):
        book = borrow.book
        due_date = LibrarianService._due_date(book)

        return {
            "id": borrow.id,
            "user_id": borrow.user_id,
            "user_name": borrow.user.name,
            "book_id": borrow.book_id,
            "book_title": book.title,
            "status": borrow.status.value,
            "dateBorrowed": book.dateBorrowed.isoformat() if book.dateBorrowed else None,
            "daysBorrowed": book.daysBorrowed,
            "dueDate": due_date.isoformat() if due_date else None,
            "extend_count": borrow.extend_count or 0,
            "fine": fine
        }

    @staticmethod
    def create_borrow(data):
        user = db.session.get(User, data["user_id"])
        if not user:
            return False, "User not found"

        book = db.session.get(Book, data["book_id"])
        if not book:
            return False, "Book not found"

        if not book.available:
            return False, "Book is not available"

        borrow = BorrowedBook(
            user_id=user.id,
            book_id=book.id,
            status=StatusEnum.ACTIVE,
            extend_count=0
        )

        book.available = False
        book.status = "borrowed"
        book.dateBorrowed = date.today()
        book.daysBorrowed = data.get("daysBorrowed", 14)

        db.session.add(borrow)
        db.session.commit()

        return True, LibrarianService._borrow_response(borrow)

    @staticmethod
    def return_book(borrow_id, data):
        borrow = db.session.get(BorrowedBook, borrow_id)
        if not borrow:
            return False, "Borrow not found"

        if borrow.status == StatusEnum.FINISHED:
            return False, "Borrow is already finished"

        fine = data.get("fine", 0)
        due_date = LibrarianService._due_date(borrow.book)

        if due_date and date.today() > due_date and fine == 0:
            borrow.status = StatusEnum.PASTDUE
            db.session.commit()
            return False, "Book is past due; fine is required"

        borrow.status = StatusEnum.FINISHED
        borrow.book.available = True
        borrow.book.status = "available"

        response = LibrarianService._borrow_response(borrow, fine=fine)

        borrow.book.dateBorrowed = None
        borrow.book.daysBorrowed = 0

        db.session.commit()

        return True, response

    @staticmethod
    def extend_borrow(borrow_id, data):
        borrow = db.session.get(BorrowedBook, borrow_id)
        if not borrow:
            return False, "Borrow not found"

        if borrow.status != StatusEnum.ACTIVE:
            return False, "Only active borrows can be extended"

        extend_count = borrow.extend_count or 0
        if extend_count >= 2:
            return False, "Max extension reached"

        due_date = LibrarianService._due_date(borrow.book)
        if due_date and date.today() > due_date:
            borrow.status = StatusEnum.PASTDUE
            db.session.commit()
            return False, "Past due borrows cannot be extended"

        reserved_by_other_user = Reservation.query.filter(
            Reservation.book_id == borrow.book_id,
            Reservation.user_id != borrow.user_id
        ).first()
        if reserved_by_other_user:
            return False, "Book is reserved by another user"

        borrow.book.daysBorrowed += data.get("days", 7)
        borrow.extend_count = extend_count + 1
        db.session.commit()

        return True, LibrarianService._borrow_response(borrow)

    @staticmethod
    def add_fine(borrow_id, data):
        borrow = db.session.get(BorrowedBook, borrow_id)
        if not borrow:
            return False, "Borrow not found"

        if borrow.status == StatusEnum.FINISHED:
            return False, "Borrow is already finished"

        fine = data["fine"]

        if fine > 0:
            borrow.status = StatusEnum.PASTDUE

        db.session.commit()

        return True, LibrarianService._borrow_response(borrow, fine=fine)

    @staticmethod
    def get_borrows():
        borrows = BorrowedBook.query.all()

        return [
            LibrarianService._borrow_response(borrow)
            for borrow in borrows
        ]

    @staticmethod
    def search_books(query):
        books = Book.query.filter(
            or_(
                Book.title.contains(query),
                Book.author.contains(query)
            )
        ).all()

        return [
            {
                "id": book.id,
                "title": book.title,
                "author": book.author,
                "publishingYear": book.publishingYear,
                "available": book.available,
                "status": book.status
            }
            for book in books
        ]

    @staticmethod
    def search_borrows(query):
        borrows = BorrowedBook.query.join(BorrowedBook.book).join(BorrowedBook.user).filter(
            or_(
                Book.title.contains(query),
                Book.author.contains(query),
                User.name.contains(query),
                User.email.contains(query)
            )
        ).all()

        return [
            LibrarianService._borrow_response(borrow)
            for borrow in borrows
        ]
