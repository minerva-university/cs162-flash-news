import pytest
from .. import db
from ..models import Collection, CollectionPost, Post, User, Article
from flask_jwt_extended import create_access_token


def test_create_collection_all_fields(client):
    data = {
        "title": "My Collection",
        "emoji": "📚",
        "description": "A test collection",
        "is_public": True,
    }
    response = client.post("/api/collections/", json=data)
    assert response.status_code == 201
    assert "collection_id" in response.json["data"]


def test_create_collection_required_fields(client):
    data = {"title": "My Collection"}
    response = client.post("/api/collections/", json=data)
    assert response.status_code == 201

    # Verify default is_public value
    collection = Collection.query.get(response.json["data"]["collection_id"])
    assert collection.is_public


def test_create_collection_no_title(client):
    data = {"emoji": "📚", "description": "A test collection"}
    response = client.post("/api/collections/", json=data)
    assert response.status_code == 400


def test_create_collection_not_logged_in(client):
    client.environ_base.pop("HTTP_AUTHORIZATION", None)

    data = {"title": "My Collection"}
    response = client.post("/api/collections/", json=data)
    assert response.status_code == 401


def test_create_collection_invalid_types(client):
    data = {"title": 123, "is_public": "not a boolean"}  # Should be string
    response = client.post("/api/collections/", json=data)
    assert response.status_code == 400


def test_get_own_collections(client):
    # Create test collections
    user = User.query.first()
    c1 = Collection(title="Public", is_public=True, user_id=user.user_id)
    c2 = Collection(title="Private", is_public=False, user_id=user.user_id)
    db.session.add_all([c1, c2])
    db.session.commit()

    response = client.get(f"/api/collections/user/{user.user_id}")
    assert response.status_code == 200
    assert len(response.json["data"]["public"]) == 1
    assert len(response.json["data"]["private"]) == 1


def test_get_other_user_collections(client):
    # Create another user with collections
    other_user = User(email="other@test.com", password="test123", username="test_user")
    db.session.add(other_user)
    db.session.commit()

    c1 = Collection(title="Public", is_public=True, user_id=other_user.user_id)
    c2 = Collection(title="Private", is_public=False, user_id=other_user.user_id)
    db.session.add_all([c1, c2])
    db.session.commit()

    response = client.get(f"/api/collections/user/{other_user.user_id}")
    assert response.status_code == 200
    assert len(response.json["data"]["public"]) == 1
    assert "private" not in response.json["data"]


def test_get_nonexistent_user_collections(client):
    response = client.get("/api/collections/user/99999")
    assert response.status_code == 404


def test_get_collections_not_logged_in(client):
    client.environ_base.pop("HTTP_AUTHORIZATION", None)

    response = client.get("/api/collections/user/1")
    assert response.status_code == 401


def test_get_collection_posts(client):

    # Create collection with posts
    collection = Collection(title="Test", user_id=1)
    db.session.add(collection)
    db.session.commit()

    # Create a test article first
    article_data = {
        "link": "http://example.com/test-article",
        "source": "Example Source",
        "title": "Test Article",
        "caption": "This is a test article.",
        "preview": None,  # You can add a preview if needed
    }

    # Create the article instance
    article = Article(**article_data)
    db.session.add(article)
    db.session.commit()  # Commit to save the article first

    # Now create the posts associated with the article
    post1 = Post(description="Test post 1", user_id=1, article_id=article.article_id)
    post2 = Post(description="Test post 2", user_id=1, article_id=article.article_id)

    db.session.add_all([post1, post2])
    db.session.commit()  # Commit to save the posts

    # Add assertions to verify the posts were created successfully
    assert post1.post_id is not None
    assert post2.post_id is not None

    cp1 = CollectionPost(collection_id=collection.collection_id, post_id=post1.post_id)
    cp2 = CollectionPost(collection_id=collection.collection_id, post_id=post2.post_id)
    db.session.add_all([cp1, cp2])
    db.session.commit()

    response = client.get(f"/api/collections/{collection.collection_id}/posts")
    assert response.status_code == 200
    assert len(response.json["data"]) == 2


def test_add_post_to_collection(client):
    collection = Collection(title="Test", user_id=1)
    # Create a post

    # Create a test article first
    article_data = {
        "link": "http://example.com/test-article",
        "source": "Example Source",
        "title": "Test Article",
        "caption": "This is a test article.",
        "preview": None,  # You can add a preview if needed
    }

    # Create the article instance
    article = Article(**article_data)
    db.session.add(article)
    db.session.commit()  # Commit to save the article first

    # Now create the posts associated with the article
    post = Post(description="Test post 1", user_id=1, article_id=article.article_id)
    db.session.add_all([collection, post])
    db.session.commit()

    response = client.post(
        f"/api/collections/{collection.collection_id}/posts/{post.post_id}"
    )
    assert response.status_code == 200
    # Try adding same post again
    response = client.post(
        f"/api/collections/{collection.collection_id}/posts/{post.post_id}"
    )
    assert response.status_code == 200


def test_update_collection(client):
    collection = Collection(title="Old Title", user_id=1)
    db.session.add(collection)
    db.session.commit()

    data = {
        "title": "New Title",
        "emoji": "🌟",
        "description": "Updated description",
        "is_public": False,
    }
    response = client.put(f"/api/collections/{collection.collection_id}", json=data)
    assert response.status_code == 200

    updated = Collection.query.get(collection.collection_id)
    assert updated.title == "New Title"
    assert updated.emoji == "🌟"


# Test deleting a collection
def test_delete_collection(client):
    collection = Collection(title="To Delete", user_id=1)
    db.session.add(collection)
    db.session.commit()

    response = client.delete(f"/api/collections/{collection.collection_id}")
    assert response.status_code == 200

    assert Collection.query.get(collection.collection_id) is None


def test_remove_post_from_collection(client):
    collection = Collection(title="Test", user_id=1)
    # Create a post

    # Create a test article first
    article_data = {
        "link": "http://example.com/test-article",
        "source": "Example Source",
        "title": "Test Article",
        "caption": "This is a test article.",
        "preview": None,  # You can add a preview if needed
    }

    # Create the article instance
    article = Article(**article_data)
    db.session.add(article)
    db.session.commit()  # Commit to save the article first

    # Now create the posts associated with the article
    post = Post(description="Test post 1", user_id=1, article_id=article.article_id)
    db.session.add_all([collection, post])
    db.session.commit()

    cp = CollectionPost(collection_id=collection.collection_id, post_id=post.post_id)
    db.session.add(cp)
    db.session.commit()

    response = client.delete(
        f"/api/collections/{collection.collection_id}/posts/{post.post_id}"
    )
    assert response.status_code == 200

    assert (
        CollectionPost.query.filter_by(
            collection_id=collection.collection_id, post_id=post.post_id
        ).first()
        is None
    )
