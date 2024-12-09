class TagsController {
  static async getAll() {
    // @TODO: Obtain this list from the database
    return [
      "Politics",
      "Tech",
      "Health",
      "Sports",
      "Entertainment",
      "Science",
      "Business",
      "Environment",
    ];
  }
}

export default TagsController;
