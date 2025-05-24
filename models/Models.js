const User = require("./User");
const Posts = require("./Posts");
const UserProfile = require("./UserProfile");
const Groups = require("./Groups");
const Comments = require("./Comments");
const Likes = require("./Likes");

class Models {
  constructor() {
    // Initialize model instances
    this.users = new User();
    this.posts = new Posts();
    this.usersProfile = new UserProfile();
    this.groups = new Groups();      // ←
    this.comments = new Comments();  // ←
    this.likes = new Likes();
  }

  async init(db) {
    await this.users.init(db);
    await this.usersProfile.init(db);
    await this.posts.init(db);
    await this.groups.init(db);
    await this.comments.init(db);
    await this.likes.init(db);
  }
}

module.exports = Models;
