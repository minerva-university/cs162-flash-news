from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from .collection import collections

# init SQLAlchemy so we can use it later in our models
db = SQLAlchemy()


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = "dev"
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"
    app.config["debug"] = True
    app.config["SECRET_KEY"] = "dev"
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"
    app.config["debug"] = True

    db.init_app(app)

    login_manager = LoginManager()
    login_manager.init_app(app)

    from .models import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # blueprint for auth routes in our app
    from .auth import auth as auth_blueprint

    app.register_blueprint(auth_blueprint)

    # blueprint for user routes in our app
    from .user import users as user_blueprint

    app.register_blueprint(user_blueprint)

    # blueprint for post routes in our app
    from .post import posts as posts_blueprint

    app.register_blueprint(posts_blueprint)

    # blueprint for collection routes in our app
    from .collection import collections as collections_blueprint

    app.register_blueprint(collections_blueprint)

    # Initialize the database
    with app.app_context():
        db.create_all()

    return app
