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

  async addFriend(userId, friendId) {
    return this.collection.updateOne(
      { user_id: userId },
      { $addToSet: { friends: friendId } }
    );
  }

  async removeFriend(userId, friendId) {
    return this.collection.updateOne(
      { user_id: userId },
      { $pull: { friends: friendId } }
    );
  }

  async getFriends(userId) {
    const user = await this.findByCustomId(userId);
    if (!user) return null;
    return user.friends || [];
  }

}

module.exports = User;
