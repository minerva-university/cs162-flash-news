// import { DB_HOST, HEADERS_WITH_JWT } from "./config.ts";

const DB_HOST = "http://127.0.0.1:5000/api";

class PostController {
  static async getAll() {

    const response = await fetch(`${DB_HOST}/posts/feed`, {
      method: "GET",
      headers: { "content-type": "application/json" }
      // headers: HEADERS_WITH_JWT(user),
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

  static async likePost(post_id) {
    console.log("@TODO IMPLEMENT");
    // const response = await fetch(`${DB_HOST}/lists`, {
    //   method: "GET",
    //   headers: HEADERS_WITH_JWT(user),
    // });

    // const responseBody = await response.json();
    // if (response?.ok) {
    //   return responseBody;
    // } else {
    //   throw new Error(`${responseBody.message}`);
    // }
  }

  static async getOGMetadata(url) {
    // @TODO: Standardize the DB_HOST value e.g. in config file
    // Also, for some reason localhost:5000 is not working
    const response = await fetch(`${DB_HOST}/og`, {
      method: "POST",
      body: JSON.stringify({ url }),
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
}

export default PostController;
