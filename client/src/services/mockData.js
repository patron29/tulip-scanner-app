export const mockProducts = {
    // Electronics
    '0885909950805': {
      name: 'MacBook Pro 14-inch',
      brand: 'Apple',
      category: 'Electronics/Laptops',
      ingredients_text: 'Specifications: M1 Pro chip, 16GB RAM, 512GB SSD, 14.2-inch Liquid Retina XDR display',
      certifications: ['Energy Star', 'EPEAT Gold'],
      isHealthProduct: false
    },
    '0190199267084': {
      name: 'AirPods Pro',
      brand: 'Apple',
      category: 'Electronics/Audio',
      ingredients_text: 'Features: Active Noise Cancellation, Transparency mode, Spatial audio, MagSafe charging case',
      certifications: ['Bluetooth 5.0 Certified'],
      isHealthProduct: false
    },
    // Clothing
    '0191234567890': {
      name: 'Classic Cotton T-Shirt',
      brand: 'Nike',
      category: 'Apparel/T-Shirts',
      ingredients_text: 'Material: 100% Cotton, Machine washable, Crew neck, Regular fit',
      certifications: ['Sustainable Cotton', 'Fair Trade'],
      isHealthProduct: false
    },
    // Home Goods
    '0193456789012': {
      name: 'Instant Pot Duo 7-in-1',
      brand: 'Instant Brands',
      category: 'Home/Kitchen Appliances',
      ingredients_text: 'Features: Pressure cooker, Slow cooker, Rice cooker, Steamer, Sauté, Yogurt maker, Warmer',
      certifications: ['UL Certified', 'FDA Approved'],
      isHealthProduct: false
    },
    // Sports
    '0195678901234': {
      name: 'Yoga Mat Premium',
      brand: 'Manduka',
      category: 'Sports/Fitness',
      ingredients_text: 'Material: Natural rubber, 6mm thickness, Non-slip surface, Eco-friendly',
      certifications: ['OEKO-TEX Certified', 'Latex-Free'],
      isHealthProduct: false
    },
    // Beauty
    '3600531369429': {
      name: 'L\'Oreal Paris Eye Cream',
      brand: 'L\'Oreal Paris',
      category: 'Beauty/Skincare',
      ingredients_text: 'Aqua, Glycerin, Dimethicone, Hyaluronic Acid, Caffeine, Vitamin E',
      certifications: ['Dermatologist Tested'],
      isHealthProduct: true
    },
    // Default
    'default': {
      name: 'Universal Product',
      brand: 'Various Brands',
      category: 'General Merchandise',
      ingredients_text: 'Product specifications and details vary by item',
      certifications: [],
      isHealthProduct: false
    }
  };
  
  export const couponTypes = [
    { type: 'percentage', value: 10, code: 'SAVE10', description: '10% off your purchase' },
    { type: 'percentage', value: 15, code: 'DEAL15', description: '15% off for new customers' },
    { type: 'percentage', value: 20, code: 'MEGA20', description: '20% off select items' },
    { type: 'fixed', value: 20, code: 'MINUS20', description: '$20 off orders over $100' },
    { type: 'fixed', value: 50, code: 'BIG50', description: '$50 off orders over $250' },
    { type: 'freeship', value: 0, code: 'SHIPFREE', description: 'Free shipping on any order' },
  ];