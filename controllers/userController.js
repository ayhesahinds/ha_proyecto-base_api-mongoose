const bcrypt = require("bcryptjs");
const formidable = require("formidable");
const fs = require("fs");
const Tweet = require("../models/Tweet");
const User = require("../models/User");

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
  const form = formidable({
    multiples: true,
    uploadDir: __dirname + "/../public/img",
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return err;

    const { firstname, lastname, username, password, bio, age, email } = fields;
    avatar = files.avatar.newFilename;

    try {
      newUser = await User.create({
        firstname,
        lastname,
        username,
        age,
        email,
        password,
        bio,
        avatar,
      });

      return res.json({ msg: "User created succesfully" });
    } catch (error) {
      console.log(error);
    }
  });
}

// Update the specified resource in storage.
async function update(req, res) {
  const { id } = req.params;

  const form = formidable({
    multiples: true,
    uploadDir: __dirname + "/../public/img",
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) return err;

      const { firstname, lastname, username, password, bio, age, email } = fields;
      const { avatar } = files;
      const updateFields = {
        firstname,
        lastname,
        username,
        password,
        age,
        bio,
        email,
        avatar,
      };
      if (password) {
        updateFields.password = await bcrypt.hash(password, 10);
      }

     

      const user = await User.findByIdAndUpdate(id, updateFields);

      if (user.avatar) {
        const imagePath = __dirname + "/../public/img/" + user.avatar;
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          }
        });
      }

      return res.json({ msg: "User updated succesfully" });
    } catch (error) {
      res.status(500).json({ msg: "User updated unsuccesfully" });
    }
  });
}




// Remove the specified resource from storage.
async function destroy(req, res) {
  try {
    const id = req.params.id;

    const user = await User.findByIdAndDelete(id);

    if (!user) return res.status(404).json({ msg: "User not found" });

    await Tweet.deleteMany({ user: id });

    if (user.avatar) {
      const imagePath = __dirname + "/../public/img/" + user.avatar;
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      });
    }

    return res.json({ msg: "User deleted succesfully" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

// Otros handlers...
// ...
async function showFollowers(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("followers", "-password").sort({ createdAt: -1 });

    return res.status(200).json({ followers: user.followers });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

async function showFollowings(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .populate("followings", "-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({ followings: user.followings });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

async function toogleFollow(req, res) {
  try {
    const { id } = req.params;
    const userId = req.auth.sub;

    const userToFollowing = await User.findById(userId);
    const userTofollow = await User.findById(id);

    if (!userToFollowing) return res.status(404).json({ msg: "User not found" });

    if (id === userToFollowing._id.toString())
      return res.json({ msg: "You can't follow yourself." });

    const alreadyFollow = userToFollowing.followings.some((user) => user._id.toString() === id);

    if (alreadyFollow) {
      userToFollowing.followings.pull(id);
      await userToFollowing.save();

      userTofollow.followers.pull(userId);
      await userTofollow.save();

      return res.status(200).json({ msg: "You have unfollowed this user." });
    }

    userToFollowing.followings.push(id);
    await userToFollowing.save();

    userTofollow.followers.push(userId);
    await userTofollow.save();

    return res.status(200).json({ msg: "You are now following this user." });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
  showFollowers,
  showFollowings,
  toogleFollow,
};
