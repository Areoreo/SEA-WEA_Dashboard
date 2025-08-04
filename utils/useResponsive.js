/**
 * Responsive utility hook
 * Place this in utils/useResponsive.js
 */

import { useState, useEffect } from 'react';

// Breakpoints matching common device sizes
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
};

/**
 * Hook that returns the current screen size category and boolean helpers
 */
export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  const [screenSize, setScreenSize] = useState('lg');
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Handler to call on window resize
    const handleResize = () => {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      
      // Determine screen size category
      const width = window.innerWidth;
      if (width < breakpoints.sm) {
        setScreenSize('xs');
      } else if (width < breakpoints.md) {
        setScreenSize('sm');
      } else if (width < breakpoints.lg) {
        setScreenSize('md');
      } else if (width < breakpoints.xl) {
        setScreenSize('lg');
      } else if (width < breakpoints.xxl) {
        setScreenSize('xl');
      } else {
        setScreenSize('xxl');
      }
    };
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures effect is only run on mount
  
  return {
    windowSize,
    screenSize,
    isMobile: screenSize === 'xs' || screenSize === 'sm',
    isTablet: screenSize === 'md',
    isDesktop: screenSize === 'lg' || screenSize === 'xl' || screenSize === 'xxl',
    isLandscape: windowSize.width > windowSize.height
  };
}

export default useResponsive;