// pages/download.js
import { MainLayout } from "@components/Layout/MainLayout";
import { useState } from "react";

export default function Download() {
    const [selectedDataType, setSelectedDataType] = useState("");
    const [selectedFormat, setSelectedFormat] = useState("");

    const handleDownload = () => {
        // Log download for tracking
        const downloadLog = {
            timestamp: new Date().toISOString(),
            dataType: selectedDataType,
            format: selectedFormat,
            // Add user info if available
        };

        console.log("Download requested:", downloadLog);

        // Trigger actual download
        if (selectedDataType && selectedFormat) {
            const filename = `seawea_${selectedDataType}_${
                new Date().toISOString().split("T")[0]
            }.${selectedFormat}`;
            // Create download link
            const link = document.createElement("a");
            link.href = `/data/downloads/${selectedDataType}.${selectedFormat}`;
            link.download = filename;
            link.click();
        }
    };

    return (
        <MainLayout title="Download Data - SEA-WEA">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Download Data</h1>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Select Data to Download</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Data Type</label>
                            <select
                                value={selectedDataType}
                                onChange={(e) => setSelectedDataType(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="">Select data type...</option>
                                <option value="reservoirs">Reservoirs & Dams</option>
                                <option value="hydropower">Hydropower Stations</option>
                                <option value="boundaries">Administrative Boundaries</option>
                                <option value="timeseries">Time Series Data</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Format</label>
                            <select
                                value={selectedFormat}
                                onChange={(e) => setSelectedFormat(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="">Select format...</option>
                                <option value="csv">CSV</option>
                                <option value="json">JSON</option>
                                <option value="shp">Shapefile (SHP)</option>
                                <option value="geojson">GeoJSON</option>
                            </select>
                        </div>

                        <button
                            onClick={handleDownload}
                            disabled={!selectedDataType || !selectedFormat}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Download
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3">Data Usage Guidelines</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>Data is provided under Creative Commons Attribution 4.0 License</li>
                        <li>Please cite SEA-WEA when using this data in publications</li>
                        <li>Commercial use requires additional permission</li>
                    </ul>
                </div>
            </div>
        </MainLayout>
    );
}
