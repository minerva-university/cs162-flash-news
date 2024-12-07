from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, current_user, login_required
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Blueprint, jsonify, request
from . import db
from .models import User, Follow

# User Blueprint
user_bp = Blueprint('user', __name__, url_prefix='/api/user')

@user_bp.route('/profile', methods=['GET'])
@login_required
def get_user_profile():
    """Get current user's profile"""
    return jsonify({
        "id": current_user.user_id,
        "username": current_user.username,
        "email": current_user.email,
        "bio": current_user.bio_description,
        "profile_picture": current_user.profile_picture.decode('utf-8') if current_user.profile_picture else None
    })


@user_bp.route('/profile', methods=['PUT'])
@login_required
def update_user_profile():
    """Update current user's profile"""
    data = request.get_json()
    
    # Update fields that are allowed to be changed
    if 'bio' in data:
        current_user.bio_description = data['bio']
    if 'profile_picture' in data:
        current_user.profile_picture = data['profile_picture'].encode('utf-8')
    
    try:
        db.session.commit()
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@user_bp.route('/delete', methods=['DELETE'])
@login_required
def delete_user_account():
    """Delete current user's account"""
    try:
        db.session.delete(current_user)
        db.session.commit()
        return jsonify({"message": "Account deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@user_bp.route('/feed', methods=['GET'])
@login_required
def get_user_feed():
    """Get feed for current user (posts from followed users)"""
    # Changed to match the Follow model structure
    followed_user_ids = [follow.user_id for follow in current_user.followings]
    
    # TODO: Implement actual feed retrieval from Post model
    return jsonify({"followed_user_ids": followed_user_ids})


@user_bp.route('/follow/<int:user_id>', methods=['POST'])
@login_required
def follow_user(user_id):
    """Follow a user"""
    
    # Prevent self-following
    if user_id == current_user.user_id:
        return jsonify({"error": "Cannot follow yourself"}), 400
    
    # Check if user exists
    user_to_follow = User.query.get(user_id)
    if not user_to_follow:
        return jsonify({"error": "User not found"}), 404
    
    # Check if already following
    existing_follow = Follow.query.filter_by(
        follower_id=current_user.user_id,
        user_id=user_id
    ).first()
    
    if existing_follow:
        return jsonify({"error": "Already following this user"}), 400
    
    # Create follow relationship
    new_follow = Follow(
        follower_id=current_user.user_id,
        user_id=user_id
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
        follower_id=current_user.user_id, 
        user_id=user_id
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
            "id": follow.user_id,
            "username": follow.followed_user.username
        } for follow in current_user.followings
    ]
    
    return jsonify({"followed_users": followed_users})


@user_bp.route('/followers', methods=['GET'])
def get_followers():
    """Get list of users following the current user"""
    if not current_user.is_authenticated:
        return jsonify({"error": "Unauthorized"}), 401
    
    followers = [
        {
            "id": follow.follower_id,
            "username": follow.following_user.username
        } for follow in current_user.followers
    ]
    
    return jsonify({"followers": followers})