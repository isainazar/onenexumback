var express = require("express");
var router = express.Router();
const auth = require("../utilities/auth");

// Controllers
const {
  getAllUsers,
  getUserById,
  dailyProgress,
  getNewsletter,
  loginAdmin,
} = require("../controller/adminController");

router.get("/getUsers", auth, getAllUsers);
router.get("/getUser/:id_user", auth, getUserById);
router.get("/dailyProgress", auth, dailyProgress);
router.get("/getNewsletter", auth, getNewsletter);
router.post("/login", loginAdmin);

module.exports = router;
