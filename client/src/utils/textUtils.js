// Text utilities for handling long text gracefully

export const truncateText = (text, maxLength = 50, suffix = '...') => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  };
  
  export const truncateMiddle = (text, maxLength = 40, separator = '...') => {
    if (!text || text.length <= maxLength) return text;
    
    const charsToShow = maxLength - separator.length;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    
    return text.substring(0, frontChars) + separator + text.substring(text.length - backChars);
  };
  
  // Responsive text truncation based on screen size
  export const responsiveTruncate = (text, { mobile = 30, tablet = 50, desktop = 70 } = {}) => {
    if (!text) return text;
    
    const width = window.innerWidth;
    let maxLength = desktop;
    
    if (width < 640) { // mobile
      maxLength = mobile;
    } else if (width < 1024) { // tablet
      maxLength = tablet;
    }
    
    return truncateText(text, maxLength);
  };
  
  // Smart truncation that respects word boundaries
  export const smartTruncate = (text, maxLength = 50, suffix = '...') => {
    if (!text || text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength - suffix.length);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > 0) {
      return truncated.substring(0, lastSpace) + suffix;
    }
    
    return truncated + suffix;
  };
  
  // Product name formatter
  export const formatProductName = (name, brand, maxLength = 40) => {
    if (!name) return '';
    
    // If brand is already in the name, don't duplicate
    if (brand && name.toLowerCase().includes(brand.toLowerCase())) {
      return smartTruncate(name, maxLength);
    }
    
    // If we have brand, prepend it
    if (brand) {
      const combined = `${brand} ${name}`;
      return smartTruncate(combined, maxLength);
    }
    
    return smartTruncate(name, maxLength);
  };
  
  // Export all functions as named exports
  const textUtils = {
    truncateText,
    truncateMiddle,
    responsiveTruncate,
    smartTruncate,
    formatProductName
  };
  
  export default textUtils;