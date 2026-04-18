from apiflask import APIBlueprint

bp = APIBlueprint('main', __name__, tag="main")

@bp.route('/')
def index():
    return 'This is The Main Blueprint'

from app.blueprints.user import bp as user_bp
bp.register_blueprint(user_bp, url_prefix="/user")

from app.blueprints.admin import bp as admin_bp
bp.register_blueprint(admin_bp, url_prefix="/admin")

from app.models import *
