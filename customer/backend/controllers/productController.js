const db = require('../config/db');

// Get all products with pagination and filters
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : null;

    let whereClause = 'WHERE p.status = "active"';
    let queryParams = [];

    // Add price filters
    if (minPrice !== null) {
      whereClause += ' AND p.price >= ?';
      queryParams.push(minPrice);
    }
    if (maxPrice !== null) {
      whereClause += ' AND p.price <= ?';
      queryParams.push(maxPrice);
    }

    // Add category filter
    if (categoryId) {
      whereClause += ' AND p.category_id = ?';
      queryParams.push(categoryId);
    }

    // Get total count
    const [countResult] = await db.query(`
      SELECT COUNT(*) as total 
      FROM products p 
      ${whereClause}
    `, queryParams);

    // Get products
    const [products] = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.images,
        p.quantity,
        p.category_id,
        p.subcategory_id,
        p.created_at,
        c.name as category_name,
        sc.name as subcategory_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(countResult[0].total / limit),
          totalProducts: countResult[0].total,
          hasNextPage: page < Math.ceil(countResult[0].total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (!productId || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const [products] = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.images,
        p.quantity,
        p.category_id,
        p.subcategory_id,
        p.created_at,
        c.name as category_name,
        sc.name as subcategory_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      WHERE p.id = ? AND p.status = "active"
    `, [productId]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = {
      ...products[0],
      images: products[0].images ? JSON.parse(products[0].images) : []
    };

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const query = req.params.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchTerm = `%${query}%`;

    // Get total count
    const [countResult] = await db.query(`
      SELECT COUNT(*) as total 
      FROM products p 
      WHERE p.status = "active" AND (p.name LIKE ? OR p.description LIKE ?)
    `, [searchTerm, searchTerm]);

    // Get products
    const [products] = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.images,
        p.quantity,
        p.category_id,
        p.subcategory_id,
        c.name as category_name,
        sc.name as subcategory_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      WHERE p.status = "active" AND (p.name LIKE ? OR p.description LIKE ?)
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [searchTerm, searchTerm, limit, offset]);

    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(countResult[0].total / limit),
          totalProducts: countResult[0].total,
          hasNextPage: page < Math.ceil(countResult[0].total / limit),
          hasPrevPage: page > 1
        },
        searchQuery: query
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products'
    });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    if (!categoryId || categoryId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    // Get total count
    const [countResult] = await db.query(`
      SELECT COUNT(*) as total 
      FROM products p 
      WHERE p.status = "active" AND p.category_id = ?
    `, [categoryId]);

    // Get products
    const [products] = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.images,
        p.quantity,
        p.category_id,
        p.subcategory_id,
        c.name as category_name,
        sc.name as subcategory_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      WHERE p.status = "active" AND p.category_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [categoryId, limit, offset]);

    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(countResult[0].total / limit),
          totalProducts: countResult[0].total,
          hasNextPage: page < Math.ceil(countResult[0].total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Get products by subcategory
exports.getProductsBySubcategory = async (req, res) => {
  try {
    const subcategoryId = parseInt(req.params.subcategoryId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    if (!subcategoryId || subcategoryId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subcategory ID'
      });
    }

    // Get total count
    const [countResult] = await db.query(`
      SELECT COUNT(*) as total
      FROM products p
      WHERE p.status = "active" AND p.subcategory_id = ?
    `, [subcategoryId]);

    // Get products
    const [products] = await db.query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.images,
        p.quantity,
        p.category_id,
        p.subcategory_id,
        c.name as category_name,
        sc.name as subcategory_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      WHERE p.status = "active" AND p.subcategory_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [subcategoryId, limit, offset]);

    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(countResult[0].total / limit),
          totalProducts: countResult[0].total,
          hasNextPage: page < Math.ceil(countResult[0].total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get products by subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const [products] = await db.query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.images,
        p.quantity,
        p.category_id,
        p.subcategory_id,
        c.name as category_name,
        sc.name as subcategory_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      WHERE p.status = "active" AND p.featured = 1
      ORDER BY p.created_at DESC
      LIMIT ?
    `, [limit]);

    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));

    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT id, name, description
      FROM categories
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// Get subcategories by category
exports.getSubcategories = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);

    if (!categoryId || categoryId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const [subcategories] = await db.query(`
      SELECT id, name, category_id
      FROM subcategories
      WHERE category_id = ?
      ORDER BY name ASC
    `, [categoryId]);

    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategories'
    });
  }
};

// Get all subcategories
exports.getAllSubcategories = async (req, res) => {
  try {
    const [subcategories] = await db.query(`
      SELECT s.id, s.name, s.category_id, c.name as category_name
      FROM subcategories s
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY c.name ASC, s.name ASC
    `);

    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    console.error('Get all subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all subcategories'
    });
  }
};

// Get product reviews (placeholder - implement when review system is added)
exports.getProductReviews = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (!productId || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // For now, return empty array - implement when review system is added
    res.json({
      success: true,
      data: {
        reviews: [],
        averageRating: 0,
        totalReviews: 0
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product reviews'
    });
  }
};

// Get related products
exports.getRelatedProducts = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 4;

    if (!productId || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Get the product's category to find related products
    const [currentProduct] = await db.query(`
      SELECT category_id, subcategory_id
      FROM products
      WHERE id = ? AND status = "active"
    `, [productId]);

    if (currentProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { category_id, subcategory_id } = currentProduct[0];

    // Get related products from same subcategory or category
    const [products] = await db.query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.images,
        p.quantity,
        p.category_id,
        p.subcategory_id,
        c.name as category_name,
        sc.name as subcategory_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      WHERE p.status = "active"
        AND p.id != ?
        AND (p.subcategory_id = ? OR p.category_id = ?)
      ORDER BY
        CASE WHEN p.subcategory_id = ? THEN 1 ELSE 2 END,
        p.created_at DESC
      LIMIT ?
    `, [productId, subcategory_id, category_id, subcategory_id, limit]);

    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));

    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    console.error('Get related products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related products'
    });
  }
};
