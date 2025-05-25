const BaseModel = require("./BaseModel");

class Posts extends BaseModel {
  constructor() {
    super("posts");
  }

  async create(postData) {
    return this.collection.insertOne(postData);
  }

  async findByCustomId(post_id) {
    return this.collection.findOne({ post_id });
  }

  async update(post_id, updateData) {
    return this.collection.updateOne(
      { post_id },
      { $set: updateData }
    );
  }

  async delete(post_id) {
    return this.collection.deleteOne({ post_id });
  }

  async list(filter = {}) {
    return this.collection.find(filter).toArray();
  }

  async search(params) {
    const query = {};
    if (params.author_id) query.author_id = params.author_id;
    if (params.group_id) query.group_id = params.group_id;
    if (params.content)
      query.content = { $regex: params.content, $options: "i" };

    return this.collection.find(query).toArray();
  }
}

module.exports = Posts;
