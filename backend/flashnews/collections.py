from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime, timezone, timedelta
from . import db
from .models import Collection, Post, CollectionPost
from .post import get_post

collections = Blueprint('collections', __name__, url_prefix='/api/collections')

 
# Create a new collection
@collections.route('/', methods=['POST'])
@login_required
def create_collection():
    data = request.get_json()

    # Validate required fields
    if not data.get('title'):
        return jsonify({'error': 'Collection title is required'}), 400

    collection = Collection(
        title=data.get('title'),
        description=data.get('description'),
        is_public=data.get('is_public', True), #set to public by default.
        user_id=current_user.user_id,
        created_at=datetime.now(timezone.utc),
    )

    db.session.add(collection)
    db.session.commit()
    
    return jsonify({
        'message': 'Collection created successfully',
        'collection_id': collection.id
    }), 201


# Get user's collections
@collections.route('/user/<int:user_id>', methods=['GET'])
@login_required
def get_collections(user_id):
    public_collections = Collection.query.filter_by(user_id=user_id, is_public=True).all()
    private_collections = Collection.query.filter_by(user_id=user_id, is_public=False).all()
    
    public_collections_data = [{
        'id': collection.id,
        'title': collection.title,
        'description': collection.description,
        'is_public': collection.is_public,
        'created_at': collection.created_at.isoformat(),
    } for collection in public_collections]

    private_collections_data = [{
        'id': collection.id,
        'title': collection.title,
        'description': collection.description,
        'is_public': collection.is_public,
        'created_at': collection.created_at.isoformat(),
    } for collection in private_collections]
    
    return jsonify({
        'public': public_collections_data,
        'private': private_collections_data}), 200

# Get posts from a specific collection
@collections.route('/<int:collection_id>/posts', methods=['GET'])
@login_required()
def get_collection_posts(collection_id):
    collection_posts = CollectionPost.query.get_or_404(collection_id)

    posts_data = []

    # This needs Moto's code to be merged first to work
    for collection in collection_posts:
        response = get_post(collection.post_id)

        if response.status_code == 200:
            posts_data.append(response.json)
        
        else:
            return response
            
    return jsonify(posts_data), 200


# Add a post to a collection
@collections.route('/<int:collection_id>/posts', methods=['POST'])
@login_required()
def add_post_to_collection(collection_id):
    data = request.get_json()
    
    '''
    *** REVIEW NEEDED ***       
    Understanding checker: Users don't create posts, they only add existing posts to their collections.

    Otherwise, I'd have to modify these lines to create a new post first before adding it to the collection. 
    And I would be expecting an article link instead of a post_id in the post data.
    '''
    post_id = data.get('post_id')
    if not post_id:
        return jsonify({'error': 'Post ID is required'}), 400

    check_post = CollectionPost.query.filter_by(collection_id=collection_id, post_id=post_id).first()

    if check_post:
        return jsonify({'message': 'Post already in collection'}), 200

    collection_post = CollectionPost(
        collection_id=collection_id,
        post_id=post_id
    )
    db.session.add(collection_post)
    db.session.commit()
    
    return jsonify({'message': 'Post added to collection'}), 200

# Delete a collection
@collections.route('/<int:collection_id>', methods=['DELETE'])
@login_required
def delete_collection(collection_id):
    collection = Collection.query.filter_by(
        id=collection_id, 
        user_id=current_user.user_id
    ).first_or_404()

    db.session.delete(collection)
    db.session.commit()
    
    return jsonify({'message': 'Collection deleted successfully'}), 200


# Remove a post from a collection
@collections.route('/<int:collection_id>/posts/<int:post_id>', methods=['DELETE'])
@login_required
def remove_post_from_collection(collection_id, post_id):
    collection_post = CollectionPost.query.filter_by(
        collection_id=collection_id, 
        post_id=post_id
    ).first_or_404()

    db.session.delete(collection_post)
    db.session.commit()
    
    return jsonify({'message': 'Post removed from collection'}), 200


# Update a collection
@collections.route('/<int:collection_id>', methods=['PUT'])
@login_required
def update_collection(collection_id):
    data = request.get_json()
    collection = Collection.query.filter_by(
        id=collection_id, 
        user_id=current_user.user_id
    ).first_or_404()

    collection.title = data.get('title', collection.title)
    collection.description = data.get('description', collection.description)
    collection.is_public = data.get('is_public', collection.is_public)

    db.session.commit()
    
    return jsonify({'message': 'Collection updated successfully'}), 200
