const express = require("express");
const router = express.Router();
const tweetController = require("../controllers/tweetController");

/*
 * API endpoints relacionados a los artículos.
 *
 * Notar que todos estos endpoints tienen como prefijo el string "/tweets",
 * tal como se definió en el archivo `routes/index.js`.
 */


router.get("/", tweetController.index);
router.post("/", tweetController.store);
router.get("/:id", tweetController.show);
router.patch("/:id", tweetController.update);
router.delete("/:id", tweetController.destroy);

module.exports = router;
