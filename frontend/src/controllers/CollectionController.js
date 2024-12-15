import { DB_HOST, HEADERS_WITH_JWT } from "./config.js";

class CollectionController {
  static get accessToken() {
    return localStorage.getItem("access_token");
  }

  static async getAllCollectionsForUser(id) {
    const response = await fetch(`${DB_HOST}/collections/user/${id}`, {
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

  static async getCollectionPosts(collectionID) {
    const response = await fetch(
      `${DB_HOST}/collections/${collectionID}/posts`,
      {
        method: "GET",
        headers: HEADERS_WITH_JWT(this.accessToken),
      },
    );

    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Failed to get collection posts");
    }
  }

  static async createCollection({
    user_id,
    title,
    description,
    emoji,
    is_public,
  }) {
    const collectionData = {
      user_id,
      title,
      description: description || "",
      emoji,
      is_public,
    };

    const response = await fetch(`${DB_HOST}/collections/`, {
      method: "POST",
      headers: HEADERS_WITH_JWT(this.accessToken),
      body: JSON.stringify(collectionData),
    });

    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Failed to create collection");
    }
  }

  static async deleteCollection(collectionID) {
    const response = await fetch(`${DB_HOST}/collections/${collectionID}`, {
      method: "DELETE",
      headers: HEADERS_WITH_JWT(this.accessToken),
    });

    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Failed to delete collection");
    }
  }

  static async updateCollection(
    collectionID,
    { title, description, emoji, is_public },
  ) {
    const collectionData = {
      title,
      description: description || "",
      emoji,
      is_public,
    };

    const response = await fetch(`${DB_HOST}/collections/${collectionID}`, {
      method: "PUT",
      headers: HEADERS_WITH_JWT(this.accessToken),
      body: JSON.stringify(collectionData),
    });

    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Failed to update collection");
    }
  }

  static async addPostToCollection(collectionID, postID) {
    const response = await fetch(
      `${DB_HOST}/collections/${collectionID}/posts/${postID}`,
      {
        method: "POST",
        headers: HEADERS_WITH_JWT(this.accessToken),
      },
    );

    const responseBody = await response.json();
    if (response?.ok) {
      const { data } = responseBody;
      return data;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }

  static async removePostFromCollection(collectionID, postID) {
    const response = await fetch(
      `${DB_HOST}/collections/${collectionID}/posts/${postID}`,
      {
        method: "DELETE",
        headers: HEADERS_WITH_JWT(this.accessToken),
      },
    );

    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Failed to remove post from collection");
    }
  }
}

export default CollectionController;
