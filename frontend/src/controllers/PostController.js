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
      const { data } = responseBody;
      return data;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  static async getUserPosts(userID) {
    try {
      const response = await fetch(`${DB_HOST}/posts/user/${userID}`, {
        method: "GET",
        headers: HEADERS_WITH_JWT(this.accessToken),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw error;
    }
  }

  static async getPost(postID) {
    const response = await fetch(`${DB_HOST}/posts/${postID}`, {
      method: "GET",
      headers: HEADERS_WITH_JWT(this.accessToken),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      const { data } = responseBody;
      return data;
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
      const { data } = responseBody;
      return data;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  static async updatePost(postID, newPost) {
    try {
      const response = await fetch(`${DB_HOST}/posts/${postID}`, {
        method: "PUT",
        body: JSON.stringify(newPost),
        headers: HEADERS_WITH_JWT(this.accessToken),
      });

      if (!response.ok) {
        const responseBody = await response.json();
        console.error("Error response:", responseBody);
        throw new Error(`${responseBody.message}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  }

  static async deletePost(postID) {
    try {
      const response = await fetch(`${DB_HOST}/posts/${postID}`, {
        method: "DELETE",
        headers: HEADERS_WITH_JWT(this.accessToken),
      });

      if (!response.ok) {
        const responseBody = await response.json();
        console.error("Error response:", responseBody);
        throw new Error(`${responseBody.message}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  }

  static async likeOrUnlikePost(postID, is_liked) {
    const response = await fetch(`${DB_HOST}/likes/${postID}`, {
      method: is_liked ? "POST" : "DELETE",
      headers: HEADERS_WITH_JWT(this.accessToken),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      const { data } = responseBody;
      return data;
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
      const { data } = responseBody;
      return data;
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
