const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function getToken(req, res) {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ msg: "Invalid Credentials" });
    }

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ msg: "Invalid Credentials" });
    }

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET);
    const userData = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      avatar: user.avatar,
    };

    return res.status(200).json({ accessToken: token, ...userData });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: error.message });
  }
}

module.exports = { getToken };
