import { DB_HOST, HEADERS_WITH_JWT } from "./config.js";

class CommentController {
  static get accessToken() {
    return localStorage.getItem("access_token");
  }

  static async getAllCommentsForPost(post_id) {
    const response = await fetch(`${DB_HOST}/comments/${post_id}`, {
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

  static async createComment(post_id, comment) {
    const response = await fetch(`${DB_HOST}/comments/${post_id}`, {
      method: "POST",
      body: JSON.stringify({ comment }),
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

  static async deleteComment(comment_id) {
    const response = await fetch(`${DB_HOST}/comments/${comment_id}`, {
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
}

export default CommentController;
