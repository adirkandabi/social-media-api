const User = require("./User");
const Posts = require("./Posts");
const UserProfile = require("./UserProfile");
const VerificationCodes = require("./VerificationCodes");

class Models {
  constructor() {
    // Initialize model instances
    this.users = new User();
    this.posts = new Posts();
    this.usersProfile = new UserProfile();
    this.verificationCodes = new VerificationCodes();
  }

  async init(db) {
    await this.users.init(db);
    await this.usersProfile.init(db);
    await this.posts.init(db);
    await this.verificationCodes.init(db);
  }
}

module.exports = Models;
