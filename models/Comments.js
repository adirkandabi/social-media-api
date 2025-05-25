const BaseModel = require("./BaseModel");

class Comments extends BaseModel {
    constructor() {
        super("comments");
    }

    async create(comment) {
        return this.collection.insertOne(comment);
    }

    async listByPost(post_id) {
        return this.collection.find({ post_id }).toArray();
    }

    async update(comment_id, updateData) {
        return this.collection.updateOne({ comment_id }, { $set: updateData });
    }

    async delete(comment_id) {
        return this.collection.deleteOne({ comment_id });
    }
}

module.exports = Comments;
