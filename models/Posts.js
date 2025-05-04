const BaseModel = require("./BaseModel");

class Posts extends BaseModel {
  constructor() {
    super("posts");
  }
  async create(postData) {
    return this.collection.insertOne(postData);
  }
  async findByCustomId(post_id) {
    return this.collection.findOne({ post_id: post_id });
  }
}

module.exports = Posts;
