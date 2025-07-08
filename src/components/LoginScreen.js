import React, { useState } from 'react';
import { Mail, Lock, Loader } from 'lucide-react';
import TulipLogo from './TulipLogo';

const LoginScreen = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && !agreedToTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }
    
    setLoading(true);
    
    // Mock login - in production, this would call your API
    setTimeout(() => {
      const mockUser = {
        id: '123',
        email: email,
        name: email.split('@')[0],
        tier: 'free',
        scansRemaining: 5,
        scansThisMonth: 0,
        joinDate: new Date().toISOString(),
        subscriptionExpiry: null
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      setLoading(false);
      onClose();
      window.location.reload();
    }, 1000);
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading(true);
    
    // Mock Google Sign-In
    // In production, you would use the actual Google Sign-In SDK
    setTimeout(() => {
      const mockUser = {
        id: 'google_123',
        email: 'user@gmail.com',
        name: 'Google User',
        tier: 'free',
        scansRemaining: 5,
        scansThisMonth: 0,
        joinDate: new Date().toISOString(),
        subscriptionExpiry: null,
        authProvider: 'google'
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      setSocialLoading(false);
      onClose();
      window.location.reload();
    }, 1500);
  };

  const handleAppleSignIn = async () => {
    setSocialLoading(true);
    
    // Mock Apple Sign-In
    // In production, you would use the actual Apple Sign-In SDK
    setTimeout(() => {
      const mockUser = {
        id: 'apple_123',
        email: 'user@icloud.com',
        name: 'Apple User',
        tier: 'free',
        scansRemaining: 5,
        scansThisMonth: 0,
        joinDate: new Date().toISOString(),
        subscriptionExpiry: null,
        authProvider: 'apple'
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      setSocialLoading(false);
      onClose();
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
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

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={socialLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            onClick={handleAppleSignIn}
            disabled={socialLoading}
            className="w-full flex items-center justify-center gap-3 bg-black text-white rounded-lg py-3 px-4 hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-400"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-400"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="mt-4">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
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
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!isLogin && !agreedToTerms)}
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
              onClick={() => setIsLogin(!isLogin)}
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
        >
          ✕
        </button>
      </div>

      {/* Terms and Privacy Modals */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Terms of Service</h3>
            <p className="text-sm text-gray-600">
              [Terms would be displayed here - import the TermsOfService component]
            </p>
            <button
              onClick={() => setShowTerms(false)}
              className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showPrivacy && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Privacy Policy</h3>
            <p className="text-sm text-gray-600">
              [Privacy policy would be displayed here - import the PrivacyPolicy component]
            </p>
            <button
              onClick={() => setShowPrivacy(false)}
              className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;