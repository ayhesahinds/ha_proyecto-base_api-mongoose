const { mongoose, Schema } = require("../db");

const userSchema = new Schema(
  {
    firstname: String,
    lastname: String,
    age: Number,
    username: String,
    password: String,
    email: String,
    bio: String,
    avatar: String,
    tweets: [{ type: Schema.Types.ObjectId, ref: "Tweet" }],
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema); // Entre comillas se coloca el nombre del modelo en mayúscula y en singular.

module.exports = User;
