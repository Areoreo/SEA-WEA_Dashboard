import React, { useState } from "react";

export const AttributeSelector = ({ options, updateOption }) => {
    const [isAttributeOpen, setAttributeOpen] = useState(true);

    const attributeOptions = {
        reservoirs: [
            { key: "dam_height_m", label: "Dam Height" },
            { key: "dam_length_m", label: "Dam Length" },
            { key: "normal_capacity_mcm", label: "Normal Capacity" },
            { key: "normal_area_km2", label: "Normal Area" },
            { key: "main_use", label: "Main Use" },
        ],
        hydropower: [
            { key: "water_head_m", label: "Water Head" },
            { key: "power_mw", label: "Installed Capacity" },
        ],
    };

    const currentAttributes = attributeOptions[options.activeTab] || attributeOptions.reservoirs;

    const handleAttributeSelect = (attributeKey) => {
        // Single selection - replace the current selection
        updateOption("selectedAttribute", attributeKey);
    };

    return (
        <div className="variable-selector">
            <div className="variable-section">
                <button
                    className="section-title"
                    onClick={() => setAttributeOpen(!isAttributeOpen)}
                >
                    Attributes
                    <span className={`toggle-icon ${isAttributeOpen ? "open" : "closed"}`}>▼</span>
                </button>
                {isAttributeOpen && (
                    <div className="variable-list">
                        {currentAttributes.map((attr) => (
                            <button
                                key={attr.key}
                                className={`variable-item ${
                                    options.selectedAttribute === attr.key ? "selected" : ""
                                }`}
                                onClick={() => handleAttributeSelect(attr.key)}
                            >
                                {attr.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// // Enhanced AttributeSelector.js with main use support
// // This matches your existing data structure and field names

// import React from "react";

// const AttributeSelector = ({ options, updateOption }) => {
//     // Define attribute options based on active tab - matches your existing data structure
//     const getAttributeOptions = (activeTab) => {
//         const baseOptions = [
//             {
//                 key: "main_use",
//                 label: "Main use",
//                 description: "Primary purpose (shapes)",
//             },
//         ];

//         if (activeTab === "reservoirs") {
//             return [
//                 ...baseOptions,
//                 {
//                     key: "normal_capacity_mcm",
//                     label: "Normal capacity",
//                     description: "MCM (size)",
//                 },
//                 {
//                     key: "normal_area_km2",
//                     label: "Normal area",
//                     description: "km² (size)",
//                 },
//                 {
//                     key: "dam_height_m",
//                     label: "Dam height",
//                     description: "meters (size)",
//                 },
//                 {
//                     key: "dam_length_m",
//                     label: "Dam length",
//                     description: "meters (size)",
//                 },
//             ];
//         } else {
//             return [
//                 ...baseOptions,
//                 {
//                     key: "power_mw",
//                     label: "Power capacity",
//                     description: "MW (size)",
//                 },
//                 {
//                     key: "water_head_m",
//                     label: "Water head",
//                     description: "meters (size)",
//                 },
//             ];
//         }
//     };

//     const attributeOptions = getAttributeOptions(options.activeTab);

//     const handleAttributeChange = (attributeKey) => {
//         updateOption("selectedAttribute", attributeKey);

//         // If switching to main_use, we might want to adjust other display options
//         if (attributeKey === "main_use") {
//             // Optional: Could automatically disable summary mode or adjust other settings
//             // updateOption("showSummary", false);
//         }
//     };

//     return (
//         <div className="space-y-2">
//             <h4 className="font-semibold text-sm text-gray-700">Attributes</h4>
//             <div className="space-y-2">
//                 {attributeOptions.map((attr) => (
//                     <label
//                         key={attr.key}
//                         className="flex items-start space-x-2 text-sm cursor-pointer"
//                     >
//                         <input
//                             type="radio"
//                             name="selectedAttribute"
//                             value={attr.key}
//                             checked={options.selectedAttribute === attr.key}
//                             onChange={() => handleAttributeChange(attr.key)}
//                             className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
//                         />
//                         <div className="flex flex-col">
//                             <span className="text-gray-700 font-medium">{attr.label}</span>
//                             <span className="text-gray-500 text-xs">{attr.description}</span>
//                         </div>
//                     </label>
//                 ))}
//             </div>

//             {/* Information panel */}
//             {options.selectedAttribute === "main_use" && (
//                 <div className="mt-3 p-2 bg-blue-50 rounded-md text-xs text-blue-700">
//                     <strong>Main Use Mode:</strong> Different symbols represent different purposes.
//                     Critical/non-critical classification is shown by filled vs. outline symbols.
//                 </div>
//             )}

//             {options.selectedAttribute !== "main_use" && (
//                 <div className="mt-3 p-2 bg-gray-50 rounded-md text-xs text-gray-600">
//                     <strong>Size Mode:</strong> Marker size represents the magnitude of the selected
//                     attribute.
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AttributeSelector;
