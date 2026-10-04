const mongoose = require('mongoose');
const Tip = require('./models/Tip');
const User = require('./models/User');

require('dotenv').config();

const seedBooks = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1/financeguide');
        
        let admin = await User.findOne({ role: 'admin' }) || await User.findOne();
        if (!admin) {
            console.log("No user found.");
            process.exit(1);
        }
        
        const books = [
            {
                title: "Rich Dad Poor Dad by Robert Kiyosaki",
                category: "Book Rec",
                content: "THE BIG LESSON: The rich buy 'Assets' (things that put money in your pocket, like stocks or real estate), while the poor buy 'Liabilities' (things that take money out, like expensive cars or phones on EMI) thinking they are assets."
            },
            {
                title: "The Psychology of Money by Morgan Housel",
                category: "Book Rec",
                content: "THE BIG LESSON: Managing money isn't about math; it's about behavior. Doing well with money has a little to do with how smart you are and a lot to do with how you behave. Consistency and avoiding panic beats high IQ in investing."
            },
            {
                title: "Atomic Habits by James Clear",
                category: "Book Rec",
                content: "THE BIG LESSON: While not strictly a finance book, it teaches that wealth is the product of small, daily habits. Saving ₹100 a day seems useless, but the compounding effect of '1% better every day' transforms your financial identity over a decade."
            },
            {
                title: "Let's Talk Money by Monika Halan",
                category: "Book Rec",
                content: "THE BIG LESSON: The ultimate personal finance guide specifically for Indians. It cuts through the complex jargon of mutual funds, insurance, and taxes in India, giving you a straightforward system to build a cash-flow machine for your life."
            }
        ];

        for (let book of books) {
            book.createdBy = admin._id;
            await Tip.create(book);
        }
        
        console.log("Book recommendations appended successfully!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedBooks();
