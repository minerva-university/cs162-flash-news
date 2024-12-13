# Getting Started

This backend powers the Flash News application, providing RESTful APIs for user authentication, post management, collections, comments, and other core functionalities. It is built using Flask and integrates a lightweight SQLite database for data persistence.

@TODO: Change if changing db for deployment.


## Local Setup 

1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Create a virtual environment:
    ```bash
    python3 -m venv venv
    ```
3. Activate the virtual environment:
    - On Windows:
        ```bash
        venv\Scripts\activate
        ```
    - On macOS/Linux:
        ```bash
        source venv/bin/activate
        ```
4. Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5. Set the `FLASK_APP` environment variable:
    - On Windows:
        ```bash
        set FLASK_APP=app
        ```
    - On macOS/Linux:
        ```bash
        export FLASK_APP=app
        ```
6. Start the backend server:
    ```bash
    flask run
    ```

## Testing

To run the backend test suite, navigate to the backend directory (```cd backend```) and use:

```bash
pytest
```

## API Endpoints 

### Authentication

-   <span style="color:beige;">**POST /login**</span> \
    Logs in a user and returns a token. 
    ```json
    Payload: { "email": "example@example.com", "password": "yourpassword" }
    ``` 

    ```json
    Response: {
        "message": "User registered successfully",
        "access_token": "access_token_string",
        "refresh_token": "refresh_token_string",
        "username": "example_user",
        "profile_picture": null, "path_to_picture'
    }
    ```


-   <span style="color:beige;">**POST /register**</span> \
    Registers a new user. 
    ```json
    Payload: { "email": "example@example.com", "password": "yourpassword", "username": "example" } 
    ```
    
    ```json
    Response: {
        "message": "User registered successfully",
        "access_token": "access_token_string",
        "refresh_token": "refresh_token_string",
        "username": "example_user",
        "profile_picture": null
    }
    ```

-   <span style="color:beige;">**POST /logout**</span> \
    Clears the current token/storage of user. 
    ```json
    Payload: { "email": "example@example.com", "password": "yourpassword", "username": "example" }
    ```

    ```json 
    Response: {
        "message": "Successfully logged out"
    }
    ```

-   <span style="color:beige;">**POST /refresh**</span> \
    Refreshes user's authentication token. 
    ```json
    Payload: { "email": "example@example.com", "password": "yourpassword", "username": "example" }
    ```

    ```json
    Response: {
        "access_token": "new_access_token_string"
    }
    ```

### Posts
-   <span style="color:#89CFF0;">**POST /posts**</span> \
    Creates a new post.
    ```json
    Payload: {
        "article_link": "https://example.com/article",
        "source": "Example News",
        "title": "Breaking News: Example Event",
        "description": "A brief description of the article.",
        "preview": "https://example.com/image.jpg",
        "caption": "This is my take on this article.",
        "categories": ["Politics", "Technology"]
    }
    ```
    ```json
    Response (201): {
        "message": "Post created successfully",
        "post_id": 1
    }

    Response (400): {
        "error": "Maximum of 5 categories allowed"
    }
    ```

-   <span style="color:#89CFF0;">**GET /posts/`<post_id>`**</span> \
    Gets a specific post by its ID.
    ```json
    Response (200): {
        "post_id": 1,
        "user": {
            "user_id": 1,
            "username": "exampleuser",
            "bio_description": "Tech enthusiast and blogger.",
            "profile_picture": "https://example.com/profile.jpg"
        },
        "description": "This is my take on this article.",
        "posted_at": "2024-12-12T10:00:00Z",
        "article": {
            "article_id": 1,
            "link": "https://example.com/article",
            "source": "Example News",
            "title": "Breaking News: Example Event",
            "caption": "A brief description of the article.",
            "preview": "https://example.com/image.jpg"
        },
        "categories": ["Politics", "Technology"],
        "comments_count": 10,
        "likes_count": 5,
        "is_liked": true
    }
    ```

-   <span style="color:#89CFF0;">**DELETE /posts/`<post_id>`**</span> \
    Deletes a post by its ID.

    ```json
    Response (200): {
        "message": "Post deleted successfully"
    }

    Response (403): {
        "message": "You are not allowed to delete this post"
    }

    Response (404): {
        "message": "Post not found"
    }
    ```

-   <span style="color:#89CFF0;">**PUT /posts/`<post_id>`**</span> \
    Updates the post information based on its ID. 

    ```json
    Payload: {
        "article_link": "https://example.com/article",
        "source": "Example News",
        "title": "Breaking News: Example Event",
        "description": "A brief description of the article.",
        "categories": ["Politics", "Technology"]
    }
    ```

    ```json
    Response (200): {
        "message": "Post updated successfully"
    }

    Response (403): {
        "message": "You are not allowed to update this post"
    }

    Response (404): {
        "message": "Post not found"
    }

    Response (400): {
        "error": "Maximum of 5 categories allowed"
    }
    ```

-   <span style="color:#89CFF0;">**GET /posts/feed**</span> \
    Gets all posts of the user and posts of following users. 

    ```json
    Payload: {
        "total_posts": 15,
        "page": 1,
        "per_page": 10,
        "posts": [
            {
            "post_id": 1,
            "user": {
                "user_id": 1,
                "username": "exampleuser",
                "bio_description": "Tech enthusiast and blogger.",
                "profile_picture": "https://example.com/profile.jpg"
            },
            "description": "This is my take on this article.",
            "posted_at": "2024-12-12T10:00:00Z",
            "article": {
                "article_id": 1,
                "link": "https://example.com/article",
                "source": "Example News",
                "title": "Breaking News: Example Event",
                "caption": "A brief description of the article.",
                "preview": "https://example.com/image.jpg"
            },
            "categories": ["Politics", "Technology"],
            "comments_count": 10,
            "likes_count": 5,
            "is_liked": true
            }
        ]
    }
    ```

    ```json
    Response (200): {
        "total_posts": 15,
        "page": 1,
        "per_page": 10,
        "posts": posts_data,
    }
    ```

-   <span style="color:#89CFF0;">**GET /posts/user/`<user_id>`**</span> \
    Gets all posts posted by the user by user's ID. 

    ```json
    Response: {
        "total_posts": 10,
        "page": 1,
        "per_page": 10,
        "posts": [
            {
            "post_id": 1,
            "description": "This is my take on this article.",
            "posted_at": "2024-12-12T10:00:00Z",
            "user": {
                "user_id": 1,
                "username": "exampleuser",
                "bio_description": "Tech enthusiast and blogger.",
                "profile_picture": "https://example.com/profile.jpg"
            },
            "article": {
                "article_id": 1,
                "link": "https://example.com/article",
                "source": "Example News",
                "title": "Breaking News: Example Event",
                "caption": "A brief description of the article.",
                "preview": "https://example.com/image.jpg"
            },
            "categories": ["Politics", "Technology"],
            "comments_count": 10,
            "likes_count": 5,
            "is_liked": true
            }
        ]
    }
    ```

-   <span style="color:#89CFF0;">**GET /posts/categories**</span> \
    Gets possible categories for a post.

    ```json
    Response: {
        "categories": [
            { "category_id": "Politics" },
            { "category_id": "Technology" },
            { "category_id": "Health" },
            { "category_id": "Science" }, 
            { "category_id": "Entertainment" }, 
            { "category_id": "Sports" }, 
            { "category_id": "Business" }, 
            { "category_id": "Environment" }
        ]
    }   
    ```


### Collections
-   <span style="color:#D8BFD8;">**POST /collections/**</span> \
    Creates a new collection.
    ```json
    Payload: {
        "title": "Tech Trends",
        "emoji": "📱",
        "description": "Latest advancements in technology",
        "is_public": true,
        "user_id": 1
    }
    ```

    ```json
    Response (201): {
        "message": "Collection created successfully",
        "collection_id": 1
    }

    Response (401): {
        "message": "Authentication required",
    }

    Response (400): {
        "message": "Collection title is required",
    }

    Response (400): {
        "message": "Title must be a string",
    }

    Response (400): {
        "message": "is_public must be a boolean",
    }

    Response (400): {
        "message": "Emoji must be a string",
    }

    Response (400): {
        "message": "A collection with this title already exists for the user",
    }
    ```

-   <span style="color:#D8BFD8;">**GET /collections/user/`<user_id>`**</span> \
    Get all user's collections based on the user ID to fetch private or not.

    ```json
    Response (200): {
        "public": [
            {
            "collection_id": 1,
            "title": "Tech Trends",
            "description": "Latest advancements in technology",
            "emoji": "📱",
            "is_public": true,
            "created_at": "2024-12-12T10:00:00Z",
            "articles_count": 5,
            "user_id": 1
            }
        ]
    }

    Response (200): {
        "public": [
            {
            "collection_id": 1,
            "title": "Tech Trends",
            "description": "Latest advancements in technology",
            "emoji": "📱",
            "is_public": true,
            "created_at": "2024-12-12T10:00:00Z",
            "articles_count": 5,
            "user_id": 1
            }
        ],
        "private": [
            {
            "collection_id": 2,
            "title": "My Private Collection",
            "description": "Personal notes",
            "emoji": "🔒",
            "is_public": false,
            "created_at": "2024-12-11T08:00:00Z",
            "articles_count": 3,
            "user_id": 1
            }
        ]
    }


    Response (404): {
        "message": "User not found"
    }
    ```


-   <span style="color:#D8BFD8;">**GET /collections/`<collection_id>`/posts**</span> \
    Gets all posts in a collection based on its ID.

    ```json 
    Response (200): {
        [
            "post_id": 1,
            "user": {
                "user_id": 1,
                "username": "exampleuser",
                "bio_description": "Tech enthusiast",
                "profile_picture": "https://example.com/profile.jpg"
            },
            "description": "This is an insightful article on technology.",
            "posted_at": "2024-12-12T10:00:00Z",
            "article": {
            "article_id": 1,
                "link": "https://example.com/article",
                "source": "Tech Blog",
                "title": "The Future of AI",
                "caption": "An in-depth look at AI advancements",
                "preview": "https://example.com/image.jpg"
            },
            "categories": ["Technology", "AI"],
            "comments_count": 3,
            "likes_count": 10,
            "is_liked": true
        ]
    }

    Response(200): {
        "posts_data": []
    }

    ```


-   <span style="color:#D8BFD8;">**POST /collections/`<collection_id>`/posts/`<post_id>`**</span> \
    Adds a post to a specific collection based on the post's ID and the collection's ID.

    ```json
    Response (200): {
        "message": "Post already in collection"
    }

    Response (200): {
        "message": "Post added to collection"
    }
    ```

-   <span style="color:#D8BFD8;">**PUT /collections/`<collection_id>`**</span> \
    Updates a collection by ID.

    ```json
    Payload: {
        "title": "Updated Collection Title",
        "description": "Updated description for the collection",
        "emoji": "📚",
        "is_public": false
    }
    ```

    ```json
    Response: {
        "message": "Collection updated successfully"
    }
    ```

-   <span style="color:#D8BFD8;">**DELETE /collections/`<collection_id>`**</span> \
    Deletes a collection by ID.

    ```json
    Response (200): {
        "message": "Collection deleted successfully"
    }

    Response (404): {
    "error": "Collection not found"
    }
    ```

-   <span style="color:#D8BFD8;">**DELETE /collections/`<collection_id>`/posts/`<post_id>`**</span> \
    Removed a post from a specific collection based on the post's ID and the collection's ID.

    ```json
    Response (200): {
        "message": "Post removed from collection"
    }

    Response (404): {
        "error": "Collection not found"
    }
    ```

### Comments
-   <span style="color:#C4DFAA;">**GET /comments/`<post_id>`**</span> \
    Fetches comments for a specific post by its ID.

    ```json
    Response (404): {
        "message": "Post not found"
    }

    Response (403): {
        "message": "You are not allowed to view comments on this post"
    }

    Response (200): {
        "total_comments": 3,
        "page": 1,
        "per_page": 10,
        "comments": [
            {
            "comment_id": 1,
            "user": {
                "user_id": 2,
                "username": "john_doe",
                "profile_picture": "https://example.com/profile.jpg"
            },
            "comment": "This is a comment.",
            "commented_at": "2024-12-12T10:45:00Z"
            }
        ]
    }
    ```

-   <span style="color:#C4DFAA;">**POST /comments/`<post_id>`**</span> \
    Adds a comment to a post by its ID.
    
    ```json
    Payload: { "content": "This is a comment" }
    ```

    ```json
    Response (404): {
        "message": "Post not found"
    }

    Response (403): {
        "message": "You are not allowed to comment on this post"
    }

    Response (400): {
        "message": "Comment is required"
    }

    Response (201): {
        "message": "Comment created successfully",
        "comment_id": 1
    }
    ```

-   <span style="color:#C4DFAA;">**PUT /comments/`<comment_id>`**</span> \
    Updates a comment information by its ID.

    ```json
    Payload: { "content": "Updated comment text" }
    ```

    ```json
    Response (404): {
        "message": "Comment not found"
    }

    Response (403): {
        "message": "You are not allowed to update this comment"
    }

    Response (400): {
        "message": "Comment is required"
    }

    Response (201): {
        "message": "Comment updated successfully"
    }
    ```

-   <span style="color:#C4DFAA;">**DELETE /comments/`<comment_id>`**</span> \
    Deletes a comment by its ID.

    ```json
    Response (404): {
        "message": "Comment not found"
    }

    Response (403): {
        "message": "You are not allowed to delete this comment"
    }

    Response (400): {
        "message": "Comment is required"
    }

    Response (201): {
        "message": "Comment deleted successfully"
    }
    ```

### Likes
-   <span style="color:#D2A679;">**GET /likes/`<post_id>`**</span> \
    Gets the number of likes and data for each specific post by its ID.

    ```json
    Response (200): {
        "total_likes": 15,
        "page": 1,
        "per_page": 10,
        "likes": [
            {
                "user_id": 1,
                "username": "john_doe",
                "profile_picture": "https://example.com/images/john.jpg"
            },
            {
                "user_id": 2,
                "username": "jane_smith",
                "profile_picture": "https://example.com/images/jane.jpg"
            }
        ]
    }

    Response (404): {
        "message": "Post not found"
    }

    Response (403): {
        "message": "You are not allowed to view likes on this post"
    }
    ```

-   <span style="color:#D2A679;">**POST /likes/`<post_id>`**</span> \
    Adds a like to a specific post by its ID.

    ```json
    Response (201): {
        "message": "Post liked successfully"
    }

    Response (404): {
        "message": "Post not found"
    }

    Response (400): {
        "message": "You have already liked this post"
    }

    Response (403): {
        "message": "You are not allowed to like this post"
    }
    ```

-   <span style="color:#D2A679;">**DELETE /likes/`<post_id>`**</span> \
    Removes a previous like from a specific post by its ID.

    ```json
    Response (200): {
        "message": "Like removed successfully"
    }

    Response (404): {
        "message": "Like not found"
    }

    Response (403): {
        "message": "You are not allowed to remove like on this post"
    }
    ```

### User
-   <span style="color:#FFF4C3;">**GET /user/`<username>`**</span> \
    Gets the data of the user based on the username and compares with current user data to defined the page owner.

    ```json
    Response (200): {
        "status": "success",
        "message": "User profile fetched successfully",
        "data": {
            "user_id": 1,
            "username": "john_doe",
            "email": "john@example.com",
            "bio_description": "Loves tech and cats.",
            "profile_picture": "http://127.0.0.1:5000/api/user/uploads/profile.jpg",
            "tags": ["developer", "tech"],
            "created_at": "2023-12-10T14:25:43.511Z",
            "is_owner": true
        }
    }

    Response (404): {
        "message": "User not found"
    }

    Response (500): {
        "status": "error",
        "message": "Database error occured"
    }

    Response (500): {
        "status": "error",
        "message": "An unexpected error occured"
    }
    ```

-   <span style="color:#FFF4C3;">**PUT /user/**</span> \
    Updates current user's profile.

    ```json
    Payload: {
        "username": "john_doe_updated",
        "bio_description": "Updated bio",
        "tags": "[\"tech\", \"science\"]",
        "profile_picture": <file>
    }
    ```

    ```json
    Response (200): {
        "status": "success",
        "message": "Profile updated successfully",
        "data": {
            "user_id": 1,
            "username": "john_doe_updated",
            "email": "john@example.com",
            "bio_description": "Updated bio",
            "profile_picture": "http://127.0.0.1:5000/api/user/uploads/updated_profile.jpg",
            "created_at": "2023-12-10T14:25:43.511Z"
        }
    }

    Response (400): {
        "status": "error",
        "message": "Username already exists"
    }

    Response (400): {
        "status": "error",
        "message": "Username is required"
    }

    Response (500): {
        "status": "error",
        "message": "Database error occured"
    }

    Response (500): {
        "status": "error",
        "message": "An unexpected error occured"
    }

    Response (404): {
        "status": "error",
        "message": "User not found"
    }
    ```

-   <span style="color:#FFF4C3;">**DELETE /user/**</span> \
    Deletes current user's account.

    ```json
    Response (200): {
        "status": "success",
        "message": "User account deleted successfully"
    }

    Response (404): {
        "message": "User not found"
    }

    Response (500): {
        "status": "error",
        "message": "Database error occured"
    }

    Response (500): {
        "status": "error",
        "message": "An unexpected error occured"
    }
    ```

-   <span style="color:#FFF4C3;">**POST /user/follow/`<user_id>`**</span> \
    Follow an user by its ID.

    ```json
    Response (200): {
        "status": "success",
        "message": "Successfully followed the user"
    }

    Response (404): {
        "status": "error",
        "message": "User not found"
    }

    Response (400): {
        "status": "error",
        "message": "You cannot follow yourself"
    }

    Response (400): {
        "status": "error",
        "message": "You are already following this user"
    }

    Response (500): {
        "status": "error",
        "message": "Database error occured"
    }

    Response (500): {
        "status": "error",
        "message": "An unexpected error occured"
    }
    ```

-   <span style="color:#FFF4C3;">**POST /user/unfollow/`<user_id>`**</span> \
    Unfollow an user by its ID.

    ```json
    Response (200): {
        "status": "success",
        "message": "Successfully unfollowed the user"
    }

    Response (404): {
        "status": "error",
        "message": "User not found"
    }

    Response (400): {
        "status": "error",
        "message": "You cannot unfollow yourself"
    }

    Response (400): {
        "status": "error",
        "message": "You are not following this user"
    }

    Response (500): {
        "status": "error",
        "message": "Database error occured"
    }

    Response (500): {
        "status": "error",
        "message": "An unexpected error occured"
    }
    ```

-   <span style="color:#FFF4C3;">**GET /user/following**</span> \
    Gets a list of all the users the current user is following. 

    ```json
    Response: {
        "followed_users": [
            {
                "id": 2,
                "username": "jane_doe"
            },
            {
                "id": 3,
                "username": "adam_smith"
            }
        ]
    }
    ```

-   <span style="color:#FFF4C3;">**GET /user/followers**</span> \
    Gets a list of all the users following the current user. 

    ```json
    Response: {
        "followers": [
            {
                "id": 2,
                "username": "jane_doe"
            },
            {
                "id": 3,
                "username": "adam_smith"
            }
        ]
    }
    ```

## Deployment - Running in Production

To deploy the backend to a production environment, follow these steps:

#### @TODO: ADD STEPS FOR DEPLOYMENT (good to have on readme)

## Additional Notes

For frontend setup and details, refer to the [Frontend README](frontend/README.md) and for general setup and information, go to the [General README](README.md).