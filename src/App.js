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

function MainApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Hide splash screen after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Make navigation globally available
  useEffect(() => {
    window.tulipNavigate = (screen) => {
      setCurrentScreen(screen);
    };
    
    window.tulipShowUpgrade = () => {
      setShowUpgrade(true);
    };
    
    return () => {
      delete window.tulipNavigate;
      delete window.tulipShowUpgrade;
    };
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
          <AppContent 
            onShowLogin={handleShowLogin} 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            showUpgrade={showUpgrade}
            setShowUpgrade={setShowUpgrade}
          />
          
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
    const existingLink = document.querySelector('link[href*="tailwindcss"]');
    if (existingLink) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
    document.head.appendChild(link);

    // Cleanup function
    return () => {
      // Don't remove on cleanup as other components might need it
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider>
          <MainApp />
        </RouterProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;