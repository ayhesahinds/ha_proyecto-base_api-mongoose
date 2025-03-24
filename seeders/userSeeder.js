const https = require("https");
const faker = require("@faker-js/faker").fakerES;
const bcrypt = require("bcryptjs");

const _ = require("lodash");

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");


module.exports = async () => {
  const users = [];
  const hashedPassword = await bcrypt.hash("1234", 10);
  const imgDir = path.join(__dirname, "/../public/img");
  const BgUser = path.join(__dirname, "/../public/backgrounds");




  for (let i = 0; i <= 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const age = faker.number.int({ min: 18, max: 80 });
    const email = faker.internet.email({ firstName, lastName, provider: "gmail.com" });
    const username = faker.helpers.mustache('{{word}}{{count}}', {
      count: () => `${faker.number.int({ max: 870 })}`,
      word: `${faker.word.verb({ length: { min: 5, max: 12 } })}`
    })

    // Background Profile 

    const imageHead = faker.image.urlLoremFlickr({ width: 908, height: 250, category: 'nature' });



    // Para el Avatar:  Generar un nombre único para la imagen utilizando crypto
    const imageFileName = `${crypto.randomUUID()}.jpg`;

    // Usar faker.image.personPortrait para obtener una URL de imagen aleatoria y se define el tamaño
    const imageUrl = faker.image.personPortrait({ size: '256' });

    // Descargar la imagen y guardarla en la carpeta public/img
    try {
      const response = await axios({
        url: imageUrl, BgUser,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(path.join(imgDir, imageFileName));
      response.data.pipe(writer);

      // Esperamos a que se termine de descargar la imagen
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);


      });



      users.push({
        firstname: firstName,
        lastname: lastName,
        age: age,
        email: email.toLowerCase(),
        bio: faker.lorem.sentence(10),
        password: hashedPassword,
        avatar: imageFileName,
        imgBg: imageHead,
        username: username,


      });
    } catch (error) {
      console.error(`Error descargando la imagen: ${error.message}`);
    }
  }

  await User.insertMany(users);
  console.log("[Database] Se corrió el seeder de Users.");
};
