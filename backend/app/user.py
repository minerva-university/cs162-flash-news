from flask import request, send_from_directory
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
import json
import os
from werkzeug.utils import secure_filename
from .utils import create_success_response, create_error_response
from .config import Config
from . import db
from .models import User, Follow

api = Namespace("users", description="User related operations")

user_model = api.model(
    "User",
    {
        "username": fields.String(
            required=True,
            description="Username",
            example="john_doe",
        ),
        "bio_description": fields.String(
            description="Bio description",
            example="I am a software developer",
        ),
        "tags": fields.List(
            fields.String,
            description="User tags",
            example=["tag1", "tag2"],
        ),
    },
)


UPLOAD_FOLDER = Config.UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# Helper function for allowed file extensions
def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS
    )


# Uploads route
@api.route("/uploads/<path:filename>")
class Uploads(Resource):
    def get(self, filename):
        return send_from_directory(Config.UPLOAD_FOLDER, filename)


# Get (view) user's profile
@api.route("/<string:username>")
class GetUserProfile(Resource):
    @api.doc(security="Bearer Auth")
    @jwt_required()
    def get(self, username):
        """Get user profile"""

        try:
            current_user_id = int(get_jwt_identity())
            user = User.query.filter_by(username=username).first()

            if not user:
                return create_error_response("User not found", status_code=404)

            # Determine if the logged-in user is the profile owner
            is_owner = current_user_id == user.user_id

            # Create the profile picture URL
            profile_picture_url = None
            if user.profile_picture:
                profile_picture_path = os.path.join(UPLOAD_FOLDER, user.profile_picture)
                if os.path.exists(profile_picture_path):
                    profile_picture_url = f"/user/uploads/{user.profile_picture}"

            tags = json.loads(user.tags) if user.tags else []

            user_data = {
                "user_id": user.user_id,
                "username": user.username,
                "email": user.email,
                "bio_description": user.bio_description,
                "profile_picture": profile_picture_url,
                "tags": tags,
                "created_at": user.created_at,
                "is_owner": is_owner,
            }
            return create_success_response(
                "User profile fetched successfully", status_code=200, data=user_data
            )

        except SQLAlchemyError as e:
            db.session.rollback()
            return create_error_response(
                "Database error occurred", status_code=500, details=str(e)
            )

        except Exception as e:
            return create_error_response(
                "An unexpected error occurred", status_code=500, details=str(e)
            )


# Update and delete user profile
@api.route("/")
class ModifyUserProfile(Resource):
    # Update user profile
    @api.doc(security="Bearer Auth")
    @api.expect(user_model)
    @jwt_required()
    def put(self):
        """Update user profile"""

        try:
            current_user_id = int(get_jwt_identity())
            user = User.query.get(current_user_id)
            if not user:
                return create_error_response("User not found", status_code=404)

            data = request.form
            new_username = data.get("username", user.username)
            file = request.files.get("profile_picture")

            if not new_username:
                return create_error_response("Username is required", status_code=400)

            # Check if the new username already exists
            if new_username != user.username:
                existing_user = User.query.filter_by(username=new_username).first()
                if existing_user:
                    return create_error_response(
                        "Username already exists", status_code=400
                    )

            # Profile Picture Upload
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(UPLOAD_FOLDER, filename))
                user.profile_picture = filename

            # Updating user fields
            user.username = new_username
            user.bio_description = (
                data.get("bio_description", user.bio_description) or None
            )
            user.profile_picture = (
                data.get("profile_picture", user.profile_picture) or None
            )
            tags = data.get("tags", "[]") or "[]"  # Default to an empty list
            user.tags = json.dumps(json.loads(tags))  # Ensure JSON format
            db.session.commit()

            updated_user_data = {
                "user_id": user.user_id,
                "username": user.username,
                "email": user.email,
                "bio_description": user.bio_description,
                "profile_picture": f"/user/uploads/{user.profile_picture}",  # Return relative URL
                "created_at": user.created_at,
            }

            return create_success_response(
                "Profile updated successfully", status_code=200, data=updated_user_data
            )

        except SQLAlchemyError as e:
            db.session.rollback()
            return create_error_response(
                "Database error occurred", status_code=500, details=str(e)
            )

        except Exception as e:
            import traceback

            traceback.print_exc()
            return create_error_response(
                "An unexpected error occurred", status_code=500, details=str(e)
            )

    # Delete user profile
    @api.doc(security="Bearer Auth")
    @jwt_required()
    def delete(self):
        """Delete user account"""

        try:
            current_user_id = int(get_jwt_identity())
            user = User.query.filter_by(user_id=current_user_id).first()

            if not user:
                return create_error_response("User not found", status_code=404)

            # Deleting the user from the database
            db.session.delete(user)
            db.session.commit()

            return create_success_response(
                "User account deleted successfully", status_code=200
            )

        except SQLAlchemyError as e:
            db.session.rollback()
            return create_error_response(
                "Database error occurred", status_code=500, details=str(e)
            )

        except Exception as e:
            return create_error_response(
                "An unexpected error occurred", status_code=500, details=str(e)
            )


# Follow user route
@api.route("/follow/<int:user_id>")
class FollowUser(Resource):
    @api.doc(security="Bearer Auth")
    @jwt_required()
    def post(self, user_id):
        """Follow a user"""

        try:
            current_user_id = int(get_jwt_identity())

            # Ensure the user cannot follow themselves
            if current_user_id == user_id:
                return create_error_response(
                    "You cannot follow yourself", status_code=400
                )

            # Check if the target user exists
            user_to_follow = User.query.get(user_id)
            if not user_to_follow:
                return create_error_response("User not found", status_code=404)

            # Check if the current user is already following the target user
            existing_follow = Follow.query.filter_by(
                follower_id=current_user_id, user_id=user_id
            ).first()
            if existing_follow:
                return create_error_response(
                    "You are already following this user", status_code=400
                )

            # Create a new follow relationship
            new_follow = Follow(follower_id=current_user_id, user_id=user_id)
            db.session.add(new_follow)
            db.session.commit()

            return create_success_response(
                "Successfully followed the user", status_code=200
            )

        except SQLAlchemyError as e:
            db.session.rollback()
            return create_error_response(
                "Database error occurred", status_code=500, details=str(e)
            )

        except Exception as e:
            db.session.rollback()
            return create_error_response(
                "Error occurred", status_code=500, details=str(e)
            )


# Unfollow user route
@api.route("/unfollow/<int:user_id>")
class UnfollowUser(Resource):
    @api.doc(security="Bearer Auth")
    @jwt_required()
    def post(self, user_id):
        """Unfollow a user"""

        try:
            current_user_id = int(get_jwt_identity())

            # Ensure the user cannot unfollow themselves
            if current_user_id == user_id:
                return create_error_response(
                    "You cannot unfollow yourself", status_code=400
                )

            # Check if the target user exists
            user_to_unfollow = User.query.get(user_id)
            if not user_to_unfollow:
                return create_error_response("User not found", status_code=404)

            # Check if the current user is following the target user
            existing_follow = Follow.query.filter_by(
                follower_id=current_user_id, user_id=user_id
            ).first()
            if not existing_follow:
                return create_error_response(
                    "You are not following this user", status_code=400
                )

            # Remove the follow relationship
            db.session.delete(existing_follow)
            db.session.commit()

            return create_success_response(
                "Successfully unfollowed the user", status_code=200
            )

        except SQLAlchemyError as e:
            db.session.rollback()
            return create_error_response(
                "Database error occurred", status_code=500, details=str(e)
            )

        except Exception as e:
            db.session.rollback()
            return create_error_response(
                "Error occurred", status_code=500, details=str(e)
            )


# Get list of users the current user is following
@api.route("/following")
class GetFollowedUsers(Resource):
    @api.doc(security="Bearer Auth")
    @jwt_required()
    def get(self):
        """Get list of users the current user is following"""

        current_user = User.query.get(int(get_jwt_identity()))

        followed_users = [
            {"id": follow.user_id, "username": follow.followed_user.username}
            for follow in current_user.followings
        ]

        return create_success_response(
            "Got list of users the user is following successfully",
            status_code=200,
            data={"followed_users": followed_users},
        )


# Get list of users following the current user
@api.route("/followers")
class GetFollowers(Resource):
    @api.doc(security="Bearer Auth")
    @jwt_required()
    def get(self):
        """Get list of users following the current user"""

        current_user = User.query.get(int(get_jwt_identity()))

        followers = [
            {"id": follow.follower_id, "username": follow.following_user.username}
            for follow in current_user.followers
        ]
        return create_success_response(
            "Got list of users successfully",
            status_code=200,
            data={"followers": followers},
        )


# Search for users
@api.route("/search")
class SearchUsers(Resource):
    @api.doc(security="Bearer Auth")
    @api.expect(api.parser().add_argument("q", type=str, required=True))
    @jwt_required()
    def get(self):
        """Search for users by username or other criteria."""
        query = request.args.get("q", "").strip()

        if not query:
            return create_error_response("Search query is required.", 400)

        try:
            users = User.query.filter(User.username.ilike(f"%{query}%")).all()

            if not users:
                return create_success_response("No users found.", 200, [])

            users_data = [
                {
                    "user_id": user.user_id,
                    "username": user.username,
                    "profile_picture": f"/user/uploads/{user.profile_picture}",
                    "bio_description": user.bio_description,
                }
                for user in users
            ]
            return create_success_response("Users found.", 200, users_data)

        except SQLAlchemyError as e:
            db.session.rollback()
            return create_error_response("Database error occurred.", 500, str(e))

        except Exception as e:
            return create_error_response("An unexpected error occurred.", 500, str(e))
