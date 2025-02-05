from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restx import Namespace, Resource, fields
from . import db
from .models import Post, Comment
from .utils import check_post_24h, create_success_response, create_error_response

api = Namespace("comments", description="Comments related operations")

comment_model = api.model(
    "Comment",
    {
        "comment": fields.String(
            required=True,
            description="Comment content",
        ),
    },
)


# Comments on a post
@api.route("/<int:post_id>")
class Comments(Resource):
    # Get comments on a post
    @api.doc(security="Bearer Auth")
    @jwt_required()
    def get(self, post_id):
        post = Post.query.get(post_id)
        if not post:
            return create_error_response("Post not found", status_code=404)

        if check_post_24h(post):
            return create_error_response(
                "You are not allowed to view comments on this post", status_code=403
            )

        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        paginated_comments = (
            Comment.query.filter_by(post_id=post_id)
            .order_by(Comment.commented_at.desc())
            .paginate(page=page, per_page=per_page, error_out=False)
        )

        comments_data = [
            {
                "comment_id": comment.comment_id,
                "user": {
                    "user_id": comment.user.user_id,
                    "username": comment.user.username,
                    "profile_picture": f"/user/uploads/{comment.user.profile_picture}",
                },
                "comment": comment.content,
                "commented_at": comment.commented_at,
            }
            for comment in paginated_comments.items
        ]

        return create_success_response(
            "Comments fetched successfully",
            status_code=200,
            data={
                "total_comments": paginated_comments.total,
                "page": paginated_comments.page,
                "per_page": paginated_comments.per_page,
                "comments": comments_data,
            },
        )

    # Create a comment on a post
    @api.doc(security="Bearer Auth")
    @api.expect(comment_model)
    @jwt_required()
    def post(self, post_id):
        post = Post.query.get(post_id)
        if not post:
            return create_error_response("Post not found", status_code=404)

        if check_post_24h(post):
            return create_error_response(
                "You are not allowed to comment on this post", status_code=403
            )

        data = request.get_json()
        comment = data.get("comment")
        if not comment:
            return create_error_response("Comment is required", status_code=400)

        post_comment = Comment(
            user_id=get_jwt_identity(), post_id=post_id, content=comment
        )
        db.session.add(post_comment)
        db.session.commit()

        return create_success_response(
            "Comment created successfully",
            status_code=201,
            data={"comment_id": post_comment.comment_id},
        )


# Modify a comment on a post
@api.route("/<int:comment_id>")
class ModifyComment(Resource):
    # Update a comment on a post
    @api.doc(security="Bearer Auth")
    @api.expect(comment_model)
    @jwt_required()
    def put(self, comment_id):
        post_comment = Comment.query.get(comment_id)
        if not post_comment:
            return create_error_response("Comment not found", status_code=404)

        if post_comment.user_id != int(get_jwt_identity()):
            return create_error_response(
                "You are not allowed to update this comment", status_code=403
            )

        if check_post_24h(post_comment.post):
            return create_error_response(
                "You are not allowed to update this comment", status_code=403
            )

        data = request.get_json()
        comment = data.get("comment")
        if not comment:
            return create_error_response("Comment is required", status_code=400)

        post_comment.content = comment
        db.session.commit()

        return create_success_response("Comment updated successfully", status_code=200)

    # Delete a comment on a post
    @api.doc(security="Bearer Auth")
    @jwt_required()
    def delete(self, comment_id):
        post_comment = Comment.query.get(comment_id)
        if not post_comment:
            return create_error_response("Comment not found", status_code=404)

        if post_comment.user_id != int(get_jwt_identity()):
            return create_error_response(
                "You are not allowed to delete this comment", status_code=403
            )

        if check_post_24h(post_comment.post):
            return create_error_response(
                "You are not allowed to delete this comment", status_code=403
            )

        db.session.delete(post_comment)
        db.session.commit()

        return create_success_response("Comment deleted successfully", status_code=200)
