const express = require("express");
const router = express.Router();
const tweetController = require("../controllers/tweetController");
const { checkAuth } = require("../middlewares/checkAuth");

/*
 * API endpoints relacionados a los artículos.
 *
 * Notar que todos estos endpoints tienen como prefijo el string "/tweets",
 * tal como se definió en el archivo `routes/index.js`.
 */

router.use(checkAuth);

router.get("/", tweetController.index);
router.post("/", tweetController.store);
router.get("/:id", tweetController.show);
router.patch("/:id", tweetController.update);
router.delete("/:id", tweetController.destroy);

// TODO: toggle 
router.patch("/:id/likes", tweetController.toogleLike);

module.exports = router;
