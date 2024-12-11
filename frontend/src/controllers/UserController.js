import { DB_HOST, HEADERS_WITH_JWT } from "./config.ts";

class UserController {
  static get accessToken() {
    return localStorage.getItem("access_token");
  }
  
  static async getCurrentUserDetails() {
    const response = await fetch(`${DB_HOST}/user`, {
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

export default UserController;
