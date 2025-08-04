// /**
//  * Export utilities for ChartComponent
//  */
// import { formatDateString } from './ChartComponentUtils';

// // Export chart data as CSV
// export const downloadCSV = (filteredData, startYear, endYear) => {
//     if (!filteredData || filteredData.length === 0) return;

//     let csvContent = "data:text/csv;charset=utf-8,";

//     // Check if we have ensemble data
//     const hasEnsembleMembers = filteredData.some(d => d.hasOwnProperty('ensemble'));

//     if (hasEnsembleMembers) {
//         // Ensemble data format
//         const years = [...new Set(filteredData.map(d => d.year))].sort((a, b) => a - b);
//         const ensembleMembers = [...new Set(filteredData.map(d => d.ensemble))].sort((a, b) => a - b);

//         // Headers row
//         csvContent += "Ensemble,";
//         csvContent += years.join(",");
//         csvContent += "\r\n";

//         // Data rows for each ensemble member
//         ensembleMembers.forEach(member => {
//             csvContent += `${member},`;
//             years.forEach(year => {
//                 const entry = filteredData.find(d => d.year === year && d.ensemble === member);
//                 csvContent += `${entry && entry.value !== undefined ? entry.value : ""},`;
//             });
//             csvContent += "\r\n";
//         });

//         // Statistics rows
//         // Mean
//         csvContent += "Mean,";
//         years.forEach(year => {
//             const yearData = filteredData.filter(d => d.year === year);
//             const values = yearData.map(d => d.value).filter(v => v !== null && v !== undefined);
//             const mean = values.length ? values.reduce((sum, val) => sum + val, 0) / values.length : "";
//             csvContent += `${mean !== "" ? mean.toFixed(2) : ""},`;
//         });
//         csvContent += "\r\n";

//         // Min
//         csvContent += "Min,";
//         years.forEach(year => {
//             const yearData = filteredData.filter(d => d.year === year);
//             const values = yearData.map(d => d.value).filter(v => v !== null && v !== undefined);
//             const min = values.length ? Math.min(...values) : "";
//             csvContent += `${min !== "" ? min.toFixed(2) : ""},`;
//         });
//         csvContent += "\r\n";

//         // Max
//         csvContent += "Max,";
//         years.forEach(year => {
//             const yearData = filteredData.filter(d => d.year === year);
//             const values = yearData.map(d => d.value).filter(v => v !== null && v !== undefined);
//             const max = values.length ? Math.max(...values) : "";
//             csvContent += `${max !== "" ? max.toFixed(2) : ""},`;
//         });
//     } else if (filteredData.some(d => d.month)) {
//         // Time series data format
//         csvContent += "Date,Year,Month,Value\r\n";
//         filteredData.forEach(item => {
//             const formattedDate = item.formattedDate || formatDateString(item.year, item.month);
//             csvContent += `${formattedDate},${item.year},${item.month || ""},${item.value !== undefined ? item.value : ""}\r\n`;
//         });
//     } else {
//         // Simple yearly data format
//         csvContent += "Year,Value\r\n";
//         filteredData.forEach(item => {
//             csvContent += `${item.year},${item.value !== undefined ? item.value : ""}\r\n`;
//         });
//     }

//     // Download the CSV file
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", `time_series_${startYear}-${endYear}.csv`);
//     document.body.appendChild(link);

//     link.click();
//     document.body.removeChild(link);
// };

// // Download chart as image
// export const downloadImage = (chartRef, startYear, endYear, format = 'png') => {
//     if (!chartRef.current) return;

//     const canvas = chartRef.current;
//     const link = document.createElement('a');

//     if (format === 'png') {
//         link.href = canvas.toDataURL('image/png');
//         link.download = `chart_${startYear}-${endYear}.png`;
//     } else if (format === 'jpg') {
//         link.href = canvas.toDataURL('image/jpeg', 0.8);
//         link.download = `chart_${startYear}-${endYear}.jpg`;
//     }

//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// };

/**
 * Export utilities for ChartComponent with built-in statistics support
 */
import { formatDateString } from "./ChartComponentUtils";

// Export chart data as CSV
export const downloadCSV = (
    filteredData,
    startYear,
    endYear,
    hasBuiltInStats = false
) => {
    if (!filteredData || filteredData.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";

    console.log("Exporting CSV with hasBuiltInStats:", hasBuiltInStats);

    // Check if we have ensemble data
    const hasEnsembleMembers = filteredData.some((d) =>
        d.hasOwnProperty("ensemble")
    );

    if (hasBuiltInStats) {
        // New format with built-in statistics
        console.log("Exporting CSV with built-in statistics");

        // Sort data by date
        const sortedData = [...filteredData].sort((a, b) => a.date - b.date);

        // Check if we also have individual ensemble members
        const hasIndividualEnsembles = sortedData.some(
            (d) => d.ensembleMembers && d.ensembleMembers.length > 0
        );

        if (hasIndividualEnsembles) {
            // Include both statistics and individual ensemble members
            csvContent += "Date,Year,Month,Mean,Min,Max,";

            // Get all ensemble member indices
            const allEnsembleIndices = new Set();
            sortedData.forEach((d) => {
                if (d.ensembleMembers) {
                    d.ensembleMembers.forEach((member) =>
                        allEnsembleIndices.add(member.ensemble)
                    );
                }
            });
            const ensembleIndices = Array.from(allEnsembleIndices).sort(
                (a, b) => a - b
            );

            // Add ensemble member headers
            ensembleIndices.forEach((index) => {
                csvContent += `Ensemble_${index},`;
            });
            csvContent += "\r\n";

            // Add data rows
            sortedData.forEach((item) => {
                const formattedDate =
                    item.formattedDate ||
                    formatDateString(item.year, item.month);
                csvContent += `${formattedDate},${item.year},${
                    item.month || ""
                },${item.mean || ""},${item.min || ""},${item.max || ""},`;

                // Add ensemble member values
                ensembleIndices.forEach((index) => {
                    const member = item.ensembleMembers?.find(
                        (m) => m.ensemble === index
                    );
                    csvContent += `${member ? member.value : ""},`;
                });
                csvContent += "\r\n";
            });
        } else {
            // Only statistics available
            csvContent += "Date,Year,Month,Mean,Min,Max\r\n";
            sortedData.forEach((item) => {
                const formattedDate =
                    item.formattedDate ||
                    formatDateString(item.year, item.month);
                csvContent += `${formattedDate},${item.year},${
                    item.month || ""
                },${item.mean || ""},${item.min || ""},${item.max || ""}\r\n`;
            });
        }
    } else if (hasEnsembleMembers) {
        // Legacy ensemble data format - calculate statistics
        console.log(
            "Exporting CSV with calculated statistics from ensemble data"
        );

        const years = [...new Set(filteredData.map((d) => d.year))].sort(
            (a, b) => a - b
        );
        const ensembleMembers = [
            ...new Set(filteredData.map((d) => d.ensemble))
        ].sort((a, b) => a - b);

        // Headers row
        csvContent += "Ensemble,";
        csvContent += years.join(",");
        csvContent += "\r\n";

        // Data rows for each ensemble member
        ensembleMembers.forEach((member) => {
            csvContent += `${member},`;
            years.forEach((year) => {
                const entry = filteredData.find(
                    (d) => d.year === year && d.ensemble === member
                );
                csvContent += `${
                    entry && entry.value !== undefined ? entry.value : ""
                },`;
            });
            csvContent += "\r\n";
        });

        // Statistics rows
        // Mean
        csvContent += "Mean,";
        years.forEach((year) => {
            const yearData = filteredData.filter((d) => d.year === year);
            const values = yearData
                .map((d) => d.value)
                .filter((v) => v !== null && v !== undefined);
            const mean = values.length
                ? values.reduce((sum, val) => sum + val, 0) / values.length
                : "";
            csvContent += `${mean !== "" ? mean.toFixed(2) : ""},`;
        });
        csvContent += "\r\n";

        // Min
        csvContent += "Min,";
        years.forEach((year) => {
            const yearData = filteredData.filter((d) => d.year === year);
            const values = yearData
                .map((d) => d.value)
                .filter((v) => v !== null && v !== undefined);
            const min = values.length ? Math.min(...values) : "";
            csvContent += `${min !== "" ? min.toFixed(2) : ""},`;
        });
        csvContent += "\r\n";

        // Max
        csvContent += "Max,";
        years.forEach((year) => {
            const yearData = filteredData.filter((d) => d.year === year);
            const values = yearData
                .map((d) => d.value)
                .filter((v) => v !== null && v !== undefined);
            const max = values.length ? Math.max(...values) : "";
            csvContent += `${max !== "" ? max.toFixed(2) : ""},`;
        });
    } else if (filteredData.some((d) => d.month)) {
        // Time series data format
        csvContent += "Date,Year,Month,Value\r\n";
        filteredData.forEach((item) => {
            const formattedDate =
                item.formattedDate || formatDateString(item.year, item.month);
            csvContent += `${formattedDate},${item.year},${item.month || ""},${
                item.value !== undefined ? item.value : ""
            }\r\n`;
        });
    } else {
        // Simple yearly data format
        csvContent += "Year,Value\r\n";
        filteredData.forEach((item) => {
            csvContent += `${item.year},${
                item.value !== undefined ? item.value : ""
            }\r\n`;
        });
    }

    // Download the CSV file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);

    // Create descriptive filename based on data type
    let filename = `time_series_${startYear}-${endYear}`;
    if (hasBuiltInStats) {
        filename += "_with_statistics";
    } else if (hasEnsembleMembers) {
        filename += "_ensemble";
    }
    filename += ".csv";

    link.setAttribute("download", filename);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
};

// Download chart as image
export const downloadImage = (chartRef, startYear, endYear, format = "png") => {
    if (!chartRef.current) return;

    const canvas = chartRef.current;
    const link = document.createElement("a");

    if (format === "png") {
        link.href = canvas.toDataURL("image/png");
        link.download = `chart_${startYear}-${endYear}.png`;
    } else if (format === "jpg") {
        link.href = canvas.toDataURL("image/jpeg", 0.8);
        link.download = `chart_${startYear}-${endYear}.jpg`;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
