from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, current_user
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Blueprint, jsonify, request, abort
from .models import User, Follow
import json
from . import db


# User Blueprint
user_bp = Blueprint('user', __name__, url_prefix='/api/user')

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
            "bio": user.bio_description if user.bio_description else "",  # Handle None values
            "profile_picture": user.profile_picture if user.profile_picture else "",  # Handle None value
            "tags": tags,
        }), 200
    
    except Exception as e:
        # Add detailed error logging for debugging
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Server error", "message": str(e)}), 500

@user_bp.route('/update_profile', methods=['PUT'])
def update_user_profile():
    """Update current user's profile"""
    if not current_user.is_authenticated:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    
    # Update fields that are allowed to be changed
    if 'bio' in data:
        current_user.bio = data['bio']
    if 'profile_picture' in data:
        current_user.profile_picture = data['profile_picture']
    
    try:
        db.session.commit()
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@user_bp.route('/delete', methods=['DELETE'])
def delete_user_account():
    """Delete current user's account"""
    if not current_user.is_authenticated:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        db.session.delete(current_user)
        db.session.commit()
        return jsonify({"message": "Account deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@user_bp.route('/feed', methods=['GET'])
def get_user_feed():
    """Get feed for current user (posts from followed users)"""
    if not current_user.is_authenticated:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Assuming you have a Post model with a relationship to User
    # This is a placeholder - you'll need to implement the actual feed logic
    followed_user_ids = [follow.followed_id for follow in current_user.following]
    
    # TODO: Implement actual feed retrieval from Post model
    return jsonify({"followed_user_ids": followed_user_ids})

@user_bp.route('/follow/<int:user_id>', methods=['POST'])
def follow_user(user_id):
    """Follow a user"""
    if not current_user.is_authenticated:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Prevent self-following
    if user_id == current_user.id:
        return jsonify({"error": "Cannot follow yourself"}), 400
    
    # Check if user exists
    user_to_follow = User.query.get(user_id)
    if not user_to_follow:
        return jsonify({"error": "User not found"}), 404
    
    # Check if already following
    existing_follow = Follow.query.filter_by(
        follower_id=current_user.id, 
        followed_id=user_id
    ).first()
    
    if existing_follow:
        return jsonify({"error": "Already following this user"}), 400
    
    # Create follow relationship
    new_follow = Follow(
        follower_id=current_user.id, 
        followed_id=user_id
    )
    
    try:
        db.session.add(new_follow)
        db.session.commit()
        return jsonify({"message": "Successfully followed user"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@user_bp.route('/unfollow/<int:user_id>', methods=['POST'])
def unfollow_user(user_id):
    """Unfollow a user"""
    if not current_user.is_authenticated:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Find and delete follow relationship
    follow = Follow.query.filter_by(
        follower_id=current_user.id, 
        followed_id=user_id
    ).first()
    
    if not follow:
        return jsonify({"error": "Not following this user"}), 400
    
    try:
        db.session.delete(follow)
        db.session.commit()
        return jsonify({"message": "Successfully unfollowed user"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@user_bp.route('/following', methods=['GET'])
def get_followed_users():
    """Get list of users the current user is following"""
    if not current_user.is_authenticated:
        return jsonify({"error": "Unauthorized"}), 401
    
    followed_users = [
        {
            "id": follow.followed.id, 
            "username": follow.followed.username
        } for follow in current_user.following
    ]
    
    return jsonify({"followed_users": followed_users})

@user_bp.route('/followers', methods=['GET'])
def get_followers():
    """Get list of users following the current user"""
    if not current_user.is_authenticated:
        return jsonify({"error": "Unauthorized"}), 401
    
    followers = [
        {
            "id": follow.follower.id, 
            "username": follow.follower.username
        } for follow in current_user.followers
    ]
    
    return jsonify({"followers": followers})