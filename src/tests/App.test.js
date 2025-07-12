// App.test.js - Enhanced test suite
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('shows splash screen initially', () => {
    render(<App />);
    expect(screen.getByText(/Smart Shopping, Beautiful Savings/i)).toBeInTheDocument();
  });

  test('shows login button when not authenticated', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
    });
  });
});

// AuthContext.test.js
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import authService from './services/authService';

jest.mock('./services/authService');

describe('AuthContext', () => {
  test('provides authentication methods', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('register');
    expect(result.current).toHaveProperty('user');
  });

  test('login updates user state', async () => {
    const mockUser = { id: '1', email: 'test@example.com', tier: 'free' };
    authService.login.mockResolvedValue(mockUser);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.login('test@example.com', 'password');
      expect(response.success).toBe(true);
    });

    expect(result.current.user).toEqual(mockUser);
  });

  test('logout clears user state', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('tulip_user');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('tulip_token');
  });
});

// validation.test.js
import { ValidationRules } from './utils/validation';

describe('ValidationRules', () => {
  describe('sanitizeInput', () => {
    test('removes dangerous characters', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = ValidationRules.sanitizeInput(input);
      expect(sanitized).toBe('scriptalert("xss")/script');
    });

    test('removes javascript: protocol', () => {
      const input = 'javascript:alert(1)';
      const sanitized = ValidationRules.sanitizeInput(input);
      expect(sanitized).toBe('alert(1)');
    });
  });

  describe('validateBarcode', () => {
    test('validates correct barcode', () => {
      const result = ValidationRules.validateBarcode('123456789012');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects short barcode', () => {
      const result = ValidationRules.validateBarcode('1234567');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Barcode must be at least 8 digits');
    });

    test('removes non-numeric characters', () => {
      const result = ValidationRules.validateBarcode('1234-5678-9012');
      expect(result.isValid).toBe(true);
      expect(result.cleanValue).toBe('123456789012');
    });
  });

  describe('validateEmail', () => {
    test('validates correct email', () => {
      const result = ValidationRules.validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
    });

    test('rejects invalid email', () => {
      const result = ValidationRules.validateEmail('not-an-email');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });
  });

  describe('validatePassword', () => {
    test('validates strong password', () => {
      const result = ValidationRules.validatePassword('StrongP@ss123');
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('strong');
    });

    test('rejects weak password', () => {
      const result = ValidationRules.validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

// LoginScreen.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginScreen from './components/LoginScreen';
import { AuthProvider } from './contexts/AuthContext';

const renderWithAuth = (component) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('LoginScreen', () => {
  test('renders login form', () => {
    renderWithAuth(<LoginScreen onClose={jest.fn()} />);
    
    expect(screen.getByText(/Welcome to Tulip/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  });

  test('switches to register form', async () => {
    renderWithAuth(<LoginScreen onClose={jest.fn()} />);
    
    const signUpButton = screen.getByText(/Sign Up/i);
    await userEvent.click(signUpButton);
    
    expect(screen.getByText(/Join Tulip/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/John Doe/i)).toBeInTheDocument();
  });

  test('validates email format', async () => {
    renderWithAuth(<LoginScreen onClose={jest.fn()} />);
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
    });
  });

  test('shows password strength indicator', async () => {
    renderWithAuth(<LoginScreen onClose={jest.fn()} />);
    
    // Switch to register
    await userEvent.click(screen.getByText(/Sign Up/i));
    
    const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
    await userEvent.type(passwordInput, 'StrongP@ss123');
    
    await waitFor(() => {
      expect(screen.getByText(/strong/i)).toBeInTheDocument();
    });
  });
});

// HomeScreen.test.js
import { render, screen } from '@testing-library/react';
import HomeScreen from './components/HomeScreen';

describe('HomeScreen', () => {
  const defaultProps = {
    setCurrentScreen: jest.fn(),
    manualBarcode: '',
    setManualBarcode: jest.fn(),
    searchByBarcode: jest.fn(),
    isLoading: false,
    error: '',
    savedProducts: [],
    setScannedProduct: jest.fn(),
    user: { tier: 'free', scansRemaining: 5 },
    remainingScans: 5,
    setShowLogin: jest.fn(),
    compactView: false,
  };

  test('displays scan button', () => {
    render(<HomeScreen {...defaultProps} />);
    expect(screen.getByText(/Scan Any Product/i)).toBeInTheDocument();
  });

  test('shows remaining scans for logged in user', () => {
    render(<HomeScreen {...defaultProps} />);
    expect(screen.getByText(/Remaining Scans/i)).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  test('displays saved products', () => {
    const savedProducts = [
      { barcode: '123', name: 'Test Product', brand: 'Test Brand', category: 'Electronics', rating: 4.5 }
    ];
    render(<HomeScreen {...defaultProps} savedProducts={savedProducts} />);
    
    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Brand/i)).toBeInTheDocument();
  });

  test('shows login prompt for guest users', () => {
    render(<HomeScreen {...defaultProps} user={null} />);
    expect(screen.getByText(/Create a free account/i)).toBeInTheDocument();
  });
});

// ProductDetailScreen.test.js
import { render, screen } from '@testing-library/react';
import ProductDetailScreen from './components/ProductDetailScreen';

describe('ProductDetailScreen', () => {
  const mockProduct = {
    barcode: '123456789',
    name: 'Test Product',
    brand: 'Test Brand',
    category: 'Electronics',
    rating: 4.5,
    certifications: ['Energy Star'],
    pros: ['Good quality', 'Affordable'],
    cons: ['Limited warranty'],
    ingredients_text: 'Product specifications',
    isHealthProduct: false,
    healthScore: null
  };

  const defaultProps = {
    scannedProduct: mockProduct,
    setCurrentScreen: jest.fn(),
    saveProduct: jest.fn(),
    savedProducts: [],
    priceComparison: null,
    loadingPrices: false,
    fetchPriceComparison: jest.fn(),
    fetchCoupons: jest.fn(),
    availableCoupons: [],
    appliedCoupon: null,
    setAppliedCoupon: jest.fn(),
    setAvailableCoupons: jest.fn(),
    userTier: 'free',
    setShowUpgrade: jest.fn(),
    showPrices: true
  };

  test('displays product information', () => {
    render(<ProductDetailScreen {...defaultProps} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  test('shows certifications', () => {
    render(<ProductDetailScreen {...defaultProps} />);
    expect(screen.getByText('Energy Star')).toBeInTheDocument();
  });

  test('displays pros and cons', () => {
    render(<ProductDetailScreen {...defaultProps} />);
    expect(screen.getByText(/Good quality/)).toBeInTheDocument();
    expect(screen.getByText(/Limited warranty/)).toBeInTheDocument();
  });

  test('shows upgrade prompt for premium features', () => {
    render(<ProductDetailScreen {...defaultProps} />);
    expect(screen.getByText(/Price History Locked/i)).toBeInTheDocument();
  });
});