const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Display a listing of the resource.
async function index(req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("-password").populate("tweets");
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

// Display the specified resource.
async function show(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password").populate("tweets");
    if (!user) res.status(404).json({ msg: "User not found" });
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

// Store a newly created resource in storage.
async function store(req, res) {
  try {
    const { firstname, lastname, age, username, email, bio, password, avatar } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstname,
      lastname,
      age,
      username,
      email,
      bio,
      password: hashedPassword,
      avatar,
    });
    return res.json({ newUser });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

// Update the specified resource in storage.
async function update(req, res) {
  try {
    const id = req.params.id;
    const { firstname, lastname, age, username, email, bio, password, avatar } = req.body;
    const updateFields = { firstname, lastname, age, username, email, bio, avatar };

    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true });
    return res.json({ updatedUser });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

// Remove the specified resource from storage.
async function destroy(req, res) {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);

    if (!user) return res.status(404).json({ msg: "User not found" });
    return res.json({ msg: "User deleted succesfully" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

// Otros handlers...
// ...

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
};
