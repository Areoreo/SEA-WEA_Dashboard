import React from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export const WarningControls = ({ showWarnings, setShowWarnings }) => {
  const map = useMap();
  
  React.useEffect(() => {
    // Create custom control
    const WarningControl = L.Control.extend({
      options: {
        position: 'topright'
      },
      
      onAdd: function(map) {
        const container = L.DomUtil.create('div', 'warning-controls leaflet-bar leaflet-control');
        
        container.innerHTML = `
          <label for="toggle-warnings">
            <input 
              type="checkbox" 
              id="toggle-warnings" 
              ${showWarnings ? 'checked' : ''}
            />
            Show Warnings
          </label>
          <div class="alert-legend" ${!showWarnings ? 'style="display:none"' : ''}>
            <div class="alert-legend-item">
              <div class="alert-legend-icon alert-legend-high"></div>
              <span>High Value Warning</span>
            </div>
            <div class="alert-legend-item">
              <div class="alert-legend-icon alert-legend-low"></div>
              <span>Low Value Warning</span>
            </div>
          </div>
        `;
        
        // Add event listener for the checkbox
        const checkbox = container.querySelector('#toggle-warnings');
        L.DomEvent.on(checkbox, 'change', function(e) {
          setShowWarnings(e.target.checked);
          
          // Toggle visibility of the legend
          const legend = container.querySelector('.alert-legend');
          legend.style.display = e.target.checked ? 'block' : 'none';
          
          // Prevent map click events from firing when interacting with the control
          L.DomEvent.stopPropagation(e);
        });
        
        // Prevent map drag when clicking on the control
        L.DomEvent.disableClickPropagation(container);
        return container;
      }
    });
    
    // Add the control to the map
    const control = new WarningControl();
    control.addTo(map);
    
    // Cleanup on unmount
    return () => {
      control.remove();
    };
  }, [map, showWarnings, setShowWarnings]);
  
  // This component doesn't render anything directly, it adds a Leaflet control
  return null;
}