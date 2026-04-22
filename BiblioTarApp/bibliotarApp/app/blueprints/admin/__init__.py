from apiflask import APIBlueprint

bp = APIBlueprint("admin", __name__, url_prefix="/api/admin", tag="Admin")

from app.blueprints.admin import routes