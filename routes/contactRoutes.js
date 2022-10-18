const { Router } = require("express");
const {
  contactController,

  quizNewsletter,
} = require("../controller/contactController");

const router = Router();

router.post("/", contactController);

router.post("/quiz-news", quizNewsletter);

module.exports = router;
