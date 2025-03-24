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
 * En este ejemplo se están insertando 500 artículos con textos ficticios.
 */

const faker = require("@faker-js/faker").fakerES;
const _ = require("lodash");
const Tweet = require("../models/Tweet");
const User = require("../models/User");

module.exports = async () => {
  const tweets = [];
  const users = await User.find();

  for (let i = 0; i < 20; i++) {
    const randomUser = users[faker.number.int({ min: 0, max: users.length - 1 })];
    const likes = _.map(_.sampleSize(users, _.random(0, users.length / 2)), "_id");

    const newTweet = new Tweet({
      content: faker.lorem.sentence().slice(0, 140),
      user: randomUser._id,
      likes,
    });
    tweets.push(newTweet);

    randomUser.tweets.push(newTweet._id);
    await randomUser.save();
  }

  await Tweet.insertMany(tweets);
  console.log("[Database] Se corrió el seeder de Tweets.");
};
