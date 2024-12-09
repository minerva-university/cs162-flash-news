from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from datetime import timedelta
from dotenv import load_dotenv
import os
from .models import User, RevokedToken


# Load environment variables from .env file
load_dotenv()

# https://stackoverflow.com/a/78849992/11620221
from flask_cors import CORS

# init SQLAlchemy so we can use it later in our models
db = SQLAlchemy()
jwt = JWTManager()


@jwt.user_lookup_loader
def load_user(jwt_header, jwt_data):
    user_id = jwt_data["sub"]
    if user_id is not None:
        return User.query.get(user_id)
    return None


@jwt.user_identity_loader
def user_identity_lookup(user):
    """Define how the user object is encoded in the JWT."""
    return user.user_id


@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return RevokedToken.query.filter_by(jti=jti).first() is not None


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URI")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(
        hours=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS"))
    )
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(
        days=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS"))
    )
    app.config["debug"] = os.getenv("DEBUG").lower() == "true"

    # https://stackoverflow.com/a/40365514/11620221
    # Don't be strict about trailing slashes in routes
    app.url_map.strict_slashes = False

    # Allow CORS for all API routes
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": "*",
                "methods": ["GET", "POST", "PUT", "DELETE"],
            }
        },
    )

    db.init_app(app)
    jwt.init_app(app)  # Initialize JWT

    # blueprint for auth routes in our app
    # from .auth import auth as auth_blueprint
    # app.register_blueprint(auth_blueprint)

    # blueprint for user routes in our app
    # from .user import users as user_blueprint
    # app.register_blueprint(user_blueprint)

    # blueprint for post routes in our app
    from .post import posts as posts_blueprint

    app.register_blueprint(posts_blueprint, url_prefix="/api/")

    # blueprint for comment routes in our app
    from .comment import comments as comments_blueprint

    app.register_blueprint(comments_blueprint, url_prefix="/api/")

    # blueprint for like routes in our app
    from .like import likes as likes_blueprint

    app.register_blueprint(likes_blueprint, url_prefix="/api/")

    # blueprint for collection routes in our app
    from .collection import collections as collections_blueprint

    app.register_blueprint(collections_blueprint)

    # blueprint for OpenGraph routes in our app
    from .og import opengraph_bp as og_blueprint

    app.register_blueprint(og_blueprint, url_prefix="/api/")

    # Initialize the database
    with app.app_context():
        db.create_all()

    return app
