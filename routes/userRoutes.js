const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { checkAuth } = require("../middleware/checkAuth");

/*
 * API endpoints relacionados a los usuarios.
 *
 * Notar que todos estos endpoints tienen como prefijo el string "/users",
 * tal como se definió en el archivo `routes/index.js`.
 */

router.get("/", userController.index);
router.get("/:id", userController.show);
router.post("/", userController.store);

router.patch("/:id", checkAuth, userController.update);
router.delete("/:id", checkAuth, userController.destroy);

module.exports = router;
