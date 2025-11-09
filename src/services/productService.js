// Product Service - Connects to Backend API
const API_BASE_URL = 'http://localhost:5001/api';

export const productService = {
  // Get product information by barcode
  getProductByBarcode: async (barcode) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/products/${barcode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error(data.message || 'Failed to get product');
      }

      return data.data;
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  },

  // Search products (if implemented on backend)
  searchProducts: async (query) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Search failed');
      }

      return data.data;
    } catch (error) {
      console.error('Search products error:', error);
      throw error;
    }
  },
};

// Alias function for backwards compatibility with existing frontend code
export const fetchProductFromAPI = async (barcode) => {
  return productService.getProductByBarcode(barcode);
};

export default productService;