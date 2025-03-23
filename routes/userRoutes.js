const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { checkAuth } = require("../middlewares/checkAuth");

/*
 * API endpoints relacionados a los usuarios.
 *
 * Notar que todos estos endpoints tienen como prefijo el string "/users",
 * tal como se definió en el archivo `routes/index.js`.
 */

router.get("/", userController.index);
router.get("/:username", userController.show);
router.post("/", userController.store);

router.use(checkAuth);

router.patch("/:username", userController.update);
router.delete("/:username", userController.destroy);

router.get("/:username/followers", userController.showFollowers);
router.get("/:username/followings", userController.showFollowings);
router.patch("/:username/follow", userController.toggleFollow);

module.exports = router;
