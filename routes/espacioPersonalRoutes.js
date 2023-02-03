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
} = require("../controller/espacioPersonalController");

router.post("/postVyR", postVidayrelaciones);
router.post("/postGei", postGustoseintereses);
router.post("/postTrabajo", postTrabajo);
router.post("/postDiario", postDiarioVirtual);
router.put("/putVyR", putVidayrelaciones);
router.put("/putGei", putGustoseintereses);
router.put("/putTrabajo", putTrabajo);

module.exports = router;
