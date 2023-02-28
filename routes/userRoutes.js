var express = require("express");
var router = express.Router();
const auth = require("../utilities/auth");

// Controllers
const {
  login,
  createUser,
  resetPassword,
  forgotPassword,
  updateTerminos,
  getSession,
  updateMailAccepted,
  updateUser,
  updatePayment
} = require("../controller/userController");

/* GET users listing. */
router.post("/login", login);
router.post("/sing-in", createUser);
router.put("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);
router.put("/terminos", auth, updateTerminos);
router.put("/data", updateUser);
router.get("/session", getSession);
router.put("/mail-accepted", auth, updateMailAccepted);
router.put("/processed", auth, updatePayment);

module.exports = router;
