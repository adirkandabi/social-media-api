const BaseModel = require("./BaseModel");

class User extends BaseModel {
  constructor() {
    super("users");
  }
  async create(userData) {
    return this.collection.insertOne(userData);
  }
  async findByCustomId(user_id) {
    return this.collection.findOne({ user_id: user_id });
  }
  async findByUsername(identifier, type) {
    return this.collection.findOne({ [type]: identifier });
  }
  async isUserExist(email, phone, username) {
    return this.collection.findOne({
      $or: [{ email: email }, { phone: phone }, { username: username }],
    });
  }
}

module.exports = User;
