import pytest
from .. import db
from ..models import Post, Like, Article, User
from datetime import datetime, timedelta, timezone


# Helper function to create a test post (similar to comment tests)
def create_test_post(db):
    article = Article(
        link="http://example.com",
        source="Test Source",
        title="Test Article",
        caption="Test Caption",
    )
    db.session.add(article)
    db.session.commit()

    post = Post(
        user_id=1,
        article_id=article.article_id,
        description="Test post",
        posted_at=datetime.now(timezone.utc),
    )

    db.session.add(post)
    db.session.commit()
    return post


# Verify you can get how many likes a post has
def test_get_likes(client):
    # Create test post with likes and corresponding users
    post = create_test_post(db)

    # Add multiple likes with corresponding users
    users = [
        User(
            user_id=i,
            username=f"test{i}",
            email=f"test{i}@test.com",
            password="password123",
        )
        for i in range(10, 14)
    ]  # Create 4 users

    likes = [
        Like(user_id=user.user_id, post_id=post.post_id)
        for user in users  # Create 4 likes from different users
    ]
    db.session.add_all(users + likes)
    db.session.commit()

    response = client.get(f"/api/likes/{post.post_id}")
    assert response.status_code == 200
    assert response.json["total_likes"] == 4

    # Verify like structure
    like = response.json["likes"][0]
    assert "user_id" in like
    assert "username" in like
    assert "profile_picture" in like


# Verify the pagination works
def test_get_likes_pagination(client):
    # Create test post with likes and corresponding users
    post = create_test_post(db)

    # Add multiple likes with corresponding users
    users = [
        User(
            user_id=i,
            username=f"test{i}",
            email=f"test{i}@test.com",
            password="password123",
        )
        for i in range(10, 25)
    ]  # Create 15 users

    likes = [
        Like(user_id=user.user_id, post_id=post.post_id)
        for user in users  # Create 15 likes from different users
    ]
    db.session.add_all(users + likes)
    db.session.commit()

    # Test first page (default 10 per page)
    response = client.get(f"/api/likes/{post.post_id}")
    assert len(response.json["likes"]) == 10

    # Test second page
    response = client.get(f"/api/likes/{post.post_id}?page=2")
    assert len(response.json["likes"]) == 5


# Verify that you can't get likes for non-existent post
def test_get_likes_nonexistent_post(client):
    response = client.get("/api/likes/99999")
    assert response.status_code == 404


# Test that you can like a post
def test_like_post(client):
    post = create_test_post(db)

    response = client.post(f"/api/likes/{post.post_id}")
    assert response.status_code == 201

    # Verify like was created
    like = Like.query.filter_by(post_id=post.post_id, user_id=1).first()
    assert like is not None


# Don't allow users to like a post twice
def test_like_post_twice(client):
    post = create_test_post(db)

    # Like once
    response = client.post(f"/api/likes/{post.post_id}")
    assert response.status_code == 201

    # Try to like again
    response = client.post(f"/api/likes/{post.post_id}")
    assert response.status_code == 400


def test_like_nonexistent_post(client):
    response = client.post("/api/likes/99999")
    assert response.status_code == 404


def test_unlike_post(client):
    post = create_test_post(db)

    # Create a like first
    like = Like(user_id=1, post_id=post.post_id)
    db.session.add(like)
    db.session.commit()

    response = client.delete(f"/api/likes/{post.post_id}")
    assert response.status_code == 200

    # Verify like was removed
    like = Like.query.filter_by(post_id=post.post_id, user_id=1).first()
    assert like is None


def test_unlike_nonexistent_like(client):
    post = create_test_post(db)
    response = client.delete(f"/api/likes/{post.post_id}")
    assert response.status_code == 404


def test_like_after_24h(client):
    # Create old post
    post = create_test_post(db)
    post.user_id = 2  # Different user's post
    post.posted_at = datetime.now(timezone.utc) - timedelta(hours=25)
    db.session.commit()

    # Try to like
    response = client.post(f"/api/likes/{post.post_id}")
    assert response.status_code == 403

    # Try to get likes
    response = client.get(f"/api/likes/{post.post_id}")
    assert response.status_code == 403

    # Try to unlike
    like = Like(user_id=1, post_id=post.post_id)
    db.session.add(like)
    db.session.commit()

    response = client.delete(f"/api/likes/{post.post_id}")
    assert response.status_code == 403
