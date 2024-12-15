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
      return responseBody;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  static async updateUserDetails(userID, { username, bio_description, tags, profile_picture }) {
    const userData = {
      username,
      bio_description,
      tags,
      profile_picture
    };

    const response = await fetch(`${DB_HOST}/user/${userID}`, {
      method: "PUT",
      headers: HEADERS_WITH_JWT(this.accessToken),
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Failed to update user details");
    }
  } 

  static async deleteUser(userID) {
    const response = await fetch(`${DB_HOST}/user/${userID}`, {
      method: "DELETE",
      headers: HEADERS_WITH_JWT(this.accessToken),
    });

    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Failed to delete user");
    }
  }
}

export default UserController;
