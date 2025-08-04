import React, { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import georaster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import { getColor } from "@utils/colorUtils";

export const GeoTiffLayer = ({ 
    data_url, 
    selectedDate, 
    options
}) => {
    const map = useMap();
    const rasterLayerRef = useRef(null);
    
    // Create color options object for the getColor utility
    const colorOptions = {
        varType: data_url.data_vartype,
        adminLevel: data_url.data_adminLevel,
        dateType: data_url.data_dateType
    };

    useEffect(() => {
        const loadGeoTIFFData = async () => {
            try {
                // Remove existing layer if any
                if (rasterLayerRef.current) {
                    map.removeLayer(rasterLayerRef.current);
                    rasterLayerRef.current = null;
                }
                
                const response = await fetch(data_url.url);
                const arrayBuffer = await response.arrayBuffer();
                const parsedRaster = await georaster(arrayBuffer);
                
                // Determine which band to use
                const bandIndex = data_url.data_vartype.startsWith("SPI") || 
                                  data_url.data_vartype === "Yield" ||
                                  data_url.data_vartype === "Area" ||
                                  data_url.data_vartype === "Production" ||
                                  data_url.data_vartype === "Prcp" ||
                                  data_url.data_vartype === "Temp" ||
                                  data_url.data_vartype === "smpct1" ||
                                  data_url.data_vartype === "yieldAnom"
                    ? 0 // Use first band for these types
                    : Number(selectedDate - 1950); // Calculate band index for time series data
                
                // Create the raster layer
                const layer = new GeoRasterLayer({
                    georaster: parsedRaster,
                    opacity: 0.7,
                    pixelValuesToColorFn: (values) => {
                        // Get the appropriate pixel value based on data type
                        const pixelValue = data_url.data_vartype === "Yield" ||
                                          data_url.data_vartype === "Area" ||
                                          data_url.data_vartype === "Production" ||
                                          data_url.data_vartype === "Prcp" ||
                                          data_url.data_vartype === "Temp" ||
                                          data_url.data_vartype.startsWith("SPI")
                            ? values[0]
                            : values[bandIndex];
                                
                        // Return null for invalid values to make them transparent
                        if (pixelValue === 0 ||
                            pixelValue < -9999 ||
                            isNaN(pixelValue)) {
                            return null;
                        }
                        
                        // Use the color utility
                        return getColor(pixelValue, colorOptions);
                    },
                    resolution: 64
                });

                // Add layer to map and store reference
                layer.addTo(map);
                rasterLayerRef.current = layer;
                
            } catch (error) {
                console.error("Error loading GeoTIFF data:", error);
            }
        };

        loadGeoTIFFData();
        
        // Cleanup on unmount
        return () => {
            if (rasterLayerRef.current) {
                map.removeLayer(rasterLayerRef.current);
            }
        };
    }, [map, data_url.url, selectedDate, data_url.data_vartype, colorOptions, options]);

    // Component no longer renders AlertMarkers
    return null;
};