// Scan Service - Connects to Backend API
const API_BASE_URL = 'http://localhost:5001/api';

export const scanService = {
  // Record a new scan
  recordScan: async (barcode, productName, prices) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          barcode,
          productName,
          prices
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to record scan');
      }

      return data.data;
    } catch (error) {
      console.error('Record scan error:', error);
      throw error;
    }
  },

  // Get scan history
  getScanHistory: async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No token found. Please login.');
      }

      const response = await fetch(`${API_BASE_URL}/scans/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get scan history');
      }

      return data.data;
    } catch (error) {
      console.error('Get scan history error:', error);
      throw error;
    }
  },
};

export default scanService;