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
  updatePayment,
  postSeccion_A,
  getUserData,
  putSeccion_A,
  postSeccion_B,
  postTest1,
  postTest2,
  postTest3,
  postTest4,
  postTest5,
} = require("../controller/userController");

/* GET users listing. */
router.post("/usuario", getUserData);
router.post("/login", login);
router.post("/sing-in", createUser);
router.put("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);
router.post("/create-seccion-a", postSeccion_A);
router.post("/create-seccion-b", postSeccion_B);
router.post("/post-test1", postTest1);
router.post("/post-test2", postTest2);
router.post("/post-test3", postTest3);
router.post("/post-test4", postTest5);
router.post("/post-test5", postTest5);

router.put("/terminos", auth, updateTerminos);
router.put("/data", updateUser);
router.get("/session", getSession);
router.put("/mail-accepted", auth, updateMailAccepted);
router.put("/processed", auth, updatePayment);
router.put("/put-section_a", putSeccion_A);

module.exports = router;
