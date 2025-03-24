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
router.get("/:id", userController.show);
router.post("/", userController.store);

router.use(checkAuth);

router.patch("/:id", userController.update);
router.delete("/:id", userController.destroy);

router.get("/:id/followers", userController.showFollowers);
router.get("/:id/followings", userController.showFollowings);
router.patch("/:id/follow", userController.toggleFollow);

module.exports = router;
