from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from . import db
from .models import Collection, Post

collections = Blueprint('collections', __name__)

@collections.route('/api/user/collections', methods=['POST'])
@jwt_required()
def create_collection():
    """Create a new collection"""
    current_user = get_jwt_identity()
    data = request.get_json()

    # Validate required fields
    if not data.get('name'):
        return jsonify({'error': 'Collection name is required'}), 400

    collection = Collection(
        name=data['name'],
        description=data.get('description', ''),
        is_public=data.get('is_public', True),
        user_id=current_user
    )

    db.session.add(collection)
    db.session.commit()
    
    return jsonify({
        'id': collection.id,
        'name': collection.name,
        'description': collection.description,
        'is_public': collection.is_public,
        'user_id': collection.user_id,
        'created_at': collection.created_at.isoformat(),
        'updated_at': collection.updated_at.isoformat()
    }), 201

@collections.route('/api/user/collections', methods=['GET'])
@jwt_required()
def get_collections():
    """Get user's collections"""
    current_user = get_jwt_identity()
    
    user_collections = Collection.query.filter_by(user_id=current_user).all()
    
    collections_data = [{
        'id': collection.id,
        'name': collection.name,
        'description': collection.description,
        'is_public': collection.is_public,
        'created_at': collection.created_at.isoformat(),
        'updated_at': collection.updated_at.isoformat()
    } for collection in user_collections]
    
    return jsonify(collections_data), 200

@collections.route('/api/user/collections/<int:collection_id>/posts', methods=['GET'])
@jwt_required()
def get_collection_posts(collection_id):
    """Get posts from a specific collection"""
    collection = Collection.query.get_or_404(collection_id)

    posts_data = [{
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'created_at': post.created_at.isoformat()
    } for post in collection.posts]
    
    return jsonify(posts_data), 200

@collections.route('/api/user/collections/<int:collection_id>/posts', methods=['POST'])
@jwt_required()
def add_post_to_collection(collection_id):
    """Add a post to a collection"""
    current_user = get_jwt_identity()
    data = request.get_json()
    
    post_id = data.get('post_id')
    if not post_id:
        return jsonify({'error': 'Post ID is required'}), 400

    collection = Collection.query.filter_by(
        id=collection_id, 
        user_id=current_user
    ).first_or_404()

    post = Post.query.get_or_404(post_id)

    if post in collection.posts:
        return jsonify({'message': 'Post already in collection'}), 200

    collection.posts.append(post)
    collection.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'message': 'Post added to collection'}), 200

@collections.route('/api/user/collections/<int:collection_id>', methods=['DELETE'])
@jwt_required()
def delete_collection(collection_id):
    """Delete a collection"""
    current_user = get_jwt_identity()
    
    collection = Collection.query.filter_by(
        id=collection_id, 
        user_id=current_user
    ).first_or_404()

    db.session.delete(collection)
    db.session.commit()
    
    return jsonify({'message': 'Collection deleted successfully'}), 200
