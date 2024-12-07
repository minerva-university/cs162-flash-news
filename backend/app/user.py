from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, UTC
from bson import ObjectId
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from .models import User

# Initialize blueprint
user_bp = Blueprint('user', __name__)

@user_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create new user document
        new_user = {
            'email': data['email'],
            'username': data['username'],
            'password': generate_password_hash(data['password']),
            'profile': {
                'full_name': data.get('full_name', ''),
                'bio': data.get('bio', ''),
                'profile_picture': data.get('profile_picture', ''),
                'location': data.get('location', '')
            },
            'followers': [],
            'following': [],
            'saved_posts': [],
            'interests': data.get('interests', []),
            'created_at': datetime.now(UTC),
            'updated_at': datetime.now(UTC)
        }
        
        result = users.insert_one(new_user)
        
        # Create access token
        access_token = create_access_token(identity=str(result.inserted_id))
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        user = users.find_one({'email': data['email']})
        if not user or not check_password_hash(user['password'], data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        access_token = create_access_token(identity=str(user['_id']))
        
        return jsonify({
            'access_token': access_token,
            'user_id': str(user['_id'])
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = get_jwt_identity()
        user = users.find_one({'_id': ObjectId(current_user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user['_id'] = str(user['_id'])
        user.pop('password', None)
        
        return jsonify(user), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Fields that can be updated
        update_fields = {
            'profile.full_name': data.get('full_name'),
            'profile.bio': data.get('bio'),
            'profile.profile_picture': data.get('profile_picture'),
            'profile.location': data.get('location'),
            'interests': data.get('interests'),
            'updated_at': datetime.now(UTC)
        }
        
        # Remove None values
        update_fields = {k: v for k, v in update_fields.items() if v is not None}
        
        result = users.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$set': update_fields}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'User not found or no changes made'}), 404
            
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/follow/<user_id>', methods=['POST'])
@jwt_required()
def follow_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        
        if current_user_id == user_id:
            return jsonify({'error': 'Cannot follow yourself'}), 400
            
        # Add to following list of current user
        result = users.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$addToSet': {'following': user_id}}
        )
        
        # Add to followers list of target user
        result2 = users.update_one(
            {'_id': ObjectId(user_id)},
            {'$addToSet': {'followers': current_user_id}}
        )
        
        if result.modified_count == 0 or result2.modified_count == 0:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify({'message': 'Successfully followed user'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/unfollow/<user_id>', methods=['POST'])
@jwt_required()
def unfollow_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        
        # Remove from following list of current user
        result = users.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$pull': {'following': user_id}}
        )
        
        # Remove from followers list of target user
        result2 = users.update_one(
            {'_id': ObjectId(user_id)},
            {'$pull': {'followers': current_user_id}}
        )
        
        if result.modified_count == 0 or result2.modified_count == 0:
            return jsonify({'error': 'User not found or not following'}), 404
            
        return jsonify({'message': 'Successfully unfollowed user'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    






