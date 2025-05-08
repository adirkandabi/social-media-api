const BaseModel = require("./BaseModel");

class VerificationCodes extends BaseModel {
  constructor() {
    super("verification_codes");
  }
  async create(userId, document_id, code, ExpireAt) {
    return this.collection.insertOne({
      document_id: document_id,
      user_id: userId,
      code: code,
      created_at: new Date(),
    });
  }
  async findByCustomId(document_id) {
    return this.collection.findOne({ document_id: document_id });
  }
  async findByUserId(user_id) {
    return this.collection.findOne({ user_id: user_id });
  }
}

module.exports = VerificationCodes;
