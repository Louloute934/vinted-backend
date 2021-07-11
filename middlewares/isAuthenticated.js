const User = require("../Model/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const user = await User.findOne({
        token: req.headers.authorization.replace("Bearer ", ""),
      });
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ error: "Unauthorized 1!" });
      }
    } else {
      res.status(401).json({ error: "Unauthorized 2!" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = isAuthenticated;
