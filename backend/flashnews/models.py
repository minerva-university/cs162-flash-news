from . import db
from flask_login import UserMixin
import enum
from datetime import datetime, timezone


class User(UserMixin, db.Model):
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    bio_description = db.Column(db.Text)
    profile_picture = db.Column(db.LargeBinary)


class Post(db.Model):
    post_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    article_link = db.Column(db.String, nullable=False)
    source = db.Column(db.String)  # Automatically generated from article_link
    title = db.Column(db.String)  # Automatically generated from article_link
    caption = db.Column(db.Text)  # Automatically generated from article_link
    preview = db.Column(db.LargeBinary)  # Automatically generated from article_link
    description = db.Column(
        db.Text
    )  # Can delete this and add it as a Comment to the post?
    posted_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))


class CategoryEnum(
    enum.Enum
):  # Not sure about this implementation. We would have to add all the Category values when initializing the database
    POLITICS = "Politics"
    TECH = "Tech"
    HEALTH = "Health"
    SPORTS = "Sports"
    ENTERTAINMENT = "Entertainment"
    SCIENCE = "Science"
    BUSINESS = "Business"
    ENVIRONMENT = "Environment"


class Category(db.Model):
    category_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.Enum(CategoryEnum), nullable=False)


class Post_Category(db.Model):  # Many to Many relationship between posts and categories
    post_id = db.Column(db.Integer, db.ForeignKey("post.post_id"), primary_key=True)
    category_id = db.Column(
        db.Integer, db.ForeignKey("category.category_id", primary_key=True)
    )


class Collection(db.Model):
    collection_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    is_public = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))


class Collection_Post(
    db.Model
):  # Many to Many relationship between posts and collections
    post_id = db.Column(db.Integer, db.ForeignKey("post.post_id"), primary_key=True)
    collection_id = db.Column(
        db.Integer, db.ForeignKey("collection.collection_id"), primary_key=True
    )


class Comment(db.Model):  # Cannot have nested comments
    comment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("post.post_id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    commented_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))


class PostLike(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("post.post_id"), primary_key=True)
    liked_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))


class Follow(db.Model):
    follower_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), primary_key=True)
    followee_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), primary_key=True)
    followed_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
