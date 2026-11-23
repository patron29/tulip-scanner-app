import React, { useState, useCallback } from 'react';
import { Mail, Lock, Loader, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ValidationRules } from '../utils/validation';
import TulipLogo from './TulipLogo';
import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';

const LoginScreen = ({ onClose }) => {
  const { login, register, socialLogin, error: authError, clearError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Clear errors when switching between login/register
  const handleModeSwitch = useCallback(() => {
    setIsLogin(!isLogin);
    setErrors({});
    clearError();
    setPassword('');
    setConfirmPassword('');
  }, [isLogin, clearError]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Validate email
    const emailValidation = ValidationRules.validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.errors[0];
    }
    
    // Validate password
    const passwordValidation = ValidationRules.validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }
    
    // Additional validation for registration
    if (!isLogin) {
      if (!name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (!agreedToTerms) {
        newErrors.terms = 'You must agree to the Terms of Service and Privacy Policy';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, confirmPassword, name, isLogin, agreedToTerms]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    clearError();
    
    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(email, password, name);
      }
      
      if (result.success) {
        onClose();
      } else {
        setErrors({ submit: result.error });
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle social sign in
  const handleSocialSignIn = async (provider) => {
    setSocialLoading(true);
    clearError();
    
    try {
      const result = await socialLogin(provider);
      if (result.success) {
        onClose();
      } else {
        setErrors({ submit: result.error });
      }
    } catch (err) {
      setErrors({ submit: 'Social login failed. Please try again.' });
    } finally {
      setSocialLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return null;
    const validation = ValidationRules.validatePassword(password);
    return validation.strength;
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <TulipLogo size="large" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Welcome to Tulip' : 'Join Tulip'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Sign in to start scanning' : 'Start your smart shopping journey'}
          </p>
        </div>

        {/* Error display */}
        {(errors.submit || authError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{errors.submit || authError}</p>
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleSocialSignIn('google')}
            disabled={socialLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Sign in with Google"
          >
            {socialLoading ? (
              <Loader className="animate-spin" size={20} />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-gray-700 font-medium">Continue with Google</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleSocialSignIn('apple')}
            disabled={socialLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-black text-white rounded-lg py-3 px-4 hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Sign in with Apple"
          >
            {socialLoading ? (
              <Loader className="animate-spin" size={20} />
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className="font-medium">Continue with Apple</span>
              </>
            )}
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-pink-400 ${
                  errors.name ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="John Doe"
                aria-label="Your name"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-pink-400 ${
                  errors.email ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="you@example.com"
                required
                aria-label="Email address"
                aria-invalid={!!errors.email}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-pink-400 ${
                  errors.password ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="••••••••"
                required
                aria-label="Password"
                aria-invalid={!!errors.password}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
            
            {!isLogin && password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Password strength:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength === 'strong' ? 'text-green-600' :
                    passwordStrength === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {passwordStrength}
                  </span>
                </div>
                <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      passwordStrength === 'strong' ? 'bg-green-500 w-full' :
                      passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' :
                      'bg-red-500 w-1/3'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-pink-400 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="••••••••"
                  required
                  aria-label="Confirm password"
                  aria-invalid={!!errors.confirmPassword}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {!isLogin && (
            <div className="mt-4">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  aria-label="Agree to terms"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-pink-600 hover:text-pink-700 underline"
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacy(true)}
                    className="text-pink-600 hover:text-pink-700 underline"
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-xs text-red-600">{errors.terms}</p>
              )}
            </div>
          )}

          {isLogin && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => alert('Password reset functionality would be implemented here')}
                className="text-sm text-pink-600 hover:text-pink-700"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || socialLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={handleModeSwitch}
              className="text-pink-600 font-semibold hover:text-pink-700"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <button
                onClick={() => setShowTerms(true)}
                className="text-pink-600 hover:text-pink-700 underline"
              >
                Terms
              </button>
              {' '}and{' '}
              <button
                onClick={() => setShowPrivacy(true)}
                className="text-pink-600 hover:text-pink-700 underline"
              >
                Privacy Policy
              </button>
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Close dialog"
        >
          ✕
        </button>
      </div>

      {/* Terms and Privacy Modals */}
      {showTerms && (
        <TermsOfService onClose={() => setShowTerms(false)} />
      )}

      {showPrivacy && (
        <PrivacyPolicy onClose={() => setShowPrivacy(false)} />
      )}
    </div>
  );
};

export default LoginScreen;