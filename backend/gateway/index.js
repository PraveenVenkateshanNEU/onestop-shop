const express = require('express');
const proxy = require('express-http-proxy');

const app = express();

app.use('/api/auth', proxy('http://localhost:5001'));
app.use('/api/products', proxy('http://localhost:5006'));
app.use('/api/orders', proxy('http://localhost:5008'));

app.listen(5000, () => {
    console.log('API Gateway running on port 5000');
});
