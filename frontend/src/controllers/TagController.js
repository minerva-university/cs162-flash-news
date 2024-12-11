import { DB_HOST, HEADERS_WITH_JWT } from "./config.ts";

class TagController {
  static get accessToken() {
    return localStorage.getItem("access_token");
  }

  static async getAll() {
    const response = await fetch(`${DB_HOST}/posts/categories`, {
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
}

export default TagController;
