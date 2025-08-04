// import React, { useState, useEffect } from "react";

// import Link from "next/link";
// import Image from "next/image";
// import { SectionContainer } from "@components/Section";
// import { Nav } from "@components/Nav";
// import { ButtonGroup, Button } from "@components/Button";
// import { Icon } from "@iconify/react";

// /**
//  * Get current date information for dynamic default setting
//  * @returns {Object} Object containing current year, month, and formatted strings
//  */
// const getCurrentDateInfo = () => {
//     const now = new Date();
//     const currentYear = now.getFullYear();
//     const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11, so add 1

//     // Format month with leading zero (e.g., "04" instead of "4")
//     const formattedMonth = String(currentMonth).padStart(2, "0");

//     return {
//         year: currentYear,
//         month: currentMonth,
//         yearString: String(currentYear),
//         monthString: formattedMonth
//     };
// };

// export const DashTop = ({
//     options,
//     updateOption,
//     setSelectedYear,
//     setSelectedMonth
// }) => {
//     const [selectedLanguage, setSelectedLanguage] = useState("English");
//     const [isLanguageOpen, setIsLanguageOpen] = useState(false);

//     const [selectedCurrent, setSelectedCurrent] = useState(false);

//     const [selectedRegion, setSelectedRegion] = useState(options.region);
//     const [isRegionOpen, setIsRegionOpen] = useState(false);

//     // Get current date information
//     const getCurrentDefaults = () => {
//         return getCurrentDateInfo();
//     };

//     // // 当点击current时触发
//     // const handleCurrentClick = () => {
//     //     if (options.overview === "forecast") {
//     //         updateOption("varType", "SPI1"); // if select current, show SPI1 forecast
//     //         updateOption("dateType", "Monthly"); // make sure dateType is correct before set date
//     //         setSelectedYear("2025");
//     //         setSelectedMonth("04");
//     //         setSelectedCurrent(true);
//     //     }
//     //     if (options.overview === "hist") {
//     //         updateOption("overview", "forecast"); // if hist when selecting current, change to forecast
//     //         updateOption("varType", "SPI1"); // if select current, show SPI1 forecast
//     //         updateOption("dateType", "Monthly"); // make sure dateType is correct before set date
//     //         setSelectedYear("2025");
//     //         setSelectedMonth("04");
//     //         setSelectedCurrent(true);
//     //     }
//     // };

//     // 当点击current时触发
//     const handleCurrentClick = () => {
//         // Get real current date information
//         const defaultDates = getCurrentDefaults();

//         if (options.overview === "forecast") {
//             updateOption("varType", "SPI1"); // if select current, show SPI1 forecast
//             updateOption("dateType", "Monthly"); // make sure dateType is correct before set date
//             setSelectedYear(defaultDates.yearString); // Use current year
//             setSelectedMonth(defaultDates.monthString); // Use current month
//             setSelectedCurrent(true);
//         }
//         if (options.overview === "hist") {
//             updateOption("overview", "forecast"); // if hist when selecting current, change to forecast
//             updateOption("varType", "SPI1"); // if select current, show SPI1 forecast
//             updateOption("dateType", "Monthly"); // make sure dateType is correct before set date
//             setSelectedYear(defaultDates.yearString); // Use current year
//             setSelectedMonth(defaultDates.monthString); // Use current month
//             setSelectedCurrent(true);
//         }
//     };

//     // // 当点击hist或forecast触发
//     // const handleOverviewClick = (type) => {
//     //     setSelectedCurrent(false);
//     //     updateOption("overview", type);
//     //     if (type === "forecast") {
//     //         const defaultDates = getCurrentDefaults();
//     //         updateOption("dateType", "Monthly");
//     //         setSelectedYear(defaultDates.yearString);
//     //         setSelectedMonth(defaultDates.monthString);
//     //     }
//     //     if (type === "hist") {
//     //         setSelectedYear("2000");
//     //         setSelectedMonth("04");
//     //     }
//     // };

//     const handleOverviewClick = (type) => {
//         setSelectedCurrent(false);
//         updateOption("overview", type);

//         if (type === "forecast") {
//             // For forecast, use current date
//             const defaultDates = getCurrentDefaults();
//             updateOption("dateType", "Monthly");
//             setSelectedYear(defaultDates.yearString);
//             setSelectedMonth(defaultDates.monthString);
//         }
//         if (type === "hist") {
//             // For historical, use previous year with current month
//             const defaultDates = getCurrentDefaults();
//             const historicalYear = String(defaultDates.year - 1);
//             setSelectedYear(historicalYear);
//             setSelectedMonth("04"); // You can change this to defaultDates.monthString
//         }
//     };

//     // 当切换成forecast 模式时，自动设置日期数据
//     useEffect(() => {
//         // if (options.overview === "forecast" && setSelectedCurrent !== "true") {
//         //     setSelectedYear("2025");
//         //     setSelectedMonth("04");
//         // }
//         // if (options.overview === "forecast") {
//         //     setSelectedYear("2025");
//         //     setSelectedMonth("04");
//         // }

//         const defaultDates = getCurrentDefaults();
//         // Only update if we're switching to forecast and not in "current" mode
//         if (options.overview === "forecast" && !selectedCurrent) {
//             // You might want to use current date here too, or keep existing logic
//             setSelectedYear(defaultDates.yearString);
//             setSelectedMonth(defaultDates.monthString);
//         }

//         if (options.overview === "hist") {
//             setSelectedYear("2000");
//             setSelectedMonth("04");
//         }
//     }, [options.overview]);

//     return (
//         <div className="dash-top-container bg-white backdrop-filter backdrop-blur-md bg-opacity-50">
//             <div className="dash-top-left">
//                 <div
//                     className="header-logo--container"
//                     onClick={() => window.location.reload()}
//                     style={{ cursor: "pointer" }}
//                 >
//                     <Image
//                         src="/rice_logo.png"
//                         alt="logo"
//                         className="h-14 w-auto"
//                         height="60"
//                         width="300"
//                         priority
//                     />
//                 </div>
//                 {/* <div className="header-logo--container">
//                     <Link href="/rice-map">
//                         <Image
//                             src="/rice_logo.png"
//                             alt="logo"
//                             className="h-14 w-auto"
//                             height="60"
//                             width="300"
//                             priority
//                         />
//                     </Link>
//                 </div> */}
//                 {/* <div className="dash-top-logo">LOGO</div> */}
//                 <div className="dash-top-buttons">
//                     <button
//                         className={`dash-top-button ${
//                             options.overview === "hist" && !selectedCurrent
//                                 ? "active"
//                                 : ""
//                         }`}
//                         onClick={() => handleOverviewClick("hist")}
//                     >
//                         Historical
//                     </button>
//                     <button
//                         className={`dash-top-button current-button ${
//                             selectedCurrent ? "active" : ""
//                         }`}
//                         onClick={handleCurrentClick}
//                     >
//                         Current
//                     </button>
//                     <button
//                         className={`dash-top-button ${
//                             options.overview === "forecast" && !selectedCurrent
//                                 ? "active"
//                                 : ""
//                         }`}
//                         onClick={() => handleOverviewClick("forecast")}
//                     >
//                         Forecast
//                     </button>
//                 </div>
//             </div>
//             <div className="dash-top-left">
//                 <div className="dash-top-language">
//                     <div className="dash-top-buttons">
//                         {[
//                             "SEA",
//                             "Thailand",
//                             "Cambodia",
//                             "Laos",
//                             "Myanmar",
//                             "Vietnam"
//                         ].map((region) => (
//                             <button
//                                 key={region}
//                                 className={`dash-top-button-red ${
//                                     options.region === region ? "active" : ""
//                                 }`}
//                                 onClick={() => updateOption("region", region)}
//                             >
//                                 {region}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 <div className="dash-top-language">
//                     <button
//                         className="language-button"
//                         onClick={() => setIsLanguageOpen(!isLanguageOpen)}
//                     >
//                         Language ▼
//                     </button>
//                     <div
//                         className={`language-dropdown ${
//                             isLanguageOpen ? "open" : ""
//                         }`}
//                     >
//                         {["English", "Chinese", "Malay", "Thai"].map((lang) => (
//                             <div
//                                 key={lang}
//                                 className={`language-option ${
//                                     selectedLanguage === lang ? "selected" : ""
//                                 }`}
//                                 onClick={() => {
//                                     setSelectedLanguage(lang);
//                                     setIsLanguageOpen(false);
//                                 }}
//                             >
//                                 {lang}
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

import React, { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import { SectionContainer } from "@components/Section";
import { Nav } from "@components/Nav";
import { ButtonGroup, Button } from "@components/Button";
import { Icon } from "@iconify/react";

/**
 * Get current date information for dynamic default setting
 * @returns {Object} Object containing current year, month, and formatted strings
 */
const getCurrentDateInfo = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11, so add 1

    // Format month with leading zero (e.g., "04" instead of "4")
    const formattedMonth = String(currentMonth).padStart(2, "0");

    return {
        year: currentYear,
        month: currentMonth,
        yearString: String(currentYear),
        monthString: formattedMonth
    };
};

export const DashTop = ({
    options,
    updateOption,
    setSelectedYear,
    setSelectedMonth
}) => {
    const [selectedLanguage, setSelectedLanguage] = useState("English");
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);

    const [selectedCurrent, setSelectedCurrent] = useState(false);

    const [selectedRegion, setSelectedRegion] = useState(options.region);
    const [isRegionOpen, setIsRegionOpen] = useState(false);

    // Get current date information
    const getCurrentDefaults = () => {
        return getCurrentDateInfo();
    };

    // 当点击current时触发
    const handleCurrentClick = () => {
        // Get real current date information
        const defaultDates = getCurrentDefaults();

        if (options.overview === "forecast") {
            updateOption("varType", "SPI1"); // if select current, show SPI1 forecast
            updateOption("dateType", "Monthly"); // make sure dateType is correct before set date
            setSelectedYear(defaultDates.yearString); // Use current year
            setSelectedMonth(defaultDates.monthString); // Use current month
            setSelectedCurrent(true);
        }
        if (options.overview === "hist") {
            updateOption("overview", "forecast"); // if hist when selecting current, change to forecast
            updateOption("varType", "SPI1"); // if select current, show SPI1 forecast
            updateOption("dateType", "Monthly"); // make sure dateType is correct before set date
            setSelectedYear(defaultDates.yearString); // Use current year
            setSelectedMonth(defaultDates.monthString); // Use current month
            setSelectedCurrent(true);
        }
    };

    // 当点击hist或forecast触发
    const handleOverviewClick = (type) => {
        setSelectedCurrent(false);
        updateOption("overview", type);

        if (type === "forecast") {
            // For forecast, use current date
            const defaultDates = getCurrentDefaults();
            updateOption("dateType", "Monthly");
            setSelectedYear(defaultDates.yearString);
            setSelectedMonth(defaultDates.monthString);
        }
        if (type === "hist") {
            // For historical, you might want to use a different default
            // Using current year - 1 for historical data, or keep your existing logic
            const defaultDates = getCurrentDefaults();
            const historicalYear = String(defaultDates.year - 1); // Previous year for historical
            setSelectedYear(historicalYear);
            setSelectedMonth("04"); // You can change this to defaultDates.monthString if preferred
        }
    };

    // 当切换成forecast 模式时，自动设置日期数据
    useEffect(() => {
        const defaultDates = getCurrentDefaults();

        // Only update if we're switching to forecast and not in "current" mode
        if (options.overview === "forecast" && !selectedCurrent) {
            // You might want to use current date here too, or keep existing logic
            // setSelectedYear(defaultDates.yearString);
            // setSelectedMonth(defaultDates.monthString);
        }

        if (options.overview === "hist") {
            // For historical, use previous year or your preferred default
            const historicalYear = String(defaultDates.year - 1);
            setSelectedYear(historicalYear);
            setSelectedMonth("04");
        }
    }, [options.overview]);

    return (
        <div className="dash-top-container bg-white backdrop-filter backdrop-blur-md bg-opacity-50">
            <div className="dash-top-left">
                <div
                    className="header-logo--container"
                    onClick={() => window.location.reload()}
                    style={{ cursor: "pointer" }}
                >
                    <Image
                        src="/rice_logo.png"
                        alt="logo"
                        className="h-14 w-auto"
                        height="60"
                        width="300"
                        priority
                    />
                </div>
                <div className="dash-top-buttons">
                    <button
                        className={`dash-top-button ${
                            options.overview === "hist" && !selectedCurrent
                                ? "active"
                                : ""
                        }`}
                        onClick={() => handleOverviewClick("hist")}
                    >
                        Historical
                    </button>
                    <button
                        className={`dash-top-button current-button ${
                            selectedCurrent ? "active" : ""
                        }`}
                        onClick={handleCurrentClick}
                    >
                        Current
                    </button>
                    <button
                        className={`dash-top-button ${
                            options.overview === "forecast" && !selectedCurrent
                                ? "active"
                                : ""
                        }`}
                        onClick={() => handleOverviewClick("forecast")}
                    >
                        Forecast
                    </button>
                </div>
            </div>
            <div className="dash-top-left">
                <div className="dash-top-language">
                    <div className="dash-top-buttons">
                        {[
                            "SEA",
                            "Thailand",
                            "Cambodia",
                            "Laos",
                            "Myanmar",
                            "Vietnam"
                        ].map((region) => (
                            <button
                                key={region}
                                className={`dash-top-button-red ${
                                    options.region === region ? "active" : ""
                                }`}
                                onClick={() => updateOption("region", region)}
                            >
                                {region}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="dash-top-language">
                    <button
                        className="language-button"
                        onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                    >
                        Language ▼
                    </button>
                    <div
                        className={`language-dropdown ${
                            isLanguageOpen ? "open" : ""
                        }`}
                    >
                        {["English", "Chinese", "Malay", "Thai"].map((lang) => (
                            <div
                                key={lang}
                                className={`language-option ${
                                    selectedLanguage === lang ? "selected" : ""
                                }`}
                                onClick={() => {
                                    setSelectedLanguage(lang);
                                    setIsLanguageOpen(false);
                                }}
                            >
                                {lang}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
