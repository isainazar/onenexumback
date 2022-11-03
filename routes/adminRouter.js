var express = require("express");
var router = express.Router();
const authAdmin = require("../utilities/authAdmin");
const auth = require("../utilities/auth");

// Controllers
const {
  getAllUsers,
  getUserById,
  dailyProgress,
  getNewsletter,
} = require("../controller/adminController");

router.get("/getUsers", auth, authAdmin, getAllUsers);
router.get("/getUser/:id_user", auth, authAdmin, getUserById);
router.get("/dailyProgress", auth, authAdmin, dailyProgress);
router.get("/getNewsletter", auth, authAdmin, getNewsletter);

module.exports = router;
