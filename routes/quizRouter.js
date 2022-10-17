const { Router } = require("express");
const { postQuiz } = require("../controller/quizController");
const router = Router();

router.post("/", postQuiz);

module.exports = router;
