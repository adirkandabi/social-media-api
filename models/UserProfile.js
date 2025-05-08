const BaseModel = require("./BaseModel");

class UserProfile extends BaseModel {
  constructor() {
    super("users_profile");
  }
  async create(profileData, profileId) {
    return this.collection.insertOne({ profile_id: profileId, ...profileData });
  }
  async findByCustomId(document_id) {
    return this.collection.findOne({ document_id: document_id });
  }
  async findByUserId(user_id) {
    return this.collection.findOne({ user_id: user_id });
  }
  async isProfileExist(userId) {
    const profile = await this.collection.findOne({
      user_id: userId,
    });

    return profile !== null;
  }
  async updateProfile(userId, updateData) {
    return await this.collection.updateOne(
      { user_id: userId },
      { $set: updateData }
    );
  }
}

module.exports = UserProfile;
