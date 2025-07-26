require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Test each route file individually
console.log('Testing customer routes...');
try {
  const customerRoutes = require("./routes/customerRoutes");
  app.use("/api/customers", customerRoutes);
  console.log('✅ Customer routes OK');
} catch (error) {
  console.error('❌ Customer routes error:', error.message);
  process.exit(1);
}

console.log('Testing product routes...');
try {
  const productRoutes = require("./routes/productRoutes");
  app.use("/api/products", productRoutes);
  console.log('✅ Product routes OK');
} catch (error) {
  console.error('❌ Product routes error:', error.message);
  process.exit(1);
}

console.log('Testing cart routes...');
try {
  const cartRoutes = require("./routes/cartRoutes");
  app.use("/api/cart", cartRoutes);
  console.log('✅ Cart routes OK');
} catch (error) {
  console.error('❌ Cart routes error:', error.message);
  process.exit(1);
}

console.log('Testing order routes...');
try {
  const orderRoutes = require("./routes/orderRoutes");
  app.use("/api/orders", orderRoutes);
  console.log('✅ Order routes OK');
} catch (error) {
  console.error('❌ Order routes error:', error.message);
  process.exit(1);
}

console.log('Testing wishlist routes...');
try {
  const wishlistRoutes = require("./routes/wishlistRoutes");
  app.use("/api/wishlist", wishlistRoutes);
  console.log('✅ Wishlist routes OK');
} catch (error) {
  console.error('❌ Wishlist routes error:', error.message);
  process.exit(1);
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Minimal Server running on port ${PORT}`);
});
