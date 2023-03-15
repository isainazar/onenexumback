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
  putSeccion_B,
  postSeccion_B,
  putValoracion_A,
  putValoracion_B,
  getValoracionA,
  getTest,
  postTest,
  getAllTest,
  putTest,
} = require("../controller/userController");

/* GET users listing. */
router.put("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);

//Usuario

router.post("/sing-in", createUser);
router.post("/login", login);
router.get("/usuario/:id_user", getUserData);


//Test de personalidad

router.post("/post-test", postTest);
router.get("/get-test/:user", getTest);
router.get("/get-all-test/:user", getAllTest);
router.put("/update-test", putTest);

router.put("/terminos", auth, updateTerminos);
router.put("/data", updateUser);
router.get("/session", getSession);
router.put("/mail-accepted", auth, updateMailAccepted);
router.put("/processed", auth, updatePayment);

//Secciones 

router.post("/create-seccion-a", postSeccion_A);
router.post("/create-seccion-b", postSeccion_B);

//Modificacion de secciones

router.put("/put-section-a", putSeccion_A);
router.put("/put-section-b", putSeccion_B);
router.put("/put-valoracion-a", putValoracion_A);
router.put("/put-valoracion-b", putValoracion_B);

router.get("/get-val-a/:user", getValoracionA)

module.exports = router;
