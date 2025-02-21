const { mongoose, Schema } = require("../db");

const tweetSchema = new Schema(
  {
    content: { type: String, maxLength: 140 },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Tweet = mongoose.model("Tweet", tweetSchema); // Entre comillas se coloca el nombre del modelo en mayúscula y en singular.

module.exports = Tweet;
