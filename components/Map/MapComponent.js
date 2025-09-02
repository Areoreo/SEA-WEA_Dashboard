import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    categorizeReservoirData,
    aggregateDataByBasin,
    getCategoryColor,
    getCategoryLabel,
    isMeaningfulAttribute,
    formatAttributeValue,
    getAttributeUnits,
} from "../../utils/dataUtils";

// import { ScaleControl, ZoomBasedSizeProvider } from "./MapEnhancement";

// import MainUseLegend from "./MainUseLegend";

// Dynamically import Leaflet components to avoid SSR issues
let MapContainer, TileLayer, GeoJSON, Marker, Popup, L;

const MapComponent = ({
    activeTab = "reservoirs",
    filteredData = [],
    selectedAttributes = ["normal_capacity"],
    showCritical = true,
    showNonCritical = true,
    spatialUnit = "basins",
    showSummary = false,
    onMarkerClick = null,
    onBasinClick = null,
    onDynamicInfoClick = null,
}) => {
    const [mapData, setMapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    const mapRef = useRef(null);

    // define point shapes when showSummary is true
    const MAIN_USE_SHAPES = {
        Hydropower: "circle",
        Irrigation: "triangle",
        "Water supply": "diamond",
        "Multiple purpose": "star",
        "Flood control": "hexagon",
        SEAWEA_UNKNOWN: "square",
    };
    const createSVGShape = (shape, size, color) => {
        const shapes = {
            circle: `<circle cx="${size / 2}" cy="${size / 2}" r="${
                size / 2 - 2
            }" fill="${color}" stroke="white" stroke-width="2"/>`,
            triangle: `<polygon points="${size / 2},2 ${size - 2},${size - 2} 2,${
                size - 2
            }" fill="${color}" stroke="white" stroke-width="2"/>`,
            diamond: `<polygon points="${size / 2},2 ${size - 2},${size / 2} ${size / 2},${
                size - 2
            } 2,${size / 2}" fill="${color}" stroke="white" stroke-width="2"/>`,
            star: `<polygon points="${size / 2},2 ${size * 0.61},${size * 0.35} ${size - 2},${
                size * 0.35
            } ${size * 0.68},${size * 0.57} ${size * 0.79},${size - 2} ${size / 2},${size * 0.75} ${
                size * 0.21
            },${size - 2} ${size * 0.32},${size * 0.57} 2,${size * 0.35} ${size * 0.39},${
                size * 0.35
            }" fill="${color}" stroke="white" stroke-width="2"/>`,
            hexagon: `<polygon points="${size * 0.25},${size * 0.13} ${size * 0.75},${
                size * 0.13
            } ${size - 2},${size / 2} ${size * 0.75},${size * 0.87} ${size * 0.25},${
                size * 0.87
            } 2,${size / 2}" fill="${color}" stroke="white" stroke-width="2"/>`,
            square: `<rect x="2" y="2" width="${size - 4}" height="${
                size - 4
            }" fill="${color}" stroke="white" stroke-width="2"/>`,
        };
        return shapes[shape] || shapes.circle;
    };

    const MainUseLegend = ({ selectedAttribute, activeTab }) => {
        if (selectedAttribute !== "main_use") return null;

        const threshold = activeTab === "reservoirs" ? ">100MCM" : ">30MW";
        const nonCriticalThreshold = activeTab === "reservoirs" ? "<100MCM" : "0-30MW";

        return (
            <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs">
                <h3 className="font-semibold text-sm mb-3">Main Use Types</h3>

                <div className="mb-4">
                    <h4 className="text-xs font-medium text-red-600 mb-2">
                        Critical ({threshold})
                    </h4>
                    <div className="space-y-1">
                        {Object.keys(MAIN_USE_SHAPES).map((useType) => (
                            <div key={`critical-${useType}`} className="flex items-center gap-2">
                                <div
                                    className="w-4 h-4 flex items-center justify-center"
                                    dangerouslySetInnerHTML={{
                                        __html: `<svg width="16" height="16" viewBox="0 0 16 16">${createSVGShape(
                                            MAIN_USE_SHAPES[useType],
                                            16,
                                            "#ef4444"
                                        )}</svg>`,
                                    }}
                                />
                                <span className="text-xs">{useType}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-medium text-blue-600 mb-2">
                        Non-critical ({nonCriticalThreshold})
                    </h4>
                    <div className="space-y-1">
                        {Object.keys(MAIN_USE_SHAPES).map((useType) => (
                            <div
                                key={`non-critical-${useType}`}
                                className="flex items-center gap-2"
                            >
                                <div
                                    className="w-4 h-4 flex items-center justify-center"
                                    dangerouslySetInnerHTML={{
                                        __html: `<svg width="16" height="16" viewBox="0 0 16 16">${createSVGShape(
                                            MAIN_USE_SHAPES[useType],
                                            16,
                                            "#3b82f6"
                                        )}</svg>`,
                                    }}
                                />
                                <span className="text-xs">{useType}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Load Leaflet dynamically on client side
    useEffect(() => {
        const loadLeaflet = async () => {
            try {
                // Dynamic imports for client-side only
                const leafletModule = await import("leaflet");
                const reactLeafletModule = await import("react-leaflet");

                L = leafletModule.default;
                MapContainer = reactLeafletModule.MapContainer;
                TileLayer = reactLeafletModule.TileLayer;
                GeoJSON = reactLeafletModule.GeoJSON;
                Marker = reactLeafletModule.Marker;
                Popup = reactLeafletModule.Popup;

                // Fix for default markers
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl:
                        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                    iconUrl:
                        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                    shadowUrl:
                        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                });

                setLeafletLoaded(true);
                loadBoundaryData();
            } catch (error) {
                console.error("Error loading Leaflet:", error);
                setLoading(false);
            }
        };

        loadLeaflet();
    }, []);

    const loadBoundaryData = async () => {
        try {
            // Try to load boundary data if available
            const boundariesResponse = await fetch("/data/SEA_boundaries.geojson");
            if (boundariesResponse.ok) {
                const boundaries = await boundariesResponse.json();
                setMapData(boundaries);
            }
        } catch (error) {
            console.warn("No boundary data available, continuing without:", error);
        } finally {
            setLoading(false);
        }
    };

    // Create basin summary bar chart icon
    const createBasinBarChartIcon = (basinData) => {
        if (!L || !leafletLoaded) return null;

        const {
            critical,
            "non-critical": nonCritical,
            unknown,
            total,
            criticalSum,
            "non-criticalSum": nonCriticalSum,
            unknownSum,
            totalSum,
            isMeaningful,
            attribute,
        } = basinData;

        // Use sums for meaningful attributes, counts for others
        const criticalValue = isMeaningful ? criticalSum : critical;
        const nonCriticalValue = isMeaningful ? nonCriticalSum : nonCritical;
        const unknownValue = isMeaningful ? unknownSum : unknown;
        const totalValue = isMeaningful ? totalSum : total;

        const maxBarHeight = 40;
        const barWidth = 12;
        const spacing = 2;
        const totalWidth = barWidth * 3 + spacing * 2;

        // Calculate bar heights (proportional to values)
        const maxValue = Math.max(criticalValue, nonCriticalValue, unknownValue, 1);
        const criticalHeight = (criticalValue / maxValue) * maxBarHeight;
        const nonCriticalHeight = (nonCriticalValue / maxValue) * maxBarHeight;
        const unknownHeight = (unknownValue / maxValue) * maxBarHeight;

        // Format values for tooltip
        const units = getAttributeUnits(attribute);
        const formatValue = (value) => {
            if (isMeaningful) {
                return formatAttributeValue(value, attribute);
            } else {
                return value.toString();
            }
        };

        const html = `
            <div class="basin-bar-chart" style="
                display: flex;
                align-items: flex-end;
                justify-content: center;
                width: ${totalWidth}px;
                height: ${maxBarHeight + 20}px;
                cursor: pointer;
                position: relative;
            ">
                <div style="
                    width: ${barWidth}px;
                    height: ${criticalHeight}px;
                    background-color: #ef4444;
                    margin-right: ${spacing}px;
                    border-radius: 2px 2px 0 0;
                    border: 1px solid white;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                " title="Critical: ${formatValue(criticalValue)}"></div>
                <div style="
                    width: ${barWidth}px;
                    height: ${nonCriticalHeight}px;
                    background-color: #3b82f6;
                    margin-right: ${spacing}px;
                    border-radius: 2px 2px 0 0;
                    border: 1px solid white;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                " title="Non-critical: ${formatValue(nonCriticalValue)}"></div>
                <div style="
                    width: ${barWidth}px;
                    height: ${unknownHeight}px;
                    background-color: #6b7280;
                    border-radius: 2px 2px 0 0;
                    border: 1px solid white;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                " title="Unknown: ${formatValue(unknownValue)}"></div>
                <div style="
                    position: absolute;
                    bottom: -15px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 2px 4px;
                    border-radius: 2px;
                    font-size: 10px;
                    font-weight: bold;
                ">${isMeaningful ? formatValue(totalValue) : totalValue}</div>
            </div>
        `;

        return L.divIcon({
            className: "basin-bar-chart-marker",
            html: html,
            iconSize: [totalWidth, maxBarHeight + 20],
            iconAnchor: [totalWidth / 2, maxBarHeight + 10],
        });
    };

    // createIndividualIcon which can show different types when isSummary==true and activeTab=='main_use'
    const createIndividualIcon = (item, attributeValue) => {
        const category = categorizeReservoirData(item, activeTab, selectedAttributes[0]);
        const baseColor = getCategoryColor(category);

        // Check if current attribute is main_use
        const isMainUseVisualization = selectedAttributes[0] === "main_use";

        let size, iconHtml;

        if (isMainUseVisualization) {
            // Fixed size for main use visualization
            size = 12;
            const shape = MAIN_USE_SHAPES[item.main_use] || "circle";
            const svgShape = createSVGShape(shape, size, baseColor);
            iconHtml = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${svgShape}</svg>`;
        } else {
            // Size based on attribute value (existing logic)
            const minSize = 10;
            const maxSize = 20;
            const normalizedValue = Math.max(
                0,
                Math.min(1, attributeValue / getMaxAttributeValue(selectedAttributes[0]))
            );
            size = minSize + normalizedValue * (maxSize - minSize);
            const svgShape = createSVGShape("circle", size, baseColor);
            iconHtml = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${svgShape}</svg>`;
        }

        return L.divIcon({
            className: "custom-reservoir-marker",
            html: `<div style="
            width: ${size}px;
            height: ${size}px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        " class="marker-dot">${iconHtml}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
        });
    };

    // new createIndividual on 20250901
    // 修改createIndividualIcon函数以支持动态大小，但加载**很慢**！
    // const createIndividualIcon = (item, attributeValue) => {
    //     if (!L || !leafletLoaded) return null;

    //     const category = categorizeReservoirData(item, activeTab, selectedAttributes[0]);
    //     const baseColor = getCategoryColor(category);

    //     // 基础大小根据属性值计算
    //     const minSize = 6;
    //     const maxSize = 20;
    //     const normalizedValue = Math.max(
    //         0,
    //         Math.min(1, attributeValue / getMaxAttributeValue(selectedAttributes[0]))
    //     );
    //     const baseSize = minSize + normalizedValue * (maxSize - minSize);

    //     // 应用缩放倍数
    //     const finalSize = Math.max(4, Math.min(40, baseSize * markerSizeMultiplier));

    //     return L.divIcon({
    //         className: "custom-reservoir-marker",
    //         html: `
    //         <div style="
    //             background-color: ${baseColor};
    //             width: ${finalSize}px;
    //             height: ${finalSize}px;
    //             border-radius: 50%;
    //             border: 2px solid white;
    //             box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    //             opacity: 0.8;
    //             transition: all 0.2s ease;
    //         " class="marker-dot"></div>
    //     `,
    //         iconSize: [finalSize, finalSize],
    //         iconAnchor: [finalSize / 2, finalSize / 2],
    //     });
    // };

    // Get maximum value for scaling
    const getMaxAttributeValue = (attribute) => {
        if (!filteredData.length) return 1;
        const values = filteredData
            .map((item) => item[attribute])
            .filter((val) => val != null && val > 0);
        return Math.max(...values, 1);
    };

    // // Prepare data based on summary mode
    const { individualMarkers, basinSummaries } = useMemo(() => {
        if (showSummary) {
            // Basin summary mode
            const basins = aggregateDataByBasin(filteredData, activeTab, selectedAttributes[0]);
            return {
                individualMarkers: [],
                basinSummaries: basins,
            };
        } else {
            // Individual marker mode
            const markers = filteredData
                .filter((item) => {
                    // Valid coordinates
                    if (!item.latitude || !item.longitude) return false;
                    if (item.latitude < -90 || item.latitude > 90) return false;
                    if (item.longitude < -180 || item.longitude > 180) return false;

                    // Filter by category visibility
                    const category = categorizeReservoirData(
                        item,
                        activeTab,
                        selectedAttributes[0]
                    );
                    if (category === "critical" && !showCritical) return false;
                    if (category === "non-critical" && !showNonCritical) return false;
                    // Unknown items are always shown when either critical or non-critical is shown

                    return true;
                })
                .map((item) => {
                    const attributeValue =
                        selectedAttributes.length > 0 ? item[selectedAttributes[0]] || 0 : 1;

                    return {
                        ...item,
                        attributeValue: Math.max(0, attributeValue),
                        category: categorizeReservoirData(item, activeTab, selectedAttributes[0]),
                    };
                });

            return {
                individualMarkers: markers,
                basinSummaries: [],
            };
        }
    }, [filteredData, activeTab, showCritical, showNonCritical, selectedAttributes, showSummary]);

    if (loading || !leafletLoaded || !MapContainer) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        {!leafletLoaded ? "Loading map library..." : "Loading map data..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <MapContainer
                center={[13.0, 105.0]} // Southeast Asia center
                zoom={5}
                className="w-full h-full"
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Render boundary layers if available */}
                {mapData && (
                    <GeoJSON
                        data={mapData}
                        style={{
                            fillColor: "#e5e7eb",
                            weight: 1,
                            opacity: 1,
                            color: "#374151",
                            fillOpacity: 0.1,
                        }}
                    />
                )}

                {/* Render basin summaries with bar charts */}
                {showSummary &&
                    basinSummaries.map((basin, index) => (
                        <Marker
                            key={`basin-${basin.basin}-${index}`}
                            position={[basin.centerLat, basin.centerLng]}
                            icon={createBasinBarChartIcon(basin)}
                            eventHandlers={{
                                click: () => {
                                    if (onBasinClick) {
                                        onBasinClick(basin);
                                    }
                                },
                            }}
                        >
                            <Popup className="basin-popup">
                                <div className="basin-summary-popup">
                                    <h3 className="font-semibold text-lg mb-2">{basin.basin}</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="font-medium">
                                                Total {basin.isMeaningful ? "Sum:" : "Count:"}
                                            </span>
                                            <span className="font-bold">
                                                {basin.isMeaningful
                                                    ? formatAttributeValue(
                                                          basin.totalSum,
                                                          basin.attribute
                                                      )
                                                    : basin.total}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="flex items-center">
                                                <span className="w-3 h-3 bg-red-500 rounded mr-2"></span>
                                                Critical:
                                            </span>
                                            <span>
                                                {basin.isMeaningful
                                                    ? formatAttributeValue(
                                                          basin.criticalSum,
                                                          basin.attribute
                                                      )
                                                    : basin.critical}
                                                {!basin.isMeaningful && ` (${basin.critical})`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="flex items-center">
                                                <span className="w-3 h-3 bg-blue-500 rounded mr-2"></span>
                                                Non-critical:
                                            </span>
                                            <span>
                                                {basin.isMeaningful
                                                    ? formatAttributeValue(
                                                          basin["non-criticalSum"],
                                                          basin.attribute
                                                      )
                                                    : basin["non-critical"]}
                                                {!basin.isMeaningful &&
                                                    ` (${basin["non-critical"]})`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="flex items-center">
                                                <span className="w-3 h-3 bg-gray-500 rounded mr-2"></span>
                                                Unknown:
                                            </span>
                                            <span>
                                                {basin.isMeaningful
                                                    ? formatAttributeValue(
                                                          basin.unknownSum,
                                                          basin.attribute
                                                      )
                                                    : basin.unknown}
                                                {!basin.isMeaningful && ` (${basin.unknown})`}
                                            </span>
                                        </div>

                                        {basin.isMeaningful && (
                                            <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                                                Showing sum of{" "}
                                                {selectedAttributes[0]?.replace(/_/g, " ")} values
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                {/* Render individual markers */}
                {!showSummary &&
                    individualMarkers.map((item, index) => (
                        <Marker
                            key={`${item.id || index}-${item.reservoir_name || item.station_name}`}
                            position={[item.latitude, item.longitude]}
                            icon={createIndividualIcon(item, item.attributeValue)}
                            eventHandlers={{
                                click: () => {
                                    if (onMarkerClick) {
                                        onMarkerClick(item);
                                    }
                                },
                            }}
                        >
                            <Popup className="custom-popup">
                                <div className="reservoir-popup">
                                    <h3 className="font-semibold text-lg mb-2">
                                        {item.reservoir_name || item.station_name || "Unknown"}
                                    </h3>

                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Type:</span>
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${
                                                    item.category === "critical"
                                                        ? "bg-red-100 text-red-800"
                                                        : item.category === "non-critical"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {getCategoryLabel(item.category, activeTab)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="font-medium">Country:</span>
                                            <span>{item.country || "N/A"}</span>
                                        </div>

                                        {activeTab === "reservoirs" && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="font-medium">Dam Height:</span>
                                                    <span>
                                                        {formatAttributeValue(
                                                            item.dam_height_m,
                                                            "dam_height_m"
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium">
                                                        Normal Capacity:
                                                    </span>
                                                    <span>
                                                        {formatAttributeValue(
                                                            item.normal_capacity_mcm,
                                                            "normal_capacity_mcm"
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium">
                                                        Normal Area:
                                                    </span>
                                                    <span>
                                                        {formatAttributeValue(
                                                            item.normal_area_km2,
                                                            "normal_area_km2"
                                                        )}
                                                    </span>
                                                </div>
                                            </>
                                        )}

                                        {activeTab === "hydropower" && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="font-medium">Power:</span>
                                                    <span>
                                                        {formatAttributeValue(
                                                            item.power_mw,
                                                            "power_mw"
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium">Water Head:</span>
                                                    <span>
                                                        {formatAttributeValue(
                                                            item.water_head_m,
                                                            "water_head_m"
                                                        )}
                                                    </span>
                                                </div>
                                            </>
                                        )}

                                        <div className="flex justify-between">
                                            <span className="font-medium">Main Use:</span>
                                            <span>{item.main_use || "N/A"}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="font-medium">Status:</span>
                                            <span>{item.status || "N/A"}</span>
                                        </div>

                                        {item.commission_year && (
                                            <div className="flex justify-between">
                                                <span className="font-medium">
                                                    Commission Year:
                                                </span>
                                                <span>{item.commission_year}</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Dynamic Info按钮 - 仅对critical reservoir且有INDEX显示 */}
                                    {item.is_critical_reservoir &&
                                        item.INDEX &&
                                        onDynamicInfoClick && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDynamicInfoClick(item);
                                                }}
                                                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors flex items-center space-x-1"
                                                title="View dynamic monitoring data"
                                            >
                                                {/* <BarChart3 className="w-3 h-3" /> */}
                                                <span>Dynamic Info</span>
                                            </button>
                                        )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                {/* MainUseLegend put here or not? TESTING... */}
                <MainUseLegend selectedAttribute={selectedAttributes[0]} activeTab={activeTab} />
            </MapContainer>

            {/* Enhanced Legend with 3 Categories */}
            {selectedAttributes[0] !== "main_use" && (
                <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs">
                    <h4 className="font-semibold mb-3">Legend</h4>

                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow"></div>
                            <span>{getCategoryLabel("critical", activeTab)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                            <span>{getCategoryLabel("non-critical", activeTab)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gray-500 border-2 border-white shadow"></div>
                            <span>{getCategoryLabel("unknown", activeTab)}</span>
                        </div>
                    </div>

                    {showSummary ? (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600">
                                {isMeaningfulAttribute(selectedAttributes[0])
                                    ? `Bar charts show sum of ${selectedAttributes[0]?.replace(
                                          /_/g,
                                          " "
                                      )} values by basin`
                                    : "Bar charts show count of items by basin"}
                            </p>
                        </div>
                    ) : (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600">
                                Marker size represents{" "}
                                {selectedAttributes[0]
                                    ? selectedAttributes[0].replace("_", " ")
                                    : "magnitude"}
                            </p>
                            <div className="mt-2 flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span className="text-xs text-gray-500">Small</span>
                                <div className="flex-1 border-t border-gray-300"></div>
                                <span className="text-xs text-gray-500">Large</span>
                                <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Info Panel */}
            <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3 text-sm">
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span className="font-medium">Mode:</span>
                        <span className="capitalize">
                            {showSummary ? "Basin Summary" : activeTab}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="font-medium">Showing:</span>
                        <span>
                            {showSummary
                                ? basinSummaries.length + " basins"
                                : individualMarkers.length + " markers"}
                        </span>
                    </div>
                    {showSummary ? (
                        <div className="flex justify-between">
                            <span className="font-medium">Aggregation:</span>
                            <span className="text-xs">
                                {isMeaningfulAttribute(selectedAttributes[0]) ? "Sum" : "Count"}
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between">
                                <span className="font-medium">Critical:</span>
                                <span className="text-red-600">
                                    {
                                        individualMarkers.filter((m) => m.category === "critical")
                                            .length
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Non-critical:</span>
                                <span className="text-blue-600">
                                    {
                                        individualMarkers.filter(
                                            (m) => m.category === "non-critical"
                                        ).length
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Unknown:</span>
                                <span className="text-gray-600">
                                    {
                                        individualMarkers.filter((m) => m.category === "unknown")
                                            .length
                                    }
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MapComponent;

// // enhancement: by MapEnhancement.js, dynamic size of points are available. BUT WARNING: large computetion resources are required. Proceed with care.
// import React, {
//     useState,
//     useEffect,
//     useRef,
//     useMemo,
//     forwardRef,
//     useImperativeHandle,
//     useCallback,
// } from "react";
// import {
//     categorizeReservoirData,
//     aggregateDataByBasin,
//     getCategoryColor,
//     getCategoryLabel,
//     isMeaningfulAttribute,
//     formatAttributeValue,
//     getAttributeUnits,
// } from "../../utils/dataUtils";

// import {
//     ScaleControl,
//     ZoomBasedSizeProvider,
//     ReservoirMaskLayer,
//     MapLoadingOverlay,
//     MapViewController,
// } from "./MapEnhancement";

// // Dynamically import Leaflet components to avoid SSR issues
// let MapContainer, TileLayer, GeoJSON, Marker, Popup, L;

// const MapComponent = forwardRef(
//     (
//         {
//             activeTab = "reservoirs",
//             filteredData = [],
//             selectedAttributes = ["normal_capacity"],
//             showCritical = true,
//             showNonCritical = true,
//             spatialUnit = "basins",
//             showSummary = false,
//             onMarkerClick = null,
//             onBasinClick = null,
//             onDynamicInfoClick = null, // 新增：Dynamic Info点击处理
//             reservoirMask = null, // 新增：水库掩膜数据
//             overviewMode = "current", // 新增：overview模式
//             modeConfig = {}, // 新增：模式配置
//         },
//         ref
//     ) => {
//         const [mapData, setMapData] = useState(null);
//         const [loading, setLoading] = useState(true);
//         const [leafletLoaded, setLeafletLoaded] = useState(false);
//         const [zoomTarget, setZoomTarget] = useState(null);
//         const [zoomInfo, setZoomInfo] = useState({
//             zoomLevel: 5,
//             markerSizeMultiplier: 1,
//             getScaledSize: (baseSize) => Math.max(4, Math.min(50, baseSize)),
//         });
//         const mapRef = useRef(null);

//         // 处理缩放信息更新
//         const handleZoomUpdate = useCallback((newZoomInfo) => {
//             setZoomInfo(newZoomInfo);
//         }, []);

//         // 暴露给父组件的方法
//         useImperativeHandle(
//             ref,
//             () => ({
//                 setView: (center, zoom) => {
//                     if (mapRef.current) {
//                         mapRef.current.setView(center, zoom);
//                     }
//                 },
//                 flyTo: (center, zoom) => {
//                     if (mapRef.current) {
//                         mapRef.current.flyTo(center, zoom);
//                     }
//                 },
//                 getZoom: () => {
//                     return mapRef.current ? mapRef.current.getZoom() : 5;
//                 },
//                 getCenter: () => {
//                     return mapRef.current ? mapRef.current.getCenter() : { lat: 13.0, lng: 105.0 };
//                 },
//             }),
//             []
//         );

//         // Main Use形状定义
//         const MAIN_USE_SHAPES = {
//             Hydropower: "circle",
//             Irrigation: "triangle",
//             "Water supply": "diamond",
//             "Multiple purpose": "star",
//             "Flood control": "hexagon",
//             SEAWEA_UNKNOWN: "square",
//         };

//         const createSVGShape = (shape, size, color) => {
//             const shapes = {
//                 circle: `<circle cx="${size / 2}" cy="${size / 2}" r="${
//                     size / 2 - 2
//                 }" fill="${color}" stroke="white" stroke-width="2"/>`,
//                 triangle: `<polygon points="${size / 2},2 ${size - 2},${size - 2} 2,${
//                     size - 2
//                 }" fill="${color}" stroke="white" stroke-width="2"/>`,
//                 diamond: `<polygon points="${size / 2},2 ${size - 2},${size / 2} ${size / 2},${
//                     size - 2
//                 } 2,${size / 2}" fill="${color}" stroke="white" stroke-width="2"/>`,
//                 star: `<polygon points="${size / 2},2 ${size * 0.61},${size * 0.35} ${size - 2},${
//                     size * 0.35
//                 } ${size * 0.68},${size * 0.57} ${size * 0.79},${size - 2} ${size / 2},${
//                     size * 0.75
//                 } ${size * 0.21},${size - 2} ${size * 0.32},${size * 0.57} 2,${size * 0.35} ${
//                     size * 0.39
//                 },${size * 0.35}" fill="${color}" stroke="white" stroke-width="2"/>`,
//                 hexagon: `<polygon points="${size * 0.25},${size * 0.13} ${size * 0.75},${
//                     size * 0.13
//                 } ${size - 2},${size / 2} ${size * 0.75},${size * 0.87} ${size * 0.25},${
//                     size * 0.87
//                 } 2,${size / 2}" fill="${color}" stroke="white" stroke-width="2"/>`,
//                 square: `<rect x="2" y="2" width="${size - 4}" height="${
//                     size - 4
//                 }" fill="${color}" stroke="white" stroke-width="2"/>`,
//             };
//             return shapes[shape] || shapes.circle;
//         };

//         // Load Leaflet dynamically
//         useEffect(() => {
//             const loadLeaflet = async () => {
//                 try {
//                     const leafletModule = await import("leaflet");
//                     L = leafletModule.default;

//                     // Import React Leaflet components
//                     const reactLeafletModule = await import("react-leaflet");
//                     MapContainer = reactLeafletModule.MapContainer;
//                     TileLayer = reactLeafletModule.TileLayer;
//                     GeoJSON = reactLeafletModule.GeoJSON;
//                     Marker = reactLeafletModule.Marker;
//                     Popup = reactLeafletModule.Popup;

//                     // Fix default icon issue
//                     delete L.Icon.Default.prototype._getIconUrl;
//                     L.Icon.Default.mergeOptions({
//                         iconRetinaUrl:
//                             "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
//                         iconUrl:
//                             "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//                         shadowUrl:
//                             "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
//                     });

//                     setLeafletLoaded(true);
//                     loadBoundaryData();
//                 } catch (error) {
//                     console.error("Error loading Leaflet:", error);
//                     setLoading(false);
//                 }
//             };

//             loadLeaflet();
//         }, []);

//         const loadBoundaryData = async () => {
//             try {
//                 // Try multiple possible boundary file locations
//                 const possiblePaths = [
//                     "/data/SEA_boundary.geojson",
//                     "/data/boundaries.geojson",
//                     "/data/sea_boundaries.geojson",
//                 ];

//                 let boundaries = null;
//                 for (const path of possiblePaths) {
//                     try {
//                         const response = await fetch(path);
//                         if (response.ok) {
//                             boundaries = await response.json();
//                             console.log(`Loaded boundaries from: ${path}`);
//                             break;
//                         }
//                     } catch (error) {
//                         console.log(`Failed to load ${path}`);
//                     }
//                 }

//                 if (boundaries) {
//                     setMapData(boundaries);
//                 }
//             } catch (error) {
//                 console.warn("No boundary data available, continuing without:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         // Get max attribute value for scaling
//         const getMaxAttributeValue = (attribute) => {
//             if (!filteredData.length) return 1;
//             const values = filteredData
//                 .map((item) => item[attribute])
//                 .filter((val) => val != null && val > 0);
//             return Math.max(...values, 1);
//         };

//         // Create basin summary bar chart icon
//         const createBasinBarChartIcon = (basinData) => {
//             if (!L || !leafletLoaded) return null;

//             const {
//                 critical,
//                 "non-critical": nonCritical,
//                 unknown,
//                 total,
//                 criticalSum,
//                 "non-criticalSum": nonCriticalSum,
//                 unknownSum,
//                 totalSum,
//                 isMeaningful,
//                 attribute,
//             } = basinData;

//             const criticalValue = isMeaningful ? criticalSum : critical;
//             const nonCriticalValue = isMeaningful ? nonCriticalSum : nonCritical;
//             const unknownValue = isMeaningful ? unknownSum : unknown;
//             const totalValue = isMeaningful ? totalSum : total;

//             const maxBarHeight = 60;
//             const barWidth = 12;
//             const spacing = 2;
//             const totalWidth = (barWidth + spacing) * 3 + spacing;

//             const formatValue = (value) => {
//                 if (isMeaningful && value >= 1000) {
//                     return `${(value / 1000).toFixed(1)}k`;
//                 }
//                 return Math.round(value).toString();
//             };

//             const getBarHeight = (value) => {
//                 if (totalValue === 0) return 0;
//                 return Math.max(2, (value / totalValue) * maxBarHeight);
//             };

//             const criticalHeight = getBarHeight(criticalValue);
//             const nonCriticalHeight = getBarHeight(nonCriticalValue);
//             const unknownHeight = getBarHeight(unknownValue);

//             const html = `
//             <div style="display: flex; flex-direction: column; align-items: center; background: white; padding: 4px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
//                 <div style="display: flex; align-items: end; margin-bottom: 2px;">
//                     <div style="width: ${barWidth}px; height: ${criticalHeight}px; background: #ef4444; margin-right: ${spacing}px; border-radius: 1px;"></div>
//                     <div style="width: ${barWidth}px; height: ${nonCriticalHeight}px; background: #3b82f6; margin-right: ${spacing}px; border-radius: 1px;"></div>
//                     <div style="width: ${barWidth}px; height: ${unknownHeight}px; background: #6b7280; border-radius: 1px;"></div>
//                 </div>
//                 <div style="font-size: 10px; font-weight: bold; color: #374151;">${formatValue(
//                     totalValue
//                 )}</div>
//             </div>
//         `;

//             return L.divIcon({
//                 className: "basin-bar-chart-marker",
//                 html: html,
//                 iconSize: [totalWidth, maxBarHeight + 20],
//                 iconAnchor: [totalWidth / 2, maxBarHeight + 10],
//             });
//         };

//         // Create individual marker icons with zoom responsiveness
//         const createIndividualIcon = (item, attributeValue) => {
//             if (!L || !leafletLoaded) return null;

//             const category = categorizeReservoirData(item, activeTab, selectedAttributes[0]);

//             // 根据overview模式调整颜色
//             let baseColor;
//             if (overviewMode === "current") {
//                 baseColor = modeConfig.statusColors?.["Operational"] || getCategoryColor(category);
//             } else if (overviewMode === "future") {
//                 baseColor = modeConfig.statusColors?.[item.status] || getCategoryColor(category);
//             } else {
//                 baseColor = getCategoryColor(category);
//             }

//             // 如果选择了main_use属性，显示形状而不是圆圈
//             if (selectedAttributes[0] === "main_use") {
//                 const shape = MAIN_USE_SHAPES[item.main_use] || MAIN_USE_SHAPES.SEAWEA_UNKNOWN;
//                 const baseSize = category === "critical" ? 20 : 16;
//                 const finalSize = zoomInfo.getScaledSize(baseSize);

//                 return L.divIcon({
//                     className: "custom-main-use-marker",
//                     html: `
//                     <div style="
//                         display: flex;
//                         align-items: center;
//                         justify-content: center;
//                         width: ${finalSize}px;
//                         height: ${finalSize}px;
//                         transition: all 0.2s ease;
//                     ">
//                         <svg width="${finalSize}" height="${finalSize}" viewBox="0 0 ${finalSize} ${finalSize}">
//                             ${createSVGShape(shape, finalSize, baseColor)}
//                         </svg>
//                     </div>
//                 `,
//                     iconSize: [finalSize, finalSize],
//                     iconAnchor: [finalSize / 2, finalSize / 2],
//                 });
//             }

//             // 常规圆形标记
//             const minSize = 6;
//             const maxSize = 20;
//             const normalizedValue = Math.max(
//                 0,
//                 Math.min(1, attributeValue / getMaxAttributeValue(selectedAttributes[0]))
//             );
//             const baseSize = minSize + normalizedValue * (maxSize - minSize);
//             const finalSize = zoomInfo.getScaledSize(baseSize);

//             return L.divIcon({
//                 className: "custom-reservoir-marker",
//                 html: `
//                 <div style="
//                     background-color: ${baseColor};
//                     width: ${finalSize}px;
//                     height: ${finalSize}px;
//                     border-radius: 50%;
//                     border: 2px solid white;
//                     box-shadow: 0 2px 4px rgba(0,0,0,0.3);
//                     opacity: 0.8;
//                     transition: all 0.2s ease;
//                 " class="marker-dot"></div>
//             `,
//                 iconSize: [finalSize, finalSize],
//                 iconAnchor: [finalSize / 2, finalSize / 2],
//             });
//         };

//         // Main Use Legend Component
//         const MainUseLegend = ({ selectedAttribute, activeTab }) => {
//             if (selectedAttribute !== "main_use") return null;

//             const threshold = activeTab === "reservoirs" ? ">100MCM" : ">30MW";
//             const nonCriticalThreshold = activeTab === "reservoirs" ? "<100MCM" : "0-30MW";

//             return (
//                 <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs main-use-legend">
//                     <h3 className="font-semibold text-sm mb-3">Main Use Types</h3>

//                     <div className="mb-4">
//                         <h4 className="text-xs font-medium text-red-600 mb-2">
//                             Critical ({threshold})
//                         </h4>
//                         <div className="space-y-1">
//                             {Object.keys(MAIN_USE_SHAPES).map((useType) => (
//                                 <div
//                                     key={`critical-${useType}`}
//                                     className="flex items-center gap-2"
//                                 >
//                                     <div
//                                         className="w-4 h-4 flex items-center justify-center"
//                                         dangerouslySetInnerHTML={{
//                                             __html: `<svg width="16" height="16" viewBox="0 0 16 16">${createSVGShape(
//                                                 MAIN_USE_SHAPES[useType],
//                                                 16,
//                                                 "#ef4444"
//                                             )}</svg>`,
//                                         }}
//                                     />
//                                     <span className="text-xs">{useType}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     <div>
//                         <h4 className="text-xs font-medium text-blue-600 mb-2">
//                             Non-critical ({nonCriticalThreshold})
//                         </h4>
//                         <div className="space-y-1">
//                             {Object.keys(MAIN_USE_SHAPES).map((useType) => (
//                                 <div
//                                     key={`non-critical-${useType}`}
//                                     className="flex items-center gap-2"
//                                 >
//                                     <div
//                                         className="w-4 h-4 flex items-center justify-center"
//                                         dangerouslySetInnerHTML={{
//                                             __html: `<svg width="16" height="16" viewBox="0 0 16 16">${createSVGShape(
//                                                 MAIN_USE_SHAPES[useType],
//                                                 16,
//                                                 "#3b82f6"
//                                             )}</svg>`,
//                                         }}
//                                     />
//                                     <span className="text-xs">{useType}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             );
//         };

//         // Prepare data based on summary mode
//         const { individualMarkers, basinSummaries } = useMemo(() => {
//             if (showSummary) {
//                 // Basin summary mode
//                 const basins = aggregateDataByBasin(filteredData, activeTab, selectedAttributes[0]);
//                 return {
//                     individualMarkers: [],
//                     basinSummaries: basins,
//                 };
//             } else {
//                 // Individual marker mode
//                 const markers = filteredData
//                     .filter((item) => {
//                         // Valid coordinates
//                         if (!item.latitude || !item.longitude) return false;
//                         if (item.latitude < -90 || item.latitude > 90) return false;
//                         if (item.longitude < -180 || item.longitude > 180) return false;

//                         // Filter by category visibility
//                         const category = categorizeReservoirData(
//                             item,
//                             activeTab,
//                             selectedAttributes[0]
//                         );
//                         if (category === "critical" && !showCritical) return false;
//                         if (category === "non-critical" && !showNonCritical) return false;

//                         return true;
//                     })
//                     .map((item) => {
//                         const attributeValue =
//                             selectedAttributes.length > 0 ? item[selectedAttributes[0]] || 0 : 1;

//                         return {
//                             ...item,
//                             attributeValue: Math.max(0, attributeValue),
//                             category: categorizeReservoirData(
//                                 item,
//                                 activeTab,
//                                 selectedAttributes[0]
//                             ),
//                         };
//                     });

//                 return {
//                     individualMarkers: markers,
//                     basinSummaries: [],
//                 };
//             }
//         }, [
//             filteredData,
//             activeTab,
//             showCritical,
//             showNonCritical,
//             selectedAttributes,
//             showSummary,
//         ]);

//         if (loading || !leafletLoaded || !MapContainer) {
//             return (
//                 <div className="flex items-center justify-center h-full">
//                     <MapLoadingOverlay
//                         loading={true}
//                         message={!leafletLoaded ? "Loading map library..." : "Loading map data..."}
//                     />
//                 </div>
//             );
//         }

//         return (
//             <div className="relative w-full h-full">
//                 <MapContainer
//                     center={[13.0, 105.0]}
//                     zoom={5}
//                     className="w-full h-full"
//                     ref={(mapInstance) => {
//                         mapRef.current = mapInstance;
//                     }}
//                 >
//                     <TileLayer
//                         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                     />

//                     {/* 缩放响应式大小提供者 */}
//                     <ZoomBasedSizeProvider onSizeUpdate={handleZoomUpdate} />

//                     {/* 边界数据渲染 */}
//                     {mapData && (
//                         <GeoJSON
//                             data={mapData}
//                             style={{
//                                 fillColor: "#e5e7eb",
//                                 weight: 1,
//                                 opacity: 1,
//                                 color: "#374151",
//                                 fillOpacity: 0.1,
//                             }}
//                         />
//                     )}

//                     {/* 比例尺控件 */}
//                     <ScaleControl />

//                     {/* 水库掩膜图层 */}
//                     {reservoirMask && (
//                         <ReservoirMaskLayer
//                             maskData={reservoirMask}
//                             style={{
//                                 fillColor: "#4299e1",
//                                 weight: 2,
//                                 opacity: 1,
//                                 color: "#2b6cb0",
//                                 dashArray: "3",
//                                 fillOpacity: 0.4,
//                             }}
//                         />
//                     )}

//                     {/* 地图视角控制 */}
//                     {zoomTarget && (
//                         <MapViewController
//                             targetLocation={zoomTarget.location}
//                             zoomLevel={zoomTarget.zoom}
//                             onViewChangeComplete={() => setZoomTarget(null)}
//                         />
//                     )}

//                     {/* Basin summaries渲染 */}
//                     {showSummary &&
//                         basinSummaries.map((basin, index) => (
//                             <Marker
//                                 key={`basin-${basin.basin}-${index}`}
//                                 position={[basin.centerLat, basin.centerLng]}
//                                 icon={createBasinBarChartIcon(basin)}
//                                 eventHandlers={{
//                                     click: () => {
//                                         if (onBasinClick) {
//                                             onBasinClick(basin);
//                                         }
//                                     },
//                                 }}
//                             >
//                                 <Popup className="basin-popup">
//                                     <div className="basin-summary-popup">
//                                         <h3 className="font-semibold text-lg mb-2">
//                                             {basin.basin}
//                                         </h3>
//                                         <div className="space-y-2 text-sm">
//                                             <div className="flex justify-between">
//                                                 <span className="font-medium">
//                                                     Total {basin.isMeaningful ? "Sum:" : "Count:"}
//                                                 </span>
//                                                 <span className="font-bold">
//                                                     {basin.isMeaningful
//                                                         ? formatAttributeValue(
//                                                               basin.totalSum,
//                                                               basin.attribute
//                                                           )
//                                                         : basin.total}
//                                                 </span>
//                                             </div>

//                                             <div className="flex justify-between text-red-600">
//                                                 <span>Critical:</span>
//                                                 <span>
//                                                     {basin.isMeaningful
//                                                         ? formatAttributeValue(
//                                                               basin.criticalSum,
//                                                               basin.attribute
//                                                           )
//                                                         : basin.critical}
//                                                 </span>
//                                             </div>

//                                             <div className="flex justify-between text-blue-600">
//                                                 <span>Non-critical:</span>
//                                                 <span>
//                                                     {basin.isMeaningful
//                                                         ? formatAttributeValue(
//                                                               basin["non-criticalSum"],
//                                                               basin.attribute
//                                                           )
//                                                         : basin["non-critical"]}
//                                                 </span>
//                                             </div>

//                                             {basin.unknown > 0 && (
//                                                 <div className="flex justify-between text-gray-600">
//                                                     <span>Unknown:</span>
//                                                     <span>
//                                                         {basin.isMeaningful
//                                                             ? formatAttributeValue(
//                                                                   basin.unknownSum,
//                                                                   basin.attribute
//                                                               )
//                                                             : basin.unknown}
//                                                     </span>
//                                                 </div>
//                                             )}

//                                             {basin.isMeaningful && (
//                                                 <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
//                                                     Showing sum of{" "}
//                                                     {selectedAttributes[0]?.replace(/_/g, " ")}{" "}
//                                                     values
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </Popup>
//                             </Marker>
//                         ))}

//                     {/* Individual markers渲染 */}
//                     {!showSummary &&
//                         individualMarkers.map((item, index) => (
//                             <Marker
//                                 key={`${item.SEAWEA_ID || item.id || index}-${
//                                     item.reservoir_name || item.station_name
//                                 }`}
//                                 position={[item.latitude, item.longitude]}
//                                 icon={createIndividualIcon(item, item.attributeValue)}
//                                 eventHandlers={{
//                                     click: () => {
//                                         if (onMarkerClick) {
//                                             onMarkerClick(item);
//                                         }
//                                     },
//                                 }}
//                             >
//                                 <Popup className="custom-popup">
//                                     <div className="reservoir-popup">
//                                         <div className="flex justify-between items-start mb-2">
//                                             <h3 className="font-semibold text-lg">
//                                                 {item.reservoir_name ||
//                                                     item.station_name ||
//                                                     "Unknown"}
//                                             </h3>

//                                             {/* Dynamic Info 按钮 - 仅对 critical reservoir 显示 */}
//                                             {item.is_critical_reservoir &&
//                                                 item.INDEX &&
//                                                 onDynamicInfoClick && (
//                                                     <button
//                                                         onClick={(e) => {
//                                                             e.stopPropagation();
//                                                             onDynamicInfoClick(item);
//                                                         }}
//                                                         className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors flex items-center space-x-1"
//                                                         title="查看动态监测数据"
//                                                     >
//                                                         <span>Dynamic Info</span>
//                                                     </button>
//                                                 )}
//                                         </div>

//                                         <div className="space-y-1 text-sm">
//                                             <div className="flex justify-between">
//                                                 <span className="font-medium">Type:</span>
//                                                 <span
//                                                     className={`px-2 py-1 rounded text-xs ${
//                                                         item.category === "critical"
//                                                             ? "bg-red-100 text-red-800"
//                                                             : item.category === "non-critical"
//                                                             ? "bg-blue-100 text-blue-700"
//                                                             : "bg-gray-100 text-gray-700"
//                                                     }`}
//                                                 >
//                                                     {getCategoryLabel(item.category)}
//                                                 </span>
//                                             </div>

//                                             <div className="flex justify-between">
//                                                 <span className="font-medium">Status:</span>
//                                                 <span
//                                                     className={`px-2 py-1 rounded text-xs ${
//                                                         overviewMode === "current"
//                                                             ? "bg-green-100 text-green-800"
//                                                             : "bg-blue-100 text-blue-800"
//                                                     }`}
//                                                 >
//                                                     {item.status || "N/A"}
//                                                 </span>
//                                             </div>

//                                             <div className="flex justify-between">
//                                                 <span className="font-medium">Country:</span>
//                                                 <span>{item.country || "N/A"}</span>
//                                             </div>

//                                             {item.commission_year && (
//                                                 <div className="flex justify-between">
//                                                     <span className="font-medium">Year:</span>
//                                                     <span>{item.commission_year}</span>
//                                                 </div>
//                                             )}

//                                             {activeTab === "reservoirs" && (
//                                                 <>
//                                                     <div className="flex justify-between">
//                                                         <span className="font-medium">
//                                                             Capacity:
//                                                         </span>
//                                                         <span>
//                                                             {formatAttributeValue(
//                                                                 item.normal_capacity_mcm,
//                                                                 "normal_capacity_mcm"
//                                                             )}
//                                                         </span>
//                                                     </div>
//                                                     <div className="flex justify-between">
//                                                         <span className="font-medium">Area:</span>
//                                                         <span>
//                                                             {formatAttributeValue(
//                                                                 item.normal_area_km2,
//                                                                 "normal_area_km2"
//                                                             )}
//                                                         </span>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {activeTab === "hydropower" && (
//                                                 <>
//                                                     <div className="flex justify-between">
//                                                         <span className="font-medium">Power:</span>
//                                                         <span>
//                                                             {formatAttributeValue(
//                                                                 item.power_mw,
//                                                                 "power_mw"
//                                                             )}
//                                                         </span>
//                                                     </div>
//                                                     <div className="flex justify-between">
//                                                         <span className="font-medium">Head:</span>
//                                                         <span>
//                                                             {formatAttributeValue(
//                                                                 item.water_head_m,
//                                                                 "water_head_m"
//                                                             )}
//                                                         </span>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {item.main_use && (
//                                                 <div className="flex justify-between">
//                                                     <span className="font-medium">Main Use:</span>
//                                                     <span>{item.main_use}</span>
//                                                 </div>
//                                             )}

//                                             {item.INDEX && (
//                                                 <div className="flex justify-between text-xs text-gray-500">
//                                                     <span>INDEX:</span>
//                                                     <span>{item.INDEX}</span>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </Popup>
//                             </Marker>
//                         ))}

//                     {/* Main Use Legend */}
//                     <MainUseLegend
//                         selectedAttribute={selectedAttributes[0]}
//                         activeTab={activeTab}
//                     />
//                 </MapContainer>
//             </div>
//         );
//     }
// );

// // 设置displayName以便调试
// MapComponent.displayName = "MapComponent";

// export default MapComponent;
