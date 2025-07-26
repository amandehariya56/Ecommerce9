require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Import routes one by one to find the problematic one
try {
  console.log('Loading customer routes...');
  const customerRoutes = require("./routes/customerRoutes");
  app.use("/api/customers", customerRoutes);
  console.log('✅ Customer routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading customer routes:', error.message);
}

try {
  console.log('Loading product routes...');
  const productRoutes = require("./routes/productRoutes");
  app.use("/api/products", productRoutes);
  console.log('✅ Product routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading product routes:', error.message);
}

try {
  console.log('Loading cart routes...');
  const cartRoutes = require("./routes/cartRoutes");
  app.use("/api/cart", cartRoutes);
  console.log('✅ Cart routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading cart routes:', error.message);
}

try {
  console.log('Loading order routes...');
  const orderRoutes = require("./routes/orderRoutes");
  app.use("/api/orders", orderRoutes);
  console.log('✅ Order routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading order routes:', error.message);
}

try {
  console.log('Loading wishlist routes...');
  const wishlistRoutes = require("./routes/wishlistRoutes");
  app.use("/api/wishlist", wishlistRoutes);
  console.log('✅ Wishlist routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading wishlist routes:', error.message);
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Test Server running on port ${PORT}`);
});
