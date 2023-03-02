const { Router } = require("express");
const auth = require("../utilities/auth");

const {
  paymentStripe,
  getPayments,
  getPaymentsEarns,
  checkUserPayment
} = require("../controller/stripeController");

const router = Router();

router.post("/", auth, paymentStripe);
router.get("/get", auth, getPayments);
router.post("/check", checkUserPayment);
router.get("/getEarns", auth, getPaymentsEarns);

module.exports = router;
