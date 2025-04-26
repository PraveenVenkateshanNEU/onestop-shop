const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path       = require('path');  
const connectDB = require('./config/db');
const temuRoutes = require('./routes/temuRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

connectDB();

app.use('/', temuRoutes);

app.listen(5010, () => {
    console.log('🛒 Temu Service running on port 5010');
});
