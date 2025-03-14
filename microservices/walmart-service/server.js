const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const walmartRoutes = require('./routes/walmartRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

connectDB();

app.use('/', walmartRoutes);

app.listen(5008, () => {
    console.log('🛒 Walmart Service running on port 5008');
});
