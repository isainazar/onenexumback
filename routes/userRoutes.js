var express = require("express");
var router = express.Router();
const auth = require("../utilities/auth");

// Controllers
const {
  login,
  createUser,
  resetPassword,
  forgotPassword,
  updateGender,
  updateOcupation,
  updateRelationship,
  updateUnemployed,
  loginWithGoogle,
} = require("../controller/userController");

/* GET users listing. */
router.post("/login", login);
router.post("/sing-in", createUser);
router.put("/reset-password", auth, resetPassword);
router.post("/forgot-password", forgotPassword);
router.post("/update-gender/:id_user", updateGender);
router.post("/update-relationship/:id_user", updateRelationship);
router.post("/update-ocupation/:id_user", updateOcupation);
router.post("/update-unempolyed/:id_user", updateUnemployed);
router.post("/loginWithGoogle", loginWithGoogle);

module.exports = router;
