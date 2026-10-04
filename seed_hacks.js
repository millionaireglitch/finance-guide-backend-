const mongoose = require('mongoose');
const Tip = require('./models/Tip');
const User = require('./models/User');

require('dotenv').config();

const seedHacks = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1/financeguide');
        
        // Find admin user or just first user to assign createdBy
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            admin = await User.findOne(); // fallback
        }
        
        if (!admin) {
            console.log("No user found to assign as creator.");
            process.exit(1);
        }

        await Tip.deleteMany({});
        
        await Tip.create({ 
            title: "The 24-Hour Rule", 
            category: "Saving Hack", 
            content: "Before making any non-essential purchase over ₹2000, wait 24 hours. The impulse will usually fade, and you'll save money.",
            createdBy: admin._id
        });
        
        await Tip.create({ 
            title: "Investing is only for rich people", 
            category: "Myth Buster", 
            content: "FALSE. With compound interest, starting with just ₹500 a month in a low-cost index fund in your 20s can outperform someone investing thousands later in life.",
            createdBy: admin._id
        });

        await Tip.create({ 
            title: "Automate Your Savings", 
            category: "Saving Hack", 
            content: "Set up an automatic transfer on payday to move 20% of your income straight into savings. If you don't see it, you won't spend it.",
            createdBy: admin._id
        });
        
        console.log("Hacks seeded successfully!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedHacks();
