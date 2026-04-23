from datetime import date, timedelta
from app.models.user import User
from app.models.book import Book
from app.models.borrowedBook import BorrowedBook, StatusEnum
from app.models.reservation import Reservation
from app.extensions import db
from sqlalchemy import select
from app.blueprints.user.schemas import UserResponseSchema


class UserService:

    @staticmethod
    def _due_date(book):
        if not book.dateBorrowed:
            return None

        return book.dateBorrowed + timedelta(days=book.daysBorrowed)

    @staticmethod
    def _borrow_response(borrow, fine=0):
        book = borrow.book
        due_date = UserService._due_date(book)

        return {
            "id": borrow.id,
            "user_name": borrow.user.name,
            "book_id": borrow.book_id,
            "book_title": book.title,
            "status": borrow.status.value,
            "dateBorrowed": book.dateBorrowed.isoformat() if book.dateBorrowed else None,
            "daysBorrowed": book.daysBorrowed,
            "dueDate": due_date.isoformat() if due_date else None,
            "extend_count": borrow.extend_count or 0,
        }

    @staticmethod
    def register(data):
        if User.query.filter_by(email=data["email"]).first():
            return False, "Email already exists"

        user = User(
            name=data["name"],
            email=data["email"],
            phone=data["phone"],
            address=data["address"]
        )

        user.set_password(data["password"])

        db.session.add(user)
        db.session.commit()

        return True, UserResponseSchema().dump(user)



    @staticmethod
    def login(data):
        user = User.query.filter_by(email=data["email"]).first()

        if not user:
            return False, "User not found"

        if not user.check_password(data["password"]):
            return False, "Wrong password"

        return True, UserResponseSchema().dump(user)


    @staticmethod
    def update_profile(user_id, data):
        user = User.query.get(user_id)

        if not user:
            return False, "User not found"

        if "phone" in data:
            user.phone = data["phone"]

        if "address" in data:
            user.address = data["address"]

        db.session.commit()

        return True, "Profile updated"



    @staticmethod
    def get_books():
        books = Book.query.all()

        return [
            {
                "id": b.id,
                "title": b.title,
                "author": b.author,
                "available": b.available
            }
            for b in books
        ]


    @staticmethod
    def get_book(book_id):
        book = Book.query.get(book_id)

        if not book:
            return {"message": "Not found"}

        return {
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "available": book.available,
            "status": book.status
        }


    @staticmethod
    def search_books(query):
        books = Book.query.filter(Book.title.contains(query)).all()

        return [
            {
                "id": b.id,
                "title": b.title,
                "author": b.author
            }
            for b in books
        ]



    @staticmethod
    def reserve_book(user_id, book_id):
        if not User.query.get(user_id) or not Book.query.get(book_id):
            return False, "Not found"

        r = Reservation(user_id=user_id, book_id=book_id)

        db.session.add(r)
        db.session.commit()

        return True, "Reserved"


    @staticmethod
    def get_history(user_id):
        borrows = BorrowedBook.query.filter_by(user_id=user_id).all()

        return [
            {
                "book": b.book.title,
                "status": b.status.value
            }
            for b in borrows
        ]



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

        due_date = UserService._due_date(borrow.book)
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

        return True, UserService._borrow_response(borrow)
