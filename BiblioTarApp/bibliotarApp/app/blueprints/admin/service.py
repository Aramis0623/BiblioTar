from app.extensions import db
from app.models.book import Book
from app.blueprints.admin.schemas import BookResponseSchema
from sqlalchemy import select

class AdminService:

    @staticmethod
    def create_book(request):
        try:
            book = Book(
                title=request["title"],
                author=request["author"],
                publishingYear=request["publishingYear"],
                available=True,
                status="available"
            )
            db.session.add(book)
            db.session.commit()
            return True, BookResponseSchema().dump(book)
        except Exception as ex:
            print("BOOK CREATE ERROR:", repr(ex))
            raise

    @staticmethod
    def update_book(book_id, request):
        book = db.session.get(Book, book_id)
        if not book:
            return False, "Book not found"

        if "title" in request:
            book.title = request["title"]

        if "author" in request:
            book.author = request["author"]

        if "publishingYear" in request:
            book.publishingYear = request["publishingYear"]

        if "status" in request:
            book.status = request["status"]

            if request["status"] in ["damaged", "lost"]:
                book.available = False
            elif request["status"] == "available":
                book.available = True

        if "available" in request:
            book.available = request["available"]

        db.session.commit()
        return True, BookResponseSchema().dump(book)

    @staticmethod
    def delete_book(book_id):
        book = db.session.get(Book, book_id)
        if not book:
            return False, "Book not found"
        if book.borrowed_books:
            return False, "Cannot delete book with borrow history"

        db.session.delete(book)
        db.session.commit()
        return True, "Book deleted"

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