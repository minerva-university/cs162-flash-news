from . import db
from flask_login import UserMixin
from sqlalchemy import Enum, Index
import enum
from datetime import datetime, timezone
from sqlalchemy.types import DateTime
from sqlalchemy.types import TypeDecorator


class TZDateTime(TypeDecorator):
    impl = DateTime
    
    def process_bind_param(self, value, dialect):
        if value is not None:
            if value.tzinfo is None:
                value = value.replace(tzinfo=datetime.timezone.utc)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            if value.tzinfo is None:
                value = value.replace(tzinfo=datetime.timezone.utc)
        return value
    

class User(UserMixin, db.Model):
    # Added the get_id method: for flask_login purposes
    def get_id(self):
        return str(self.user_id)

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc))
    bio_description = db.Column(db.Text)
    profile_picture = db.Column(db.LargeBinary)

    posts = db.relationship(
        "Post", backref="user", lazy=True, cascade="all, delete-orphan"
    )
    collections = db.relationship(
        "Collection", backref="user", lazy=True, cascade="all, delete-orphan"
    )
    comments = db.relationship(
        "Comment", backref="user", lazy=True, cascade="all, delete-orphan"
    )
    likes = db.relationship(
        "Like", backref="user", lazy=True, cascade="all, delete-orphan"
    )
    followers = db.relationship(
        "Follow",
        foreign_keys="[Follow.user_id]",
        backref="followed_user",
        lazy=True,
        cascade="all, delete-orphan",
    )
    followings = db.relationship(
        "Follow",
        foreign_keys="[Follow.follower_id]",
        backref="following_user",
        lazy=True,
        cascade="all, delete-orphan",
    )


class Article(db.Model):  # Seperated this from Post considering 3NF.
    article_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    link = db.Column(db.String, nullable=False)
    source = db.Column(db.String)  # Automatically generated from link
    title = db.Column(db.String)  # Automatically generated from link
    caption = db.Column(db.Text)  # Automatically generated from link
    preview = db.Column(db.String)  # URL of og:image, automatically generated from link

    posts = db.relationship(
        "Post", backref="article", lazy=True, cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_article_link", "link"),
    )  # Indexing the link column for when searching if the article already exists.


class Post(db.Model):
    post_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    article_id = db.Column(
        db.Integer, db.ForeignKey("article.article_id"), nullable=False
    )
    description = db.Column(db.Text)
    posted_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)

    categories = db.relationship(
        "PostCategory", backref="post", lazy=True, cascade="all, delete-orphan"
    )
    collections = db.relationship(
        "CollectionPost", backref="post", lazy=True, cascade="all, delete-orphan"
    )
    comments = db.relationship(
        "Comment", backref="post", lazy=True, cascade="all, delete-orphan"
    )
    likes = db.relationship(
        "Like", backref="post", lazy=True, cascade="all, delete-orphan"
    )


class CategoryEnum(enum.Enum):
    POLITICS = "Politics"
    TECH = "Tech"
    HEALTH = "Health"
    SPORTS = "Sports"
    ENTERTAINMENT = "Entertainment"
    SCIENCE = "Science"
    BUSINESS = "Business"
    ENVIRONMENT = "Environment"


class PostCategory(db.Model):  # Many to Many relationship between posts and categories
    post_id = db.Column(db.Integer, db.ForeignKey("post.post_id"), primary_key=True)
    category = db.Column(Enum(CategoryEnum), primary_key=True)


class Collection(db.Model):
    collection_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    emoji = db.Column(db.String(10))
    description = db.Column(db.Text)
    emoji = db.Column(db.String(10))
    description = db.Column(db.Text)
    is_public = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc))

    posts = db.relationship(
        "CollectionPost", backref="collection", lazy=True, cascade="all, delete-orphan"
    )

    # Adding a unique constraint to the user_id and title columns
    __table_args__ = (
            db.UniqueConstraint('user_id', 'title', name='unique_user_collection_title'),
        )
    )

    # Adding a unique constraint to the user_id and title columns
    __table_args__ = (
            db.UniqueConstraint('user_id', 'title', name='unique_user_collection_title'),
        )


class CollectionPost(
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
    commented_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc))


class Like(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("post.post_id"), primary_key=True)
    liked_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc))


class Follow(db.Model):
    user_id = db.Column(
        db.Integer, db.ForeignKey("user.user_id"), primary_key=True
    )  # User being followed
    follower_id = db.Column(
        db.Integer, db.ForeignKey("user.user_id"), primary_key=True
    )  # User following
    followed_at = db.Column(db.DateTime(timezone=True), default=datetime.now(timezone.utc))