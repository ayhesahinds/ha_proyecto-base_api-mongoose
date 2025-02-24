const { mongoose, Schema } = require("../db");
const User = require("./User");

const tweetSchema = new Schema(
  {
    title: String,
    content: String,

  },
  {
    timestamps: true,
  },
);

const Tweet = mongoose.model("Tweet", tweetSchema); // Entre comillas se coloca el nombre del modelo en mayúscula y en singular.

module.exports = Tweet;
