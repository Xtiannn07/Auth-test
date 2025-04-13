// LoadingScreen.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function LoadingScreen({ bars = 8 }) {
  // Generate the loading bars with staggered animation
  const loadingBars = Array.from({ length: bars }).map((_, index) => (
    <div 
      key={index}
      className="h-12 w-2 bg-white mx-1 animate-pulse rounded-full"
      style={{ 
        animationDelay: `${index * 0.15}s`,
        animationDuration: '1.2s'
      }}
    />
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Semi-transparent dark overlay with strong blur */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-lg" />
      
      {/* Loading content */}
      <div className="flex flex-col items-center justify-center z-10">
        <div className="flex mb-4">
          {loadingBars}
        </div>
        <div className="text-white font-medium tracking-wider">Loading...</div>
      </div>
    </div>
  );
}

LoadingScreen.propTypes = {
  bars: PropTypes.number
};