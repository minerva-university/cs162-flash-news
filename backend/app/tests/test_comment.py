import pytest
from .. import db
from ..models import Post, Comment, Article
from flask_login import logout_user
from datetime import datetime, timedelta, timezone
from ..utils import check_post_24h


# Helper function to create a test post as reference for testing comments
def create_test_post(db):
    article = Article(
        link="http://example.com",
        source="Test Source",
        title="Test Article",
        caption="Test Caption"
    )
    db.session.add(article)
    db.session.commit()

    post = Post(user_id=1,
                article_id=article.article_id,
                description="Test post",
                posted_at=datetime.now(timezone.utc))
    
    db.session.add(post)
    db.session.commit()
    return post


# Ensure comments in a post can be retrieved
def test_get_comments(client):
    # Create test post with comments
    post = create_test_post(db)
    
    # Add multiple comments
    comments = [
        Comment(user_id=1, post_id=post.post_id, content=f"Test comment {i}")
        for i in range(3)
    ]
    db.session.add_all(comments)
    db.session.commit()

    response = client.get(f'/api/comments/{post.post_id}')
    assert response.status_code == 200
    assert len(response.json['comments']) == 3
    assert response.json['total_comments'] == 3

    # Verify comment structure
    comment = response.json['comments'][0]
    assert 'comment_id' in comment
    assert 'user' in comment
    assert 'comment' in comment
    assert 'commented_at' in comment


# Test the pagination of the comments
def test_get_comments_pagination(client):
    post = create_test_post(db)
    
    # Add 15 comments
    comments = [
        Comment(user_id=1, post_id=post.post_id, content=f"Test comment {i}")
        for i in range(15)
    ]
    db.session.add_all(comments)
    db.session.commit()

    # Test first page (default 10 per page)
    response = client.get(f'/api/comments/{post.post_id}')
    assert len(response.json['comments']) == 10
    
    # Test second page
    response = client.get(f'/api/comments/{post.post_id}?page=2')
    assert len(response.json['comments']) == 5


# Test that getting comments from a non-existent post throws an error
def test_get_comments_nonexistent_post(client):
    response = client.get('/api/comments/99999')
    assert response.status_code == 404


# Test that users can't view comments if they're not logged in
def test_get_comments_not_logged_in(client):
    with client.application.test_request_context():
        logout_user()
    
    response = client.get('/api/comments/1')
    assert response.status_code == 401


# Test that you can create a new comment
def test_create_comment(client):
    post = create_test_post(db)
    
    data = {'comment': 'New test comment'}
    response = client.post(f'/api/comments/{post.post_id}', json=data)
    assert response.status_code == 201
    assert 'comment_id' in response.json

    # Verify comment was created
    comment = Comment.query.get(response.json['comment_id'])
    assert comment is not None
    assert comment.content == 'New test comment'


# Test that you can't create an empty comment
def test_create_comment_empty(client):
    post = create_test_post(db)
    
    data = {'comment': ''}
    response = client.post(f'/api/comments/{post.post_id}', json=data)
    assert response.status_code == 400


# Test that users can't create a comment on a non-existent post
def test_create_comment_nonexistent_post(client):
    data = {'comment': 'Test comment'}
    response = client.post('/api/comments/99999', json=data)
    assert response.status_code == 404


# Test that updating a comment works well
def test_update_comment(client):
    post = create_test_post(db)
    comment = Comment(user_id=1, post_id=post.post_id, content="Original comment")
    db.session.add(comment)
    db.session.commit()

    data = {'comment': 'Updated comment'}
    response = client.put(f'/api/comments/{comment.comment_id}', json=data)
    assert response.status_code == 200

    updated_comment = Comment.query.get(comment.comment_id)
    assert updated_comment.content == 'Updated comment'


# Test that you can't change another user's comment
def test_update_comment_unauthorized(client):
    # Create comment by different user
    post = create_test_post(db)
    comment = Comment(user_id=2, post_id=post.post_id, content="Other user's comment")
    db.session.add(comment)
    db.session.commit()

    data = {'comment': 'Trying to update'}
    response = client.put(f'/api/comments/{comment.comment_id}', json=data)
    assert response.status_code == 403


# Test that delete a comment works
def test_delete_comment(client):
    post = create_test_post(db)
    comment = Comment(user_id=1, post_id=post.post_id, content="Comment to delete")
    db.session.add(comment)
    db.session.commit()

    response = client.delete(f'/api/comments/{comment.comment_id}')
    assert response.status_code == 200

    # Verify comment was deleted
    assert Comment.query.get(comment.comment_id) is None


# Test that you can't delete another user's comment
def test_delete_comment_unauthorized(client):
    post = create_test_post(db)
    comment = Comment(user_id=2, post_id=post.post_id, content="Other user's comment")
    db.session.add(comment)
    db.session.commit()

    response = client.delete(f'/api/comments/{comment.comment_id}')
    assert response.status_code == 403


def test_post_24h_datetime_comparison():
    # Create a post with timezone-aware datetime
    post = create_test_post(db)
    post.user_id = 2
    post.posted_at = datetime.now(timezone.utc) - timedelta(hours=25)
    db.session.commit()

    db.session.refresh(post)

    # Verify the datetime has timezone info
    assert post.posted_at.tzinfo is not None
    
    # Test the check_post_24h function directly
    assert check_post_24h(post) == True

    # Test with a recent post
    post.posted_at = datetime.now(timezone.utc) - timedelta(hours=23)
    db.session.commit()
    assert check_post_24h(post) == False


# Test that you can't see comments on another user's post 24hrs after they posted it
def test_comment_after_24h(client):
    # Create old post
    post = create_test_post(db)
    post.user_id = 2  # Different user's post
    post.posted_at = datetime.now(timezone.utc) - timedelta(hours=25)
    db.session.commit()

    # Try to comment
    data = {'comment': 'Test comment'}
    response = client.post(f'/api/comments/{post.post_id}', json=data)
    assert response.status_code == 403

    # Try to get comments
    response = client.get(f'/api/comments/{post.post_id}')
    assert response.status_code == 403
