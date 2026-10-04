const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
require('dotenv').config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1/financeguide');
        await Quiz.deleteMany();
        
        await Quiz.create([
            {
                question: "What does SIP stand for in mutual funds?",
                options: ["Systematic Investment Plan", "Secure Income Portfolio", "Standard Interest Payout", "Savings Index Plan"],
                correctAnswer: "Systematic Investment Plan",
                explanation: "SIP allows you to invest a fixed amount regularly in a mutual fund scheme, promoting disciplined investing."
            },
            {
                question: "Which of the following is considered 'Good Debt'?",
                options: ["Credit Card Debt", "Education Loan", "Car Loan", "Personal Loan for a Vacation"],
                correctAnswer: "Education Loan",
                explanation: "An education loan increases your future earning potential and often provides tax benefits, making it an investment in yourself (Good Debt)."
            },
            {
                question: "What is the primary purpose of an Emergency Fund?",
                options: ["To buy the latest iPhone", "To invest in high-risk crypto", "To cover 3-6 months of living expenses during crises", "To pay for daily groceries"],
                correctAnswer: "To cover 3-6 months of living expenses during crises",
                explanation: "An emergency fund acts as a financial safety net to protect you from unexpected events like job loss or medical emergencies."
            }
        ]);
        console.log("Quizzes seeded successfully!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
seed();
