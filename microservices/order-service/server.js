const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

connectDB();

// ✅ Use Order Routes
app.use('/', orderRoutes);

app.listen(5007, () => {
    console.log('📦 Order Service running on port 5007');
});
