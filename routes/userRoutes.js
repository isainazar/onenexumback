var express = require("express");
var router = express.Router();
const auth = require("../utilities/auth");

// Controllers
const {
  login,
  createUser,
  resetPassword,
  forgotPassword,
} = require("../controller/userController");

/* GET users listing. */
router.post("/login", login);
router.post("/sing-in", createUser);
router.put("/reset-password", auth, resetPassword);
router.post("/forgot-password", forgotPassword);

module.exports = router;