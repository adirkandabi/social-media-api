const BaseModel = require("./BaseModel");

class User extends BaseModel {
  constructor() {
    super("users");
  }
  async create(userData) {
    return this.collection.insertOne({
      ...userData,
      is_verified: false,
      friends: [],
    });
  }
  async findByCustomId(user_id) {
    return this.collection.findOne({ user_id: user_id });
  }
  async findByUsername(identifier, type) {
    return this.collection.findOne({ [type]: identifier });
  }
  async findBySearch(regex) {
    return this.collection
      .aggregate([
        {
          $match: {
            $or: [
              { username: { $regex: regex } },
              { first_name: { $regex: regex } },
              { last_name: { $regex: regex } },
            ],
          },
        },
        {
          $lookup: {
            from: "users_profile", // name of the other collection
            localField: "user_id", // field in users collection
            foreignField: "user_id", // field in users_profile
            as: "profileData", // result will be an array
          },
        },
        {
          $unwind: {
            // flatten the profileData array
            path: "$profileData",
            preserveNullAndEmptyArrays: true, // in case there's no profile yet
          },
        },
        {
          $project: {
            _id: 0,
            user_id: 1,
            username: 1,
            first_name: 1,
            last_name: 1,
            profile_image: "$profileData.profile_image", // bring image from joined doc
          },
        },
      ])
      .toArray();
  }

  async updateName(user_id, name) {
    return await this.collection.updateOne(
      { user_id: user_id },
      { $set: name }
    );
  }
  async updatePassword(user_id, password) {
    return await this.collection.updateOne(
      { user_id: user_id },
      { $set: { password: password } }
    );
  }
  async verifyUser(userId) {
    return await this.collection.updateOne(
      { user_id: userId },
      { $set: { is_verified: true } }
    );
  }
  // for register
  async isUserExist(email, phone, username) {
    return this.collection.findOne({
      $or: [{ email: email }, { phone: phone }, { username: username }],
    });
  }
}

module.exports = User;
