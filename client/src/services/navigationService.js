// src/services/navigationService.js
// Global navigation service to handle navigation from anywhere in the app

class NavigationService {
    constructor() {
      this.listeners = [];
      this.currentScreen = 'home';
    }
  
    subscribe(listener) {
      this.listeners.push(listener);
      // Return unsubscribe function
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }
  
    navigate(screen, params = {}) {
      this.currentScreen = screen;
      
      // Notify all listeners
      this.listeners.forEach(listener => {
        try {
          listener(screen, params);
        } catch (error) {
          // Silently handle errors in production
        }
      });
      
      // Also dispatch custom event as backup
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: screen,
        bubbles: true 
      }));
    }
  
    getCurrentScreen() {
      return this.currentScreen;
    }
    
    // Add this method to satisfy RouterContext if it's looking for it
    setNavigationFunctions() {
      // This is a no-op to prevent errors
      return this;
    }
  }
  
  // Create singleton instance
  const navigationService = new NavigationService();
  
  export default navigationService;