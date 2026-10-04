const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1/financeguide').then(async () => {
   const count = await Transaction.countDocuments();
   console.log("Transaction count: " + count);
   process.exit(0);
});
