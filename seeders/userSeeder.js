const https = require("https");
const faker = require("@faker-js/faker").fakerES;
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");
const _ = require("lodash");

const User = require("../models/User");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const uploadAvatarToSupabase = async (avatarBuffer) => {
  try {
    const fileName = `image_${Date.now()}.png`;

    const { data, error } = await supabase.storage.from("avatars").upload(fileName, avatarBuffer, {
      contentType: "image/png",
    });

    if (error) throw error;

    return fileName;
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

    // Crear los usuarios
    for (let i = 0; i < 100; i++) {
      const firstname = faker.person.firstName().split(" ")[0];
      const lastname = faker.person.lastName().split(" ")[0];
      const username = `${firstname.toLowerCase()}${lastname.toLowerCase()}`;
      const avatarUrl = faker.image.avatar();
      const avatarBuffer = await fetchImageBuffer(avatarUrl);

      const avatarFileName = await uploadAvatarToSupabase(avatarBuffer);

      const user = {
        firstname,
        lastname,
        username,
        password: hashedPassword,
        email: `${username}@gmail.com`,
        bio: faker.lorem.sentence(),
        avatar: avatarFileName,
        following: [],
        followers: [],
      };

      users.push(user);
    }

    // Guardar usuarios en la base de datos y obtener sus ObjectIds
    const savedUsers = await User.insertMany(users);
    const userMap = savedUsers.reduce((map, user) => {
      map[user.username] = user._id;
      return map;
    }, {});

    // Crear las relaciones de followers y following usando un bucle for
    for (let i = 0; i < savedUsers.length; i++) {
      const user = savedUsers[i];

      // Elegimos aleatoriamente hasta 10 usuarios para seguir (puedes ajustar el número)
      const followingCount = Math.floor(Math.random() * 10) + 1;
      const following = getRandomUsers(savedUsers, followingCount, user.username);

      // Asignamos los ObjectIds de los usuarios a los que sigue
      user.following = following.map((u) => userMap[u.username]);

      // Actualizamos los followers de los usuarios que han sido seguidos
      for (let j = 0; j < following.length; j++) {
        const followedUser = following[j];
        if (!followedUser.followers.includes(user._id)) {
          followedUser.followers.push(user._id); // Aquí se asigna el ObjectId
        }
      }

      // Actualizamos los usuarios en la base de datos con las relaciones de following
      await User.updateOne({ _id: user._id }, { following: user.following });

      // Actualizamos los followers de los usuarios seguidos
      for (let j = 0; j < following.length; j++) {
        const followedUser = following[j];
        const followedUserObjectId = userMap[followedUser.username]; // Usamos ObjectId
        await User.updateOne({ _id: followedUserObjectId }, { followers: followedUser.followers });
      }
    }

    console.log("[Database] Se corrió el seeder de Users.");
  } catch (error) {
    console.error("Error al ejecutar el seeder:", error);
  }
};

// Función para obtener usuarios aleatorios para seguir usando lodash
const getRandomUsers = (users, count, excludeUsername) => {
  // Filtramos para evitar que un usuario se siga a sí mismo
  const otherUsers = users.filter((user) => user.username !== excludeUsername);

  // Usamos lodash _.sampleSize para obtener un número aleatorio de usuarios para seguir
  const randomUsers = _.sampleSize(otherUsers, count);

  return randomUsers;
};
