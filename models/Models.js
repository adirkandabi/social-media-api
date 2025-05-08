const User = require("./User");
const Posts = require("./Posts");
const UserProfile = require("./UserProfile");

class Models {
  constructor() {
    // Initialize model instances
    this.users = new User();
    this.posts = new Posts();
    this.usersProfile = new UserProfile();
  }

  async init(db) {
    await this.users.init(db);
    await this.usersProfile.init(db);
    await this.posts.init(db);
  }
}

module.exports = Models;
