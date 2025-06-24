exports.addFriend = async (req, res) => {
    const users = req.app.locals.models.users;
    const { user_id, friend_id } = req.body;

    // בדיקה אם זה אותו משתמש
    if (user_id === friend_id)
        return res.status(400).json({ message: "Cannot add yourself as a friend" });

    const user = await users.findByCustomId(user_id);
    const friend = await users.findByCustomId(friend_id);

    if (!user || !friend)
        return res.status(404).json({ message: "User not found" });

    // בדיקה אם הם כבר חברים
    if (user.friends?.includes(friend_id))
        return res.status(400).json({ message: "Already friends" });

    await users.addFriend(user_id, friend_id);
    await users.addFriend(friend_id, user_id); // הוספה הדדית

    res.json({ message: "Friend added" });
};

exports.removeFriend = async (req, res) => {
    const users = req.app.locals.models.users;
    const { user_id, friend_id } = req.body;

    const user = await users.findByCustomId(user_id);
    const friend = await users.findByCustomId(friend_id);

    if (!user || !friend)
        return res.status(404).json({ message: "User not found" });

    await users.removeFriend(user_id, friend_id);
    await users.removeFriend(friend_id, user_id); // הסרה הדדית

    res.json({ message: "Friend removed" });
};

exports.getFriends = async (req, res) => {
    const users = req.app.locals.models.users;
    const user_id = req.params.user_id;

    const user = await users.findByCustomId(user_id);
    if (!user)
        return res.status(404).json({ message: "User not found" });

    const friendsData = await Promise.all(
        (user.friends || []).map(id => users.findByCustomId(id))
    );

    const simplified = friendsData
        .filter(Boolean)
        .map(u => ({
            user_id: u.user_id,
            username: u.username,
            email: u.email
        }));

    res.json({ user_id, friends: simplified });
};
