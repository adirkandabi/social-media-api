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
    return this.collection.updateOne({ post_id }, { $set: updateData });
  }

  async delete(post_id) {
    return this.collection.deleteOne({ post_id });
  }

  async list(filter = {}) {
    return this.collection
      .aggregate([
        { $match: filter },

        // Join with users to get first_name
        {
          $lookup: {
            from: "users",
            localField: "author_id",
            foreignField: "user_id",
            as: "author_user",
          },
        },
        {
          $unwind: {
            path: "$author_user",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Join with user_profile to get profile_image
        {
          $lookup: {
            from: "users_profile",
            localField: "author_id",
            foreignField: "user_id",
            as: "author_profile",
          },
        },
        {
          $unwind: {
            path: "$author_profile",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Join with groups to get group name (if group_id exists)
        {
          $lookup: {
            from: "groups",
            localField: "group_id",
            foreignField: "group_id",
            as: "group_data",
          },
        },
        {
          $unwind: {
            path: "$group_data",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Combine author and group fields
        {
          $addFields: {
            author: {
              first_name: "$author_user.first_name",
              profile_image: "$author_profile.profile_image",
            },
            group_name: "$group_data.name",
          },
        },

        // Clean up raw arrays
        {
          $project: {
            author_user: 0,
            author_profile: 0,
            group_data: 0,
          },
        },
      ])
      .toArray();
  }

  async search(params) {
    const query = {};
    if (params.author_id) query.author_id = params.author_id;
    if (params.group_id) query.group_id = params.group_id;
    if (params.content)
      query.content = { $regex: params.content, $options: "i" };

    return this.collection.find(query).toArray();
  }

  async getPostsByUserId(author_id) {
    return this.collection.find({ author_id }).toArray();
  }
}

module.exports = Posts;
