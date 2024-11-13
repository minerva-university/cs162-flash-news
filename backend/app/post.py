from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime, timedelta, timezone
from . import db
from .models import Post, Article, PostCategory, CategoryEnum, Like, Comment

posts = Blueprint("post", __name__)


MAX_CATEGORIES = 5  # Maximum number of categories a post can have


def check_post_24h(post):
    time_threshold = datetime.now(timezone.utc) - timedelta(hours=24)
    return post.user_id != current_user.user_id and post.posted_at < time_threshold


# Create a post
@posts.route("/posts", methods=["POST"])
@login_required
def create_post():
    data = request.get_json()

    article_link = data.get("article_link")
    if not article_link:
        return jsonify({"error": "Article link is required"}), 400

    article = Article.query.filter_by(link=article_link).first()
    if not article:
        article = Article(
            link=article_link,
            source=None,  # Implement later
            title=None,  # Implement later
            caption=None,  # Implement later
            preview=None,  # Implement later
        )  # What if the automated fields fail? Implement later
        db.session.add(article)
        db.session.commit()

    post = Post(
        user_id=current_user.user_id,
        article_id=article.article_id,
        description=data.get("description"),
    )

    db.session.add(post)
    db.session.commit()

    categories = data.get("categories")
    if categories:
        if len(categories) > MAX_CATEGORIES:
            return (
                jsonify({"error": "Maximum of {MAX_CATEGORIES} categories allowed"}),
                400,
            )
        for category in categories:
            if category in CategoryEnum.__members__:
                post_category = PostCategory(
                    post_id=post.post_id,
                    category=CategoryEnum[category],
                )
                db.session.add(post_category)
    db.session.commit()

    return (
        jsonify({"message": "Post created successfully", "post_id": post.post_id}),
        201,
    )


# Get posts (posted by the user) with pagination
@posts.route("/posts/<user_id>", methods=["GET"])
@login_required
def get_user_posts(user_id):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    # Check if the requested user_id is the current user's
    if user_id == current_user.user_id:
        # Fetch all posts by the user
        posts_query = Post.query.filter_by(user_id=user_id)
    else:
        # Fetch only posts within the last 24 hours if not the current user's posts
        time_threshold = datetime.now(timezone.utc) - timedelta(hours=24)
        posts_query = Post.query.filter_by(user_id=user_id).filter(
            Post.posted_at >= time_threshold
        )

    # Apply pagination
    paginated_posts = posts_query.paginate(
        page=page, per_page=per_page, error_out=False
    )

    posts_data = [
        {
            "post_id": post.post_id,
            "description": post.description,
            "posted_at": post.posted_at,
            "article": {
                "article_id": post.article.article_id,
                "title": post.article.title,
                "link": post.article.link,
                "caption": post.article.caption,
            },
            "categories": [category.category.value for category in post.categories],
            "comments_count": len(post.comments),
            "likes_count": len(post.likes),
        }
        for post in paginated_posts.items
    ]

    return (
        jsonify(
            {
                "total_posts": paginated_posts.total,
                "page": paginated_posts.page,
                "per_page": paginated_posts.per_page,
                "posts": posts_data,
            }
        ),
        200,
    )


# Get feed (posts by followed users) with pagination
@posts.route("/posts/feed", methods=["GET"])
@login_required
def get_feed():
    # Set pagination parameters
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    time_threshold = datetime.now(timezone.utc) - timedelta(hours=24)

    followed_users = [follow.user_id for follow in current_user.followings]

    # Query posts by followed users from the last 24 hours
    posts_query = Post.query.filter(
        Post.user_id.in_(followed_users), Post.posted_at >= time_threshold
    ).order_by(Post.posted_at.desc())

    # Apply pagination
    paginated_posts = posts_query.paginate(
        page=page, per_page=per_page, error_out=False
    )

    posts_data = [
        {
            "post_id": post.post_id,
            "user": {
                "user_id": post.user.user_id,
                "username": post.user.username,
                "bio_description": post.user.bio_description,
                "profile_picture": post.user.profile_picture,
            },
            "user_id": post.user_id,
            "description": post.description,
            "posted_at": post.posted_at,
            "article": {
                "article_id": post.article.article_id,
                "title": post.article.title,
                "link": post.article.link,
                "caption": post.article.caption,
            },
            "categories": [category.category.value for category in post.categories],
            "comments_count": len(post.comments),
            "likes_count": len(post.likes),
        }
        for post in paginated_posts.items
    ]

    return (
        jsonify(
            {
                "total_posts": paginated_posts.total,
                "page": paginated_posts.page,
                "per_page": paginated_posts.per_page,
                "posts": posts_data,
            }
        ),
        200,
    )


# Get a single post
@posts.route("/posts/<post_id>", methods=["GET"])
@login_required
def get_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    if check_post_24h(user=post, post=post):
        return jsonify({"error": "You are not allowed to view this post"}), 403

    post_data = {
        "post_id": post.post_id,
        "user": {
            "user_id": post.user.user_id,
            "username": post.user.username,
            "bio_description": post.user.bio_description,
            "profile_picture": post.user.profile_picture,
        },
        "description": post.description,
        "posted_at": post.posted_at,
        "article": {
            "article_id": post.article.article_id,
            "title": post.article.title,
            "link": post.article.link,
            "caption": post.article.caption,
        },
        "categories": [category.category.value for category in post.categories],
        "comments_count": len(post.comments),
        "likes_count": len(post.likes),
    }

    return jsonify(post_data), 200


# Delete a post
@posts.route("/posts/<post_id>", methods=["DELETE"])
@login_required
def delete_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    if post.user_id != current_user.user_id:
        return jsonify({"error": "You are not allowed to delete this post"}), 403

    db.session.delete(post)
    db.session.commit()

    return jsonify({"message": "Post deleted successfully"}), 200


# Update a post
@posts.route("/posts/<post_id>", methods=["PUT"])
@login_required
def update_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    if post.user_id != current_user.user_id:
        return jsonify({"error": "You are not allowed to update this post"}), 403

    data = request.get_json()
    article_link = data.get("article_link")
    description = data.get("description")
    categories = data.get("categories")

    if article_link:
        article = Article.query.filter_by(link=article_link).first()
        if not article:
            article = Article(
                link=article_link,
                source=None,  # Implement later
                title=None,  # Implement later
                caption=None,  # Implement later
                preview=None,  # Implement later
            )  # What if the automated fields fail? Implement later
            db.session.add(article)
            db.session.commit()

        post.article_id = article.article_id  # Update post's article_id to new article

    if description:
        post.description = description

    if categories:
        # Check if the number of categories is within the limit
        if len(categories) > MAX_CATEGORIES:
            return (
                jsonify({"error": "Maximum of {MAX_CATEGORIES} categories allowed"}),
                400,
            )
        # Remove existing categories
        PostCategory.query.filter_by(post_id=post_id).delete()
        # Add new categories
        for category_name in categories:
            if category_name in CategoryEnum.__members__:
                post_category = PostCategory(
                    post_id=post_id,
                    category=CategoryEnum[category_name],
                )
                db.session.add(post_category)
    db.session.commit()

    return jsonify({"message": "Post updated successfully"}), 200


# Get likes on a post
@posts.route("/posts/<post_id>/likes", methods=["GET"])
def get_likes(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    if check_post_24h(post):
        return jsonify({"error": "You are not allowed to view likes on this post"}), 403

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    paginated_likes = post.likes.paginate(page=page, per_page=per_page, error_out=False)

    likes_data = [
        {
            "user_id": like.user_id,
            "username": like.user.username,
            "profile_picture": like.user.profile_picture,
        }
        for like in paginated_likes.items
    ]

    return (
        jsonify(
            {
                "total_likes": paginated_likes.total,
                "page": paginated_likes.page,
                "per_page": paginated_likes.per_page,
                "likes": likes_data,
            }
        ),
        200,
    )


# Like a post
@posts.route("/posts/<post_id>/like", methods=["POST"])
@login_required
def give_like(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    if check_post_24h(post):
        return jsonify({"error": "You are not allowed to like this post"}), 403

    post_like = Like(user_id=current_user.user_id, post_id=post_id)
    db.session.add(post_like)
    db.session.commit()

    return jsonify({"message": "Post liked successfully"}), 201


# Unlike a post
@posts.route("/posts/<post_id>/like", methods=["DELETE"])
@login_required
def remove_like(post_id):
    post_like = Like.query.filter_by(
        user_id=current_user.user_id, post_id=post_id
    ).first()
    if not post_like:
        return jsonify({"error": "Like not found"}), 404

    if check_post_24h(post_like.post):
        return (
            jsonify({"error": "You are not allowed to remove like on this post"}),
            403,
        )

    db.session.delete(post_like)
    db.session.commit()

    return jsonify({"message": "Like removed successfully"}), 200


# Get comments on a post
@posts.route("/posts/<post_id>/comments", methods=["GET"])
@login_required
def get_comments(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    if check_post_24h(post):
        return (
            jsonify({"error": "You are not allowed to view comments on this post"}),
            403,
        )

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    paginated_comments = post.comments.paginate(
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
            "comment": comment.comment,
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
@posts.route("/posts/<post_id>/comment", methods=["POST"])
@login_required
def create_comment(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    if check_post_24h(post):
        return jsonify({"error": "You are not allowed to comment on this post"}), 403

    data = request.get_json()
    comment = data.get("comment")
    if not comment:
        return jsonify({"error": "Comment is required"}), 400

    post_comment = Comment(
        user_id=current_user.user_id, post_id=post_id, comment=comment
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
@posts.route("/posts/comment/<comment_id>", methods=["PUT"])
@login_required
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

    post_comment.comment = comment
    db.session.commit()

    return jsonify({"message": "Comment updated successfully"}), 200


# Delete a comment on a post
@posts.route("/posts/comment/<comment_id>", methods=["DELETE"])
@login_required
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


# Get available categories
@posts.route("/posts/categories", methods=["GET"])
@login_required
def get_categories():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    paginated_categories = CategoryEnum.query.paginate(
        page=page, per_page=per_page, error_out=False
    )

    categories_data = [
        {"category_id": category} for category in paginated_categories.items
    ]

    return (
        jsonify(
            {
                "total_categories": paginated_categories.total,
                "page": paginated_categories.page,
                "per_page": paginated_categories.per_page,
                "categories": categories_data,
            }
        ),
        200,
    )
