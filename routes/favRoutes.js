var express = require("express");
var router = express.Router();
const auth = require("../utilities/auth");

// Controllers
const {
    getFavs,
    getAllFavs,
postFav
} = require("../controller/FavsController");


router.get("/getFav/:user", getFavs);
router.get("/getFavs/:user", getAllFavs);
router.post("/postFav", postFav);

module.exports = router;
