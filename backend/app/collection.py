from flask import Blueprint, request, jsonify
from . import db
from .models import Collection, CollectionPost, User
from .post import get_post
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import CollectionPost, Post

collections = Blueprint("collections", __name__, url_prefix="/api/collections")


# Create a new collection
@collections.route("/", methods=["POST"])
@jwt_required()
def create_collection():
    user_id = int(get_jwt_identity())
    if not User.query.get(user_id):
        return jsonify({"error": "Authentication required"}), 401
    data = request.get_json()
    print("Received data:", data)  # Log the request payload for debugging

    # Validate required fields
    if not data.get("title"):
        return jsonify({"error": "Collection title is required"}), 400

    # Check for duplicate collection
    existing_collection = Collection.query.filter_by(
        user_id=user_id,
        title=data.get('title')
    ).first()

    if existing_collection:
        return jsonify({'error': 'A collection with this title already exists for the user'}), 400

    # Create new collection
    collection = Collection(
        user_id=user_id,
        title=data.get('title'),
        emoji=data.get('emoji'),
        description=data.get('description', ''),
        is_public=data.get('is_public', True),  # set to public by default.
    )

    db.session.add(collection)
    db.session.commit()

    return (
        jsonify(
            {
                "message": "Collection created successfully",
                "collection_id": collection.collection_id,
            }
        ),
        201,
    )

# Get user's collections
@collections.route("/user/<int:user_id>", methods=["GET"])
@jwt_required()
def get_collections(user_id):

    current_user_id = int(get_jwt_identity())
    print(f"Logged-in user ID: {current_user_id}")
    print(f"Requested user ID: {user_id}")

    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Fetch public and private collections
    public_collections = Collection.query.filter_by(user_id=user_id, is_public=True).all()
    print(f"Public collections fetched: {len(public_collections)}")

    private_collections = []
    if int(current_user_id) == int(user_id):  # Fetch private collections only if the user is the owner
        print("Fetching private collections")
        private_collections = Collection.query.filter_by(user_id=user_id, is_public=False).all()
        print(f"Private collections fetched: {len(private_collections)}")

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
    
    if int(get_jwt_identity()) != user_id:
        return jsonify({"public": public_collections_data}), 200

    else:
        return (
            jsonify(
                {"public": public_collections_data, "private": private_collections_data}
            ),
            200,
        )


# Get posts from a specific collection
@collections.route("/<int:collection_id>/posts", methods=["GET"])
@jwt_required()
def get_collection_posts(collection_id):

    collection_posts = (
        CollectionPost.query
        .filter_by(collection_id=collection_id)
        .all()
    )
    
    # If no posts in collection, return empty list
    if not collection_posts:
        return jsonify([]), 200

    posts_data = []

    for collection in collection_posts:
        response, status_code = get_post(collection.post_id)

        # Check if post exists
        if status_code == 200:
            posts_data.append(response.json)

        else:
            print(f"Failed to fetch post with ID {collection.post_id}: {response.status_code}")
            return response, status_code

    return jsonify(posts_data), 200


# Add a post to a collection
@collections.route("/<int:collection_id>/posts/<int:post_id>", methods=["POST"])
@jwt_required()
def add_post_to_collection(collection_id, post_id):
    check_post = CollectionPost.query.filter_by(collection_id=collection_id, post_id=post_id).first()

    if check_post:
        return jsonify({"message": "Post already in collection"}), 200

    collection_post = CollectionPost(collection_id=collection_id, post_id=post_id)
    db.session.add(collection_post)
    db.session.commit()

    return jsonify({"message": "Post added to collection"}), 200


# Update a collection
@collections.route("/<int:collection_id>", methods=["PUT"])
@jwt_required()
def update_collection(collection_id):

    print(f"Received PUT request for collection ID: {collection_id}")
    print(f"Initial collection: {Collection.query.get(collection_id)}")
    print(f"Initial is_public: {Collection.query.get(collection_id).is_public}")
    data = request.get_json()
    collection = Collection.query.filter_by(
        collection_id=collection_id, 
        user_id=int(get_jwt_identity())
    ).first_or_404()

    collection.title = data.get("title", collection.title)
    collection.description = data.get("description", collection.description)
    collection.emoji = data.get("emoji", collection.emoji)
    collection.is_public = data.get("is_public", collection.is_public)

    db.session.commit()
    updated_collection = Collection.query.get(collection_id)
    return jsonify({"message": "Collection updated successfully"}), 200
    

# Delete a collection
@collections.route("/<int:collection_id>", methods=["DELETE"])
@jwt_required()
def delete_collection(collection_id):
    collection = Collection.query.filter_by(
        collection_id=collection_id, 
        user_id=int(get_jwt_identity())
    ).first_or_404()

    collection = Collection.query.get_or_404(collection_id)
    db.session.delete(collection)
    db.session.commit()

    return jsonify({"message": "Collection deleted successfully"}), 200


# Remove a post from a collection
@collections.route("/<int:collection_id>/posts/<int:post_id>", methods=["DELETE"])
@jwt_required()
def remove_post_from_collection(collection_id, post_id):
    # Check if user owns the collection
    if not (Collection.query
            .filter_by(collection_id=collection_id, user_id=int(get_jwt_identity()))
            .first()):
        return jsonify({'error': 'Collection not found'}), 404

    collection_post = CollectionPost.query.filter_by(
        collection_id=collection_id, post_id=post_id
    ).first_or_404()

    db.session.delete(collection_post)
    db.session.commit()

    return jsonify({"message": "Post removed from collection"}), 200
