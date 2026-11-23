// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Shared product lookup: DB first, Open Food Facts fallback, then save.
// Returns the product document, or null when it cannot be found anywhere.
async function lookupProduct(barcode) {
  let product = await Product.findOne({ barcode });

  if (!product) {
    product = await fetchFromExternalAPI(barcode);
    if (!product) return null;
    product = new Product(product);
    await product.save();
  }

  return product;
}

// Enforces the monthly scan limit for the user's tier.
// Returns { allowed: true } or { allowed: false, scansRemaining: 0 }.
async function checkScanLimit(user) {
  const limits = { free: 5, basic: 100, premium: Infinity };
  const limit = limits[user.tier] ?? 5;
  if (user.tier !== 'premium' && user.scansThisMonth >= limit) {
    return { allowed: false, scansRemaining: 0 };
  }
  return { allowed: true };
}

async function recordScanUsage(product, user) {
  product.scanCount += 1;
  await product.save();

  user.scansThisMonth += 1;
  await user.save();

  const limits = { free: 5, basic: 100, premium: Infinity };
  const limit = limits[user.tier] ?? 5;
  return user.tier === 'premium' ? 'Unlimited' : limit - user.scansThisMonth;
}

// GET /api/products/scan/:barcode - Scan a product (legacy route)
router.get('/scan/:barcode', auth, async (req, res) => {
  try {
    const { barcode } = req.params;
    const user = req.user;

    const limit = await checkScanLimit(user);
    if (!limit.allowed) {
      return res.status(403).json({
        message: 'No scans remaining. Please upgrade your plan.',
        scansRemaining: 0
      });
    }

    const product = await lookupProduct(barcode);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const scansRemaining = await recordScanUsage(product, user);

    res.json({
      success: true,
      data: product,
      product,
      scansRemaining,
      scansThisMonth: user.scansThisMonth
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ message: 'Error scanning product' });
  }
});

// Helper function to fetch from external API
async function fetchFromExternalAPI(barcode) {
  try {
    // Option 1: Open Food Facts API (free, no key needed)
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    if (response.ok) {
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;

        return {
          barcode: barcode,
          name: product.product_name || 'Unknown Product',
          brand: product.brands || 'Unknown Brand',
          category: product.categories || 'General',
          description: product.ingredients_text || '',
          imageUrl: product.image_url || null,
          ingredients: product.ingredients_text || '',
          nutritionFacts: {
            calories: product.nutriments?.energy_kcal || 0,
            fat: product.nutriments?.fat || 0,
            protein: product.nutriments?.proteins || 0,
            carbs: product.nutriments?.carbohydrates || 0,
            sugar: product.nutriments?.sugars || 0,
            sodium: product.nutriments?.sodium || 0
          }
        };
      }
    }

    // If Open Food Facts doesn't have it, return null
    return null;

  } catch (error) {
    console.error('External API error:', error);
    return null;
  }
}

// GET /api/products/search - Search products
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const products = await Product.find({
      $text: { $search: q }
    }).limit(20);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Search failed' });
  }
});

// GET /api/products/saved - Get user's saved products
router.get('/saved', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedProducts');
    res.json(user.savedProducts || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saved products' });
  }
});

// POST /api/products/save/:productId - Save a product
router.post('/save/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);

    // Check if already saved
    if (user.savedProducts.includes(productId)) {
      return res.status(400).json({ message: 'Product already saved' });
    }

    // Check save limit
    const maxSaved = user.tier === 'premium' ? Infinity : (user.tier === 'basic' ? 100 : 10);
    if (user.savedProducts.length >= maxSaved) {
      return res.status(403).json({
        message: `You've reached the maximum of ${maxSaved} saved products for your ${user.tier} plan.`
      });
    }

    user.savedProducts.push(productId);
    await user.save();

    res.json({ message: 'Product saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving product' });
  }
});

// DELETE /api/products/save/:productId - Remove saved product
router.delete('/save/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);

    user.savedProducts = user.savedProducts.filter(
      id => id.toString() !== productId
    );
    await user.save();

    res.json({ message: 'Product removed from saved' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing product' });
  }
});

// GET /api/products/:barcode - Get a product by barcode.
// This is the route the frontend actually calls (productService).
// Declared last so it does not swallow /search or /saved.
router.get('/:barcode', auth, async (req, res) => {
  try {
    const { barcode } = req.params;
    const user = req.user;

    const limit = await checkScanLimit(user);
    if (!limit.allowed) {
      return res.status(403).json({
        success: false,
        message: 'No scans remaining. Please upgrade your plan.',
        scansRemaining: 0
      });
    }

    const product = await lookupProduct(barcode);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const scansRemaining = await recordScanUsage(product, user);

    res.json({
      success: true,
      data: product,
      scansRemaining,
      scansThisMonth: user.scansThisMonth
    });
  } catch (error) {
    console.error('Product lookup error:', error);
    res.status(500).json({ success: false, message: 'Error looking up product' });
  }
});

module.exports = router;
