import React, { useState, useEffect, lazy, Suspense } from 'react';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { RouterProvider } from './contexts/RouterContext';
import ErrorBoundary from './components/ErrorBoundary';
import TulipLogo from './components/TulipLogo';
import { Loader } from 'lucide-react';

// Lazy load components for better performance
const SplashScreen = lazy(() => import('./components/SplashScreen'));
const LoginScreen = lazy(() => import('./components/LoginScreen'));
const AppHeader = lazy(() => import('./components/AppHeader'));
const AppContent = lazy(() => import('./components/AppContent'));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
    <div className="text-center">
      <TulipLogo size="large" className="animate-pulse mx-auto mb-4" />
      <Loader className="animate-spin text-purple-600 mx-auto" size={32} />
    </div>
  </div>
);

// Add custom CSS for optimized Tailwind
const OptimizedStyles = () => (
  <style>{`
    /* Critical CSS - Minimal Tailwind utilities */
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .min-h-screen { min-height: 100vh; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .max-w-md { max-width: 28rem; }
    .bg-white { background-color: #ffffff; }
    .text-center { text-align: center; }
    .animate-spin { animation: spin 1s linear infinite; }
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
  `}</style>
);

function MainApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  // Hide splash screen after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleShowLogin = (show) => {
    setShowLogin(show);
  };

  if (showSplash) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </Suspense>
    );
  }

  return (
    <ErrorBoundary>
      <div className="App max-w-md mx-auto bg-white min-h-screen relative">
        <Suspense fallback={<LoadingFallback />}>
          <AppHeader onShowLogin={handleShowLogin} />
          <AppContent onShowLogin={handleShowLogin} />
          
          {/* Login Modal */}
          {showLogin && (
            <LoginScreen onClose={() => setShowLogin(false)} />
          )}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

function App() {
  // Load Tailwind CSS only once
  useEffect(() => {
    // Check if already loaded
    if (!document.querySelector('link[href*="tailwindcss"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
      link.onload = () => {
        console.log('Tailwind CSS loaded');
      };
      document.head.appendChild(link);
    }
  }, []);

  return (
    <>
      <OptimizedStyles />
      <ErrorBoundary>
        <AuthProvider>
          <RouterProvider>
            <MainApp />
          </RouterProvider>
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;