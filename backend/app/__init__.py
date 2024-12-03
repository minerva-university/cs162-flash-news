from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

# https://stackoverflow.com/a/78849992/11620221
from flask_cors import CORS

# init SQLAlchemy so we can use it later in our models
db = SQLAlchemy()


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = "dev"
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"
    app.config["debug"] = True

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
    # from .collection import collections as collections_blueprint
    # app.register_blueprint(collections_blueprint)

    # blueprint for OpenGraph routes in our app
    from .og import opengraph_bp as og_blueprint
    app.register_blueprint(og_blueprint, url_prefix="/api/")

    # Initialize the database
    with app.app_context():
        db.create_all()

    return app
