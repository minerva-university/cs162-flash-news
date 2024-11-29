from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.exceptions import NotFound, BadRequest
from datetime import datetime
from bson import ObjectId
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError

from . import db
from .models import User

# Initialize blueprint
user_bp = Blueprint('user', __name__)


# Utility function for consistent error handling
def create_error_response(message, status_code=400, details=None):
    return jsonify({
        'status': 'error',
        'message': message,
        'details': details
    }), status_code


# Register a new user
@user_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid input'}), 400              

        # Check if user already exists
        if User.query.filter((User.email == data['email']) | (User.username == data['username'])).first():
            return jsonify({'error': 'Email or username already registered'}), 400
        
        # Create and save new user
        new_user = User(
            email=data['email'],
            username=data['username'],
            password=generate_password_hash(data['password']),
            bio_description=data.get('bio_description', ''),
            profile_picture=data.get('profile_picture', None),
            created_at=datetime.now(timezone.utc)
        )
        db.session.add(new_user)
        db.session.commit()


        # Create access token
        access_token = create_access_token(identity=new_user.user_id)

        return jsonify({
            'status': 'success',
            'message': 'User registered successfully',
            'access_token': access_token
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return create_error_response('Database error occurred', 500, str(e))



# User login
@user_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid input'}), 400

        user = User.query.filter_by(email=data['email']).first()
        if not user or not check_password_hash(user.password, data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401

        access_token = create_access_token(identity=user.user_id)

        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'access_token': access_token,
            'user_id': user.user_id
        }), 200

    except Exception as e:
        return create_error_response('An unexpected error occurred', 500, str(e))




# View (get) user's profile 
@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        user_data = {
            'user_id': user.user_id,
            'username': user.username,
            'email': user.email,
            'bio_description': user.bio_description,
            'profile_picture': user.profile_picture,
            'created_at': user.created_at
        }

        return jsonify({
            'status': 'success',
            'message': 'User profile fetched successfully',
            'data': user_data
        }), 200
        
    except Exception as e:
        return create_error_response('An unexpected error occurred', 500, str(e))





# Update user profile
@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        user.username = data.get('username', user.username)
        user.bio_description = data.get('bio_description', user.bio_description)
        user.profile_picture = data.get('profile_picture', user.profile_picture)
        user.email = data.get('email', user.email)
        db.session.commit()


        return jsonify({
            'status': 'success',
            'message': 'Profile updated successfully'
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return create_error_response('Database error occurred', 500, str(e))




# Delete user profile
@user_bp.route('/delete', methods=['DELETE'])
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

        return jsonify({
            'status': 'success',
            'message': 'User account deleted successfully'
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return create_error_response('Database error occurred', 500, str(e))

    except Exception as e:
        return create_error_response('An unexpected error occurred', 500, str(e))



# Follow user route
@user_bp.route('/follow/<int:user_id>', methods=['POST'])
@login_required
def follow_user(user_id):
    try:
        # Ensure the user cannot follow themselves
        if current_user.user_id == user_id:
            return create_error_response('You cannot follow yourself', 400)

        # Check if the target user exists
        user_to_follow = User.query.get(user_id)
        if not user_to_follow:
            return create_error_response('User not found', 404)

        # Check if the current user is already following the target user
        existing_follow = Follow.query.filter_by(follower_id=current_user.user_id, user_id=user_id).first()
        if existing_follow:
            return create_error_response('You are already following this user', 400)

        # Create a new follow relationship
        new_follow = Follow(follower_id=current_user.user_id, user_id=user_id)
        db.session.add(new_follow)
        db.session.commit()

        return jsonify({'message': 'Successfully followed the user'}), 200

    except Exception as e:
        db.session.rollback()
        return create_error_response(str(e), 500)




# Unfollow user route
@user_bp.route('/unfollow/<int:user_id>', methods=['POST'])
@login_required
def unfollow_user(user_id):
    try:
        # Ensure the user cannot unfollow themselves
        if current_user.user_id == user_id:
            return create_error_response('You cannot unfollow yourself', 400)

        # Check if the target user exists
        user_to_unfollow = User.query.get(user_id)
        if not user_to_unfollow:
            return create_error_response('User not found', 404)

        # Check if the current user is following the target user
        follow_relation = Follow.query.filter_by(follower_id=current_user.user_id, user_id=user_id).first()
        if not follow_relation:
            return create_error_response('You are not following this user', 400)

        # Remove the follow relationship
        db.session.delete(follow_relation)
        db.session.commit()

        return jsonify({'message': 'Successfully unfollowed the user'}), 200

    except Exception as e:
        db.session.rollback()
        return create_error_response(str(e), 500)