from datetime import date, timedelta, datetime
from app.models.user import User
from app.models.book import Book
from app.models.role import Role
from app.models.borrowedBook import BorrowedBook, StatusEnum
from app.models.reservation import Reservation
from app.extensions import db
from sqlalchemy import select
from app.blueprints.user.schemas import RoleSchema, UserResponseSchema, PayloadSchema
from authlib.jose import jwt
from flask import current_app


class UserService:

    @staticmethod
    def _due_date(book):
        if not book.dateBorrowed:
            return None

        return book.dateBorrowed + timedelta(days=book.daysBorrowed)

    @staticmethod
    def _borrow_response(borrow):
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
            "fine": borrow.fine or 0,
        }

    @staticmethod
    def register(data):
        if User.query.filter_by(email=data["email"]).first():
            return False, "Email already exists"

        user_role = Role.query.filter_by(name="user").first()

        if not user_role:
            return False, "Default role not found"

        user = User(
            name=data["name"],
            email=data["email"],
            phone=data["phone"],
            address=data["address"]
        )

        user.set_password(data["password"])

        user.roles.append(user_role)
        db.session.add(user)
        db.session.commit()

        return True, user



    @staticmethod
    def login(data):
        user = User.query.filter_by(email=data["email"]).first()

        if not user:
            return False, "User not found"

        if not user.check_password(data["password"]):
            return False, "Wrong password"
        user_schema = UserResponseSchema().dump(user)
        user_schema["token"] = UserService.token_generate(user)
        return True, user_schema

    @staticmethod
    def token_generate(user : User):
        payload = PayloadSchema()
        payload.exp = int((datetime.now() + timedelta(minutes=30)).timestamp())
        payload.user_id = user.id
        payload.roles = RoleSchema().dump(user.roles, many=True)
        return jwt.encode( { "alg" : "RS256"}, PayloadSchema().dump(payload), current_app.config["SECRET_KEY"]).decode()

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
                "available": b.available,
                "status": b.status,
                "publishingYear": b.publishingYear,
                "reserved_by": b.reservations[0].user_id if b.reservations else None
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
            "status": book.status,
            "publishingYear": book.publishingYear,
            "reserved_by": book.reservations[0].user_id if book.reservations else None
        }


    @staticmethod
    def search_books(query):
        books = Book.query.filter(
            Book.title.contains(query) | Book.author.contains(query)
        ).all()

        return [
            {
                "id": b.id,
                "title": b.title,
                "author": b.author,
                "available": b.available,
                "status": b.status,
                "publishingYear": b.publishingYear,
                "reserved_by": b.reservations[0].user_id if b.reservations else None
            }
            for b in books
        ]



    @staticmethod
    def reserve_book(user_id, book_id):
        user = db.session.get(User, user_id)
        book = db.session.get(Book, book_id)

        if not user or not book:
            return False, "Nem található felhasználó vagy könyv"

        if not book.available:
            return False, "A könyv jelenleg nem foglalható"

        
        existing = Reservation.query.filter_by(user_id=user_id, book_id=book_id).first()
        if existing:
            return False, "Ezt a könyvet már lefoglaltad"

        r = Reservation(user_id=user_id, book_id=book_id)
        
        book.available = False
        book.status = "reserved"

        db.session.add(r)
        db.session.commit()

        return True, "Sikeres foglalás!"


    @staticmethod
    def get_history(user_id):
        
        borrows = BorrowedBook.query.filter_by(user_id=user_id).all()
        history = []
        
        for b in borrows:
            due_date = UserService._due_date(b.book)
            history.append({
                "id": b.id,
                "book": b.book.title,
                "status": b.status.value,
                "dateBorrowed": b.book.dateBorrowed.isoformat() if b.book.dateBorrowed else None,
                "dueDate": due_date.isoformat() if due_date else None,
                "returnDate": b.dateReturned.isoformat() if b.dateReturned else None,
                "fine": b.fine,
                "type": "borrow"
            })

        
        reservations = Reservation.query.filter_by(user_id=user_id).all()
        for r in reservations:
            history.append({
                "id": f"res-{r.id}",
                "book": r.book.title,
                "status": "reserved",
                "dateBorrowed": None,
                "dueDate": None,
                "returnDate": None,
                "fine": 0,
                "type": "reservation"
            })

        return history



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
