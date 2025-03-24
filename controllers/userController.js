const formidable = require("formidable");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const path = require("path");

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
  const { id } = req.params.id;
  try {
    const user = await User.findById({ id }).select("-password").populate("tweets");

    if (!user) res.status(404).json({ msg: "User not found" });
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

// Store a newly created resource in storage.
async function store(req, res) {
  try {
    const form = formidable({
      multiples: true,
      //uploadDir: __dirname + "/../public/img",
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) return err;

      const { firstname, lastname, username, password, bio, age, email, imgBg } = fields;
      if (!firstname || !lastname || !username || !password || !email) {
        return res.status(400).json({ msg: "Missing required fields." });
      }
      const ext = path.extname(files.avatar.filepath);
      const newFileName = `image_${Date.now()}${ext}`;
      const hashedPassword = await bcrypt.hash(password, 10);

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(newFileName, fs.createReadStream(files.avatar.filepath), {
          cacheControl: "3600",
          upsert: false,
          contentType: files.avatar.mimetype,
          duplex: "half",
        });

      const newUser = await User.create({
        firstname,
        lastname,
        username,
        age,
        email,
        password: hashedPassword,
        bio,
        avatar: newFileName,
        imgBg,
      });
      return res.status(200).json({ newUser });
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

// Update the specified resource in storage.
async function update(req, res) {
  try {
    const { id } = req.params;

    const form = formidable({
      multiples: false,
      //uploadDir: __dirname + "/../public/img",
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) return err;

      const { firstname, lastname, username, password, bio, age, email } = fields;
      const ext = path.extname(files.avatar.filepath);
      const newFileName = `image_${Date.now()}${ext}`;

      const updateFields = {
        firstname,
        lastname,
        username,
        password,
        age,
        bio,
        email,
        avatar: newFileName,
        imgBg,
      };

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(newFileName, fs.createReadStream(files.avatar.filepath), {
          cacheControl: "3600",
          upsert: false,
          contentType: files.avatar.mimetype,
          duplex: "half",
        });

      if (password) {
        updateFields.password = await bcrypt.hash(password, 10);
      }

      const user = await User.findByIdAndUpdate(id, updateFields);

      await supabase.storage.from("avatars").remove([user.avatar]);

      return res.json({ msg: "User updated successfully" });
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}

// Remove the specified resource from storage.
async function destroy(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) return res.status(404).json({ msg: "User not found" });

    await supabase.storage.from("avatars").remove([user.avatar]);

    await Tweet.deleteMany({ user: id });

    return res.json({ msg: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

// Otros handlers...
// ...
async function showFollowers(req, res) {
  try {
    const { id } = req.params;
    const { followers } = await User.findById(id)
      .populate("followers", "-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({ followers });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

async function showFollowings(req, res) {
  try {
    const { id } = req.params;
    const { followings } = await User.findById(id)
      .populate("followings", "-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({ followings });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

async function toggleFollow(req, res) {
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
  toggleFollow,
};
