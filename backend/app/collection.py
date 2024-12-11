from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import db
from .models import Collection, CollectionPost, User
from .post import get_post
from .utils import create_success_response, create_error_response

collections = Blueprint('collections', __name__, url_prefix='/api/collections')

# Create a new collection
@collections.route('/', methods=['POST'])
@jwt_required()
def create_collection():
    user_id = get_jwt_identity()
    if not User.query.get(user_id):
        return create_error_response("Authentication required", 401)
    data = request.get_json()

    # Validate required fields
    if not data.get('title'):
        return create_error_response("Collection title is required", 400)

    # Validate data types
    if not isinstance(data.get('title'), str):
        return create_error_response("Title must be a string", 400)
        
    if 'is_public' in data and not isinstance(data['is_public'], bool):
        return create_error_response("is_public must be a boolean", 400)
    
    if 'emoji' in data and not isinstance(data['emoji'], str):
        return create_error_response("Emoji must be a string", 400)

    collection = Collection(
        title=data.get('title'),
        emoji=data.get('emoji'),
        description=data.get('description'),
        is_public=data.get('is_public', True),  # set to public by default.
        user_id=user_id,
    )

    db.session.add(collection)
    db.session.commit()
    
    return create_success_response("Collection created successfully", 201, 
    {"collection_id": collection.collection_id}
    )


# Get user's collections
@collections.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_collections(user_id):
    user = User.query.get(user_id)
    if not user:
        return create_error_response("User not found", 404)
    
    # Filter collections after getting them from user
    public_collections = [c for c in user.collections if c.is_public]
    private_collections = [c for c in user.collections if not c.is_public]

    public_collections_data = [{
        'id': collection.collection_id,
        'title': collection.title,
        'description': collection.description,
        'emoji': collection.emoji,
        'is_public': collection.is_public,
        'created_at': collection.created_at.isoformat(),
    } for collection in public_collections]

    private_collections_data = [{
        'id': collection.collection_id,
        'title': collection.title,
        'emoji': collection.emoji,
        'description': collection.description,
        'is_public': collection.is_public,
        'created_at': collection.created_at.isoformat(),
    } for collection in private_collections]
    
    if int(get_jwt_identity()) != user_id:
        return create_success_response("Public collections fetched successfully", 200, {
        'public': public_collections_data
    })

    else:
        return create_success_response("Collections fetched successfully", 200, {
        'public': public_collections_data,
        'private': private_collections_data
    })

# Get posts from a specific collection
@collections.route('/<int:collection_id>/posts', methods=['GET'])
@jwt_required()
def get_collection_posts(collection_id):
    collection_posts = (
        CollectionPost.query
        .filter_by(collection_id=collection_id)
        .all())

    posts_data = []

    for collection in collection_posts:
        response, status_code = get_post(collection.post_id)

        # Check if post exists
        if status_code == 200:
            posts_data.append(response.json)
        
        else:
            return response, status_code
            
    return create_success_response("Posts fetched successfully", 200, posts_data)


# Add a post to a collection
@collections.route('/<int:collection_id>/posts/<int:post_id>', methods=['POST'])
@jwt_required()
def add_post_to_collection(collection_id, post_id):

    check_post = CollectionPost.query.filter_by(collection_id=collection_id, post_id=post_id).first()

    if check_post:
        return create_success_response("Post already in collection", 200)

    collection_post = CollectionPost(
        collection_id=collection_id,
        post_id=post_id
    )
    db.session.add(collection_post)
    db.session.commit()
    
    return create_success_response("Post added to collection successfully", 200)


# Update a collection
@collections.route('/<int:collection_id>', methods=['PUT'])
@jwt_required()
def update_collection(collection_id):
    data = request.get_json()
    collection = Collection.query.filter_by(
        collection_id=collection_id, 
        user_id=get_jwt_identity()
    ).first_or_404()

    collection.title = data.get('title', collection.title)
    collection.description = data.get('description', collection.description)
    collection.emoji = data.get('emoji', collection.emoji)
    collection.is_public = data.get('is_public', collection.is_public)

    db.session.commit()
    
    return create_success_response("Collection updated successfully")


# Delete a collection
@collections.route('/<int:collection_id>', methods=['DELETE'])
@jwt_required()
def delete_collection(collection_id):
    collection = Collection.query.filter_by(
        collection_id=collection_id,
        user_id=get_jwt_identity()
    ).first_or_404()

    db.session.delete(collection)
    db.session.commit()
    
    return create_success_response("Collection deleted successfully")


# Remove a post from a collection
@collections.route('/<int:collection_id>/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def remove_post_from_collection(collection_id, post_id):
    # Check if user owns the collection
    if not (Collection.query
            .filter_by(collection_id=collection_id, user_id=get_jwt_identity())
            .first()):
        return create_error_response("Collection not found", 404)

    collection_post = CollectionPost.query.filter_by(
        collection_id=collection_id,
        post_id=post_id
    ).first_or_404()

    db.session.delete(collection_post)
    db.session.commit()
    
    return create_success_response("Post removed from collection successfully", 200)
