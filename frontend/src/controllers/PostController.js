import { DB_HOST, HEADERS_WITH_JWT } from "./config.js";

class PostController {
  static get accessToken() {
    return localStorage.getItem("access_token");
  }

  static async getFeedPosts() {
    const response = await fetch(`${DB_HOST}/posts/feed`, {
      method: "GET",
      headers: HEADERS_WITH_JWT(this.accessToken),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      return responseBody;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  // TODO: Remove this
  // I am pretty sure this is not used anywhere
  // Would this refer to feed or user posts? Either case there are functions already
  static async getAll() {
    const response = await fetch(`${DB_HOST}/posts`, {
      method: "GET",
      headers: HEADERS_WITH_JWT(this.accessToken),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      return responseBody;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  static async getUserPosts(userID) {
    const response = await fetch(`${DB_HOST}/posts/user/${userID}`, {
      method: "GET",
      headers: HEADERS_WITH_JWT(this.accessToken),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      return responseBody;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  static async getPost(postID) {
    const response = await fetch(`${DB_HOST}/posts/${postID}`, {
      method: "GET",
      headers: HEADERS_WITH_JWT(this.accessToken),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      return responseBody;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  static async createPost(post) {
    const response = await fetch(`${DB_HOST}/posts`, {
      method: "POST",
      body: JSON.stringify(post),
      headers: HEADERS_WITH_JWT(this.accessToken),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      return responseBody;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  static async updatePost(postID, newPost) {
    const response = await fetch(`${DB_HOST}/posts/${postID}`, {
      method: "PUT",
      body: JSON.stringify(newPost),
      headers: HEADERS_WITH_JWT(this.accessToken),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      return responseBody;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  static async deletePost(postID) {
    const response = await fetch(`${DB_HOST}/posts/${postID}`, {
      method: "DELETE",
      headers: HEADERS_WITH_JWT(this.accessToken),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      return responseBody;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  static async likeOrUnlikePost(postID, is_liked) {
    const response = await fetch(`${DB_HOST}/likes/${postID}`, {
      method: is_liked ? "POST" : "DELETE",
      headers: HEADERS_WITH_JWT(this.accessToken),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      return responseBody;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  static async getOGMetadata(url) {
    const response = await fetch(`${DB_HOST}/og`, {
      method: "POST",
      body: JSON.stringify({ url }),
      headers: HEADERS_WITH_JWT(this.accessToken),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      return responseBody;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  // Follow a user
  static async followUser(userID) {
    const response = await fetch(`${DB_HOST}/follow/${userID}`, {
      method: "POST",
      headers: HEADERS_WITH_JWT(this.accessToken),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      return responseBody;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  // Unfollow a user
  static async unfollowUser(userID) {
    const response = await fetch(`${DB_HOST}/follow/${userID}`, {
      method: "DELETE",
      headers: HEADERS_WITH_JWT(this.accessToken),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      return responseBody;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  // Get all categories
  static async getCategories() {
    try {
      const response = await fetch(`${DB_HOST}/posts/categories`, {
        method: "GET",
        headers: HEADERS_WITH_JWT(this.accessToken),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }
}

export default PostController;
