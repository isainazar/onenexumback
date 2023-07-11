var express = require("express");
var router = express.Router();
const auth = require("../utilities/auth");

// Controllers
const {
  getAllUsers,
  getUserById,
  getNewsletter,
  loginAdmin,
  getSectionA,
  getAllSections,
  getSectionB,
  resetIdPayment,
  updateAdminPw
} = require("../controller/adminController");

router.get("/getUsers", auth, getAllUsers);
router.get("/getA", getSectionA);
router.get("/getB", getSectionB);
router.get("/getSections", getAllSections);
router.get("/getUser/:id_user", auth, getUserById);
router.get("/getNewsletter", auth, getNewsletter);
router.post("/login", loginAdmin);
router.put("/resetUserData", resetIdPayment);
router.put("/pw", updateAdminPw);
module.exports = router;
