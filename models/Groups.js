const BaseModel = require("./BaseModel");

class Groups extends BaseModel {
    constructor() {
        super("groups");
    }

    async create(group) {
        return this.collection.insertOne(group);
    }

    async findById(group_id) {
        return this.collection.findOne({ group_id });
    }

    async list(filter = {}) {
        return this.collection.find(filter).toArray();
    }

    async update(group_id, updateData) {
        return this.collection.updateOne({ group_id }, { $set: updateData });
    }

    async delete(group_id) {
        return this.collection.deleteOne({ group_id });
    }

    async addMember(group_id, user_id) {
        return this.collection.updateOne(
            { group_id },
            { $addToSet: { members: user_id } }
        );
    }

    async removeMember(group_id, user_id) {
        return this.collection.updateOne(
            { group_id },
            { $pull: { members: user_id } }
        );
    }
}

module.exports = Groups;
