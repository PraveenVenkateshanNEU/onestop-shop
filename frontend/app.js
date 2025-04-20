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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

// Middleware to pass user session to templates
app.use((req, res, next) => {
    res.locals.user = req.session.user;
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

// ✅ Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 EJS UI running on http://localhost:${PORT}`));
