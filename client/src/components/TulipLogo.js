import React from 'react';

const TulipLogo = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96
  };

  const pixelSize = sizes[size] || sizes.medium;

  return (
    <img 
      src="/tulip-icon.png" 
      alt="Tulip Logo"
      width={pixelSize}
      height={pixelSize}
      className={`${className}`}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default TulipLogo;