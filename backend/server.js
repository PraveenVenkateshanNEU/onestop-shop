const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();
app.use(express.json());

connectDB();

app.use(
    session({
        secret: process.env.SESSION_SECRET,  // Defined in .env
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@shock.ghg6a.mongodb.net/${process.env.MONGODB_DBNAME}?retryWrites=true&w=majority&appName=Shock`,
            collectionName: 'sessions',
        }),
        cookie: { maxAge: 1000 * 60 * 60 }  // 1-hour session expiry
    })
);

app.use('/', authRoutes);

app.listen(5001, () => {
    console.log('Authentication Service running on port 5001');
});
