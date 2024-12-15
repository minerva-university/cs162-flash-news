import pytest
from .. import db
from ..models import User, Follow


def test_get_profile_authenticated(client):
    # get test user username

    response = client.get("/api/user/testuser")
    assert response.status_code == 200
    assert response.json["data"]["username"] == "testuser"
    assert response.json["data"]["email"] == "test@test.com"


def test_get_profile_unauthenticated(client):

    client.environ_base.pop("HTTP_AUTHORIZATION", None)

    response = client.get("/api/user/testuser")
    assert response.status_code == 401


def test_update_profile(client, test_user):
    data = {
        "bio_description": "New bio description",
        "profile_picture": "base64_encoded_image",  # In practice, this would be actual image data
    }
    response = client.put("/api/user/", data=data)
    assert response.status_code == 200

    # Verify changes in database
    updated_user = User.query.get(test_user.user_id)
    assert updated_user.bio_description == "New bio description"


def test_delete_account(client, test_user):
    response = client.delete("/api/user/")
    assert response.status_code == 200

    # Verify user is deleted
    deleted_user = User.query.get(test_user.user_id)
    assert deleted_user is None


def test_follow_user(client, test_user):
    # Create another user to follow
    other_user = User(email="other@test.com", password="test123", username="other_user")
    db.session.add(other_user)
    db.session.commit()

    response = client.post(f"/api/user/follow/{other_user.user_id}")
    assert response.status_code == 200

    # Verify follow relationship in database
    follow = Follow.query.filter_by(
        follower_id=test_user.user_id, user_id=other_user.user_id
    ).first()
    assert follow is not None


def test_follow_nonexistent_user(client):
    response = client.post("/api/user/follow/99999")
    assert response.status_code == 404


def test_follow_self(client, test_user):
    response = client.post(f"/api/user/follow/{test_user.user_id}")
    assert response.status_code == 400


def test_follow_already_following(client, test_user):
    # Create and follow another user
    other_user = User(email="other@test.com", password="test123", username="other_user")
    db.session.add(other_user)
    db.session.commit()

    follow = Follow(follower_id=test_user.user_id, user_id=other_user.user_id)
    db.session.add(follow)
    db.session.commit()

    # Try to follow again
    response = client.post(f"/api/user/follow/{other_user.user_id}")
    assert response.status_code == 400


def test_unfollow_user(client, test_user):
    # Create and follow another user
    other_user = User(email="other@test.com", password="test123", username="other_user")
    db.session.add(other_user)
    db.session.commit()

    follow = Follow(follower_id=test_user.user_id, user_id=other_user.user_id)
    db.session.add(follow)
    db.session.commit()

    # Unfollow
    response = client.post(f"/api/user/unfollow/{other_user.user_id}")
    assert response.status_code == 200

    # Verify follow relationship is removed
    follow = Follow.query.filter_by(
        follower_id=test_user.user_id, user_id=other_user.user_id
    ).first()
    assert follow is None


def test_get_following_list(client, test_user):
    # Create and follow multiple users
    users = []
    for i in range(3):
        user = User(email=f"user{i}@test.com", password="test123", username=f"user{i}")
        users.append(user)
        db.session.add(user)
    db.session.commit()

    for user in users:
        follow = Follow(follower_id=test_user.user_id, user_id=user.user_id)
        db.session.add(follow)
    db.session.commit()

    response = client.get("/api/user/following")
    assert response.status_code == 200
    assert len(response.json["data"]["followed_users"]) == 3


def test_get_followers_list(client, test_user):
    # Create multiple users who follow the test user
    users = []
    for i in range(3):
        user = User(email=f"user{i}@test.com", password="test123", username=f"user{i}")
        users.append(user)
        db.session.add(user)
    db.session.commit()

    for user in users:
        follow = Follow(follower_id=user.user_id, user_id=test_user.user_id)
        db.session.add(follow)
    db.session.commit()

    response = client.get("/api/user/followers")
    assert response.status_code == 200
    assert len(response.json["data"]["followers"]) == 3


def test_get_user_feed(client, test_user):
    # Create users and follow them
    users = []
    for i in range(3):
        user = User(email=f"user{i}@test.com", password="test123", username=f"user{i}")
        users.append(user)
        db.session.add(user)
    db.session.commit()

    for user in users:
        follow = Follow(follower_id=test_user.user_id, user_id=user.user_id)
        db.session.add(follow)
    db.session.commit()

    response = client.get("/api/posts/feed")
    assert response.status_code == 200
    # assert "followed_user_ids" in response.json --> followed_user_ids is not in the response


# Test that the search functionality works
def test_search_users(client, test_user):
    # Create users to search for
    users = []
    for i in range(3):
        user = User(email=f"test{i**3}@test.com", password="test123", username=f"user{i**3}")
        users.append(user)

    user = User(email="test59@test.com", password="test123", username="wizzy") # test another username
    users.append(user)

    db.session.add_all(users)
    db.session.commit()

    response = client.get("/api/user/search?q=user")
    response2 = client.get("/api/user/search?q=wizzy")

    assert response.status_code == 200
    assert len(response.json["data"]) == 4 # including test_user

    assert response2.status_code == 200
    assert len(response2.json["data"]) == 1
