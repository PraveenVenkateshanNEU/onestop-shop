const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db'); // MongoDB connection
const productRoutes = require('./routes/productRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Use Product Routes
app.use('/', productRoutes);

app.listen(5006, () => {
    console.log('📦 Product Service running on port 5006');
});
