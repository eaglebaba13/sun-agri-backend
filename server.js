const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'sun-agri-super-secret-jwt-key-2026';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Middleware
const allowedOrigins = [
  'https://sunagriscience.in',
  'https://www.sunagriscience.in',
  'http://localhost:5173',
  'http://localhost:8080'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Auth Token Verification Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// 1. GET /health
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 2. GET /products
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY name ASC');
    const products = result.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      formulation: row.formulation,
      activeIngredient: row.active_ingredient,
      description: row.description,
      packaging: row.packaging,
      dosage: row.dosage,
      crops: row.crops,
      specs: row.specs,
      upcoming: row.upcoming
    }));
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. GET /products/:slug
app.get('/products/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE slug = $1', [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      formulation: row.formulation,
      activeIngredient: row.active_ingredient,
      description: row.description,
      packaging: row.packaging,
      dosage: row.dosage,
      crops: row.crops,
      specs: row.specs,
      upcoming: row.upcoming
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. POST /inquiries
app.post('/inquiries', async (req, res) => {
  try {
    const {
      type,
      companyName,
      contactPerson,
      phone,
      email,
      gstOrLicense,
      state,
      city,
      products,
      volume,
      message
    } = req.body;

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const inquiryId = `SAS-${randomNum}`;

    await pool.query(
      `INSERT INTO inquiries (
        id, type, company_name, contact_person, phone, email,
        gst_or_license, state, city, products, volume, message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        inquiryId,
        type,
        companyName,
        contactPerson,
        phone,
        email,
        gstOrLicense,
        state,
        city,
        JSON.stringify(products || []),
        volume,
        message || null
      ]
    );

    res.status(201).json({ id: inquiryId, status: 'received' });
  } catch (error) {
    console.error('Error saving inquiry:', error);
    res.status(500).json({ error: 'Failed to record inquiry' });
  }
});

// 5. GET /inquiries (Bearer Protected)
app.get('/inquiries', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    const inquiries = result.rows.map(row => ({
      id: row.id,
      type: row.type,
      companyName: row.company_name,
      contactPerson: row.contact_person,
      phone: row.phone,
      email: row.email,
      gstOrLicense: row.gst_or_license,
      state: row.state,
      city: row.city,
      products: row.products,
      volume: row.volume,
      message: row.message,
      createdAt: row.created_at
    }));
    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. POST /auth/login
app.post('/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [identifier]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(authUser, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: authUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sun Agri Science API active on port ${PORT}`);
});
