from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime, timedelta, timezone
from . import db
from .models import Post, Article, PostCategory, CategoryEnum
from .utils import check_post_24h
from flask_jwt_extended import jwt_required

posts = Blueprint("post", __name__)


MAX_CATEGORIES = 5  # Maximum number of categories a post can have

current_user_id = 1  # @TODO: Get current user from JWT


# Create a post
@posts.route("/posts", methods=["POST"])
@jwt_required()
def create_post():
    data = request.get_json()

    article_link = data.get("article_link")
    if not article_link:
        return jsonify({"error": "Article link is required"}), 400

    # Check if the article already exists
    article = Article.query.filter_by(link=article_link).first()
    # If not, create a new article
    if not article:
        article = Article(
            link=article_link,
            source=data.get("site_name"),  # og:site_name
            title=data.get("title"),  # og:title
            caption=data.get("description"),  # og:description
            preview=data.get("image"),  # og:image
        )  # What if the automated fields fail? Implement later
        db.session.add(article)
        db.session.commit()

    post = Post(
        user_id=current_user_id,  # @TODO change back to current_user.user_id or JWT equivalent
        article_id=article.article_id,
        description=data.get(
            "post_description"
        ),  # post_ prefix differentiates from og:description
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
            # Check if the category exists and add it to the PostCategory table
            if category.upper() in CategoryEnum.__members__:
                post_category = PostCategory(
                    post_id=post.post_id,
                    category=CategoryEnum[category.upper()],
                )
                db.session.add(post_category)
        db.session.commit()

    return (
        jsonify({"message": "Post created successfully", "post_id": post.post_id}),
        201,
    )


# Get a single post
@posts.route("/posts/<int:post_id>", methods=["GET"])
@jwt_required()
def get_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    if check_post_24h(user=post, post=post):
        return jsonify({"error": "You are not allowed to view this post"}), 403

    # @TODO: Change back to this later
    # is_liked = any(like.user_id == current_user.id for like in post.likes)
    is_liked = any(like.user_id == current_user_id for like in post.likes)

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
            "link": post.article.link,
            "source": post.article.source,
            "title": post.article.title,
            "caption": post.article.caption,
            "preview": post.article.preview,
        },
        "categories": [category.category.value for category in post.categories],
        "comments_count": len(post.comments),
        "likes_count": len(post.likes),
        "is_liked": is_liked,
    }

    return jsonify(post_data), 200


# Delete a post
@posts.route("/posts/<int:post_id>", methods=["DELETE"])
@jwt_required()
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
@posts.route("/posts/<int:post_id>", methods=["PUT"])
@jwt_required()
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


# Get feed (posts by self + followed users) with pagination
@posts.route("/posts/feed", methods=["GET"])
@jwt_required()
def get_feed():
    # Set pagination parameters
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    time_threshold = datetime.now(timezone.utc) - timedelta(hours=24)

    followed_users = [
        current_user_id, 
        # (follow.user_id for follow in current_user.followings) # @TODO: Implement this once we have JWT
    ]

    # Query posts by followed users from the last 24 hours
    posts_query = Post.query.filter(
        Post.user_id.in_(followed_users), Post.posted_at >= time_threshold
    ).order_by(Post.posted_at.desc())

    # Apply pagination
    paginated_posts = posts_query.paginate(
        page=page, per_page=per_page, error_out=False
    )

    posts_data = []
    for post in paginated_posts.items:
        # is_liked = any(like.user_id == current_user.id for like in post.likes)
        is_liked = any(like.user_id == current_user_id for like in post.likes)
        posts_data.append(
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
                    "link": post.article.link,
                    "source": post.article.source,
                    "title": post.article.title,
                    "caption": post.article.caption,
                    "preview": post.article.preview,
                },
                "categories": [category.category.value for category in post.categories],
                "comments_count": len(post.comments),
                "likes_count": len(post.likes),
                "is_liked": is_liked,
            }
        )

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


# Get posts (posted by the user) with pagination
@posts.route("/posts/user/<int:user_id>", methods=["GET"])
@jwt_required()
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

    posts_data = []
    for post in paginated_posts.items:
        # is_liked = any(like.user_id == current_user.id for like in post.likes)
        is_liked = any(like.user_id == current_user_id for like in post.likes)
        posts_data.append(
            {
                "post_id": post.post_id,
                "description": post.description,
                "posted_at": post.posted_at,
                "article": {
                    "article_id": post.article.article_id,
                    "link": post.article.link,
                    "source": post.article.source,
                    "title": post.article.title,
                    "caption": post.article.caption,
                    "preview": post.article.preview,
                },
                "categories": [category.category.value for category in post.categories],
                "comments_count": len(post.comments),
                "likes_count": len(post.likes),
                "is_liked": is_liked,
            }
        )

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


# Get available categories
@posts.route("/posts/categories", methods=["GET"])
@jwt_required()
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
