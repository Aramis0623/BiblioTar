from apiflask import APIBlueprint

bp = APIBlueprint("librarian", __name__, url_prefix="/api/librarian", tag="Librarian")

from app.blueprints.librarian import routes