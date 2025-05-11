const BaseModel = require("./BaseModel");
require("dotenv").config();

class VerificationCodes extends BaseModel {
  constructor() {
    super("verification_codes");
  }
  async create(userId, document_id, code, ExpireAt) {
    return this.collection.insertOne({
      document_id: document_id,
      user_id: userId,
      code: code,
      verified: false,
      created_at: new Date(Date.now()),
      expire_at: ExpireAt,
    });
  }
  async findByCustomId(document_id) {
    return this.collection.findOne({ document_id: document_id });
  }
  async findByUserId(user_id) {
    return this.collection.findOne({ user_id: user_id });
  }
  async verifyCode(userId, code) {
    const addingTime = parseInt(process.env.VERIFICATION_CODE_EXPIRY);
    const codeDocuments = await this.collection.find({
      user_id: userId,
      code: code,
      verified: false,
    });
    codeDocuments.forEach(async (document) => {
      const shouldExpire = new Date(
        new Date(document.expire_at).getTime() + addingTime * 1000
      );
      const now = new Date();

      if (now < shouldExpire) {
        const updateResult = await this.collection.updateOne(
          { user_id: userId, code: code },
          { $set: { verified: true } }
        );
        console.log("returning true");

        return updateResult.matchedCount > 0;
      }
    });
    console.log("returning false");

    return false;
  }
}

module.exports = VerificationCodes;
