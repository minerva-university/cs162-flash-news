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

  static async getAll() {
    const response = await fetch(`${DB_HOST}/posts`, {
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
    const response = await fetch(`${DB_HOST}/posts/${postID}`, {
      method: "PUT",
      body: JSON.stringify(newPost),
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

  static async deletePost(postID) {
    const response = await fetch(`${DB_HOST}/posts/${postID}`, {
      method: "DELETE",
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
}

export default PostController;
