from app.blueprints.user import bp
from bibliotarApp.app.blueprints.user.schemas import UserLoginSchema, UserRequestSchema, UserResponseSchema
from bibliotarApp.app.blueprints.user.service import UserService
from apiflask import HTTPError

@bp.route('/')
def index():
    return 'This is The User Blueprint'

@bp.post('/registrate')
@bp.input(UserRequestSchema, location="json")
@bp.output(UserResponseSchema)
def user_registrate(json_data):
    succes, response = UserService.user_registrate(json_data)
    if succes:
        return response, 201
    raise HTTPError(message=response, status_code=400)

@bp.post('/login')
@bp.input(UserLoginSchema, location="json")
@bp.output(UserResponseSchema)
def user_login(json_data):
    succes, response = UserService.user_login(json_data)
    if succes:
        return response, 201
    raise HTTPError(message=response, status_code=400)