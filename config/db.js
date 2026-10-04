const mongoose = require('mongoose');

// Connect to MongoDB using the MONGO_URI from the .env file
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    // We only log the error so the server (and Swagger) can still start
    console.error(`MongoDB connection failed: ${error.message}`);
  }
};

module.exports = connectDB;
