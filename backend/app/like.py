from flask import Blueprint, request, jsonify
from . import db
from .models import Post, Like
from .utils import check_post_24h, create_success_response, create_error_response
from flask_jwt_extended import jwt_required, get_jwt_identity

likes = Blueprint("like", __name__, url_prefix="/api/likes")


# Get likes on a post
@likes.route("/<int:post_id>", methods=["GET"])
def get_likes(post_id):
    post = Post.query.get(post_id)
    if not post:
        return create_error_response("Post not found", status_code=404)

    if check_post_24h(post):
        return create_error_response("You are not allowed to view likes on this post", status_code=403)

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    paginated_likes = (
        Like.query.filter_by(post_id=post_id)
        .order_by(Like.liked_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    likes_data = [
        {
            "user_id": like.user_id,
            "username": like.user.username,
            "profile_picture": like.user.profile_picture,
        }
        for like in paginated_likes.items
    ]

    return create_success_response("Likes fetched successfully", status_code=200, data={
    "total_likes": paginated_likes.total,
    "page": paginated_likes.page,
    "per_page": paginated_likes.per_page,
    "likes": likes_data,
})


# Like a post
@likes.route("/<int:post_id>", methods=["POST"])
@jwt_required()
def give_like(post_id):
    post = Post.query.get(post_id)
    if not post:
        return create_error_response("Post not found", status_code=404)

    existing_like = Like.query.filter_by(
        user_id=get_jwt_identity(), post_id=post_id
    ).first()
    if existing_like:
        return create_error_response("You have already liked this post", status_code=400)

    if check_post_24h(post):
        return create_error_response("You are not allowed to like this post", status_code=403)

    post_like = Like(
        user_id=get_jwt_identity(),
        post_id=post_id,
    )
    db.session.add(post_like)
    db.session.commit()

    return create_success_response("Post liked successfully", status_code=201)


# Unlike a post
@likes.route("/<int:post_id>", methods=["DELETE"])
@jwt_required()
def remove_like(post_id):
    post_like = Like.query.filter_by(
        user_id=get_jwt_identity(),
        post_id=post_id,
    ).first()
    if not post_like:
        return create_error_response("Like not found", status_code=404)

    if check_post_24h(post_like.post):
        return create_error_response("You are not allowed to remove like on this post", status_code=403)

    db.session.delete(post_like)
    db.session.commit()

    return create_success_response("Like removed successfully", status_code=200)
