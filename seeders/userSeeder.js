const https = require("https");
const faker = require("@faker-js/faker").fakerES;
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");

const User = require("../models/User");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const uploadAvatarToSupabase = async (avatarBuffer) => {
  try {
    const fileName = `image_${Date.now()}.png`;

    const { data, error } = await supabase.storage.from("avatars").upload(fileName, avatarBuffer, {
      contentType: "image/png",
    });

    if (error) throw error;
    return supabase.storage.from("avatars").getPublicUrl(data.path).publicURL;
  } catch (error) {
    console.error("Error al subir el avatar a Supabase:", error);
    return null;
  }
};

const fetchImageBuffer = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const data = [];
      res.on("data", (chunk) => data.push(chunk));
      res.on("end", () => resolve(Buffer.concat(data)));
      res.on("error", reject);
    });
  });
};

module.exports = async () => {
  try {
    const users = [];
    const hashedPassword = await bcrypt.hash("1234", 10);

    for (let i = 0; i < 100; i++) {
      const firstname = faker.person.firstName().split(" ")[0];
      const lastname = faker.person.lastName().split(" ")[0];
      const avatarUrl = faker.image.avatar();
      const avatarBuffer = await fetchImageBuffer(avatarUrl);
      const avatar = await uploadAvatarToSupabase(avatarBuffer);

      users.push({
        firstname,
        lastname,
        username: `${firstname.toLowerCase()}${lastname.toLowerCase()}`,
        password: hashedPassword,
        email: faker.internet.email(),
        bio: faker.lorem.sentence(),
        avatar,
      });
    }

    await User.insertMany(users);
    console.log("[Database] Se corrió el seeder de Users.");
  } catch (error) {
    console.error("Error al ejecutar el seeder:", error);
  }
};
