import pytest
from flask_jwt_extended import decode_token
from ..models import User, RevokedToken
from datetime import timedelta
from unittest.mock import patch
from flask_jwt_extended import create_access_token

# Test data
VALID_USER = {
    "username": "testuser123",
    "email": "test123@example.com",
    "password": "SecurePass123!"
}

# Fixture to create a registered user
@pytest.fixture
def registered_user(client):
    response = client.post('/api/register', json=VALID_USER)
    print('response is: ', response.json)
    assert response.status_code == 201
    return VALID_USER


# Test successful user registration"""
def test_register_success(client):
    response = client.post('/api/register', json=VALID_USER)
    assert response.status_code == 201
    assert 'access_token' in response.json
    assert 'refresh_token' in response.json
    
    # Verify user was created in database
    user = User.query.filter_by(email=VALID_USER['email']).first()
    assert user is not None
    assert user.username == VALID_USER['username']


# Test registration with invalid inputs
def test_register_invalid_inputs(client):
    # Test missing fields
    response = client.post('/api/register', json={})
    assert response.status_code == 400

    # Test invalid email
    invalid_email_user = VALID_USER.copy()
    invalid_email_user['email'] = 'invalid-email'
    response = client.post('/api/register', json=invalid_email_user)
    assert response.status_code == 400

    # Test SQL injection attempt in username
    sql_injection_user = VALID_USER.copy()
    sql_injection_user['username'] = "' OR '1'='1"
    response = client.post('/api/register', json=sql_injection_user)
    assert response.status_code == 201  # Should still work but be safely escaped


# Test registration with existing username/email
def test_register_duplicate_user(client, registered_user):
    response = client.post('/api/register', json=VALID_USER)
    assert response.status_code == 400
    assert 'exists' in response.json.get('message', '').lower()


# Test successful login
def test_login_success(client, registered_user):
    credentials = {
        "email": registered_user['email'],
        "password": registered_user['password']
    }
    response = client.post('/api/login', json=credentials)
    assert response.status_code == 200
    assert 'access_token' in response.json
    assert 'refresh_token' in response.json


# Test login with invalid credentials"""
def test_login_invalid_credentials(client, registered_user):
    # Test wrong password
    credentials = {
        "email": registered_user['email'],
        "password": "wrongpassword"
    }
    response = client.post('/api/login', json=credentials)
    assert response.status_code == 401

    # Test non-existent user
    credentials['email'] = "nonexistent@example.com"
    response = client.post('/api/login', json=credentials)
    assert response.status_code == 401


# Test logout functionality
def test_logout(client, registered_user):
    # First login to get token
    credentials = {
        "email": registered_user['email'],
        "password": registered_user['password']
    }
    login_response = client.post('/api/login', json=credentials)
    access_token = login_response.json['access_token']

    # Then logout
    response = client.post(
        '/api/logout',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    assert response.status_code == 200

    # Verify token was revoked
    decoded_token = decode_token(access_token)
    revoked_token = RevokedToken.query.filter_by(jti=decoded_token['jti']).first()
    assert revoked_token is not None


# Test refresh token functionality
def test_refresh_token(client, registered_user):
    # First login to get tokens
    credentials = {
        "email": registered_user['email'],
        "password": registered_user['password']
    }
    login_response = client.post('/api/login', json=credentials)
    refresh_token = login_response.json['refresh_token']

    # Use refresh token to get new access token
    response = client.post(
        '/api/refresh',
        headers={'Authorization': f'Bearer {refresh_token}'}
    )
    assert response.status_code == 200
    assert 'access_token' in response.json


# Test accessing protected endpoints without token
def test_unauthorized_access(client):
    # Remove the default authorization
    client.environ_base.pop('HTTP_AUTHORIZATION', None)

    response = client.post('/api/logout')
    assert response.status_code == 401

    response = client.post('/api/refresh')
    assert response.status_code == 401


# Test expired token handling
def test_token_expiration(client, registered_user):
    # First login to get a valid token
    credentials = {
        "email": registered_user['email'],
        "password": registered_user['password']
    }
    
    # Create a token with a very short expiration time (1 second)
    with patch('flask_jwt_extended.utils.create_access_token') as mock_create_token:
        # Login to get the user_id
        login_response = client.post('/api/login', json=credentials)
        user_id = decode_token(login_response.json['access_token'])['sub']
        
        # Create a token that's already expired
        expired_token = create_access_token(
            identity=user_id,
            expires_delta=timedelta(seconds=-1)
        )
        mock_create_token.return_value = expired_token

        # Try to access a protected endpoint with the expired token
        response = client.post(
            '/api/logout',
            headers={'Authorization': f'Bearer {expired_token}'}
        )
        assert response.status_code == 401
        assert 'token has expired' in response.json.get('msg', '').lower()

    # Test with a token that's about to expire
    with patch('flask_jwt_extended.utils.create_access_token') as mock_create_token:
        # Create a token with 1 second expiration
        short_lived_token = create_access_token(
            identity=user_id,
            expires_delta=timedelta(seconds=1)
        )
        mock_create_token.return_value = short_lived_token

        # First request should work
        response = client.post(
            '/api/logout',
            headers={'Authorization': f'Bearer {short_lived_token}'}
        )
        assert response.status_code == 200

        # Wait for token to expire
        import time
        time.sleep(2)

        # Second request should fail
        response = client.post(
            '/api/logout',
            headers={'Authorization': f'Bearer {short_lived_token}'}
        )
        assert response.status_code == 401
        assert 'token has expired' in response.json.get('msg', '').lower()


# Test refresh token expiration
def test_refresh_token_expiration(client, registered_user):
    credentials = {
        "email": registered_user['email'],
        "password": registered_user['password']
    }
    
    with patch('flask_jwt_extended.utils.create_refresh_token') as mock_create_refresh:
        # Login to get the user_id
        login_response = client.post('/api/login', json=credentials)
        user_id = decode_token(login_response.json['refresh_token'])['sub']
        
        # Create an expired refresh token
        expired_refresh_token = create_access_token(
            identity=user_id,
            expires_delta=timedelta(seconds=-1)
        )
        mock_create_refresh.return_value = expired_refresh_token

        # Try to refresh with expired token
        response = client.post(
            '/api/refresh',
            headers={'Authorization': f'Bearer {expired_refresh_token}'}
        )
        assert response.status_code == 401
        assert 'token has expired' in response.json.get('msg', '').lower()