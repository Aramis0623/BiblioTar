from app.models.user import User
from app.models.book import Book
from app.models.borrowedBook import BorrowedBook
from app.models.reservation import Reservation
from app.extensions import db
from sqlalchemy import select
from app.blueprints.user.schemas import UserResponseSchema


class UserService:


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
    def extend_borrow(borrow_id):
        borrow = BorrowedBook.query.get(borrow_id)

        if not borrow:
            return False, "Not found"

        if borrow.extend_count >= 2:
            return False, "Max extension reached"

        borrow.extend_count += 1
        db.session.commit()

        return True, "Extended"