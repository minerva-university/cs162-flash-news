import { DB_HOST, HEADERS_WITH_JWT } from "./config.js";

class UserController {
  static get accessToken() {
    return localStorage.getItem("access_token");
  }

  static async getCurrentUserDetails(username) {
    const response = await fetch(`${DB_HOST}/user/${username}`, {
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
}

export default UserController;
