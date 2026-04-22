from apiflask import APIBlueprint

bp = APIBlueprint(
    "user",
    __name__,
    url_prefix="/api/user",
    tag="User"
)

from app.blueprints.user import routes