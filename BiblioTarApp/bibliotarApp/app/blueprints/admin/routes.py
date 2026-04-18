from app.blueprints.admin import bp
from app.blueprints.admin.schemas import (BookCreateSchema, BookUpdateSchema, BookResponseSchema, BookSearchSchema)
from app.blueprints.admin.service import AdminService
from apiflask import HTTPError


@bp.post('/books')
@bp.input(BookCreateSchema)
@bp.output(BookResponseSchema)
def create_book(json_data):
    success, response = AdminService.create_book(json_data)
    if success:
        return response, 201
    raise HTTPError(400, message=response)


@bp.put('/books/<int:book_id>')
@bp.input(BookUpdateSchema)
@bp.output(BookResponseSchema)
def update_book(book_id, json_data):
    success, response = AdminService.update_book(book_id, json_data)
    if success:
        return response
    raise HTTPError(404, message=response)


@bp.delete('/books/<int:book_id>')
def delete_book(book_id):
    success, response = AdminService.delete_book(book_id)
    if success:
        return {"message": response}
    raise HTTPError(404, message=response)

@bp.get("/books/search")
@bp.input(BookSearchSchema, location="query")
def search_books(query_data):
    return AdminService.search_books(query_data["query"])

@bp.get("/books")
def get_books():
    return AdminService.get_books()