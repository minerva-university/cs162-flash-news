from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.exceptions import NotFound, BadRequest
from datetime import datetime
from bson import ObjectId
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
import json
import os
from werkzeug.utils import secure_filename
from .config import Config 

from . import db
from .models import User, Follow 

# Initialize blueprint
user_bp = Blueprint('user', __name__, url_prefix='/api/user')

UPLOAD_FOLDER = Config.UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Helper function for allowed file extensions
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@user_bp.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(Config.UPLOAD_FOLDER, filename)

# Utility function for consistent success handling
def create_success_response(message, status_code=200, data=None):
    return jsonify({
        'status': 'success',
        'message': message,
        'data': data
    }), status_code

# Utility function for consistent error handling
def create_error_response(message, status_code=400, details=None):
    return jsonify({
        'status': 'error',
        'message': message,
        'details': details
    }), status_code


# Get (view) user's profile 
@user_bp.route('/', methods=['GET'])
@jwt_required()
def get_profile(): 
    try:
        current_user_id = get_jwt_identity()
        print(f"JWT Identity: {current_user_id}")  # Debugging
        user = User.query.get(current_user_id)

        if not user:
            return create_error_response('User not found', 404)
        
        # Create the profile picture URL
        profile_picture_url = None
        if user.profile_picture:
            profile_picture_path = os.path.join(UPLOAD_FOLDER, user.profile_picture)
            if os.path.exists(profile_picture_path):
                profile_picture_url = f"http://127.0.0.1:5000/api/user/uploads/{user.profile_picture}"
        
        tags = json.loads(user.tags) if user.tags else []

        user_data = {
            'user_id': user.user_id,
            'username': user.username,
            'email': user.email,
            'bio_description': user.bio_description,
            'profile_picture': profile_picture_url,
            'tags': tags,
            'created_at': user.created_at
        }
        return create_success_response('User profile fetched successfully', 200, user_data)
    
    except SQLAlchemyError as e:
        db.session.rollback()
        return create_error_response('Database error occurred', 500, str(e))
        
    except Exception as e:
        return create_error_response('An unexpected error occurred', 500, str(e))

# Update user profile
@user_bp.route('/', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        print(f"Current user ID: {current_user_id}")
        user = User.query.get(current_user_id)
        if not user:
            print("User not found")
            return create_error_response('User not found', 404)

        data = request.form  
        print(f"Received data: {data}")
        new_username = data.get('username', user.username)
        print(f"New username: {new_username}")
        file = request.files.get("profile_picture")
        print(f"File received: {file}")

        # Commenting this out because users should not be able to change their email
        #new_email = data.get('email', user.email)

        if not new_username:
            return create_error_response('Username is required', 400)
        
        # Check if the new username already exists
        if new_username != user.username:
            existing_user = User.query.filter_by(username=new_username).first()
            if existing_user:
                return create_error_response('Username already exists', 400)

        """
        # Check if the new email already exists
        if new_email != user.email:
            existing_email_user = User.query.filter_by(email=new_email).first()
            if existing_email_user:
                return create_error_response('Email already exists', 400)
        """

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            user.profile_picture = filename
        
        # Updating user fields
        user.bio_description = data.get('bio_description') or None
        print(f"Updating user: {user}")
        user.profile_picture = data.get('profile_picture', user.profile_picture) or None
        print(f"Path to profile picture: {user.profile_picture}")
        tags = data.get('tags', '[]')  # Default to an empty list
        user.tags = json.dumps(json.loads(tags))  # Ensure JSON format
        print(f"Tags: {user.tags}")
        db.session.commit()

        updated_user_data = {
            'user_id': user.user_id,
            'username': new_username,
            'email': user.email,
            'bio_description': user.bio_description,
            'profile_picture': f"http://127.0.0.1:5000/api/user/uploads/{user.profile_picture}", # Hard-Coded for now
            'created_at': user.created_at
        }

        return create_success_response('Profile updated successfully', 200, updated_user_data)

    except SQLAlchemyError as e:
        print(f"SQLAlchemy Error: {str(e)}")
        db.session.rollback()
        return create_error_response('Database error occurred', 500, str(e))

    except Exception as e:
        import traceback
        traceback.print_exc()
        return create_error_response('An unexpected error occurred', 500, str(e))

# Delete user profile
@user_bp.route('/', methods=['DELETE'])
@jwt_required()
def delete_user():
    try:
        # Get the current user's ID from the JWT token
        current_user_id = get_jwt_identity()

        # Retrieve the user object from the database using user_id as primary key
        user = User.query.filter_by(user_id=current_user_id).first()

        if not user:
            return create_error_response('User not found', 404)

        # Deleting the user from the database
        db.session.delete(user)
        db.session.commit()

        return create_success_response('User account deleted successfully', 200) 

    except SQLAlchemyError as e:
        db.session.rollback()
        return create_error_response('Database error occurred', 500, str(e))

    except Exception as e:
        return create_error_response('An unexpected error occurred', 500, str(e))



# Follow user route
@user_bp.route('/follow/<int:user_id>', methods=['POST'])
@jwt_required()
def follow_user(user_id):
    try:
        current_user_id = get_jwt_identity()

        # Ensure the user cannot follow themselves
        if current_user_id == user_id:
            return create_error_response('You cannot follow yourself', 400)

        # Check if the target user exists
        user_to_follow = User.query.get(user_id)
        if not user_to_follow:
            return create_error_response('User not found', 404)

        # Check if the current user is already following the target user
        existing_follow = Follow.query.filter_by(follower_id=current_user_id, user_id=user_id).first()
        if existing_follow:
            return create_error_response('You are already following this user', 400)

        # Create a new follow relationship
        new_follow = Follow(follower_id=current_user_id, user_id=user_id)
        db.session.add(new_follow)
        db.session.commit()

        return create_success_response('Successfully followed the user', 200)

    except SQLAlchemyError as e:
        db.session.rollback()
        return create_error_response('Database error occurred', 500, str(e))

    except Exception as e:
        db.session.rollback()
        return create_error_response(str(e), 500)

# Unfollow user route
@user_bp.route('/unfollow/<int:user_id>', methods=['POST'])
@jwt_required() 
def unfollow_user(user_id):
    try: 
        current_user_id = get_jwt_identity()

        # Ensure the user cannot unfollow themselves
        if current_user_id == user_id:
            return create_error_response('You cannot unfollow yourself', 400)

        # Check if the target user exists
        user_to_unfollow = User.query.get(user_id)
        if not user_to_unfollow:
            return create_error_response('User not found', 404)

        # Check if the current user is following the target user
        existing_follow = Follow.query.filter_by(follower_id=current_user_id, user_id=user_id).first()
        if not existing_follow:
            return create_error_response('You are not following this user', 400)

        # Remove the follow relationship
        db.session.delete(existing_follow)
        db.session.commit()

        return create_success_response('Successfully unfollowed the user', 200)

    except SQLAlchemyError as e:
        db.session.rollback()
        return create_error_response('Database error occurred', 500, str(e))

    except Exception as e:
        db.session.rollback()
        return create_error_response(str(e), 500)