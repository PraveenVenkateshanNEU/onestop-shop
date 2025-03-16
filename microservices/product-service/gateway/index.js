const express = require('express');
const proxy = require('express-http-proxy');

const app = express();

app.use('/api/auth', proxy('http://localhost:5001'));
app.use('/api/products', proxy('http://localhost:5006'));
app.use('/api/orders', proxy('http://localhost:5007'));
app.use('/api/walmart', proxy('http://localhost:5008'));
app.use('/api/amazon', proxy('http://localhost:5009'));
app.use('/api/temu', proxy('http://localhost:5010'));

app.listen(5000, () => {
    console.log('🚀 Microservices API Gateway running on port 5000');
});