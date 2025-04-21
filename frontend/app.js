const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'ejs_secret_key',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.flashMessage = req.session.flashMessage;
    delete req.session.flashMessage;
    next();
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

// Middleware to pass user session to templates
app.use((req, res, next) => {
    if (!req.session.cart) req.session.cart = [];
    res.locals.user = req.session.user;
    res.locals.cart = req.session.cart;
    next();
});

// ✅ Route: Home (Login)
app.get('/', (req, res) => {
    res.redirect('/login');
});

// ✅ Route: Login Page
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
        req.session.token = response.data.token;

        // Optional: store user data in session if needed
        const decoded = JSON.parse(Buffer.from(response.data.token.split('.')[1], 'base64').toString());
        req.session.user = decoded;

        res.redirect('/products');
    } catch (err) {
        res.render('login', { error: 'Invalid credentials' });
    }
});

// ✅ Route: Register Page
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
        res.redirect('/login');
    } catch (err) {
        res.render('register', { error: 'Registration failed' });
    }
});

// ✅ Route: Products Page
app.get('/products', async (req, res) => {
    if (!req.session.token) return res.redirect('/login');

    try {
        const response = await axios.get(`${API_BASE_URL}/api/products`, {
            headers: { Authorization: `Bearer ${req.session.token}` }
        });
        res.render('products', { products: response.data });
    } catch (err) {
        res.status(500).send('Error loading products');
    }
});

// ✅ Add to Cart
app.post('/cart/add', (req, res) => {
    const { productId, name, price, source, quantity } = req.body;
    const item = {
        productId,
        name,
        price: parseFloat(price),
        source,
        quantity: parseInt(quantity)
    };
    const existing = req.session.cart.find(p => p.productId === productId);
    if (existing) {
        existing.quantity += item.quantity;
    } else {
        req.session.cart.push(item);
    }
    res.redirect('/products');
});

// ✅ View Cart
app.get('/cart', (req, res) => {
    if (!req.session.token) return res.redirect('/login');
    res.render('cart');
});

// ✅ Checkout
app.post('/cart/checkout', async (req, res) => {
    if (!req.session.token || req.session.cart.length === 0) return res.redirect('/cart');
    try {
        console.log('🛒 Checkout cart data:', req.session.cart);
        await axios.post(`${API_BASE_URL}/api/orders/create`, {
            products: req.session.cart
        }, {
            headers: { Authorization: `Bearer ${req.session.token}` }
        });
        req.session.cart = [];
        res.send('<h2>Order Placed Successfully!</h2><a href="/products">Back to Shop</a>');
    } catch {
        res.status(500).send('Checkout failed');
    }
});

// ✅ Order History
app.get('/orders', async (req, res) => {
    if (!req.session.token) return res.redirect('/login');
    try {
        const response = await axios.get(`${API_BASE_URL}/api/orders`, {
            headers: { Authorization: `Bearer ${req.session.token}` }
        });
        res.render('orders', { orders: response.data });
    } catch {
        res.status(500).send('Could not load orders');
    }
});

// ✅ Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 EJS UI running on http://localhost:${PORT}`));
