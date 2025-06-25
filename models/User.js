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
      requests_recieved: [],
      requests_sent: [],
    });
  }
  async findByCustomId(user_id) {
    return this.collection.findOne({ user_id: user_id });
  }
  async findByUsername(identifier, type) {
    return this.collection.findOne({ [type]: identifier });
  }
  async sendFriendRequest(userId, friendId) {
    try {
      await this.collection.updateOne(
        { user_id: friendId },
        { $addToSet: { requests_recieved: userId } }
      );
      await this.collection.updateOne(
        { user_id: userId },
        { $addToSet: { requests_sent: friendId } }
      );
      return true;
    } catch (error) {
      console.error("Error sending friend request:", error);
      return false;
    }
  }
  async acceptFriendRequest(userId, friendId) {
    try {
      // Add each other as friends
      await this.collection.updateOne(
        { user_id: userId },
        {
          $addToSet: { friends: friendId },
          $pull: { requests_sent: friendId },
        }
      );

      await this.collection.updateOne(
        { user_id: friendId },
        {
          $addToSet: { friends: userId },
          $pull: { requests_recieved: userId },
        }
      );

      return true;
    } catch (error) {
      console.error("Error accepting friend request:", error);
      return false;
    }
  }
  async rejectFriendRequest(userId, friendId) {
    try {
      // Remove friend request from both users
      await this.collection.updateOne(
        { user_id: userId },
        { $pull: { requests_recieved: friendId } }
      );
      await this.collection.updateOne(
        { user_id: friendId },
        { $pull: { requests_sent: userId } }
      );
      return true;
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      return false;
    }
  }
  async cancelFriendRequest(userId, friendId) {
    try {
      // Remove the sent friend request
      await this.collection.updateOne(
        { user_id: userId },
        { $pull: { requests_sent: friendId } }
      );
      // Remove the received friend request from the other user
      await this.collection.updateOne(
        { user_id: friendId },
        { $pull: { requests_recieved: userId } }
      );
      return true;
    } catch (error) {
      console.error("Error canceling friend request:", error);
      return false;
    }
  }
  async deleteFriend(userId, friendId) {
    try {
      // Remove each other from friends list
      await this.collection.updateOne(
        { user_id: userId },
        { $pull: { friends: friendId } }
      );
      await this.collection.updateOne(
        { user_id: friendId },
        { $pull: { friends: userId } }
      );
      return true;
    } catch (error) {
      console.error("Error deleting friend:", error);
      return false;
    }
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
  async findUserSummary(userId) {
    return this.collection
      .aggregate([
        {
          $match: {
            user_id: userId, // filter by user_id
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
