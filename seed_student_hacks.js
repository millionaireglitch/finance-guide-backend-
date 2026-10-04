const mongoose = require('mongoose');
const Tip = require('./models/Tip');
const User = require('./models/User');

require('dotenv').config();

const seedHacks = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1/financeguide');
        
        let admin = await User.findOne({ role: 'admin' }) || await User.findOne();
        if (!admin) {
            console.log("No user found.");
            process.exit(1);
        }

        await Tip.deleteMany({});
        
        const hacks = [
            {
                title: "The 'Minimum Due' Credit Card Trap",
                category: "Myth Buster",
                content: "Many beginners think paying the 'Minimum Amount Due' on a credit card is enough. REALITY: You will be charged massive interest (often 36-40% annually) on the remaining balance. Always pay the 'Total Amount Due' before the deadline. If you can't, don't use the card."
            },
            {
                title: "Start an SIP with just ₹500",
                category: "Saving Hack",
                content: "You don't need a massive salary to start investing. As a student, if you save just ₹500 a month from your pocket money and put it into a Nifty 50 Index Mutual Fund via SIP, you are building the most important financial muscle: Discipline. Time in the market beats timing the market."
            },
            {
                title: "The 30-Day Rule for Tech & Gadgets",
                category: "Saving Hack",
                content: "As students, FOMO (Fear Of Missing Out) makes us want the latest iPhone or headphones on EMI. HACK: Force yourself to wait 30 days before buying any non-essential item over ₹5,000. 90% of the time, the impulse fades and you realize you don't actually need it."
            },
            {
                title: "Your .edu Email is a Goldmine",
                category: "Student Hack",
                content: "Stop paying full price for software. Your college email ID gives you massive discounts. Spotify, Apple Music, GitHub Pro, Notion, and Amazon Prime all have heavily discounted or free tiers specifically for students. Always ask 'Do you have a student discount?' before buying."
            },
            {
                title: "Education Loans vs. Personal Loans",
                category: "Myth Buster",
                content: "MYTH: All debt is bad. REALITY: An education loan for a high-ROI degree (like B.Tech CSE) is 'Good Debt' because it increases your future earning potential and offers tax benefits under Section 80E. However, taking a personal loan to buy a motorcycle is 'Bad Debt'."
            },
            {
                title: "The 10% Upskill Budget",
                category: "Wealth Hack",
                content: "If you get a stipend from an internship, don't spend it all on eating out. Allocate exactly 10% of it to an 'Upskill Fund'. Use this only to buy technical books, Udemy courses, or cloud hosting (AWS/DigitalOcean) to host your projects. Investing in your skills gives the highest ROI in your 20s."
            }
        ];

        for (let hack of hacks) {
            hack.createdBy = admin._id;
            await Tip.create(hack);
        }
        
        console.log("Student-focused hacks seeded successfully!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedHacks();
