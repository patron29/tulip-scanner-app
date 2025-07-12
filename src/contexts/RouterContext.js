import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Simple routing context for navigation with history support
const RouterContext = createContext();

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

export const RouterProvider = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState('home');
  const [routeHistory, setRouteHistory] = useState(['home']);
  const [routeParams, setRouteParams] = useState({});

  // Navigate to a new route
  const navigate = useCallback((route, params = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    setRouteHistory(prev => [...prev, route]);
    
    // Update browser history
    const url = new URL(window.location);
    url.searchParams.set('screen', route);
    window.history.pushState({ route, params }, '', url);
  }, []);

  // Go back to previous route
  const goBack = useCallback(() => {
    if (routeHistory.length > 1) {
      const newHistory = [...routeHistory];
      newHistory.pop(); // Remove current route
      const previousRoute = newHistory[newHistory.length - 1];
      
      setRouteHistory(newHistory);
      setCurrentRoute(previousRoute);
      setRouteParams({});
      
      window.history.back();
    }
  }, [routeHistory]);

  // Replace current route without adding to history
  const replace = useCallback((route, params = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    
    const newHistory = [...routeHistory];
    newHistory[newHistory.length - 1] = route;
    setRouteHistory(newHistory);
    
    const url = new URL(window.location);
    url.searchParams.set('screen', route);
    window.history.replaceState({ route, params }, '', url);
  }, [routeHistory]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.route) {
        setCurrentRoute(event.state.route);
        setRouteParams(event.state.params || {});
      } else {
        // Handle initial page load
        const url = new URL(window.location);
        const screen = url.searchParams.get('screen') || 'home';
        setCurrentRoute(screen);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Set initial route from URL
    const url = new URL(window.location);
    const screen = url.searchParams.get('screen') || 'home';
    if (screen !== 'home') {
      setCurrentRoute(screen);
      setRouteHistory([screen]);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Check if can go back
  const canGoBack = routeHistory.length > 1;

  const value = {
    currentRoute,
    routeParams,
    routeHistory,
    navigate,
    goBack,
    replace,
    canGoBack
  };

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
};