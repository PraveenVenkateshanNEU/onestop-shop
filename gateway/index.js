const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors');

const app = express();

const proxyOptions = {
  proxyReqOptDecorator(opts, srcReq) {
    // forward auth and cookies
    opts.headers['Authorization'] = srcReq.headers['authorization'] || '';
    opts.headers['Cookie']        = srcReq.headers['cookie']        || '';
    return opts;
  }
};

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3005'],
    credentials: true
  }));

app.use('/api/auth', proxy('http://localhost:5001', proxyOptions));
app.use('/api/products', proxy('http://localhost:5006', proxyOptions));
app.use('/api/orders', proxy('http://localhost:5007', proxyOptions));
app.use('/api/walmart', proxy('http://localhost:5008', proxyOptions));
app.use('/api/amazon', proxy('http://localhost:5009', proxyOptions));
app.use('/api/temu', proxy('http://localhost:5010', proxyOptions));

app.listen(5000, () => {
    console.log('🚀 Microservices API Gateway running on port 5000');
});