const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());

connectDB();

app.use('/', authRoutes);

app.listen(5001, () => {
    console.log('Authentication Service running on port 5001');
});
