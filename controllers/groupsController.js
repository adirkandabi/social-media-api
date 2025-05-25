// helpers
const nextId = () => Date.now().toString();

// Create group
exports.createGroup = async (req, res) => {
    const groups = req.app.locals.models.groups;
    const { name, description, owner_id } = req.body;

    if (!name) return res.status(400).json({ message: "name required" });

    const group = {
        group_id: nextId(),
        name,
        description: description || "",
        owner_id: owner_id || null,
        members: [],
        created_at: new Date(),
        updated_at: null,
    };

    await groups.create(group);
    res.status(201).json({ message: "Group created", group });
};

// Get all groups (with optional filter by owner_id)
exports.getAllGroups = async (req, res) => {
    const groups = req.app.locals.models.groups;
    const filter = {};
    if (req.query.owner_id) filter.owner_id = req.query.owner_id;
    const data = await groups.list(filter);
    res.json(data);
};

// Get group by ID
exports.getGroupById = async (req, res) => {
    const groups = req.app.locals.models.groups;
    const g = await groups.findById(req.params.group_id);
    if (!g) return res.status(404).json({ message: "Group not found" });
    res.json(g);
};

// Update group
exports.updateGroup = async (req, res) => {
    const groups = req.app.locals.models.groups;
    const result = await groups.update(req.params.group_id, {
        ...req.body,
        updated_at: new Date(),
    });
    if (!result.matchedCount)
        return res.status(404).json({ message: "Group not found" });
    res.json({ message: "Group updated" });
};

// Delete group
exports.deleteGroup = async (req, res) => {
    const groups = req.app.locals.models.groups;
    const result = await groups.delete(req.params.group_id);
    if (!result.deletedCount)
        return res.status(404).json({ message: "Group not found" });
    res.json({ message: "Group deleted" });
};

// Join group
exports.joinGroup = async (req, res) => {
    const groups = req.app.locals.models.groups;
    const users = req.app.locals.models.users;

    const group = await groups.findById(req.params.group_id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const user = await users.findByCustomId(req.body.user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (group.members.includes(req.body.user_id)) {
        return res.status(400).json({ message: "User already a member" });
    }

    await groups.addMember(req.params.group_id, req.body.user_id);
    res.json({ message: "Joined group" });
};

// Leave group
exports.leaveGroup = async (req, res) => {
    const groups = req.app.locals.models.groups;
    const users = req.app.locals.models.users;

    const group = await groups.findById(req.params.group_id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const user = await users.findByCustomId(req.body.user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!group.members.includes(req.body.user_id)) {
        return res.status(400).json({ message: "User is not a member" });
    }

    await groups.removeMember(req.params.group_id, req.body.user_id);
    res.json({ message: "Left group" });
};
//get groups by user
exports.getGroupsByUser = async (req, res) => {
    const groups = req.app.locals.models.groups;
    const users = req.app.locals.models.users;
    const user_id = req.params.user_id;

    const user = await users.findByCustomId(user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    try {
        const userGroups = await groups.list({ members: user_id });
        res.json(userGroups);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user's groups", error: error.message });
    }
};

