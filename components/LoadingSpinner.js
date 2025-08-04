import React from "react";

/**
 * LoadingSpinner Component
 * Displays a loading animation with optional message
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isLoading - Whether to show the spinner
 * @param {string} props.message - Optional message to display
 * @param {string} props.size - Size of the spinner (small, medium, large)
 * @param {string} props.overlay - Whether to show as overlay (true) or inline (false)
 */
export const LoadingSpinner = ({ 
  isLoading = true, 
  message = "Loading...", 
  size = "medium",
  overlay = true 
}) => {
  if (!isLoading) return null;
  
  // Size classes
  const sizeClasses = {
    small: "h-6 w-6 border-2",
    medium: "h-12 w-12 border-4",
    large: "h-20 w-20 border-8"
  };
  
  // Container classes based on overlay prop
  const containerClasses = overlay 
    ? "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" 
    : "flex flex-col items-center justify-center p-4";
  
  return (
    <div className={containerClasses}>
      <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-lg">
        <div className={`${sizeClasses[size]} border-t-blue-500 border-solid rounded-full animate-spin`}></div>
        {message && (
          <p className="mt-4 text-gray-700 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

/**
 * MapLoadingOverlay Component
 * Specialized loading spinner for map operations
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isLoading - Whether to show the overlay
 * @param {string} props.message - Optional message to display
 */
export const MapLoadingOverlay = ({ 
  isLoading = true, 
  message = "Loading map data..." 
}) => {
  if (!isLoading) return null;
  
  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 z-40 flex items-center justify-center pointer-events-none">
      <div className="bg-white rounded-lg p-4 shadow-lg flex flex-col items-center">
        <div className="h-10 w-10 border-4 border-t-blue-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-700">{message}</p>
      </div>
    </div>
  );
};

/**
 * DataLoadingIndicator Component
 * Minimal loading indicator for data fetching operations
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isLoading - Whether to show the indicator
 */
export const DataLoadingIndicator = ({ isLoading = true }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-md z-50 flex items-center">
      <div className="h-4 w-4 border-2 border-t-white border-solid rounded-full animate-spin mr-2"></div>
      <span className="text-sm">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;