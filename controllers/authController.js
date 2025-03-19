const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function getToken(req, res) {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.json({ msg: "Invalid Credentials" });

  const isValidPassword = await bcrypt.compare(req.body.password, user.password);
  if (!isValidPassword) return res.json({ msg: "Invalid Credentials" });

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET);
  const userData = {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    avatar: user.avatar,
  };
  return res.json({ accessToken: token, userData });
}

module.exports = { getToken };
