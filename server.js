const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fear_secret_key_2025';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'fear_admin_secret_2025';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fear_store';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '24h';
const ADMIN_TOKEN_EXPIRY = process.env.ADMIN_TOKEN_EXPIRY || '8h';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// MongoDB Schemas
const adminUserSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const enquirySchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: 'new' },
  created_at: { type: Date, default: Date.now }
});

const paymentSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  order_id: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, default: 'online' },
  status: { type: String, default: 'completed' },
  created_at: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  category: String,
  stock: { type: Number, default: 100 }
});

const userSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now }
});

const orderItemSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  order_id: { type: String, required: true },
  product_id: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const cartItemSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  user_id: { type: String, required: true },
  product_id: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  user_id: String,
  total: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  shipping_address: String,
  created_at: { type: Date, default: Date.now }
});

// Create Models
const AdminUser = mongoose.model('AdminUser', adminUserSchema);
const Enquiry = mongoose.model('Enquiry', enquirySchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);
const OrderItem = mongoose.model('OrderItem', orderItemSchema);
const CartItem = mongoose.model('CartItem', cartItemSchema);

// Initialize sample data
async function initializeData() {
  try {
    // Check if products already exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const products = [
        {
          id: 'zeus-whey',
          name: 'Zeus Whey',
          description: 'The Ultimate Strength Formula - Premium whey protein for maximum muscle growth',
          price: 2999,
          image: 'assets/product.png',
          category: 'supplements'
        },
        {
          id: 'ares-preworkout',
          name: 'Ares Pre-workout',
          description: 'Unleash Your Power Surge - High-intensity pre-workout for explosive energy',
          price: 1999,
          image: 'assets/product.png',
          category: 'supplements'
        },
        {
          id: 'hermes-energy',
          name: 'Hermes Energy',
          description: 'For Unmatched Speed & Endurance - Natural energy booster for peak performance',
          price: 1499,
          image: 'assets/product.png',
          category: 'supplements'
        },
        {
          id: 'athena-focus',
          name: 'Athena Focus',
          description: 'A True Brain Booster - Cognitive enhancement for mental clarity',
          price: 1799,
          image: 'assets/product.png',
          category: 'supplements'
        },
        {
          id: 'olympian-tee',
          name: 'The Olympian Tee',
          description: 'Premium Cotton-Poly Blend with Athletic Fit & High-Durability FEAR Logo Print',
          price: 1999,
          image: 'assets/merchandise.png',
          category: 'apparel'
        }
      ];

      await Product.insertMany(products);
      console.log('Sample products inserted');
    }

    // Check if admin user exists
    const adminCount = await AdminUser.countDocuments();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await AdminUser.create({
        username: 'admin',
        password: hashedPassword
      });
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Initialize data after connection
mongoose.connection.once('open', () => {
  initializeData();
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// API Routes

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User registration
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const userId = uuidv4();

    const user = await User.create({
      id: userId,
      name,
      email,
      password: hashedPassword
    });
    
    const token = jwt.sign({ userId, email, name }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    res.json({ token, user: { id: userId, name, email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create order
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { shippingAddress } = req.body;
  const orderId = uuidv4();

  try {
    // Get cart items for the user
    const cartItems = await CartItem.find({ user_id: req.user.userId });
    
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total from cart items
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    await Order.create({
      id: orderId,
      user_id: req.user.userId,
      total,
      shipping_address: JSON.stringify(shippingAddress)
    });

    // Create order items
    const orderItems = cartItems.map(item => ({
      id: uuidv4(),
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));

    await OrderItem.insertMany(orderItems);

    // Create payment record
    await Payment.create({
      id: uuidv4(),
      order_id: orderId,
      amount: total,
      status: 'completed'
    });

    // Clear user's cart after successful order
    await CartItem.deleteMany({ user_id: req.user.userId });

    res.json({ orderId, message: 'Order created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user orders
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.userId }).sort({ created_at: -1 });
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const items = await OrderItem.find({ order_id: order.id });
      return {
        ...order.toObject(),
        items: items.map(item => `${item.product_id}:${item.quantity}:${item.price}`).join(',')
      };
    }));

    res.json(ordersWithItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user cart
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cartItems = await CartItem.find({ user_id: req.user.userId });
    
    // Get product details for each cart item
    const cartWithProducts = await Promise.all(cartItems.map(async (item) => {
      const product = await Product.findOne({ id: item.product_id });
      return {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        name: product?.name || 'Unknown Product',
        image: product?.image || '',
        description: product?.description || ''
      };
    }));

    res.json(cartWithProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to cart
app.post('/api/cart', authenticateToken, async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  
  if (!product_id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    // Get product details
    const product = await Product.findOne({ id: product_id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already exists in cart
    const existingItem = await CartItem.findOne({ 
      user_id: req.user.userId, 
      product_id: product_id 
    });

    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      // Create new cart item
      await CartItem.create({
        user_id: req.user.userId,
        product_id: product_id,
        quantity: quantity,
        price: product.price
      });
    }

    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update cart item quantity
app.put('/api/cart/:id', authenticateToken, async (req, res) => {
  const { quantity } = req.body;
  
  if (quantity <= 0) {
    return res.status(400).json({ error: 'Quantity must be greater than 0' });
  }

  try {
    const cartItem = await CartItem.findOne({ 
      id: req.params.id, 
      user_id: req.user.userId 
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from cart
app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
  try {
    const result = await CartItem.deleteOne({ 
      id: req.params.id, 
      user_id: req.user.userId 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear user cart
app.delete('/api/cart', authenticateToken, async (req, res) => {
  try {
    await CartItem.deleteMany({ user_id: req.user.userId });
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    await Enquiry.create({
      id: uuidv4(),
      name,
      email,
      message
    });
    res.json({ message: 'Thank you for your enquiry. We will get back to you soon!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, ADMIN_SECRET, (err, admin) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.admin = admin;
    next();
  });
};

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await AdminUser.findOne({ username });
    if (!admin) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ adminId: admin.id, username: admin.username }, ADMIN_SECRET, { expiresIn: ADMIN_TOKEN_EXPIRY });
    res.json({ token, admin: { id: admin.id, username: admin.username } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin dashboard data
app.get('/api/admin/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const newEnquiries = await Enquiry.countDocuments({ status: 'new' });
    const recentOrders = await Order.find().sort({ created_at: -1 }).limit(5);
    const recentEnquiries = await Enquiry.find().sort({ created_at: -1 }).limit(5);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      newEnquiries,
      recentOrders,
      recentEnquiries
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin orders management
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const orders = await Order.find(filter).sort({ created_at: -1 });
    
    // Get user emails and order items
    const ordersWithDetails = await Promise.all(orders.map(async (order) => {
      const user = await User.findOne({ id: order.user_id });
      const items = await OrderItem.find({ order_id: order.id });
      
      return {
        ...order.toObject(),
        user_email: user?.email || 'N/A',
        items: items.map(item => `${item.product_id}:${item.quantity}:${item.price}`).join(',')
      };
    }));

    res.json(ordersWithDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order
app.get('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const user = await User.findOne({ id: order.user_id });
    const items = await OrderItem.find({ order_id: order.id });

    res.json({
      ...order.toObject(),
      user_email: user?.email || 'N/A',
      items: items.map(item => `${item.product_id}:${item.quantity}:${item.price}`).join(',')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
app.put('/api/admin/orders/:id/status', authenticateAdmin, async (req, res) => {
  const { status } = req.body;
  
  try {
    await Order.updateOne({ id: req.params.id }, { status });
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin enquiries management
app.get('/api/admin/enquiries', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const enquiries = await Enquiry.find(filter).sort({ created_at: -1 });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single enquiry
app.get('/api/admin/enquiries/:id', authenticateAdmin, async (req, res) => {
  try {
    const enquiry = await Enquiry.findOne({ id: req.params.id });
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }
    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update enquiry status
app.put('/api/admin/enquiries/:id/status', authenticateAdmin, async (req, res) => {
  const { status } = req.body;
  
  try {
    await Enquiry.updateOne({ id: req.params.id }, { status });
    res.json({ message: 'Enquiry status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin payments management
app.get('/api/admin/payments', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const payments = await Payment.find(filter).sort({ created_at: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin users management
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ created_at: -1 });
    
    // Get order statistics for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const orders = await Order.find({ user_id: user.id });
      const orderCount = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
      const lastOrderDate = orders.length > 0 ? Math.max(...orders.map(o => new Date(o.created_at))) : null;

      return {
        ...user.toObject(),
        order_count: orderCount,
        total_spent: totalSpent,
        last_order_date: lastOrderDate
      };
    }));

    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single user with recent orders
app.get('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const orders = await Order.find({ user_id: req.params.id });
    const recentOrders = await Order.find({ user_id: req.params.id }).sort({ created_at: -1 }).limit(5);
    
    const orderCount = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const lastOrderDate = orders.length > 0 ? Math.max(...orders.map(o => new Date(o.created_at))) : null;

    res.json({
      ...user.toObject(),
      order_count: orderCount,
      total_spent: totalSpent,
      last_order_date: lastOrderDate,
      recent_orders: recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user status
app.put('/api/admin/users/:id/status', authenticateAdmin, async (req, res) => {
  const { status } = req.body;
  
  try {
    await User.updateOne({ id: req.params.id }, { status });
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  const userId = req.params.id;
  
  try {
    // Delete user's order items first
    const userOrders = await Order.find({ user_id: userId });
    const orderIds = userOrders.map(order => order.id);
    
    await OrderItem.deleteMany({ order_id: { $in: orderIds } });
    await Order.deleteMany({ user_id: userId });
    await User.deleteOne({ id: userId });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`FEAR Store server running on port ${PORT}`);
});