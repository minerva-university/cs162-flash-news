from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.exceptions import NotFound, BadRequest
from datetime import datetime
from bson import ObjectId
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
import json

from . import db
from .models import User, Follow 

# Initialize blueprint
user_bp = Blueprint('user', __name__)


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
@user_bp.route('/user', methods=['GET'])
@jwt_required()
def get_profile(): 
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return create_error_response('User not found', 404)

        user_data = {
            'user_id': user.user_id,
            'username': user.username,
            'email': user.email,
            'bio_description': user.bio_description,
            'profile_picture': user.profile_picture,
            'created_at': user.created_at
        }
        return create_success_response('User profile fetched successfully', 200, user_data)
    
    except SQLAlchemyError as e:
        db.session.rollback()
        return create_error_response('Database error occurred', 500, str(e))
        
    except Exception as e:
        return create_error_response('An unexpected error occurred', 500, str(e))


@user_bp.route('/users/<string:username>', methods=['GET'])
def get_user_by_username(username):
    try:
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'user_id': user.user_id, 'username': user.username}), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@user_bp.route('/profile/<string:username>', methods=['GET'])
def get_user_profile(username):
    """Get user profile by username"""
    try:
        # Query user by username
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        tags = json.loads(user.tags) if user.tags else []

        # Ensure all fields are safely serialized
        return jsonify({
            "id": user.user_id,
            "username": user.username,
            "email": user.email,
            "bio": user.bio_description if user.bio_description else "",  
            "profile_picture": user.profile_picture if user.profile_picture else "",  #
            "tags": tags,
        }), 200
    
    except Exception as e:
        # Add detailed error logging for debugging
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Server error", "message": str(e)}), 500

# Update user profile
@user_bp.route('/user', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity() 
        user = User.query.get(current_user_id) 
        
        if not user:
            return create_error_response('User not found', 404)

        data = request.get_json()
        new_username = data.get('username', user.username)
        new_email = data.get('email', user.email)


        # Check if the new username already exists
        if new_username != user.username:
            existing_user = User.query.filter_by(username=new_username).first()
            if existing_user:
                return create_error_response('Username already exists', 400)

        # Check if the new email already exists
        if new_email != user.email:
            existing_email_user = User.query.filter_by(email=new_email).first()
            if existing_email_user:
                return create_error_response('Email already exists', 400)

        user.username = new_username
        user.bio_description = data.get('bio_description', user.bio_description)
        user.profile_picture = data.get('profile_picture', user.profile_picture)
        user.email = new_email if new_email != user.email else user.email # Only update if new email is provided
        db.session.commit()

        updated_user_data = {
            'user_id': user.user_id,
            'username': user.username,
            'email': user.email,
            'bio_description': user.bio_description,
            'profile_picture': user.profile_picture,
            'created_at': user.created_at
        }

        return create_success_response('Profile updated successfully', 200, updated_user_data)

    except SQLAlchemyError as e:
        db.session.rollback()
        return create_error_response('Database error occurred', 500, str(e))

    except Exception as e:
        return create_error_response('An unexpected error occurred', 500, str(e))



# Delete user profile
@user_bp.route('/user', methods=['DELETE'])
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