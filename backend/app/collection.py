from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from . import db
from .models import Collection, CollectionPost, User
from .post import get_post

collections = Blueprint('collections', __name__, url_prefix='/api/collections')

import logging

# Create a new collection
@collections.route('/', methods=['POST'])
#@login_required
def create_collection():
    user = User.query.filter_by(user_id=2).first()  # Assuming user_id is 1 for testing
    if not user:
        return jsonify({'error': 'Test user not found'}), 404

    data = request.get_json()
    print("Received data:", data)  # Log the request payload for debugging

    # Validate required fields
    if not data.get('title'):
        return jsonify({'error': 'Collection title is required'}), 400

    # Check for duplicate collection
    existing_collection = Collection.query.filter_by(
        user_id=user.user_id,
        title=data.get('title')
    ).first()

    if existing_collection:
        return jsonify({'error': 'A collection with this title already exists for the user'}), 400

    # Create new collection
    collection = Collection(
        user_id=user.user_id,
        title=data.get('title'),
        emoji=data.get('emoji'),
        description=data.get('description', ''),  # Default to empty string
        is_public=data.get('is_public', True),  # Default to public
    )

    db.session.add(collection)
    db.session.commit()

    return jsonify({
        'message': 'Collection created successfully',
        'collection_id': collection.collection_id,
    }), 201

# Get user's collections
@collections.route('/user/<int:user_id>', methods=['GET'])
#@login_required
def get_collections(user_id):

    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    '''
    public_collections = user.collections.filter_by(is_public=True).all()
    private_collections = user.collections.filter_by(is_public=False).all()
    '''

    public_collections = [c for c in user.collections if c.is_public]
    private_collections = [c for c in user.collections if not c.is_public]

    '''
    # Less efficient way to get collections

    public_collections = Collection.query.filter_by(user_id=user_id, is_public=True).all()
    private_collections = Collection.query.filter_by(user_id=user_id, is_public=False).all()
    '''

    public_collections_data = [{
        'collection_id': collection.collection_id,
        'title': collection.title,
        'description': collection.description,
        'emoji': collection.emoji,
        'is_public': collection.is_public,
        'created_at': collection.created_at.isoformat(),
        'articles_count': len(collection.posts),
        'user_id': collection.user_id,
    } for collection in public_collections]

    private_collections_data = [{
        'collection_id': collection.collection_id,
        'title': collection.title,
        'emoji': collection.emoji,
        'description': collection.description,
        'is_public': collection.is_public,
        'created_at': collection.created_at.isoformat(),
        'articles_count': len(collection.posts),
        'user_id': collection.user_id,
    } for collection in private_collections]
    
    #if current_user.user_id != user_id:
    if user.user_id != user_id:
        return jsonify({
            'public': public_collections_data}), 200

    else:
        return jsonify({
            'public': public_collections_data,
            'private': private_collections_data}), 200

# Get posts from a specific collection
@collections.route('/<int:collection_id>/posts', methods=['GET'])
#@login_required
def get_collection_posts(collection_id):

    collection_posts = (
        CollectionPost.query
        .filter_by(collection_id=collection_id)
        .all())
    
    if not collection_posts:
        return jsonify({'error': 'No posts found for this collection'}), 404

    posts_data = []

    # This needs Moto's code to be merged first to work
    for collection_post in collection_posts:
        response = get_post(collection_post.post_id)

        # Check if post exists
        if response.status_code == 200:
            posts_data.append(response.json)
        
        else:
            print(f"Failed to fetch post with ID {collection_post.post_id}: {response.status_code}")
            return response
            
    return jsonify(posts_data), 200


# Add a post to a collection
@collections.route('/<int:collection_id>/posts/<int:post_id>', methods=['POST'])
#@login_required
def add_post_to_collection(collection_id, post_id):
    
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


# Update a collection
@collections.route('/update/<int:collection_id>', methods=['PUT'])
#@login_required
def update_collection(collection_id):

    print(f"Received PUT request for collection ID: {collection_id}")
    print(f"Initial collection: {Collection.query.get(collection_id)}")
    print(f"Initial is_public: {Collection.query.get(collection_id).is_public}")
    data = request.get_json()
    print(f"Request data: {data}")
    
    # Fetch collection
    collection = Collection.query.get_or_404(collection_id)
    print(f"Found collection: {collection}")

# Update fields
    if 'title' in data:
        collection.title = data['title']
    if 'description' in data:
        collection.description = data['description']
    if 'emoji' in data:
        collection.emoji = data['emoji']
    if 'is_public' in data:
        collection.is_public = data['is_public']

    # Commit changes
    db.session.commit()
    updated_collection = Collection.query.get(collection_id)
    print(f"Final committed collection: {updated_collection}")
    print(f"Collection new title: {updated_collection.title}")
    print(f"Collection new description: {updated_collection.description}")
    print(f"Collection new emoji: {updated_collection.emoji}")
    print(f"Collection new is_public: {updated_collection.is_public}")

    return jsonify({"message": "Collection updated successfully"}), 200
    

# Delete a collection
@collections.route('/delete/<int:collection_id>', methods=['DELETE'])
#@login_required
def delete_collection(collection_id):

    collection = Collection.query.get_or_404(collection_id)
    db.session.delete(collection)
    db.session.commit()
    
    return jsonify({'message': 'Collection deleted successfully'}), 200


# Remove a post from a collection
@collections.route('/<int:collection_id>/posts/<int:post_id>', methods=['DELETE'])
#@login_required
def remove_post_from_collection(collection_id, post_id):

    user = User(
        email= 'test@gmail.com',
        username= 'test',
        password= 'test',
    )

    # Check if user owns the collection
    
    if not (Collection.query
            #.filter_by(id=collection_id, user_id=current_user.user_id)
            .filter_by(collection_id=collection_id, user_id=user.user_id)
            .first()):
        return jsonify({'error': 'Collection not found'}), 404

    collection_post = CollectionPost.query.filter_by(
        collection_id=collection_id,
        post_id=post_id
    ).first_or_404()

    db.session.delete(collection_post)
    db.session.commit()
    
    return jsonify({'message': 'Post removed from collection'}), 200
