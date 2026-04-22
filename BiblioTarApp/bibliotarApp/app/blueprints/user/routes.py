from app.blueprints.user import bp
from app.blueprints.user.schemas import (
    UserLoginSchema,
    UserRequestSchema,
    UserResponseSchema,
    UserUpdateSchema,
    BookSearchSchema
)
from app.blueprints.user.service import UserService
from apiflask import HTTPError



@bp.post("/register")
@bp.input(UserRequestSchema)
@bp.output(UserResponseSchema)
def register(json_data):
    success, res = UserService.register(json_data)

    if success:
        return res, 201

    raise HTTPError(message=res, status_code=400)



@bp.post("/login")
@bp.input(UserLoginSchema)
@bp.output(UserResponseSchema)
def login(json_data):
    success, res = UserService.login(json_data)

    if success:
        return res, 200

    raise HTTPError(message=res, status_code=400)



@bp.put('/profile/update/<int:user_id>')
@bp.doc(tags=["User"])
@bp.input(UserUpdateSchema, location="json")
def user_update_profile(user_id, json_data):
    success, response = UserService.update_profile(user_id, json_data)

    if success:
        return {"message": response}, 200

    raise HTTPError(status_code=400, message=response)



@bp.get("/books")
def get_books():
    return UserService.get_books()


@bp.get("/books/<int:book_id>")
def get_book(book_id):
    return UserService.get_book(book_id)


@bp.get("/books/search")
@bp.input(BookSearchSchema, location="query")
def search_books(query_data):
    return UserService.search_books(query_data["query"])



@bp.post("/reserve/<int:book_id>/<int:user_id>")
def reserve(book_id, user_id):
    success, res = UserService.reserve_book(user_id, book_id)

    if success:
        return {"message": res}, 201

    raise HTTPError(message=res, status_code=400)



@bp.get("/history/<int:user_id>")
def history(user_id):
    return UserService.get_history(user_id)


@bp.put("/borrow/extend/<int:borrow_id>")
def extend(borrow_id):
    success, res = UserService.extend_borrow(borrow_id)

    if success:
        return {"message": res}, 200

    raise HTTPError(message=res, status_code=400)