import { DB_HOST, HEADERS_WITH_JWT } from "./config.js";

class AuthController {
  static get accessToken() {
    return localStorage.getItem("access_token");
  }

  static async signUp(bodyData) {
    const response = await fetch(`${DB_HOST}/register`, {
      method: "POST",
      headers: HEADERS_WITH_JWT(this.accessToken),
      body: JSON.stringify(bodyData),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      const { data } = responseBody;
      return data;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  static async logIn(bodyData) {
    const response = await fetch(`${DB_HOST}/login`, {
      method: "POST",
      headers: HEADERS_WITH_JWT(this.accessToken),
      body: JSON.stringify(bodyData),
    });

    const responseBody = await response.json();
    if (response?.ok) {
      const { data } = responseBody;
      return data;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  static async logOut() {
    const response = await fetch(`${DB_HOST}/login`, {
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

export default AuthController;