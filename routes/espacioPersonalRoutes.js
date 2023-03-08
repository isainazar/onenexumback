var express = require("express");
var router = express.Router();
const auth = require("../utilities/auth");

// Controllers
const {
  postDiarioVirtual,
  postGustoseintereses,
  postTrabajo,
  postVidayrelaciones,
  putGustoseintereses,
  putTrabajo,
  putVidayrelaciones,
  getVidayrelaciones,
  getGustoseintereses,
  getTrabajo,
  getDiario
} = require("../controller/espacioPersonalController");

router.get("/getVyR/:user", getVidayrelaciones);
router.post("/postVyR", postVidayrelaciones);
router.put("/putVyR", putVidayrelaciones);

router.get("/getGei/:user", getGustoseintereses);
router.post("/postGei", postGustoseintereses);
router.put("/putGei", putGustoseintereses);

router.get("/getTrabajo/:user", getTrabajo);
router.post("/postTrabajo", postTrabajo);
router.put("/putTrabajo", putTrabajo);

router.get("/getJournal/:user", getDiario);
router.post("/postDiario", postDiarioVirtual);

module.exports = router;
