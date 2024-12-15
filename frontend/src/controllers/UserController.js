import { DB_HOST, HEADERS_WITH_JWT } from "./config.js";

class UserController {
  static get accessToken() {
    return localStorage.getItem("access_token");
  }

  static async getCurrentUserDetails(username) {
    try {
      const response = await fetch(`${DB_HOST}/user/${username}`, {
        method: "GET",
        headers: HEADERS_WITH_JWT(this.accessToken),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("UserController error:", error);
      throw error;
    }
  }

  static async updateUserDetails(formData) {
    try {
      const response = await fetch(`${DB_HOST}/user`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating user details:", error);
      throw error;
    }
  }

  static async deleteUser(userID) {
    const response = await fetch(`${DB_HOST}/user/${userID}`, {
      method: "DELETE",
      headers: HEADERS_WITH_JWT(this.accessToken),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error("Failed to delete user");
    }
  }
}

export default UserController;
