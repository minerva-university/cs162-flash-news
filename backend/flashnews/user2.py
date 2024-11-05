from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, current_user
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Blueprint, jsonify, request, abort
from __init__ import db

# User Model
class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    bio = db.Column(db.Text, nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)

    # Relationships
    posts = relationship('Post', back_populates='author')
    followers = relationship(
        'Follow', 
        foreign_keys='Follow.followed_id', 
        back_populates='followed',
        cascade='all, delete-orphan'
    )
    following = relationship(
        'Follow', 
        foreign_keys='Follow.follower_id', 
        back_populates='follower',
        cascade='all, delete-orphan'
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Follow Model for implementing follow/unfollow functionality
class Follow(db.Model):
    __tablename__ = 'follows'

    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    followed_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    follower = relationship('User', foreign_keys=[follower_id], back_populates='following')
    followed = relationship('User', foreign_keys=[followed_id], back_populates='followers')

# User Blueprint
user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
def get_user_profile():
    """Get current user's profile"""
    if not current_user.is_authenticated:
        return jsonify({"error": "Unauthorized"}), 401
    
    return jsonify({
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "bio": current_user.bio,
        "profile_picture": current_user.profile_picture
    })

@user_bp.route('/profile', methods=['PUT'])
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