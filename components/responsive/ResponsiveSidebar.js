// import React, { useState, useEffect } from "react";

// // Import your SEA-WEA selectors
// import { AttributeSelector } from "@components/Selectors/AttributeSelector";
// import { CountrySelector } from "@components/Selectors/CountrySelector";
// import { CriticalitySelector } from "@components/Selectors/CriticalitySelector";
// import { MainUseSelector } from "@components/Selectors/MainUseSelector";
// import { SpatialUnitSelector } from "@components/Selectors/SpatialUnitSelector";
// import { WaterEnergySelector } from "@components/Selectors/WaterEnergySelector";

// export const ResponsiveSidebar = ({
//     options,
//     updateOption,
//     availableCountries = [],
//     availableUses = [],
//     sidebarOpen,
//     setSidebarOpen,
//     isMobile = false,
// }) => {
//     const [sidebarTextVisible, setSidebarTextVisible] = useState(!isMobile);

//     // Handle window resize
//     useEffect(() => {
//         const handleResize = () => {
//             const mobile = window.innerWidth < 768;
//             if (mobile && sidebarOpen) {
//                 setSidebarTextVisible(false);
//             }
//         };

//         window.addEventListener("resize", handleResize);
//         return () => window.removeEventListener("resize", handleResize);
//     }, [sidebarOpen]);

//     // Handle sidebar visibility with animation
//     useEffect(() => {
//         if (!sidebarOpen) {
//             setSidebarTextVisible(false);
//         } else {
//             // Delay showing content until animation completes
//             const timer = setTimeout(() => setSidebarTextVisible(true), 150);
//             return () => clearTimeout(timer);
//         }
//     }, [sidebarOpen]);

//     return (
//         <div
//             className={`seawea-sidebar ${
//                 sidebarOpen ? "open" : "collapsed"
//             } transition-all duration-300 ease-in-out`}
//         >
//             {/* Desktop Toggle Button */}
//             {!isMobile && (
//                 <button
//                     className="sidebar-toggle-btn"
//                     onClick={() => setSidebarOpen(!sidebarOpen)}
//                     aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
//                 >
//                     <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className={`h-4 w-4 transition-transform duration-200 ${
//                             sidebarOpen ? "rotate-180" : ""
//                         }`}
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                     >
//                         <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M15 19l-7-7 7-7"
//                         />
//                     </svg>
//                 </button>
//             )}

//             {/* Sidebar Content */}
//             <div
//                 className={`sidebar-content ${
//                     sidebarTextVisible ? "visible" : "hidden"
//                 } transition-opacity duration-200 overflow-y-auto`}
//             >
//                 {sidebarOpen && (
//                     <div className="space-y-2">
//                         <SpatialUnitSelector options={options} updateOption={updateOption} />

//                         <WaterEnergySelector options={options} updateOption={updateOption} />

//                         <CriticalitySelector options={options} updateOption={updateOption} />

//                         <CountrySelector
//                             options={options}
//                             updateOption={updateOption}
//                             availableCountries={availableCountries}
//                         />

//                         <MainUseSelector
//                             options={options}
//                             updateOption={updateOption}
//                             availableUses={availableUses}
//                         />

//                         <AttributeSelector options={options} updateOption={updateOption} />

//                         {/* Info Panel */}
//                         <div className="mt-6 p-3 bg-gray-50 rounded text-sm">
//                             <div className="flex items-start space-x-2">
//                                 <svg
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0"
//                                     fill="none"
//                                     viewBox="0 0 24 24"
//                                     stroke="currentColor"
//                                 >
//                                     <path
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         strokeWidth={2}
//                                         d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                                     />
//                                 </svg>
//                                 <p className="text-gray-700">
//                                     Marker size represents:{" "}
//                                     <strong>{options.selectedAttribute?.replace(/_/g, " ")}</strong>
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Collapsed state hint */}
//                 {!sidebarOpen && !isMobile && (
//                     <div className="collapsed-hint">
//                         <div className="transform -rotate-90 text-xs text-gray-500 whitespace-nowrap">
//                             Filters
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ResponsiveSidebar;

import React, { useState, useEffect } from "react";

// Import your SEA-WEA selectors
import { AttributeSelector } from "@components/Selectors/AttributeSelector";
// import AttributeSelector from "@components/Selectors/AttributeSelector";
import { CountrySelector } from "@components/Selectors/CountrySelector";
import { CriticalitySelector } from "@components/Selectors/CriticalitySelector";
import { SpatialUnitSelector } from "@components/Selectors/SpatialUnitSelector";
import { WaterEnergySelector } from "@components/Selectors/WaterEnergySelector";
import { SummaryToggleSelector } from "@components/Selectors/SummaryToggleSelector";

import { MainUseSelector } from "@components/Selectors/MainUseSelector";

export const ResponsiveSidebar = ({
    options,
    updateOption,
    availableCountries = [],
    availableUses = [],
    sidebarOpen,
    setSidebarOpen,
    isMobile = false,
}) => {
    const [sidebarTextVisible, setSidebarTextVisible] = useState(!isMobile);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            if (mobile && sidebarOpen) {
                setSidebarTextVisible(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [sidebarOpen]);

    // Handle sidebar visibility with animation
    useEffect(() => {
        if (!sidebarOpen) {
            setSidebarTextVisible(false);
        } else {
            // Delay showing content until animation completes
            const timer = setTimeout(() => setSidebarTextVisible(true), 150);
            return () => clearTimeout(timer);
        }
    }, [sidebarOpen]);

    return (
        <div
            className={`seawea-sidebar ${
                sidebarOpen ? "open" : "collapsed"
            } transition-all duration-300 ease-in-out`}
        >
            {/* Desktop Toggle Button */}
            {!isMobile && (
                <button
                    className="sidebar-toggle-btn"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transition-transform duration-200 ${
                            sidebarOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>
            )}

            {/* Sidebar Content */}
            <div
                className={`sidebar-content ${
                    sidebarTextVisible ? "visible" : "hidden"
                } transition-opacity duration-200 overflow-y-auto`}
            >
                {sidebarOpen && (
                    <div className="space-y-2">
                        <SpatialUnitSelector options={options} updateOption={updateOption} />

                        <WaterEnergySelector options={options} updateOption={updateOption} />

                        <CriticalitySelector options={options} updateOption={updateOption} />

                        <SummaryToggleSelector options={options} updateOption={updateOption} />

                        <AttributeSelector options={options} updateOption={updateOption} />

                        {/* Add Summary Toggle Selector */}

                        <CountrySelector
                            options={options}
                            updateOption={updateOption}
                            availableCountries={availableCountries}
                        />

                        <MainUseSelector
                            options={options}
                            updateOption={updateOption}
                            availableUses={availableUses}
                        />

                        {/* Info Panel */}
                        {/* <div className="mt-6 p-3 bg-gray-50 rounded text-sm">
                            <div className="flex items-start space-x-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <div className="text-gray-700">
                                    {options.showSummary ? (
                                        <div>
                                            <p className="font-medium">Basin Summary Mode</p>
                                            <p className="text-xs mt-1">
                                                Showing aggregated data by basin with bar charts
                                            </p>
                                        </div>
                                    ) : (
                                        <p>
                                            Marker size represents:{" "}
                                            <strong>
                                                {options.selectedAttribute?.replace(/_/g, " ")}
                                            </strong>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div> */}
                    </div>
                )}

                {/* Collapsed state hint */}
                {!sidebarOpen && !isMobile && (
                    <div className="collapsed-hint">
                        <div className="transform -rotate-90 text-xs text-gray-500 whitespace-nowrap">
                            Filters
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResponsiveSidebar;
