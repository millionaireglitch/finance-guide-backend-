const Quiz = require('../models/Quiz');

exports.getQuizzes = async (req, res) => {
    try {
        // Send quizzes without exposing the correct answer to the frontend
        const quizzes = await Quiz.find().select('-correctAnswer');
        res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.submitAnswer = async (req, res) => {
    try {
        const { answer } = req.body;
        const quiz = await Quiz.findById(req.params.id);
        
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
        
        const isCorrect = (quiz.correctAnswer === answer);
        res.status(200).json({ 
            success: true, 
            isCorrect, 
            explanation: quiz.explanation,
            correctAnswer: quiz.correctAnswer 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
