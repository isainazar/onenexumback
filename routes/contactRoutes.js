const { Router } = require("express");
const {
  contactController,
  footerNewsletter,
  quizNewsletter,
} = require("../controller/contactController");

const router = Router();

router.post("/", contactController);
router.post("/footer-news", footerNewsletter);
router.post("/quiz-news", quizNewsletter);

module.exports = router;
