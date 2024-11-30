from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from datetime import timedelta
from dotenv import load_dotenv
import os
from .models import User, RevokedToken


# Load environment variables from .env file
load_dotenv()

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

    db.init_app(app)
    jwt.init_app(app)  # Initialize JWT

    # blueprint for auth routes in our app
    # from .auth import auth as auth_blueprint
    # app.register_blueprint(auth_blueprint)

    # blueprint for user routes in our app
    # from .user import users as user_blueprint
    # app.register_blueprint(user_blueprint)

    # blueprint for post routes in our app
    # from .post import posts as posts_blueprint
    # app.register_blueprint(posts_blueprint)

    # blueprint for collection routes in our app
    # from .collections import collections as collections_blueprint
    # app.register_blueprint(collections_blueprint)

    # Initialize the database
    with app.app_context():
        db.create_all()

    @app.route("/")
    def home():
        return "Hello, Flask!"

    return app
