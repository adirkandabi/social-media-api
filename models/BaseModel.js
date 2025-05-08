class BaseModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collection = null; // Will be initialized with a MongoDB collection instance
  }

  async init(db) {
    this.collection = db.collection(this.collectionName);
  }
}

module.exports = BaseModel;
