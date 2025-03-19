const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function getToken(req, res) {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.json({ msg: "Invalid Credentials" });

  const isValidPassword = await bcrypt.compare(req.body.password, user.password);
  if (!isValidPassword) return res.json({ msg: "Invalid Credentials" });

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET);
  return res.json({ accessToken: token, userId: user.id, userAvatar: user.avatar });
}

module.exports = { getToken };
