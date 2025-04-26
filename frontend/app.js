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
    res.locals.flashMessage = req.session.error
    delete req.session.error
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

function isAuthenticated(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}
function isAdmin(req, res, next) {
  if (req.session.user.role !== 'admin') return res.redirect('/');
  next();
}



// ✅ Route: Home (Login)
app.get('/', (req, res) => {
    res.redirect('/login');
});

// ✅ Route: Login Page
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    //const { email, password } = req.body;

    try {
        //const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
        const { email, password } = req.body;
        const { data } = await axios.post(
          `${API_BASE_URL}/api/auth/login`,
          { email, password },    { withCredentials: true }
        );
        // store JWT
          req.session.token = data.token;
        // decode to get role, username, id
        const payload = JSON.parse(
          Buffer.from(data.token.split('.')[1], 'base64').toString()
        );
        req.session.user = {
          userId: payload.userId,
          username: payload.username,
          role: payload.role
        };
        return res.redirect(
          payload.role === 'admin' ? '/admin/dashboard' : '/products'
        );

        // req.session.token = response.data.token;

        // // Optional: store user data in session if needed
        // const decoded = JSON.parse(Buffer.from(response.data.token.split('.')[1], 'base64').toString());
        // req.session.user = decoded;

        // if (decoded.role === 'admin') {
        //     res.redirect('http://localhost:3005/'); // Admin Panel
        // } else {
        //     res.redirect('/products'); // Regular user
        // }
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

app.get(
  '/admin/dashboard',
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      // fetch all sources + orders
      const [walmart, amazon, temu, orders] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/walmart`, {
          headers: { Authorization: `Bearer ${req.session.token}` }
        }),
        axios.get(`${API_BASE_URL}/api/amazon`, {
          headers: { Authorization: `Bearer ${req.session.token}` }
        }),
        axios.get(`${API_BASE_URL}/api/temu`, {
          headers: { Authorization: `Bearer ${req.session.token}` }
        }),
        axios.get(`${API_BASE_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${req.session.token}` }
        }),
      ]);

      res.render('dashboard', {
        walmart:  walmart.data,
        amazon:   amazon.data,
        temu:     temu.data,
        orders:   orders.data,
        error:   res.locals.error
      });
    } catch (e) {
      res.render('dashboard', {
        walmart: [], amazon: [], temu: [],
         orders: [], 
        error: 'Failed to load admin data'
      });
    }
  }
);




// Add product to any source
app.post(
  '/admin/product/add',
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    const { source, name, description, price, category, image } = req.body;
    if (!source || !name || !description || !price || !category) {
      req.session.error = 'All fields (source, name, description, price & category) are required'
      return res.redirect('/admin/dashboard')
    }
    try {
      await axios.post(
        `${API_BASE_URL}/api/${source}/add`,
        { name, description, price, category, image },
        { headers: { Authorization: `Bearer ${req.session.token}` } }
      )
      res.redirect('/admin/dashboard')
    } catch {
      req.session.error = 'Add failed – please try again'
      res.redirect('/admin/dashboard')
    }
  }
);

// Delete product
app.post(
  '/admin/product/delete',
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    const { source, id } = req.body;
    await axios.delete(
      `${API_BASE_URL}/api/${source}/delete/${id}`,
      { headers: { Authorization: `Bearer ${req.session.token}` } }
    );
    res.redirect('/admin/dashboard');
  }
);


// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 EJS UI running on http://localhost:${PORT}`));
