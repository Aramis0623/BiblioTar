from app.extensions import db
from app.blueprints.user.schemas import UserResponseSchema
from app.models.user import User
#from app.models.address import Address (Nekunk nincs ilyen nevu model)
from sqlalchemy import select
from app.models.role import Role

class UserService:
    @staticmethod
    def user_registrate(request):
        try:
            if db.session.execute(select(User).filter_by(email = request["email"])).scalar_one_or_none():
                return False, "E-mail already exist!"
            # request["address"] = Address(**request["address"])
            # user = User(**request)
            user = User(name=request["name"], email=request["email"], phone=request["phone"], address=request["address"])
            # user.set_password(user.password)
            user.roles.append(db.session.execute(select(Role).filter_by(name="User")).scalar_one())
            db.session.add(user)
            db.session.commit()
            return True, UserResponseSchema().dump(user)
        except Exception as ex:
            print("REGISTRATION ERROR:", repr(ex))
            raise
            # return False, "Incorrect user data!"
    @staticmethod
    def user_login(request):
        pass