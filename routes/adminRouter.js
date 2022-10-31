var express = require("express");
var router = express.Router();
const authAdmin = require("../utilities/authAdmin");
const auth = require("../utilities/auth");

// Controllers
const { getAllUsers, getUserById } = require("../controller/adminController");

router.get("/getUsers", auth, authAdmin, getAllUsers);
router.get("/getUser", auth, authAdmin, getUserById);

module.exports = router;
