const BaseModel = require("./BaseModel");

class Likes extends BaseModel {
    constructor() {
        super("likes");
    }

    async like(post_id, user_id) {
        // prevent duplicate like
        return this.collection.updateOne(
            { post_id, user_id },
            { $setOnInsert: { post_id, user_id, liked_at: new Date() } },
            { upsert: true }
        );
    }

    async count(post_id) {
        return this.collection.countDocuments({ post_id });
    }
}

module.exports = Likes;
