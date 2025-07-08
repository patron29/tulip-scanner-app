import { mockProducts } from './mockData';

export const fetchProductFromAPI = async (barcode) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const product = mockProducts[barcode] || mockProducts['default'];
    
    const details = product.isHealthProduct && product.ingredients_text.includes('Ingredients:') 
      ? product.ingredients_text.split(',').map(ing => ({
          name: ing.trim(),
          safety: 'approved',
          purpose: 'Component'
        }))
      : [{
          name: product.ingredients_text,
          safety: 'specification',
          purpose: 'Product Details'
        }];
    
    return {
      barcode: barcode,
      name: product.name,
      brand: product.brand,
      category: product.category,
      image: null,
      ingredients: details,
      certifications: product.certifications,
      pros: ['Quality product', 'Trusted brand', 'Good reviews'],
      cons: ['Check compatibility', 'Compare prices'],
      healthScore: product.isHealthProduct ? Math.floor(Math.random() * 20) + 80 : null,
      rating: (4 + Math.random()).toFixed(1),
      ingredients_text: product.ingredients_text,
      isHealthProduct: product.isHealthProduct
    };
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch product data');
  }
};

export const saveProductToFavorites = (products, newProduct) => {
  if (!products.find(p => p.barcode === newProduct.barcode)) {
    return [...products, newProduct];
  }
  return products;
};