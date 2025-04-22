const User = require("../models/User");

const getAllUsers = async (req, res) => {
  const users = await User.find()
      .select("-password")
      .lean()
      .exec();
  if (!users.length) {
    return res.status(404).json({
      message: "No users found",
      code: "NO_USERS_EXIST"
    });
  }
  res.json(users);
};

module.exports = {
  getAllUsers,
};
