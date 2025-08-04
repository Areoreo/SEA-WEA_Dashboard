import React, { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

// export const MapLegend = ({ data }) => {
//     const legendConfig = {
//         Prcp: {
//             title: "Precipitation (mm)",
//             grades: [0, 200, 400, 600, 800, 1000],
//             colors: ["#0033FF", "#0099FF", "#00FF99", "#FFFF00", "#FF3300"]
//         },
//         PrcpProv: {
//             title: "Precipitation (mm)",
//             grades: [0, 600, 1200, 1800, 2400, 3000],
//             colors: [
//                 "hsl(200, 100%, 50%)",
//                 "hsl(150, 100%, 50%)",
//                 "hsl(100, 100%, 50%)",
//                 "hsl(50, 100%, 50%)",
//                 "hsl(0, 100%, 50%)"
//             ]
//         },
//         PrcpProvMonthly: {
//             title: "Precipitation (mm)",
//             grades: [0, 100, 200, 300, 400, 500],
//             colors: [
//                 "hsl(200, 100%, 50%)",
//                 "hsl(150, 100%, 50%)",
//                 "hsl(100, 100%, 50%)",
//                 "hsl(50, 100%, 50%)",
//                 "hsl(0, 100%, 50%)"
//             ]
//         },

//         SPI: {
//             title: "Drought Index",
//             grades: [2, 1.5, 1, 0, -1, -1.5, -2],
//             labels: ["W3", "W2", "W1", "D0", "D1", "D2", "D3"],
//             colors: [
//                 "#14713d",
//                 "#3cb371",
//                 "#98fb98",
//                 "#eee",
//                 "#f5deb3",
//                 "#d2691e",
//                 "#b22222"
//             ],
//             className: "legend-SPI"
//         },
//         Temp: {
//             title: "Temperature (℃)",
//             grades: [10, 15, 20, 25, 30, 35],
//             colors: [
//                 "#08306B",
//                 "#4292C6",
//                 "#41AB5D",
//                 "#F7DC6F",
//                 "#E67E22",
//                 "#C0392B"
//             ]
//         },
//         Yield: {
//             title: "Yield (ton/ha)",
//             grades: [1, 3, 5, 7],
//             colors: [
//                 "hsl(30, 100%, 40%)",
//                 "hsl(60, 100%, 40%)",
//                 "hsl(90, 100%, 40%)",
//                 "hsl(120, 100%, 40%)"
//             ]
//         },
//         YieldProv: {
//             title: "Yield (ton/ha)",
//             grades: [1, 3, 5, 7],
//             colors: [
//                 "hsl(30, 100%, 40%)",
//                 "hsl(60, 100%, 40%)",
//                 "hsl(90, 100%, 40%)",
//                 "hsl(120, 100%, 40%)"
//             ]
//         },
//         Prod: {
//             title: "Production (ton)",
//             grades: [1, 3, 5, 7],
//             colors: [
//                 "#00f", // Blue for 1°C (cool)
//                 "#0099ff", // Light blue for 5°C
//                 "#ffff00", // Yellow for 10°C
//                 "#ffcc00", // Orange for 20°C
//                 "#ff3300" // Red for 30°C (hot)],
//             ]
//         },
//         SMPct: {
//             title: "SMPct",
//             grades: [20, 40, 60, 80]
//         }
//     };

//     const map = useMap();
//     const legendRef = useRef(null);

//     useEffect(() => {
//         if (legendRef.current) {
//             legendRef.current.remove();
//         }

//         const legend = L.control({ position: "bottomleft" });
//         legend.onAdd = function () {
//             let vartype = data.data_vartype.startsWith("SPI")
//                 ? "SPI"
//                 : data.data_vartype === "Yield"
//                 ? "YieldProv"
//                 : data.data_vartype === "Prcp" &&
//                   data.data_adminLevel === "Prov" &&
//                   data.data_dateType === "Yearly"
//                 ? "PrcpProv"
//                 : data.data_vartype === "Prcp" &&
//                   data.data_adminLevel === "Country" &&
//                   data.data_dateType === "Yearly"
//                 ? "PrcpProv"
//                 : data.data_vartype === "Prcp" &&
//                   data.data_adminLevel === "Prov" &&
//                   data.data_dateType === "Monthly"
//                 ? "PrcpProvMonthly"
//                 : data.data_vartype === "Prcp" &&
//                   data.data_adminLevel === "Country" &&
//                   data.data_dateType === "Monthly"
//                 ? "PrcpProvMonthly"
//                 : data.data_vartype || "Default";

//             const config = legendConfig[vartype] || {};

// let div = L.DomUtil.create(
//     "div",
//     `legend-container ${config.className || "legend-default"}`
// );

// if (vartype === "SPI") {
//     const tooltipTexts = {
//         D3: "Extreme Drought Major crop losses, widespread water shortages.",
//         D2: "Severe Drought Likely crop loss, water restrictions may be needed.",
//         D1: "Some damage to crops, low streamflow, water shortages possible.",
//         D0: "Typical climate conditions, no significant anomalies.",
//         W1: "Above-normal precipitation, beneficial for agriculture and water supply.",
//         W2: "High rainfall, increased runoff, risk of localized flooding.",
//         W3: "Unusual flooding, excessive soil moisture, potential waterlogging."
//     };

//     const legendTexts = {
//         D3: "Extremely Dry",
//         D2: "Severely Dry",
//         D1: "Moderately Dry",
//         D0: "Near Normal",
//         W1: "Moderately Wet",
//         W2: "Severly Wet",
//         W3: "Extremely Wet"
//     };

//     const legendContainer = document.createElement("div");

//     const title = document.createElement("div");
//     title.className = "legend-title";
//     title.textContent = config.title;
//     legendContainer.appendChild(title);

//     for (let i = 0; i < config.grades.length; i++) {
//         const tooltipText =
//             tooltipTexts[config.labels[i]] ||
//             "No information available";

//         const legendItem = document.createElement("div");
//         legendItem.className = "legend-item";

//         // 问号图标
//         const infoIcon = document.createElement("div");
//         infoIcon.className = "info-icon";
//         infoIcon.innerHTML = `?`;

//         const tooltip = document.createElement("div");
//         tooltip.className = "tooltip";
//         tooltip.textContent = tooltipText;
//         infoIcon.appendChild(tooltip);

//         // 颜色块
//         const colorBox = document.createElement("div");
//         colorBox.className = "color-box";
//         colorBox.style.backgroundColor = config.colors[i];

//         // 标签文本
//         const legendText = document.createElement("span");
//         legendText.className = "legend-text";
//         legendText.textContent = legendTexts[config.labels[i]];

//         legendItem.appendChild(infoIcon);
//         legendItem.appendChild(colorBox);
//         legendItem.appendChild(legendText);

//         legendContainer.appendChild(legendItem);
//     }
//     div.appendChild(legendContainer);
// } else if (config.colors) {
//     div.innerHTML = `<div class="legend-title">${
//         config.title || "Legend"
//     }</div>`;
//     div.innerHTML += `<div class="legend-gradient" style="background: linear-gradient(to right, ${config.colors.join(
//         ", "
//     )});"></div>`;
//     div.innerHTML += `<div class="legend-labels">${config.grades
//         .map((g) => `<span>${g}</span>`)
//         .join(" ")}</div>`;
// }

// return div;
//         };

//         legend.addTo(map);
//         legendRef.current = legend;

//         return () => legend.remove();
//     }, [map, data.data_vartype]);

//     return null;
// };

// import React from "react";

export const MapLegend = ({ data, selectedDate }) => {
    // If no data is available, don't render the legend at all
    // check whether it is no data by checking data.url, cuz I set defaut data.url to be "no_data" for null data
    if (data.url === "no_data") return null;

    // month names map
    const formatDateDisplay = (selectedDate) => {
        if (!selectedDate) return "Unknown Date";

        const year = selectedDate.slice(0, 4);
        const month =
            selectedDate.length >= 6 ? selectedDate.slice(4, 6) : null;
        const day = selectedDate.length === 8 ? selectedDate.slice(6, 8) : null;

        const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ];
        const monthFormatted = month ? monthNames[parseInt(month, 10) - 1] : "";

        if (selectedDate.length === 4) {
            return `${year}`;
        } else if (selectedDate.length === 6) {
            return `${monthFormatted}, ${year}`;
        } else if (selectedDate.length === 8) {
            return `${monthFormatted} ${parseInt(day, 10)}, ${year}`;
        }

        return "Invalid Date";
    };

    const legendConfig = {
        Prcp: {
            title: "Precipitation (mm)",
            grades: [0, 200, 400, 600, 800, 1000],
            colors: ["#0033FF", "#0099FF", "#00FF99", "#FFFF00", "#FF3300"]
        },
        PrcpProv: {
            title: "Precipitation (mm)",
            grades: [0, 600, 1200, 1800, 2400, 3000],
            colors: [
                "hsl(200, 100%, 50%)",
                "hsl(150, 100%, 50%)",
                "hsl(100, 100%, 50%)",
                "hsl(50, 100%, 50%)",
                "hsl(0, 100%, 50%)"
            ]
        },
        PrcpProvMonthly: {
            title: "Precipitation (mm)",
            grades: [0, 100, 200, 300, 400, 500],
            colors: [
                "hsl(200, 100%, 50%)",
                "hsl(150, 100%, 50%)",
                "hsl(100, 100%, 50%)",
                "hsl(50, 100%, 50%)",
                "hsl(0, 100%, 50%)"
            ]
        },

        SPI: {
            title: "Drought Index",
            grades: [2, 1.5, 1, 0, -1, -1.5, -2],
            labels: ["W3", "W2", "W1", "D0", "D1", "D2", "D3"],
            colors: [
                "#14713d",
                "#3cb371",
                "#98fb98",
                "#eee",
                "#f5deb3",
                "#d2691e",
                "#b22222"
            ],
            className: "legend-SPI"
        },
        Temp: {
            title: "Temperature (℃)",
            grades: [10, 15, 20, 25, 30, 35],
            colors: [
                "#08306B",
                "#4292C6",
                "#41AB5D",
                "#F7DC6F",
                "#E67E22",
                "#C0392B"
            ]
        },
        Yield: {
            title: "Yield (ton/ha)",
            grades: [4, 5, 6, 7],
            // colors: [
            //     "hsl(30, 100%, 40%)",
            //     "hsl(60, 100%, 40%)",
            //     "hsl(90, 100%, 40%)",
            //     "hsl(120, 100%, 40%)"
            // ]
            colors: [
                "#ffffe5",
                "#f7fcb9",
                "#d9f0a3",
                "#addd8e",
                "#78c679",
                "#41ab5d",
                "#238443",
                "#005a32"
            ]
        },
        YieldProv: {
            title: "Yield (ton/ha)",
            grades: [4, 5, 6, 7],
            // colors: [
            //     "hsl(30, 100%, 40%)",
            //     "hsl(60, 100%, 40%)",
            //     "hsl(90, 100%, 40%)",
            //     "hsl(120, 100%, 40%)"
            // ]
            colors: [
                "#F8FF96",
                "#F0F09A",
                "#C9EC77",
                "#addd8e",
                "#78c679",
                "#41ab5d",
                "#238443",
                "#005a32"
            ]
        },
        YieldGrid: {
            title: "Yield (ton/ha)",
            grades: [1, 3, 5, 7],
            // colors: [
            //     "hsl(30, 100%, 40%)",
            //     "hsl(60, 100%, 40%)",
            //     "hsl(90, 100%, 40%)",
            //     "hsl(120, 100%, 40%)"
            // ]
            colors: [
                "#F8FF96",
                "#F0F09A",
                "#C9EC77",
                "#addd8e",
                "#78c679",
                "#41ab5d",
                "#238443",
                "#005a32"
            ]
        },
        Area: {
            title: "Rice Area (ha)",
            grades: [0, 2500, 5000, 7500, 10000],
            colors: [
                "hsl(40, 80%, 50%)",
                "hsl(60, 80%, 50%)",
                "hsl(80, 80%, 50%)",
                "hsl(100, 80%, 50%)",
                "hsl(120, 80%, 50%)"
            ]
        },
        AreaProv: {
            title: "Rice Area (k ha)",
            grades: [100, 200, 300, 400, 500],
            colors: [
                "hsl(40, 80%, 50%)",
                "hsl(60, 80%, 50%)",
                "hsl(80, 80%, 50%)",
                "hsl(100, 80%, 50%)",
                "hsl(120, 80%, 50%)"
            ]
        },
        AreaCountry: {
            title: "Rice Area (million ha)",
            grades: [2, "4", "5", "8", "10"],
            colors: [
                "hsl(40, 80%, 50%)",
                "hsl(60, 80%, 50%)",
                "hsl(80, 80%, 50%)",
                "hsl(100, 80%, 50%)",
                "hsl(120, 80%, 50%)"
            ]
        },
        Production: {
            title: "Production (ton)",
            grades: [0, 2500, 5000, 7500, 10000],
            colors: [
                "hsl(30, 100%, 40%)",
                "hsl(48, 100%, 40%)",
                "hsl(66, 100%, 40%)",
                "hsl(84, 100%, 40%)",
                "hsl(120, 100%, 40%)"
            ]
        },
        ProductionProv: {
            title: "Production (million ton)",
            grades: [0, 0.5, 1, 1.5, 2],
            colors: [
                "hsl(30, 100%, 40%)",
                "hsl(48, 100%, 40%)",
                "hsl(66, 100%, 40%)",
                "hsl(84, 100%, 40%)",
                "hsl(120, 100%, 40%)"
            ]
        },
        ProductionCountry: {
            title: "Production (million ton)",
            grades: [0, 2.5, 5, 7.5, 10],
            colors: [
                "hsl(30, 100%, 40%)",
                "hsl(48, 100%, 40%)",
                "hsl(66, 100%, 40%)",
                "hsl(84, 100%, 40%)",
                "hsl(120, 100%, 40%)"
            ]
        },
        smpct1: {
            title: "Soil Moisture Percentile",
            grades: [0, 25, 50, 75, 100],
            labels: [
                "Very Wet", // Significantly Above Normal
                "Wet", // Moderately Above Normal
                "Near Normal", // Near Normal
                "Abnormally Dry",
                "Moderate Drought",
                "Severe Drought",
                "Extreme Drought"
            ],
            colors: [
                "#80cdc1", // Somewhat Wet
                "#c7eae5", // Slightly Wet
                "#f5f5f5", // No Drought (正常)
                "#f6e8c3", // D0 - Abnormally Dry
                "#dfc27d", // D1 - Moderate Drought
                "#bf812d", // D2 - Severe Drought
                "#8c510a" // D3/D4 - Extreme/Exceptional Drought
            ],
            className: "legend-smpct1"
        },
        yieldAnom: {
            title: "Yield Anomaly (Ton/ha)",
            grades: [1.5, 0.3, -0.3, -1.199, -5],
            labels: [
                "Significantly Above Normal", // Significantly Above Normal
                "Moderately Above Normal", // Moderately Above Normal
                "Near Normal", // Near Normal
                "Moderately Below Normal", // Moderately Below Normal
                "Significantly Below Normal" // Significantly Below Normal
            ],
            colors: [
                "#1a9850", // Significantly Above Normal
                "#74add1", // Moderately Above Normal
                "#d9d9d9", // Near Normal
                "#f46d43", // Moderately Below Normal
                "#a50026" // Significantly Below Normal
            ],
            className: "legend-yieldAnom"
            // className: "legend-yieldAnom"
        }
    };

    let vartype = data.data_vartype.startsWith("SPI")
        ? "SPI"
        : data.data_vartype === "smpct1"
        ? "smpct1"
        : data.data_vartype === "yieldAnom"
        ? "yieldAnom"
        : data.data_vartype === "Yield" &&
          (data.data_adminLevel === "Country" ||
              data.data_adminLevel === "Prov")
        ? "YieldProv"
        : data.data_vartype === "Yield" && data.data_adminLevel === "Grid"
        ? "YieldGrid"
        : data.data_vartype === "Area" && data.data_adminLevel === "Grid"
        ? "Area"
        : data.data_vartype === "Area" && data.data_adminLevel === "Prov"
        ? "AreaProv"
        : data.data_vartype === "Area" && data.data_adminLevel === "Country"
        ? "AreaCountry"
        : data.data_vartype === "Production" && data.data_adminLevel === "Grid"
        ? "Production"
        : data.data_vartype === "Production" && data.data_adminLevel === "Prov"
        ? "ProductionProv"
        : data.data_vartype === "Production" &&
          data.data_adminLevel === "Country"
        ? "ProductionCountry"
        : data.data_vartype === "Prcp" &&
          data.data_adminLevel === "Prov" &&
          data.data_dateType === "Yearly"
        ? "PrcpProv"
        : data.data_vartype === "Prcp" &&
          data.data_adminLevel === "Country" &&
          data.data_dateType === "Yearly"
        ? "PrcpProv"
        : data.data_vartype === "Prcp" &&
          data.data_adminLevel === "Prov" &&
          data.data_dateType === "Monthly"
        ? "PrcpProvMonthly"
        : data.data_vartype === "Prcp" &&
          data.data_adminLevel === "Country" &&
          data.data_dateType === "Monthly"
        ? "PrcpProvMonthly"
        : data.data_vartype || "Default";

    // set legend config to be what vartype you selected, or set it as default 'Yield'
    const config = legendConfig[vartype] || legendConfig["Yield"];

    // return (
    //     <div
    //         className={`legend-container ${
    //             config.className || "legend-default"
    //         }`}
    //     >
    //         <div className="legend-title">{config.title}</div>
    //         {vartype === "SPI" ? (
    //             <div className="legend-items">
    //                 {config.labels.map((label, i) => (
    //                     <div key={i} className="legend-item">
    //                         {/* 问号图标及 Tooltip */}
    //                         <div className="info-icon">
    //                             ?
    //                             <div className="tooltip">
    //                                 {tooltipTexts[label] ||
    //                                     "No information available"}
    //                             </div>
    //                         </div>

    //                         {/* 颜色块 */}
    //                         <div
    //                             className="color-box"
    //                             style={{ backgroundColor: config.colors[i] }}
    //                         ></div>

    //                         {/* 标签文本 */}
    //                         <span className="legend-text">
    //                             {legendTexts[label]}
    //                         </span>
    //                     </div>
    //                 ))}
    //             </div>
    //         ) : (
    //             <div className="legend-gradient-container">
    //                 <div
    //                     className="legend-gradient"
    //                     style={{
    //                         background: `linear-gradient(to right, ${config.colors.join(
    //                             ", "
    //                         )})`
    //                     }}
    //                 ></div>
    //                 <div className="legend-labels">
    //                     {config.grades.map((grade, i) => (
    //                         <span key={i}>{grade}</span>
    //                     ))}
    //                 </div>
    //             </div>
    //         )}
    //     </div>
    // );

    return (
        <div
            className={`legend-container ${
                config.className || "legend-default"
            }`}
        >
            <div className="legend-title">{config.title}</div>

            {vartype === "SPI" ? (
                <div className="legend-items">
                    {config.labels.map((label, i) => (
                        <div key={i} className="legend-item">
                            {/* Optional tooltip */}
                            <div className="info-icon">
                                ?
                                <div className="tooltip">
                                    {tooltipTexts[label] ||
                                        "No information available"}
                                </div>
                            </div>

                            {/* Color swatch */}
                            <div
                                className="color-box"
                                style={{ backgroundColor: config.colors[i] }}
                            ></div>

                            {/* Label text */}
                            <span className="legend-text">
                                {legendTexts[label] || label}
                            </span>
                        </div>
                    ))}
                </div>
            ) : vartype === "smpct1" ? (
                <div className="legend-items">
                    {config.labels.map((label, i) => (
                        <div key={i} className="legend-item">
                            {/* Optional tooltip */}
                            {/* <div className="info-icon">
                                ?
                                <div className="tooltip">
                                    {tooltipTexts[label] ||
                                        "No information available"}
                                </div>
                            </div> */}

                            {/* Color swatch */}
                            <div
                                className="color-box"
                                style={{ backgroundColor: config.colors[i] }}
                            ></div>

                            {/* Label text */}
                            <span className="legend-text">
                                {legendTexts[label] || label}
                            </span>
                        </div>
                    ))}
                </div>
            ) : vartype === "yieldAnom" ? (
                <div className="legend-items">
                    {config.labels.map((label, i) => (
                        <div key={i} className="legend-item">
                            {/* Optional tooltip */}
                            <div className="info-icon">
                                ?
                                <div className="tooltip">
                                    {tooltipTexts[label] ||
                                        "No information available"}
                                </div>
                            </div>

                            {/* Color swatch */}
                            <div
                                className="color-box"
                                style={{ backgroundColor: config.colors[i] }}
                            ></div>

                            {/* Label text */}
                            <span className="legend-text">
                                {legendTexts[label] || label}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="legend-gradient-container">
                    <div
                        className="legend-gradient"
                        style={{
                            background: `linear-gradient(to right, ${config.colors.join(
                                ", "
                            )})`
                        }}
                    ></div>
                    <div className="legend-labels">
                        {config.grades.map((grade, i) => (
                            <span key={i}>{grade}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// SPI 类型的 Tooltip 信息
const tooltipTexts = {
    D3: "Extreme Drought Major crop losses, widespread water shortages.",
    D2: "Severe Drought Likely crop loss, water restrictions may be needed.",
    D1: "Some damage to crops, low streamflow, water shortages possible.",
    D0: "Typical climate conditions, no significant anomalies.",
    W1: "Above-normal precipitation, beneficial for agriculture and water supply.",
    W2: "High rainfall, increased runoff, risk of localized flooding.",
    W3: "Unusual flooding, excessive soil moisture, potential waterlogging.",
    "Significantly Above Normal":
        "Crop yield is significantly above averag, among the top 20% of all years",
    "Moderately Above Normal":
        "Crop yield in this range is higher than usual, among the top 20% to 40% of all years",
    "Near Normal":
        "Crop yield is close to the historical average, within the middle 20% of all years",
    "Moderately Below Normal":
        "Crop yield is lower than average — among the bottom 20% to 40% of all years",
    "Significantly Below Normal":
        "Crop yield is significantly below average, among the lowest 20% of all years"
};

// SPI 级别的文本标签
const legendTexts = {
    D3: "Extremely Dry",
    D2: "Severely Dry",
    D1: "Moderately Dry",
    D0: "Near Normal",
    W1: "Moderately Wet",
    W2: "Severly Wet",
    W3: "Extremely Wet"
};
