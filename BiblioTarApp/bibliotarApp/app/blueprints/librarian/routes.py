from apiflask import HTTPError

from app.blueprints.librarian import bp
from app.blueprints.librarian.schemas import (
    BookSearchSchema,
    BorrowCreateSchema,
    BorrowedBookResponseSchema,
    BorrowExtendSchema,
    BorrowReturnSchema,
    BorrowSearchSchema,
    FineCreateSchema
)
from app.blueprints.librarian.service import LibrarianService


@bp.post("/borrow")
@bp.input(BorrowCreateSchema)
@bp.output(BorrowedBookResponseSchema)
def create_borrow(json_data):
    success, response = LibrarianService.create_borrow(json_data)

    if success:
        return response, 201

    raise HTTPError(message=response, status_code=400)


@bp.put("/borrow/<int:borrow_id>/return")
@bp.input(BorrowReturnSchema)
@bp.output(BorrowedBookResponseSchema)
def return_book(borrow_id, json_data):
    success, response = LibrarianService.return_book(borrow_id, json_data)

    if success:
        return response, 200

    raise HTTPError(message=response, status_code=400)


@bp.put("/borrow/<int:borrow_id>/extend")
@bp.input(BorrowExtendSchema)
@bp.output(BorrowedBookResponseSchema)
def extend_borrow(borrow_id, json_data):
    success, response = LibrarianService.extend_borrow(borrow_id, json_data)

    if success:
        return response, 200

    raise HTTPError(message=response, status_code=400)


@bp.put("/borrow/<int:borrow_id>/fine")
@bp.input(FineCreateSchema)
@bp.output(BorrowedBookResponseSchema)
def add_fine(borrow_id, json_data):
    success, response = LibrarianService.add_fine(borrow_id, json_data)

    if success:
        return response, 200

    raise HTTPError(message=response, status_code=400)


@bp.get("/borrows")
def get_borrows():
    return LibrarianService.get_borrows()


@bp.get("/books/search")
@bp.input(BookSearchSchema, location="query")
def search_books(query_data):
    return LibrarianService.search_books(query_data["query"])


@bp.get("/borrows/search")
@bp.input(BorrowSearchSchema, location="query")
def search_borrows(query_data):
    return LibrarianService.search_borrows(query_data["query"])
