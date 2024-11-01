from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

# init SQLAlchemy so we can use it later in our models
db = SQLAlchemy()


def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = 'dev'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'

    db.init_app(app)

    '''
    This is legacy code from the tutorial. This should be removed.

    # Login authentication
    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)


    # this was a blue print for the user model
    from .models import User

    @login_manager.user_loader
    def load_user(user_id):
        # since the user_id is just the primary key of our user table, use it in the query for the user
        return User.query.get(int(user_id))

    # blueprint for auth routes in our app
    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)

    # blueprint for non-auth parts of app
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)
    '''

    return app


'''
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'  # You'll create this route later

    from .user import user_bp
    app.register_blueprint(user_bp, url_prefix='/user')

    # You'll need to add a user loader for flask-login
    @login_manager.user_loader
    def load_user(user_id):
        from .user import User
        return User.query.get(int(user_id))

    return app
'''