import { DB_HOST, HEADERS_WITH_JWT } from "./config.ts";

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
      return responseBody;
    } else {
      throw new Error(`${responseBody.message}`);
    }
  }
  
  static async addPostToCollection(collectionID, postID) {
    const response = await fetch(`${DB_HOST}/collections/${collectionID}/posts/${postID}`, {
      method: "POST",
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

export default CollectionController;
