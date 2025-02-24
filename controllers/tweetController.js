const Tweet = require("../models/Tweet");
const User = require("../models/User");

// Display a listing of the resource.
async function index(req, res) {
  try {
    const tweets = await Tweet.find().sort({ createdAt: -1 }).limit(20);
    return res.json({ tweets });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

// Display the specified resource.
async function show(req, res) {}

// Store a newly created resource in storage.
async function store(req, res) {}

// Update the specified resource in storage.
async function update(req, res) {
  //  const tweet = await Tweet.findById(req.params.id);
}

// Remove the specified resource from storage.
async function destroy(req, res) {}

// Otros handlers...
// ...

async function toogleLike(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.auth;
    console.log(req.auth);
    //const userId = sub;
    const tweet = await Tweet.findById(id);

    if (!tweet) return res.status(404).json({ msg: "Tweet not found" });

    const alreadyLiked = tweet.likes.includes(userId);
    if (alreadyLiked) {
      await Tweet.findByIdAndUpdate(id, { $pull: { likes: userId } });
      return res.json({ msg: "Like removed" });
    }
    await Tweet.findByIdAndUpdate(id, { $addToSet: { likes: userId } });
    return res.json({ msg: "Like added" });
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
  toogleLike,
};
