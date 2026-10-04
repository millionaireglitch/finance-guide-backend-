const express = require('express');
const router = express.Router();
const { getQuizzes, submitAnswer } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getQuizzes);
router.post('/:id/submit', protect, submitAnswer);

module.exports = router;
