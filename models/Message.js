// models/Message.js
const BaseModel = require("./BaseModel");
class Message extends BaseModel {
  constructor() {
    super("messages");
  }

  async save({ sender, receiver, text, room, timestamp }) {
    return this.collection.insertOne({
      sender,
      receiver,
      text,
      room,
      timestamp: timestamp || new Date(),
      read: false,
    });
  }

  async getMessages(room) {
    return this.collection.find({ room }).sort({ timestamp: 1 }).toArray();
  }

  async markAsRead(room, receiver) {
    return this.collection.updateMany(
      { room, receiver, read: false },
      { $set: { read: true } }
    );
  }

  async countUnread(receiver) {
    return this.collection.countDocuments({ receiver, read: false });
  }

  async getUnreadSummary(receiver) {
    const result = await this.collection
      .aggregate([
        {
          $match: {
            receiver,
            read: false,
          },
        },
        {
          $group: {
            _id: "$sender",
            unread_count: { $sum: 1 },
          },
        },
        {
          $project: {
            user_id: "$_id",
            unread_count: 1,
            _id: 0,
          },
        },
      ])
      .toArray();

    return result;
  }
}

module.exports = Message;
