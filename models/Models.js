const User = require("./User");
const Posts = require("./Posts");

class Models {
  constructor() {
    // Initialize model instances
    this.users = new User();
    this.posts = new Posts();
  }

  async init(db) {
    await this.users.init(db);
    await this.posts.init(db);
  }
}

module.exports = Models;
