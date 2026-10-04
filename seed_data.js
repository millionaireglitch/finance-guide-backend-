const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Income = require('./models/Income');
const Expense = require('./models/Expense');
const Budget = require('./models/Budget');
const Asset = require('./models/Asset');
const Debt = require('./models/Debt');
const NetWorth = require('./models/NetWorth');
const Tip = require('./models/Tip');

require('dotenv').config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1/financeguide');
        const user = await User.findOne({ email: '2025.snehac@isu.ac.in' });
        if (!user) {
            console.log("User 2025.snehac@isu.ac.in not found!");
            process.exit(1);
        }

        const userId = user._id;

        // Clean existing data for this user to prevent massive duplication
        await Transaction.deleteMany({ user: userId });
        await Income.deleteMany({ user: userId });
        await Expense.deleteMany({ user: userId });
        await Budget.deleteMany({ user: userId });
        await Asset.deleteMany({ user: userId });
        await Debt.deleteMany({ user: userId });
        await NetWorth.deleteMany({ user: userId });

        // Dates
        const today = new Date();
        const thisMonthStr = today.toISOString().slice(0, 7); // e.g. 2026-10

        // 1. Assets & Debts
        await Asset.create({ user: userId, name: 'HDFC Savings', type: 'Bank', value: 125000, date: today });
        await Asset.create({ user: userId, name: 'MacBook Pro', type: 'Other', value: 85000, date: today });
        await Debt.create({ user: userId, name: 'Student Loan', amount: 45000, interestRate: 8, status: 'active' });

        // 2. Budgets
        await Budget.create({ user: userId, category: 'Food', limit: 12000, month: thisMonthStr, spent: 8500 });
        await Budget.create({ user: userId, category: 'Transport', limit: 5000, month: thisMonthStr, spent: 3200 });
        await Budget.create({ user: userId, category: 'Entertainment', limit: 4000, month: thisMonthStr, spent: 4500 }); // Intentional over-budget

        // 3. Transactions (Income & Expenses over last 4 months for the chart)
        for(let i=0; i<4; i++) {
            let d = new Date();
            d.setMonth(d.getMonth() - i);
            let dateStr = d.toISOString();
            
            let incAmt = i === 0 ? 60000 : 55000;
            await Transaction.create({ user: userId, type: 'income', category: 'Salary', amount: incAmt, description: 'Tech Internship', date: dateStr });
            await Income.create({ user: userId, source: 'Salary', amount: incAmt, description: 'Tech Internship', date: dateStr });

            await Transaction.create({ user: userId, type: 'expense', category: 'Rent', amount: 15000, description: 'Monthly Rent', date: dateStr });
            await Expense.create({ user: userId, category: 'Rent', amount: 15000, description: 'Monthly Rent', date: dateStr });
            
            await Transaction.create({ user: userId, type: 'expense', category: 'Food', amount: 8500 + (Math.random()*1000), description: 'Groceries & Eating out', date: dateStr });
            await Expense.create({ user: userId, category: 'Food', amount: 8500, description: 'Groceries & Eating out', date: dateStr });
        }

        // 4. Net Worth History (last 7 days to make the line chart pop)
        let baseNw = 165000; 
        for(let i=6; i>=0; i--) {
            let d = new Date();
            d.setDate(d.getDate() - i);
            await NetWorth.create({ 
                user: userId, 
                totalAssets: 210000, 
                totalDebts: 45000, 
                netWorth: baseNw + (Math.random() * 5000), 
                recordDate: d.toISOString().split('T')[0] 
            });
        }

        // 5. Tips (Global)
        await Tip.deleteMany({});
        await Tip.create({ title: "Build an Emergency Fund", category: "Savings", content: "Aim to save 3-6 months of living expenses in a separate, easily accessible bank account." });
        await Tip.create({ title: "The 50/30/20 Rule", category: "Budgeting", content: "Allocate 50% of income to needs, 30% to wants, and 20% to savings and investments." });
        
        console.log("Data seeding complete!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
seed();
