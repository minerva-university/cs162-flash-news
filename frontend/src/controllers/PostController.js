// import { DB_HOST, HEADERS_WITH_JWT } from "./config.ts";

const DB_HOST = "http://127.0.0.1:5000/api";

class PostController {
  static async getAll() {
    return [
      {
        username: "johndoe",
        profile_picture: "xxx",
        post_id: 1,
        description: "My thoughts on the new iPhone: CMI",
        posted_at: "2024-10-10 10:00:00",

        // https://www.opengraph.xyz/url/https%3A%2F%2Fwww.apple.com%2Fshop%2Fbuy-iphone%2Fiphone-14
        article_id: 1,
        link: "https://www.apple.com/shop/buy-iphone/iphone-14",
        source: "Apple.com",
        title: "Buy iPhone 14 and iPhone 14 Plus",
        caption:
          "Get iPhone 14 and iPhone 14 Plus for an amazing price with special carrier trade-in offers. Make low monthly payments at 0% APR. Buy now with fast, free shipping.",

        // Note: We currently have this as a BLOB in the database, so adjustments need to be made later
        preview:
          "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-model-unselect-gallery-1-202209?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1660689596976",
        liked: true,
        categories: ["Tech"],
      },
      {
        username: "arcanefan",
        profile_picture: "xxx",
        post_id: 2,
        description:
          "I'm so excited for the new season of Arcane! Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        posted_at: "2024-11-10 10:00:00",

        article_id: 2,
        link: "https://www.netflix.com/watch/81516575",
        source: "Netflix.com",
        title: "Watch Arcane | Netflix Official Site",
        caption:
          "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and clashing convictions.",
        preview:
          "https://occ-0-2433-2705.1.nflxso.net/dnm/api/v6/E8vDc_W8CLv7-yMQu8KMEC7Rrr8/AAAABQNoTH4w43r03nin8IJF7V9pPC08OHH9zEcZrRiHOwwsHstlO_jGK8SUJG5bUGprzedBosTk1SaykOkDWidUc3vqSSrqZ3GG_YMD.jpg?r=388",
        liked: false,
        categories: ["Entertainment"],
      },
    ];

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
