import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

export const AlertMarker = ({ position, type, message, name }) => {
  // Create custom icon based on alert type
  const getIcon = (alertType) => {
    const iconUrl = alertType === 'high' 
      ? '/warning-high.svg'  // Path to high warning icon
      : '/warning-low.svg';  // Path to low warning icon
    
    return L.divIcon({
      html: `
        <div class="alert-marker ${alertType === 'high' ? 'alert-high' : 'alert-low'}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
      `,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  return (
    <Marker 
      position={position} 
      icon={getIcon(type)}
      zIndexOffset={1000} // Ensure alert is above other markers
    >
      <Tooltip direction="top" permanent={false} className={`alert-tooltip alert-${type}`}>
        <div>
          <strong>{name}</strong>
          <p>{message}</p>
        </div>
      </Tooltip>
    </Marker>
  );
};