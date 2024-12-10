import pytest
from backend.app import create_app, db
from backend.app.models import User
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token


@pytest.fixture(autouse=True, scope="session")
def app_dict():
    app = create_app()
    app.config.update({
        'TESTING': True
    })

    with app.app_context():
        db.create_all()

        yield {
            'app': app,
            'db': db
        }

        db.session.remove()
        if 'test' in app.config["SQLALCHEMY_DATABASE_URI"]:
            db.drop_all()


@pytest.fixture(autouse=True)
def setup_db(app_dict):
    """Clear database before each test"""
    db = app_dict['db']
    with app_dict['app'].app_context():
        # Clear all tables
        db.drop_all()
        db.create_all()


@pytest.fixture
def test_user(app_dict):
    db = app_dict['db']
    app = app_dict['app']

    with app.app_context():
        try:
            # First check if user already exists
            existing_user = User.query.filter_by(email='test@test.com').first()
            if existing_user:
                db.session.delete(existing_user)
                db.session.commit()

            # Create new user with hashed password
            user = User(
                email='test@test.com',
                username='testuser',
                password=generate_password_hash('password123')
            )

            db.session.add(user)
            db.session.commit()

            created_user = User.query.filter_by(email='test@test.com').first()
            if not created_user:
                raise Exception("Failed to create test user")

            return created_user

        except Exception as e:
            print(f"Error in test_user fixture: {str(e)}")
            db.session.rollback()
            raise


@pytest.fixture()
def client(app_dict, test_user):
    app = app_dict['app']
    db = app_dict['db']
    client = app.test_client()
    
    # Create access token for test user
    with app.app_context():
        access_token = create_access_token(identity=str(test_user.user_id))
        # Set the Authorization header for subsequent requests
        client.environ_base['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
    
    yield client
    # Cleanup
    db.session.rollback()
