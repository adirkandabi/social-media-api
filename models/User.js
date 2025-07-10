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
      await this.collection.updateOne(
        { user_id: userId },
        {
          $addToSet: { friends: friendId },
          $pull: { requests_recieved: friendId },
        }
      );

      await this.collection.updateOne(
        { user_id: friendId },
        {
          $addToSet: { friends: userId },
          $pull: { requests_sent: userId },
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
      await this.collection.updateOne(
        { user_id: userId },
        { $pull: { requests_sent: friendId } }
      );
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
            from: "users_profile",
            localField: "user_id",
            foreignField: "user_id",
            as: "profileData",
          },
        },
        {
          $unwind: {
            path: "$profileData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            user_id: 1,
            username: 1,
            first_name: 1,
            last_name: 1,
            profile_image: "$profileData.profile_image",
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
            user_id: userId,
          },
        },
        {
          $lookup: {
            from: "users_profile",
            localField: "user_id",
            foreignField: "user_id",
            as: "profileData",
          },
        },
        {
          $unwind: {
            path: "$profileData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            user_id: 1,
            username: 1,
            first_name: 1,
            last_name: 1,
            profile_image: "$profileData.profile_image",
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
    if (!user) return [];

    const friendIds = user.friends || [];

    if (friendIds.length === 0) return [];

    return this.collection
      .aggregate([
        {
          $match: {
            user_id: { $in: friendIds },
          },
        },
        {
          $lookup: {
            from: "users_profile",
            localField: "user_id",
            foreignField: "user_id",
            as: "profileData",
          },
        },
        {
          $unwind: {
            path: "$profileData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            user_id: 1,
            username: 1,
            first_name: 1,
            last_name: 1,
            profile_image: "$profileData.profile_image",
          },
        },
      ])
      .toArray();
  }

  async getUsersByIds(userIds) {
    if (!userIds || userIds.length === 0) return [];

    return this.collection
      .aggregate([
        {
          $match: {
            user_id: { $in: userIds },
          },
        },
        {
          $lookup: {
            from: "users_profile",
            localField: "user_id",
            foreignField: "user_id",
            as: "profileData",
          },
        },
        {
          $unwind: {
            path: "$profileData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            user_id: 1,
            username: 1,
            first_name: 1,
            last_name: 1,
            profile_image: "$profileData.profile_image",
          },
        },
      ])
      .toArray();
  }
}

module.exports = User;
