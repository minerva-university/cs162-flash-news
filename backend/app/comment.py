from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from . import db
from .models import Post, Comment
from .utils import check_post_24h

comments = Blueprint("comment", __name__)

current_user_id = 1

# Get comments on a post
@comments.route("/comments/<int:post_id>", methods=["GET"])
# @TODO: add JWT decorator
def get_comments(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    # if check_post_24h(post):
    #     return (
    #         jsonify({"error": "You are not allowed to view comments on this post"}),
    #         403,
    #     )

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

    return (
        jsonify(
            {
                "total_comments": paginated_comments.total,
                "page": paginated_comments.page,
                "per_page": paginated_comments.per_page,
                "comments": comments_data,
            }
        ),
        200,
    )


# Create a comment on a post
@comments.route("/comments/<int:post_id>", methods=["POST"])
# @TODO: add JWT decorator
def create_comment(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    # if check_post_24h(post):
    #     return jsonify({"error": "You are not allowed to comment on this post"}), 403

    data = request.get_json()
    comment = data.get("comment")
    if not comment:
        return jsonify({"error": "Comment is required"}), 400

    post_comment = Comment(
        # user_id=current_user.user_id,
        user_id=current_user_id,
        post_id=post_id,
        content=comment # <-- this was originally comment=comment, which is wrong
    )
    db.session.add(post_comment)
    db.session.commit()

    return (
        jsonify(
            {
                "message": "Comment created successfully",
                "comment_id": post_comment.comment_id,
            }
        ),
        201,
    )


# Update a comment on a post
@comments.route("/comments/<int:comment_id>", methods=["PUT"])
# @TODO: add JWT decorator
def update_comment(comment_id):
    post_comment = Comment.query.get(comment_id)
    if not post_comment:
        return jsonify({"error": "Comment not found"}), 404

    if post_comment.user_id != current_user.user_id:
        return jsonify({"error": "You are not allowed to update this comment"}), 403

    if check_post_24h(post_comment.post):
        return jsonify({"error": "You are not allowed to update this comment"}), 403

    data = request.get_json()
    comment = data.get("comment")
    if not comment:
        return jsonify({"error": "Comment is required"}), 400

    post_comment.content = comment
    db.session.commit()

    return jsonify({"message": "Comment updated successfully"}), 200


# Delete a comment on a post
@comments.route("/comments/<int:comment_id>", methods=["DELETE"])
# @TODO: add JWT decorator
def delete_comment(comment_id):
    post_comment = Comment.query.get(comment_id)
    if not post_comment:
        return jsonify({"error": "Comment not found"}), 404

    if post_comment.user_id != current_user.user_id:
        return jsonify({"error": "You are not allowed to delete this comment"}), 403

    if check_post_24h(post_comment.post):
        return jsonify({"error": "You are not allowed to delete this comment"}), 403

    db.session.delete(post_comment)
    db.session.commit()

    return jsonify({"message": "Comment deleted successfully"}), 200
