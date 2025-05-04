const User = require("./User");

class Models {
  constructor() {
    // Initialize model instances
    this.users = new User();
  }

  async init(db) {
    await this.users.init(db);
  }
}

module.exports = Models;
