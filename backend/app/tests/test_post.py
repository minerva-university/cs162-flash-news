import pytest
from flask import json
from .. import db
from ..models import Post, Article, User, CategoryEnum, Follow
from flask_login import logout_user, login_user
from datetime import datetime, timedelta, timezone


# Test creating a post works
def test_create_post_success(client):
    data = {
        'article_link': 'http://example.com/article',
        'description': 'Test post description',
        'categories': ['TECH', 'SCIENCE']
    }
    response = client.post('/api/posts/', json=data)
    assert response.status_code == 201
    assert 'post_id' in response.json

    # Verify post was created
    post = Post.query.get(response.json['post_id'])
    assert post.description == 'Test post description'
    assert len(post.categories) == 2


# Test that you can't create a post without an article
def test_create_post_no_article_link(client):
    data = {
        'description': 'Test post description'
    }
    response = client.post('/api/posts/', json=data)
    assert response.status_code == 400


# Test that you can only create a post with 5 (MAX_NUM) categories
def test_create_post_too_many_categories(client):
    data = {
        'article_link': 'http://example.com/article',
        'categories': ['TECH', 'SCIENCE', 'SPORTS', 'HEALTH', 'BUSINESS', 'POLITICS']
    }
    response = client.post('/api/posts/', json=data)
    assert response.status_code == 400


# Test that you can't create a post without being logged in (security)
def test_create_post_not_logged_in(client):
    client.environ_base.pop('HTTP_AUTHORIZATION', None)
    
    data = {
        'article_link': 'http://example.com/article'
    }
    response = client.post('/api/posts/', json=data)
    assert response.status_code == 401


# Test that you can retrieve posts
def test_get_post_success(client):
    # Create test post
    article = Article(link='http://example.com/article')
    db.session.add(article)
    db.session.commit()

    post = Post(
        user_id=1,
        article_id=article.article_id,
        description='Test post'
    )
    db.session.add(post)
    db.session.commit()

    response = client.get(f'/api/posts/{post.post_id}')
    assert response.status_code == 200
    assert response.json['description'] == 'Test post'
    assert 'user' in response.json
    assert 'article' in response.json


# Test that retrieving a non-existent posts returns an error
def test_get_post_nonexistent(client):
    response = client.get('/api/posts/99999')
    assert response.status_code == 404


# Test that you can delete a post
def test_delete_post_success(client):
    # Create test post
    article = Article(link='http://example.com/article')
    db.session.add(article)
    db.session.commit()

    post = Post(
        user_id=1,  # Current test user's ID
        article_id=article.article_id,
        description='Test post'
    )
    db.session.add(post)
    db.session.commit()

    response = client.delete(f'/api/posts/{post.post_id}')
    assert response.status_code == 200
    assert Post.query.get(post.post_id) is None


# Test that you can't delete another user's post 
def test_delete_post_unauthorized(client):
    # Create another user
    other_user = User(email='other@test.com', password='test123', username='other_user')
    db.session.add(other_user)
    db.session.commit()

    # Create post owned by other user
    article = Article(link='http://example.com/article')
    db.session.add(article)
    db.session.commit()

    post = Post(
        user_id=other_user.user_id,
        article_id=article.article_id,
        description='Test post'
    )
    db.session.add(post)
    db.session.commit()

    response = client.delete(f'/api/posts/{post.post_id}')
    assert response.status_code == 403


# Test getting user's feed
def test_get_feed(client):
    # Create another user to follow
    other_user = User(email='other@test.com', password='test123', username='other_user')
    db.session.add(other_user)
    db.session.commit()

    # Create some posts
    article = Article(link='http://example.com/article')
    db.session.add(article)
    db.session.commit()

    posts = []
    for i in range(3):
        post = Post(
            user_id=other_user.user_id,
            article_id=article.article_id,
            description=f'Test post {i}'
        )
        posts.append(post)
    
    db.session.add_all(posts)
    db.session.commit()

    current_user = User.query.first()  # Get the test user
    follow = Follow(follower_id=current_user.user_id, user_id=other_user.user_id)
    db.session.add(follow)
    db.session.commit()


    response = client.get('/api/posts/feed')

    assert response.status_code == 200
    assert 'posts' in response.json
    assert 'total_posts' in response.json
    assert 'page' in response.json


# Test getting user's posts
def test_get_user_posts(client):
    # Create test posts
    article = Article(link='http://example.com/article')
    db.session.add(article)
    db.session.commit()

    user = User.query.first()
    posts = []
    for i in range(3):
        post = Post(
            user_id=user.user_id,
            article_id=article.article_id,
            description=f'Test post {i}'
        )
        posts.append(post)
    
    db.session.add_all(posts)
    db.session.commit()

    response = client.get(f'/api/posts/user/{user.user_id}')
    assert response.status_code == 200
    assert 'posts' in response.json
    assert len(response.json['posts']) == 3


# Test retrieving all the categories
def test_get_categories(client):
    response = client.get('/api/posts/categories')
    assert response.status_code == 200
    assert 'categories' in response.json

    # Verify all categories were received 
    categories = response.json['categories']
    assert len(categories) == len(CategoryEnum)


# Test that you can't view a post 24hrs after it has been created
def test_view_post_after_24h(client):
    article = Article(link='http://example.com/article')
    db.session.add(article)
    db.session.commit()

    post = Post(
        user_id=2,
        article_id=article.article_id,
        description='Test post'
    )
    db.session.add(post)
    db.session.commit()

    post.posted_at = (datetime.now(timezone.utc) - timedelta(hours=25))
    db.session.commit()

    response = client.get(f'/api/posts/{post.post_id}')
    assert response.status_code == 403

