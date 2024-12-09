// import { DB_HOST, HEADERS_WITH_JWT } from "./config.ts";

const DB_HOST = "http://127.0.0.1:5000/api";

class CommentController {
  static async getAllCommentsForPost(post_id) {
    const response = await fetch(`${DB_HOST}/comments/${post_id}`, {
      method: "GET",
      headers: { "content-type": "application/json" },
      // headers: HEADERS_WITH_JWT(user),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      return responseBody;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  static async createComment(post_id, comment) {
    const response = await fetch(`${DB_HOST}/comments/${post_id}`, {
      method: "POST",
      body: JSON.stringify({ comment }),
      headers: { "content-type": "application/json" },
      // headers: HEADERS_WITH_JWT(user),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      return responseBody;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  static async deleteComment(comment_id) {
    const response = await fetch(`${DB_HOST}/comments/${comment_id}`, {
      method: "DELETE",
      // headers: HEADERS_WITH_JWT(user),
      headers: { "content-type": "application/json" },
    });

    const responseBody = await response.json();
    if (response?.ok) {
      return responseBody;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }
}

export default CommentController;
