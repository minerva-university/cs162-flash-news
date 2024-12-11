from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import db
from .models import Post, Comment
from .utils import check_post_24h, create_success_response, create_error_response

comments = Blueprint("comment", __name__, url_prefix='/api/comments')


# Get comments on a post
@comments.route("/<int:post_id>", methods=["GET"])
@jwt_required()
def get_comments(post_id):
    post = Post.query.get(post_id)
    if not post:
        return create_error_response("Post not found", 404)

    if check_post_24h(post):
        return create_error_response("You are not allowed to view comments on this post", 403)

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    paginated_comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.commented_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    comments_data = [
        {
            "comment_id": comment.comment_id,
            "user": {
                "user_id": comment.user.user_id,
                "username": comment.user.username,
                "profile_picture": comment.user.profile_picture,
            },
            "comment": comment.content,
            "commented_at": comment.commented_at,
        }
        for comment in paginated_comments.items
    ]

    return create_success_response("Comments fetched successfully", 200, {
        "total_comments": paginated_comments.total,
        "page": paginated_comments.page,
        "per_page": paginated_comments.per_page,
        "comments": comments_data,
    })


# Create a comment on a post
@comments.route("/<int:post_id>", methods=["POST"])
@jwt_required()
def create_comment(post_id):
    post = Post.query.get(post_id)
    if not post:
        return create_error_response("Post not found", 404)

    if check_post_24h(post):
        return create_error_response("You are not allowed to comment on this post", 403)

    data = request.get_json()
    comment = data.get("comment")
    if not comment:
        return create_error_response("Comment is required", 400)

    post_comment = Comment(
        user_id=get_jwt_identity(), post_id=post_id, content=comment
    )
    db.session.add(post_comment)
    db.session.commit()

    return create_success_response("Comment created successfully", 201, 
    {"comment_id": post_comment.comment_id}
    )


# Update a comment on a post
@comments.route("/<int:comment_id>", methods=["PUT"])
@jwt_required()
def update_comment(comment_id):
    post_comment = Comment.query.get(comment_id)
    if not post_comment:
        return create_error_response("Comment not found", 404)

    if post_comment.user_id != int(get_jwt_identity()):
        return create_error_response("You are not allowed to update this comment", 403)

    if check_post_24h(post_comment.post):
        return create_error_response("You are not allowed to update this comment", 403)

    data = request.get_json()
    comment = data.get("comment")
    if not comment:
        return create_error_response("Comment is required", 400)

    post_comment.content = comment
    db.session.commit()

    return create_success_response("Comment updated successfully")


# Delete a comment on a post
@comments.route("/<int:comment_id>", methods=["DELETE"])
@jwt_required()
def delete_comment(comment_id):
    post_comment = Comment.query.get(comment_id)
    if not post_comment:
        return create_error_response("Comment not found", 404)

    if post_comment.user_id != int(get_jwt_identity()):
        return create_error_response("You are not allowed to delete this comment", 403)

    if check_post_24h(post_comment.post):
        return create_error_response("You are not allowed to delete this comment", 403)

    db.session.delete(post_comment)
    db.session.commit()

    return create_success_response("Comment deleted successfully")
