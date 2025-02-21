/*
 * El seeder no es más que un archivo que contiene una función que se encarga
 * de insertar datos (generalmente de prueba) en una base de datos.
 *
 * El nombre "seeder" es una convención y significa "semillero".
 *
 * Además, en este caso, se está usando una librería llamada Faker
 * (https://fakerjs.dev/) para facilitar la creación de datos ficticios como
 * nombres, apellidos, títulos, direcciones y demás textos.
 *
 * Suele ser común que en los seeders exista un `for` donde se define la
 * cantidad de registros de prueba que se insertarán en la base de datos.
 *
 * En este ejemplo se están insertando 100 usuarios con nombres ficticios.
 */

const faker = require("@faker-js/faker").fakerES;
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");

module.exports = async () => {
  const users = [];
  const userPassword = await bcrypt.hash("1234", 10);
  const imgDir = path.join(__dirname, "/../public/img");

  for (let i = 0; i < 100; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.persona.lastName();

    // Generar un nombre único para la imagen utilizando crypto
    const imageFileName = `${crypto.randomUUID()}.jpg`;

    // Usar faker.image.urlPicsumPhotos para obtener una URL de imagen aleatoria
    const imageUrl = faker.image.urlPicsumPhotos({ width: 150, height: 150 });


 // Descargar la imagen y guardarla en la carpeta public/img
 try {
  const response = await axios({
    url: imageUrl,
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
      username: faker.internet.username(),
      password: userPassword,
      email: faker.internet.email({ firstName, lastName, provider: "gmail.com" }),
      Bio: faker.lorem.sentences(3),
      image: imageFileName, // Guardamos el nombre del archivo de la imagen
      });
    } catch (error) {
      console.error(`Error descargando la imagen: ${error.message}`);
    }
  }

  await User.insertMany(users);
  console.log("[Database] Se corrió el seeder de Users.");
};
