// Add this test component to see if basic navigation works
import React, { useState } from 'react';

const TestNavigationButton = ({ label, targetScreen, icon: Icon, onNavigate }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Visual feedback
    setIsPressed(true);
    
    // Navigate after a short delay
    setTimeout(() => {
      setIsPressed(false);
      onNavigate(targetScreen);
    }, 150);
  };
  
  return (
    <button
      onClick={handleClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={handleClick}
      className={`w-full px-4 py-4 text-left text-sm flex items-center gap-3 transition-all ${
        isPressed 
          ? 'bg-gray-200 scale-95' 
          : 'bg-white hover:bg-gray-50 active:bg-gray-100'
      } text-gray-700`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {Icon && <Icon size={16} />}
      <span>{label}</span>
      {isPressed && <span className="ml-auto text-xs text-gray-500">Loading...</span>}
    </button>
  );
};

export default TestNavigationButton;