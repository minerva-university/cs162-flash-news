import re
from flask import request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
from flask_restx import Namespace, Resource, fields
from .models import User, RevokedToken
from . import db
from .utils import create_success_response, create_error_response

api = Namespace("auth", description="Authentication operations")

register_model = api.model(
    "Register",
    {
        "username": fields.String(
            required=True,
            description="Username",
            example="john_doe",
        ),
        "email": fields.String(
            required=True,
            description="Email address",
            example="john_doe@gmail.com",
        ),
        "password": fields.String(
            required=True,
            description="Password",
            example="password123",
        ),
    },
)


login_model = api.model(
    "Login",
    {
        "email": fields.String(
            required=True,
            description="Email address",
            example="john_doe@gmail.com",
        ),
        "password": fields.String(
            required=True,
            description="Password",
            example="password123",
        ),
    },
)


def validate_password(password):
    """Can add these checks to validate the password:
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one digit."
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character."
    """
    return True, ""


def validate_email(email):
    """Validate the email address using a regular expression."""
    email_regex = r"^((?!\.)[a-zA-Z0-9_.-]*[^.])(@[a-zA-Z0-9-]+)(\.[a-zA-Z0-9-.]+)$"  # character \w-_ was causing an error, so regex has been updated.
    if not re.match(email_regex, email, re.IGNORECASE):
        return False, "Invalid email address."
    return True, None


@api.route("/register")
class Register(Resource):
    @api.expect(register_model)
    def post(self):
        data = request.get_json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return create_error_response(
                "Missing username, email or password", status_code=400
            )

        if (
            User.query.filter(
                (User.username == username) | (User.email == email)
            ).first()
            is not None
        ):
            return create_error_response("User already exists", status_code=400)

        # Validate email address
        is_valid_email, email_message = validate_email(email)
        if not is_valid_email:
            return create_error_response(
                "Is not valid email", email_message, status_code=400
            )

        # Validate password
        is_valid_password, password_message = validate_password(password)
        if not is_valid_password:
            return create_error_response(
                "Is not valid password", password_message, status_code=400
            )

        hashed_password = generate_password_hash(
            password
        )  # By default, it has 16 character of salt.
        new_user = User(username=username, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        access_token = create_access_token(identity=str(new_user.user_id))
        refresh_token = create_refresh_token(identity=str(new_user.user_id))

        return create_success_response(
            "User registered successfully",
            status_code=201,
            data={
                "access_token": access_token,
                "refresh_token": refresh_token,
                "username": new_user.username,
                "profile_picture": f"/user/uploads/{new_user.profile_picture}",
            },
        )


@api.route("/login")
class Login(Resource):
    @api.expect(login_model)
    def post(self):
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return create_error_response("Missing email or password", status_code=400)

        user = User.query.filter_by(email=email).first()

        if not user or not check_password_hash(user.password, password):
            return create_error_response("Invalid credentials", status_code=401)

        access_token = create_access_token(identity=str(user.user_id))
        refresh_token = create_refresh_token(identity=str(user.user_id))

        # Includes username and profile picture as Pei suggested

        return create_success_response(
            "User logged in successfully",
            status_code=200,
            data={
                "access_token": access_token,
                "refresh_token": refresh_token,
                "username": user.username,
                "profile_picture": f"/user/uploads/{user.profile_picture}",
            },
        )


@api.route("/logout")
class Logout(Resource):
    @api.doc(security="Bearer Auth")
    @jwt_required()
    def post(self):
        jti = get_jwt()["jti"]
        revoked_token = RevokedToken(jti=jti)
        db.session.add(revoked_token)
        db.session.commit()
        return create_success_response("Successfully logged out", status_code=200)


@api.route("/refresh")
class Refresh(Resource):
    @api.doc(security="Bearer Auth")
    @jwt_required(refresh=True)
    def post(self):
        current_user_id = get_jwt_identity()
        new_access_token = create_access_token(identity=str(current_user_id))
        return create_success_response(
            "Token refreshed successfully",
            status_code=200,
            data={"access_token": new_access_token},
        )
