from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from datetime import timedelta
from dotenv import load_dotenv
import os
from flask_cors import CORS  # https://stackoverflow.com/a/78849992/11620221
from flask_restx import Api
import logging


# Load environment variables from .env file
load_dotenv()


# init SQLAlchemy so we can use it later in our models
db = SQLAlchemy()
jwt = JWTManager()


@jwt.user_lookup_loader
def load_user(jwt_header, jwt_data):
    from .models import User

    user_id = jwt_data["sub"]

    if user_id is not None:
        return User.query.get(user_id)
    return None


@jwt.user_identity_loader
def user_identity_lookup(user):
    """Define how the user object is encoded in the JWT."""
    # User id is going to be a string since JWT sub needs to be a string
    if isinstance(user, str):
        return user
    return str(user)  # Always return a string


@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    from .models import RevokedToken

    jti = jwt_payload["jti"]
    return RevokedToken.query.filter_by(jti=jti).first() is not None


def create_app():
    app = Flask(__name__)
    app.logger.setLevel(logging.INFO)  # Set logging level
    
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev")
    
    # Case 1: Testing environment
    if app.config.get("TESTING", False):
        if os.getenv("CI"):
            app.logger.info("Using TESTING environment with CI configuration")
            app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
                "DATABASE_URI",
                "postgresql://testuser:testpassword@localhost:5432/testdb",
            )
        else:
            app.logger.info("Using TESTING environment with local configuration")
            app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///test.db"

    # Case 2: Production environment (Vercel/Docker) or CI
    elif os.getenv("prod") or os.getenv("CI"):
        app.logger.info("Using PRODUCTION environment")
        app.logger.info(f"prod env: {os.getenv('prod')}")
        app.logger.info(f"CI env: {os.getenv('CI')}")
        app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
            "DATABASE_URI", "postgresql://postgres:password@localhost:5432/flashnews"
        )

    # Case 3: Local development (default)
    else:
        app.logger.info("Using LOCAL DEVELOPMENT environment")
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"

    # Log the final database URI (TO BE REMOVED)
    app.logger.info(f"Using database: {app.config['SQLALCHEMY_DATABASE_URI']}")

    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(
        hours=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS", 12))
    )
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(
        days=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", 30))
    )
    app.config["debug"] = os.getenv("DEBUG", "true").lower() == "true"
    app.config["RESTX_MASK_SWAGGER"] = False

    # https://stackoverflow.com/a/40365514/11620221
    # Don't be strict about trailing slashes in routes
    app.url_map.strict_slashes = False

    origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

    # Allow CORS for all API routes
    CORS(
        app,
        resources={
            r"/*": {
                "origins": origins,
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
            }
        },
        supports_credentials=True,
    )

    db.init_app(app)
    jwt.init_app(app)

    authorizations = {
        "Bearer Auth": {"type": "apiKey", "in": "header", "name": "Authorization"}
    }

    # Initialize RESTx API
    api = Api(
        app,
        title="Your App API",
        version="1.0",
        description="Comprehensive API documentation for your Flask app",
        doc="/",
        authorizations=authorizations,
        security="Bearer Auth",
    )

    # Import namespaces
    from .auth import api as auth_ns
    from .user import api as user_ns
    from .post import api as post_ns
    from .comment import api as comment_ns
    from .like import api as like_ns
    from .collection import api as collection_ns
    from .og import api as og_ns

    # Add namespaces to the API
    api.add_namespace(auth_ns, path="/api")
    api.add_namespace(user_ns, path="/api/user")
    api.add_namespace(post_ns, path="/api/posts")
    api.add_namespace(comment_ns, path="/api/comments")
    api.add_namespace(like_ns, path="/api/likes")
    api.add_namespace(collection_ns, path="/api/collections")
    api.add_namespace(og_ns, path="/api/og")

    # Avoids circular imports by importing models in this format
    with app.app_context():
        from .models import User, RevokedToken  # Import models lazily

        db.create_all()  # Create all tables in the database

    return app
