const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_USERNAME = process.env.MONGODB_USERNAME;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const MONGODB_DBNAME = process.env.MONGODB_DBNAME;

const mongoURI = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@shock.ghg6a.mongodb.net/${MONGODB_DBNAME}?retryWrites=true&w=majority&appName=Shock`;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully!');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit the process if connection fails
    }
};

module.exports = connectDB;
