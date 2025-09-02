import React, { useState, useMemo, useEffect } from "react";
import { BarChart3, Info } from "lucide-react";
import MapComponent from "../Map/DynamicMapComponent";
import { formatAttributeValue, isMeaningfulAttribute } from "../../utils/dataUtils";

// Import responsive components
import { ResponsiveNavbar } from "../responsive/ResponsiveNavbar";
import { ResponsiveSidebar } from "../responsive/ResponsiveSidebar";
// import MainUseLegend from "../Map/MainUseLegend";

import { useOverviewMode } from "../../utils/overviewModeHandler";
import { getBasinSystem } from "../../utils/basinAssignment";

const ReservoirDashboard = () => {
    const [data, setData] = useState({
        features: [],
        summary: {},
        metadata: { filters: { countries: [], main_uses: [] } },
    });
    const [loading, setLoading] = useState(true);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [selectedBasin, setSelectedBasin] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Options state following the requested pattern
    const [options, setOptions] = useState({
        activeTab: "reservoirs",
        spatialUnit: "basins",
        selectedCountries: [],
        selectedUses: [],
        selectedAttribute: "normal_capacity_mcm",
        showCritical: true,
        showNonCritical: true,
        showSummary: false, // New summary toggle
        overview: "current", // Updated by navbar buttons
        dateType: "current",
    });

    // Handle responsive breakpoints
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true); // Auto-open on desktop
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Generic update function for options
    const updateOption = (key, value) => {
        setOptions((prev) => ({
            ...prev,
            [key]: value,
        }));

        // Clear selections when changing modes
        if (key === "showSummary") {
            setSelectedMarker(null);
            setSelectedBasin(null);
        }
    };

    // Handle sidebar toggle
    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Handle marker clicks
    const handleMarkerClick = (markerData) => {
        setSelectedMarker(markerData);
        setSelectedBasin(null); // Clear basin selection
    };

    // Handle basin clicks
    const handleBasinClick = (basinData) => {
        setSelectedBasin(basinData);
        setSelectedMarker(null); // Clear marker selection
    };

    // Load data on component mount
    useEffect(() => {
        fetch("/data/processed_all_reservoirs.json")
            .then((response) => response.json())
            .then((jsonData) => {
                setData(jsonData);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error loading data:", error);
                setLoading(false);
            });
    }, []);

    // First: filter data by options.overview
    const {
        overviewMode, // "current" 或 "future"
        filteredData, // 根据模式过滤的数据
        modeConfig, // 当前模式的配置
        stats, // 统计信息
        basinSystem, // basin系统
    } = useOverviewMode(data.features, options);

    // Filter logic based on options
    // const filteredData = useMemo(() => {
    //     if (!data.features || data.features.length === 0) return [];

    //     return data.features.filter((item) => {
    //         if (
    //             options.selectedCountries.length > 0 &&
    //             !options.selectedCountries.includes(item.country)
    //         )
    //             return false;
    //         if (options.selectedUses.length > 0 && !options.selectedUses.includes(item.main_use))
    //             return false;

    //         if (options.activeTab === "reservoirs") {
    //             if (!options.showCritical && item.is_critical_reservoir) return false;
    //             if (!options.showNonCritical && !item.is_critical_reservoir) return false;
    //         } else {
    //             if (!options.showCritical && item.is_critical_hydropower) return false;
    //             if (!options.showNonCritical && !item.is_critical_hydropower) return false;
    //         }

    //         return true;
    //     });
    // }, [data.features, options]);

    // Second: filter data using other properties
    const finalFilteredData = useMemo(() => {
        // 在overview过滤的基础上进行额外的属性过滤
        return filteredData.filter((item) => {
            // 应用现有的country, main_use等过滤逻辑
            if (
                options.selectedCountries.length > 0 &&
                !options.selectedCountries.includes(item.country)
            ) {
                return false;
            }

            if (options.selectedUses.length > 0 && !options.selectedUses.includes(item.main_use)) {
                return false;
            }

            return true;
        });
    }, [filteredData, options.selectedCountries, options.selectedUses]);

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="seawea-main-layout">
            {/* Enhanced Responsive Navbar */}
            <ResponsiveNavbar
                options={options}
                updateOption={updateOption}
                onSidebarToggle={isMobile ? handleSidebarToggle : null}
                sidebarOpen={sidebarOpen}
            />

            {/* Enhanced Responsive Sidebar */}
            <ResponsiveSidebar
                options={options}
                updateOption={updateOption}
                availableCountries={data.metadata?.filters?.countries || []}
                availableUses={data.metadata?.filters?.main_uses || []}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                isMobile={isMobile}
            />

            {/* Main Content Area - Moves horizontally with sidebar, fixed vertically */}
            <div className={`seawea-content ${!sidebarOpen ? "sidebar-collapsed" : ""}`}>
                {/* Map Container - Fixed Y-axis, responsive X-axis */}
                <div className="seawea-map-container">
                    <MapComponent
                        activeTab={options.activeTab}
                        filteredData={filteredData}
                        selectedAttributes={[options.selectedAttribute]}
                        showCritical={options.showCritical}
                        showNonCritical={options.showNonCritical}
                        spatialUnit={options.spatialUnit}
                        showSummary={options.showSummary}
                        onMarkerClick={handleMarkerClick}
                        onBasinClick={handleBasinClick}
                    />
                </div>

                {/* Summary Panel - Fixed at bottom, fixed height */}
                <div className="seawea-summary-panel">
                    <div className="h-full p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                                <BarChart3 className="w-5 h-5 mr-2" />
                                <h3 className="font-semibold">Summary</h3>
                                <span className="ml-2 text-sm text-gray-500">
                                    (
                                    {options.overview === "current"
                                        ? "Current Data"
                                        : "Future Projections"}
                                    ){options.showSummary && " - Basin View"}
                                </span>
                            </div>
                            {(selectedMarker || selectedBasin) && (
                                <button
                                    onClick={() => {
                                        setSelectedMarker(null);
                                        setSelectedBasin(null);
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Clear Selection
                                </button>
                            )}
                        </div>

                        {selectedBasin ? (
                            // Selected basin details with enhanced display
                            <div className="h-32 overflow-y-auto">
                                <div className="bg-green-50 p-3 rounded mb-2">
                                    <h4 className="font-semibold text-green-800">
                                        {selectedBasin.basin}
                                    </h4>
                                    <p className="text-sm text-green-600">
                                        Basin Summary -{" "}
                                        {selectedBasin.isMeaningful
                                            ? "Sum of Values"
                                            : "Count of Items"}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Total:</span>
                                            <span className="font-bold">
                                                {selectedBasin.isMeaningful
                                                    ? formatAttributeValue(
                                                          selectedBasin.totalSum,
                                                          selectedBasin.attribute
                                                      )
                                                    : `${selectedBasin.total} items`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="flex items-center text-red-600">
                                                <span className="w-2 h-2 bg-red-500 rounded mr-1"></span>
                                                Critical:
                                            </span>
                                            <span className="text-red-600 font-medium">
                                                {selectedBasin.isMeaningful
                                                    ? formatAttributeValue(
                                                          selectedBasin.criticalSum,
                                                          selectedBasin.attribute
                                                      )
                                                    : `${selectedBasin.critical} items`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="flex items-center text-blue-600">
                                                <span className="w-2 h-2 bg-blue-500 rounded mr-1"></span>
                                                Non-critical:
                                            </span>
                                            <span className="text-blue-600 font-medium">
                                                {selectedBasin.isMeaningful
                                                    ? formatAttributeValue(
                                                          selectedBasin["non-criticalSum"],
                                                          selectedBasin.attribute
                                                      )
                                                    : `${selectedBasin["non-critical"]} items`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="flex items-center text-gray-600">
                                                <span className="w-2 h-2 bg-gray-500 rounded mr-1"></span>
                                                Unknown:
                                            </span>
                                            <span className="text-gray-600 font-medium">
                                                {selectedBasin.isMeaningful
                                                    ? formatAttributeValue(
                                                          selectedBasin.unknownSum,
                                                          selectedBasin.attribute
                                                      )
                                                    : `${selectedBasin.unknown} items`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {selectedBasin.isMeaningful && (
                                    <div className="mt-2 text-xs text-gray-500 text-center">
                                        Meaningful attribute: values are summed
                                    </div>
                                )}
                            </div>
                        ) : selectedMarker ? (
                            // Selected marker details
                            <div className="h-32 overflow-y-auto">
                                <div className="bg-blue-50 p-3 rounded mb-2">
                                    <h4 className="font-semibold text-blue-800">
                                        {selectedMarker.reservoir_name ||
                                            selectedMarker.station_name}
                                    </h4>
                                    <p className="text-sm text-blue-600">
                                        {selectedMarker.country}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="font-medium">Type: </span>
                                        <span
                                            className={`px-1 py-0.5 rounded text-xs ${
                                                selectedMarker.category === "critical"
                                                    ? "bg-red-100 text-red-700"
                                                    : selectedMarker.category === "non-critical"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {selectedMarker.category === "critical"
                                                ? "Critical"
                                                : selectedMarker.category === "non-critical"
                                                ? "Non-critical"
                                                : "Unknown"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Status: </span>
                                        {selectedMarker.status || "N/A"}
                                    </div>
                                    {options.activeTab === "reservoirs" && (
                                        <>
                                            <div>
                                                <span className="font-medium">Capacity: </span>
                                                {formatAttributeValue(
                                                    selectedMarker.normal_capacity_mcm,
                                                    "normal_capacity_mcm"
                                                )}
                                            </div>
                                            <div>
                                                <span className="font-medium">Area: </span>
                                                {formatAttributeValue(
                                                    selectedMarker.normal_area_km2,
                                                    "normal_area_km2"
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {options.activeTab === "hydropower" && (
                                        <>
                                            <div>
                                                <span className="font-medium">Power: </span>
                                                {formatAttributeValue(
                                                    selectedMarker.power_mw,
                                                    "power_mw"
                                                )}
                                            </div>
                                            <div>
                                                <span className="font-medium">Head: </span>
                                                {formatAttributeValue(
                                                    selectedMarker.water_head_m,
                                                    "water_head_m"
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Overall summary statistics
                            <div className="grid grid-cols-4 gap-4 h-32">
                                <div className="bg-gray-50 p-3 rounded">
                                    <h4 className="text-sm font-medium text-gray-600">Total</h4>
                                    <p className="text-2xl font-bold">{filteredData.length}</p>
                                    {options.showSummary && (
                                        <p className="text-xs text-gray-500">
                                            {isMeaningfulAttribute(options.selectedAttribute)
                                                ? "Sum mode"
                                                : "Count mode"}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-red-50 p-3 rounded">
                                    <h4 className="text-sm font-medium text-red-600">Critical</h4>
                                    <p className="text-2xl font-bold text-red-600">
                                        {
                                            filteredData.filter((item) =>
                                                options.activeTab === "reservoirs"
                                                    ? item.is_critical_reservoir
                                                    : item.is_critical_hydropower
                                            ).length
                                        }
                                    </p>
                                </div>
                                <div className="bg-blue-50 p-3 rounded">
                                    <h4 className="text-sm font-medium text-blue-600">
                                        Non-critical
                                    </h4>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {
                                            filteredData.filter((item) =>
                                                options.activeTab === "reservoirs"
                                                    ? !item.is_critical_reservoir
                                                    : !item.is_critical_hydropower
                                            ).length
                                        }
                                    </p>
                                </div>
                                <div className="bg-green-50 p-3 rounded">
                                    <h4 className="text-sm font-medium text-green-600">
                                        {options.showSummary ? "Basins" : "Countries"}
                                    </h4>
                                    <p className="text-2xl font-bold text-green-600">
                                        {options.showSummary
                                            ? new Set(
                                                  filteredData.map((item) => {
                                                      // Simple basin classification based on coordinates
                                                      const lat = item.latitude;
                                                      const lng = item.longitude;
                                                      if (
                                                          lat >= 20 &&
                                                          lat <= 30 &&
                                                          lng >= 100 &&
                                                          lng <= 110
                                                      )
                                                          return "Red River Basin";
                                                      if (
                                                          lat >= 10 &&
                                                          lat <= 20 &&
                                                          lng >= 105 &&
                                                          lng <= 115
                                                      )
                                                          return "Mekong River Basin";
                                                      if (
                                                          lat >= 15 &&
                                                          lat <= 25 &&
                                                          lng >= 95 &&
                                                          lng <= 105
                                                      )
                                                          return "Irrawaddy River Basin";
                                                      if (
                                                          lat >= 5 &&
                                                          lat <= 15 &&
                                                          lng >= 100 &&
                                                          lng <= 110
                                                      )
                                                          return "Chao Phraya Basin";
                                                      if (
                                                          lat >= 0 &&
                                                          lat <= 10 &&
                                                          lng >= 95 &&
                                                          lng <= 115
                                                      )
                                                          return "Peninsular Malaysia Basin";
                                                      if (
                                                          lat >= 15 &&
                                                          lat <= 25 &&
                                                          lng >= 110 &&
                                                          lng <= 120
                                                      )
                                                          return "Pearl River Basin";
                                                      return "Other Southeast Asian Basins";
                                                  })
                                              ).size
                                            : new Set(
                                                  filteredData
                                                      .map((item) => item.country)
                                                      .filter(Boolean)
                                              ).size}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReservoirDashboard;

// import React, { useState, useMemo, useEffect, useRef } from "react";
// import { BarChart3, Info } from "lucide-react";
// import MapComponent from "../Map/DynamicMapComponent";
// import { formatAttributeValue, isMeaningfulAttribute } from "../../utils/dataUtils";
// import { useOverviewMode } from "../../utils/overviewModeHandler";
// import DynamicInfoPanel from "../DynamicInfo/DynamicInfoSystem";

// // Import responsive components
// import { ResponsiveNavbar } from "../responsive/ResponsiveNavbar";
// import { ResponsiveSidebar } from "../responsive/ResponsiveSidebar";

// const ReservoirDashboard = () => {
//     const [data, setData] = useState({
//         features: [],
//         summary: {},
//         metadata: { filters: { countries: [], main_uses: [] } },
//     });
//     const [loading, setLoading] = useState(true);
//     const [selectedMarker, setSelectedMarker] = useState(null);
//     const [selectedBasin, setSelectedBasin] = useState(null);
//     const [sidebarOpen, setSidebarOpen] = useState(true);
//     const [isMobile, setIsMobile] = useState(false);

//     // Dynamic Info 相关状态
//     const [showDynamicInfo, setShowDynamicInfo] = useState(false);
//     const [selectedReservoir, setSelectedReservoir] = useState(null);
//     const [reservoirMask, setReservoirMask] = useState(null);

//     // Map reference for zoom control
//     const mapRef = useRef(null);

//     // Options state following the requested pattern
//     const [options, setOptions] = useState({
//         activeTab: "reservoirs",
//         spatialUnit: "basins",
//         selectedCountries: [],
//         selectedUses: [],
//         selectedAttribute: "normal_capacity_mcm",
//         showCritical: true,
//         showNonCritical: true,
//         showSummary: false,
//         overview: "current", // This will be updated by navbar buttons
//         dateType: "current",
//     });

//     // 使用overview模式hook进行数据处理
//     const {
//         overviewMode,
//         filteredData: overviewFilteredData,
//         modeConfig,
//         stats,
//         basinSystem,
//     } = useOverviewMode(data.features, options);

//     // Handle responsive breakpoints
//     useEffect(() => {
//         const handleResize = () => {
//             const mobile = window.innerWidth < 768;
//             setIsMobile(mobile);
//             if (mobile) {
//                 setSidebarOpen(false);
//             } else {
//                 setSidebarOpen(true); // Auto-open on desktop
//             }
//         };

//         handleResize();
//         window.addEventListener("resize", handleResize);
//         return () => window.removeEventListener("resize", handleResize);
//     }, []);

//     // Generic update function for options
//     const updateOption = (key, value) => {
//         setOptions((prev) => ({
//             ...prev,
//             [key]: value,
//         }));

//         // Clear selections when changing modes
//         if (key === "showSummary" || key === "overview") {
//             setSelectedMarker(null);
//             setSelectedBasin(null);

//             // Close dynamic info when switching modes
//             if (key === "overview") {
//                 setShowDynamicInfo(false);
//                 setSelectedReservoir(null);
//                 setReservoirMask(null);
//             }
//         }
//     };

//     // Handle sidebar toggle
//     const handleSidebarToggle = () => {
//         setSidebarOpen(!sidebarOpen);
//     };

//     // Handle marker clicks
//     const handleMarkerClick = (markerData) => {
//         setSelectedMarker(markerData);
//         setSelectedBasin(null); // Clear basin selection
//     };

//     // Handle basin clicks
//     const handleBasinClick = (basinData) => {
//         setSelectedBasin(basinData);
//         setSelectedMarker(null); // Clear marker selection
//     };

//     // Handle Dynamic Info clicks
//     const handleDynamicInfoClick = (reservoir) => {
//         console.log("Dynamic Info clicked for reservoir:", reservoir);
//         setSelectedReservoir(reservoir);
//         setShowDynamicInfo(true);

//         // Close other panels
//         setSelectedMarker(null);
//         setSelectedBasin(null);
//     };

//     // Handle zoom to reservoir with mask
//     const handleZoomToReservoir = async (reservoir) => {
//         console.log("Zooming to reservoir:", reservoir);

//         // Zoom map to reservoir location
//         if (mapRef.current) {
//             const map = mapRef.current;
//             map.setView([reservoir.latitude, reservoir.longitude], 12);
//         }

//         // Try to load reservoir mask
//         await loadReservoirMask(reservoir);
//     };

//     // Load reservoir water surface mask
//     const loadReservoirMask = async (reservoir) => {
//         if (!reservoir.critical_reservoir_id) {
//             console.warn("No critical_reservoir_id found for reservoir:", reservoir);
//             return;
//         }

//         try {
//             // Try multiple possible file paths and formats
//             const possiblePaths = [
//                 `/data/criticalReservoirsShape/${reservoir.critical_reservoir_id}.geojson`,
//                 `/data/criticalReservoirsShape/reservoir_${reservoir.critical_reservoir_id}.geojson`,
//                 `/data/reservoirShapes/${reservoir.critical_reservoir_id}.geojson`,
//             ];

//             let maskData = null;
//             for (const path of possiblePaths) {
//                 try {
//                     const response = await fetch(path);
//                     if (response.ok) {
//                         maskData = await response.json();
//                         console.log("Successfully loaded reservoir mask from:", path);
//                         break;
//                     }
//                 } catch (error) {
//                     console.log("Failed to load from:", path);
//                 }
//             }

//             if (maskData) {
//                 setReservoirMask(maskData);
//             } else {
//                 console.warn(
//                     "Could not load reservoir mask for ID:",
//                     reservoir.critical_reservoir_id
//                 );
//             }
//         } catch (error) {
//             console.error("Error loading reservoir mask:", error);
//         }
//     };

//     // Load data on component mount
//     useEffect(() => {
//         const loadData = async () => {
//             try {
//                 // Load the comprehensive dataset (JSON2 equivalent)
//                 const response = await fetch("/data/processed_all_reservoirs.json");
//                 if (!response.ok) {
//                     throw new Error("Failed to load data");
//                 }

//                 const jsonData = await response.json();
//                 setData(jsonData);
//                 console.log("Loaded data:", {
//                     total: jsonData.features?.length || 0,
//                     sample: jsonData.features?.[0],
//                 });
//             } catch (error) {
//                 console.error("Error loading data:", error);
//                 // Try fallback data source
//                 try {
//                     const fallbackResponse = await fetch("/data/processed_reservoir_data.json");
//                     const fallbackData = await fallbackResponse.json();
//                     setData(fallbackData);
//                     console.log("Loaded fallback data");
//                 } catch (fallbackError) {
//                     console.error("Error loading fallback data:", fallbackError);
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         loadData();
//     }, []);

//     // Apply additional filters on top of overview filtering
//     const finalFilteredData = useMemo(() => {
//         if (!overviewFilteredData) return [];

//         return overviewFilteredData.filter((item) => {
//             // Country filter
//             if (
//                 options.selectedCountries.length > 0 &&
//                 !options.selectedCountries.includes(item.country)
//             ) {
//                 return false;
//             }

//             // Main use filter
//             if (options.selectedUses.length > 0 && !options.selectedUses.includes(item.main_use)) {
//                 return false;
//             }

//             // Critical/Non-critical filter
//             const isCritical =
//                 options.activeTab === "reservoirs"
//                     ? item.is_critical_reservoir
//                     : item.is_critical_hydropower;

//             if (!options.showCritical && isCritical) return false;
//             if (!options.showNonCritical && !isCritical) return false;

//             return true;
//         });
//     }, [overviewFilteredData, options]);

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center h-screen">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Loading SEA-WEA Dashboard...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex flex-col h-screen bg-gray-50">
//             {/* Navigation */}
//             <ResponsiveNavbar
//                 options={options}
//                 updateOption={updateOption}
//                 onSidebarToggle={handleSidebarToggle}
//                 isMobile={isMobile}
//                 modeConfig={modeConfig}
//             />

//             <div className="flex flex-1 overflow-hidden">
//                 {/* Sidebar */}
//                 {/* <ResponsiveSidebar
//                     isOpen={sidebarOpen}
//                     isMobile={isMobile}
//                     options={options}
//                     updateOption={updateOption}
//                     countries={data.metadata?.filters?.countries || []}
//                     mainUses={data.metadata?.filters?.main_uses || []}
//                     stats={stats}
//                     overviewMode={overviewMode}
//                     modeConfig={modeConfig}
//                 /> */}
//                 <ResponsiveSidebar
//                     options={options}
//                     updateOption={updateOption}
//                     availableCountries={data.metadata?.filters?.countries || []}
//                     availableUses={data.metadata?.filters?.main_uses || []}
//                     sidebarOpen={sidebarOpen}
//                     setSidebarOpen={setSidebarOpen}
//                     isMobile={isMobile}
//                 />

//                 {/* Main Content */}
//                 <div className="flex-1 flex flex-col relative">
//                     {/* Map Container - adjust height based on dynamic info panel */}
//                     <div
//                         className={`transition-all duration-300 ${
//                             showDynamicInfo ? "h-1/2" : "flex-1"
//                         }`}
//                     >
//                         <MapComponent
//                             ref={mapRef}
//                             activeTab={options.activeTab}
//                             filteredData={finalFilteredData}
//                             selectedAttributes={[options.selectedAttribute]}
//                             showCritical={options.showCritical}
//                             showNonCritical={options.showNonCritical}
//                             spatialUnit={options.spatialUnit}
//                             showSummary={options.showSummary}
//                             onMarkerClick={handleMarkerClick}
//                             onBasinClick={handleBasinClick}
//                             onDynamicInfoClick={handleDynamicInfoClick}
//                             reservoirMask={reservoirMask}
//                             overviewMode={overviewMode}
//                             modeConfig={modeConfig}
//                         />
//                     </div>

//                     {/* Dynamic Info Panel */}
//                     {showDynamicInfo && selectedReservoir && (
//                         <div className="h-1/2 border-t border-gray-200">
//                             <DynamicInfoPanel
//                                 reservoir={selectedReservoir}
//                                 onClose={() => {
//                                     setShowDynamicInfo(false);
//                                     setSelectedReservoir(null);
//                                     setReservoirMask(null);
//                                 }}
//                                 onZoomToReservoir={handleZoomToReservoir}
//                             />
//                         </div>
//                     )}

//                     {/* Right sidebar for details */}
//                     <div
//                         className={`right-sidebar transition-all duration-300 ${
//                             (selectedMarker || selectedBasin) && !isMobile
//                                 ? "w-80 border-l border-gray-200"
//                                 : "w-0 overflow-hidden"
//                         } bg-white`}
//                     >
//                         <div className="p-4 h-full overflow-y-auto">
//                             {selectedMarker && (
//                                 <div className="space-y-4">
//                                     <div className="flex justify-between items-center">
//                                         <h3 className="text-lg font-semibold">
//                                             {selectedMarker.reservoir_name ||
//                                                 selectedMarker.station_name}
//                                         </h3>
//                                         <button
//                                             onClick={() => setSelectedMarker(null)}
//                                             className="text-gray-500 hover:text-gray-700"
//                                         >
//                                             ×
//                                         </button>
//                                     </div>

//                                     <div className="space-y-2 text-sm">
//                                         <div className="flex justify-between">
//                                             <span className="font-medium">Overview Mode:</span>
//                                             <span
//                                                 className={`px-2 py-1 rounded text-xs ${
//                                                     overviewMode === "current"
//                                                         ? "bg-green-100 text-green-800"
//                                                         : "bg-blue-100 text-blue-800"
//                                                 }`}
//                                             >
//                                                 {modeConfig.title}
//                                             </span>
//                                         </div>

//                                         <div className="flex justify-between">
//                                             <span className="font-medium">Type:</span>
//                                             <span
//                                                 className={`px-2 py-1 rounded text-xs ${
//                                                     selectedMarker.is_critical_reservoir
//                                                         ? "bg-red-100 text-red-800"
//                                                         : "bg-blue-100 text-blue-700"
//                                                 }`}
//                                             >
//                                                 {selectedMarker.is_critical_reservoir
//                                                     ? "Critical"
//                                                     : "Non-critical"}
//                                             </span>
//                                         </div>

//                                         <div className="flex justify-between">
//                                             <span className="font-medium">Status:</span>
//                                             <span>{selectedMarker.status || "N/A"}</span>
//                                         </div>

//                                         <div className="flex justify-between">
//                                             <span className="font-medium">Country:</span>
//                                             <span>{selectedMarker.country || "N/A"}</span>
//                                         </div>

//                                         {selectedMarker.commission_year && (
//                                             <div className="flex justify-between">
//                                                 <span className="font-medium">
//                                                     Commission Year:
//                                                 </span>
//                                                 <span>{selectedMarker.commission_year}</span>
//                                             </div>
//                                         )}

//                                         {options.activeTab === "reservoirs" && (
//                                             <>
//                                                 <div className="flex justify-between">
//                                                     <span className="font-medium">Capacity:</span>
//                                                     <span>
//                                                         {formatAttributeValue(
//                                                             selectedMarker.normal_capacity_mcm,
//                                                             "normal_capacity_mcm"
//                                                         )}
//                                                     </span>
//                                                 </div>
//                                                 <div className="flex justify-between">
//                                                     <span className="font-medium">Area:</span>
//                                                     <span>
//                                                         {formatAttributeValue(
//                                                             selectedMarker.normal_area_km2,
//                                                             "normal_area_km2"
//                                                         )}
//                                                     </span>
//                                                 </div>
//                                             </>
//                                         )}

//                                         {options.activeTab === "hydropower" && (
//                                             <>
//                                                 <div className="flex justify-between">
//                                                     <span className="font-medium">Power:</span>
//                                                     <span>
//                                                         {formatAttributeValue(
//                                                             selectedMarker.power_mw,
//                                                             "power_mw"
//                                                         )}
//                                                     </span>
//                                                 </div>
//                                                 <div className="flex justify-between">
//                                                     <span className="font-medium">Head:</span>
//                                                     <span>
//                                                         {formatAttributeValue(
//                                                             selectedMarker.water_head_m,
//                                                             "water_head_m"
//                                                         )}
//                                                     </span>
//                                                 </div>
//                                             </>
//                                         )}

//                                         {/* Dynamic Info按钮 - 只对critical reservoir显示 */}
//                                         {selectedMarker.is_critical_reservoir &&
//                                             selectedMarker.INDEX && (
//                                                 <div className="mt-4 pt-4 border-t">
//                                                     <button
//                                                         onClick={() =>
//                                                             handleDynamicInfoClick(selectedMarker)
//                                                         }
//                                                         className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
//                                                     >
//                                                         <BarChart3 className="w-4 h-4" />
//                                                         <span>Dynamic Info</span>
//                                                     </button>
//                                                 </div>
//                                             )}
//                                     </div>
//                                 </div>
//                             )}

//                             {selectedBasin && (
//                                 <div className="space-y-4">
//                                     <div className="flex justify-between items-center">
//                                         <h3 className="text-lg font-semibold">
//                                             {selectedBasin.basin}
//                                         </h3>
//                                         <button
//                                             onClick={() => setSelectedBasin(null)}
//                                             className="text-gray-500 hover:text-gray-700"
//                                         >
//                                             ×
//                                         </button>
//                                     </div>

//                                     <div className="space-y-2 text-sm">
//                                         <div className="grid grid-cols-2 gap-4">
//                                             <div className="bg-red-50 p-3 rounded">
//                                                 <div className="font-medium text-red-600">
//                                                     Critical
//                                                 </div>
//                                                 <div className="text-lg font-bold">
//                                                     {selectedBasin.critical}
//                                                 </div>
//                                             </div>
//                                             <div className="bg-blue-50 p-3 rounded">
//                                                 <div className="font-medium text-blue-600">
//                                                     Non-critical
//                                                 </div>
//                                                 <div className="text-lg font-bold">
//                                                     {selectedBasin["non-critical"]}
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="bg-gray-50 p-3 rounded">
//                                             <div className="font-medium text-gray-600">Total</div>
//                                             <div className="text-xl font-bold">
//                                                 {selectedBasin.total}
//                                             </div>
//                                         </div>

//                                         {selectedBasin.isMeaningful && (
//                                             <div className="mt-2 pt-2 border-t text-xs text-gray-600">
//                                                 Values shown as sum of{" "}
//                                                 {selectedBasin.attribute.replace(/_/g, " ")}
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ReservoirDashboard;
