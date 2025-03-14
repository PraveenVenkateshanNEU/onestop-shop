const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const amazonRoutes = require('./routes/amazonRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

connectDB();

app.use('/', amazonRoutes);

app.listen(5009, () => {
    console.log('🛒 Amazon Service running on port 5009');
});
