from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta, timezone
from . import db
from .models import Post, Article, PostCategory, CategoryEnum, User
from .utils import check_post_24h, create_success_response, create_error_response
from flask_jwt_extended import jwt_required, get_jwt_identity

posts = Blueprint("post", __name__, url_prefix="/api/posts")


MAX_CATEGORIES = 5  # Maximum number of categories a post can have


# Create a post
@posts.route("/", methods=["POST"])
@jwt_required()
def create_post():
    data = request.get_json()

    article_link = data.get("article_link")
    if not article_link:
        return create_error_response("Article link is required", status_code=400)

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
        user_id=get_jwt_identity(),
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
            return create_error_response(
                f"Maximum of {MAX_CATEGORIES} categories allowed", status_code=400
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

    return create_success_response("Post created successfully", status_code=201, data={"post_id": post.post_id})


# Get a single post
@posts.route("/<int:post_id>", methods=["GET"])
@jwt_required()
def get_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return create_error_response("Post not found", status_code=404)

    if check_post_24h(post=post):
        return create_error_response("You are not allowed to view this post", status_code=403)

    current_user_id = get_jwt_identity()
    is_liked = any(like.user_id == current_user_id for like in post.likes)

    post_data = {
        "post_id": post.post_id,
        "user": {
            "user_id": post.user.user_id,
            "username": post.user.username,
            "bio_description": post.user.bio_description,
            "profile_picture": f"/user/uploads/{post.user.profile_picture}",
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

    return create_success_response("Post retrieved successfully", status_code=200, data=post_data)


# Delete a post
@posts.route("/<int:post_id>", methods=["DELETE"])
@jwt_required()
def delete_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return create_error_response("Post not found", status_code=404)

    if post.user_id != int(get_jwt_identity()):
        return create_error_response("You are not allowed to delete this post", status_code=403) 

    db.session.delete(post)
    db.session.commit()

    return create_success_response("Post deleted successfully", status_code=200)


# Update a post
@posts.route("/<int:post_id>", methods=["PUT"])
@jwt_required()
def update_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return create_error_response("Post not found", status_code=404)

    if post.user_id != int(get_jwt_identity()):
        return create_error_response("You are not allowed to update this post", status_code=403)

    data = request.get_json()

    # Articles cannot be updated
    # Only update post description and categories
    post_description = data.get("post_description")
    categories = data.get("categories")

    if post_description:
        post.description = post_description

    if categories:
        # Check if the number of categories is within the limit
        if len(categories) > MAX_CATEGORIES:
            return create_error_response(
                f"Maximum of {MAX_CATEGORIES} categories allowed", status_code=400
            )
        # Remove existing categories
        PostCategory.query.filter_by(post_id=post_id).delete()

        # Add new categories
        for category_name in categories:
            category_key = category_name.upper().replace(" ", "_")  # Normalize input to match enum keys
            if category_key in CategoryEnum.__members__:
                post_category = PostCategory(
                    post_id=post_id,
                    category=CategoryEnum[category_key],
                )
                db.session.add(post_category)
                print(f"post_category being added: {post_category.category.name}")
            else:
                print(f"Category not added because it's not in enum: {category_name}")

    db.session.commit()

    return create_success_response("Post updated successfully", status_code=200)


# Get feed (posts by self + followed users) with pagination
@posts.route("/feed", methods=["GET"])
@jwt_required()
def get_feed():
    # Set pagination parameters
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    time_threshold = datetime.now(timezone.utc) - timedelta(hours=24)
    current_user = User.query.get(get_jwt_identity())

    followed_users = [
        current_user.user_id,
        *[follow.user_id for follow in current_user.followings],
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
        is_liked = any(like.user_id == int(get_jwt_identity()) for like in post.likes)
        posts_data.append(
            {
                "post_id": post.post_id,
                "user": {
                    "user_id": post.user.user_id,
                    "username": post.user.username,
                    "bio_description": post.user.bio_description,
                    "profile_picture": f"/user/uploads/{post.user.profile_picture}",
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

    return create_success_response("Posts fetched successfully", status_code=200, {
    "total_posts": paginated_posts.total,
    "page": paginated_posts.page,
    "per_page": paginated_posts.per_page,
    "posts": posts_data,
})

# Get posts (posted by the user) with pagination
@posts.route("/user/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user_posts(user_id):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    # Check if the requested user_id is the current user's
    if user_id == int(get_jwt_identity()):
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
        is_liked = any(like.user_id == int(get_jwt_identity()) for like in post.likes)
        posts_data.append(
            {
                "post_id": post.post_id,
                "description": post.description,
                "posted_at": post.posted_at,
                "user": {
                    "user_id": post.user.user_id,
                    "username": post.user.username,
                    "bio_description": post.user.bio_description,
                    "profile_picture": f"/user/uploads/{post.user.profile_picture}",
                },
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

    return success_response("Posts fetched successfully", 200, data={
        "total_posts": paginated_posts.total,
        "page": paginated_posts.page,
        "per_page": paginated_posts.per_page,
        "posts": posts_data,
    })


# Get available categories
@posts.route("/categories", methods=["GET"])
@jwt_required()
def get_categories():
    """
    # No need for pagination given that we are dealing with only few categories (fixed)

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
    """
    categories_data = [{"category_id": category.value} for category in CategoryEnum]

    return success_response("Categories fetched successfully", 200, data={
        "categories": categories_data,
    })
