import React, { useState, useEffect, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Calendar,
    TrendingUp,
    Droplets,
    Mountain,
    BarChart3,
    X,
    ZoomIn,
    Download,
} from "lucide-react";

// 主要的Dynamic Info面板组件
export const DynamicInfoPanel = ({ reservoir, onClose, onZoomToReservoir }) => {
    const [timeSeriesData, setTimeSeriesData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState("all");
    const [activeChart, setActiveChart] = useState("all"); // 'all', 'elevation', 'area', 'storage'

    useEffect(() => {
        if (reservoir && reservoir.INDEX) {
            loadTimeSeriesData(reservoir.INDEX, reservoir.commission_year);
        }
    }, [reservoir]);

    const loadTimeSeriesData = async (index, commissionYear = null) => {
        setLoading(true);
        setError(null);

        try {
            // 尝试多种可能的文件名格式
            const possibleFiles = [
                `${index}_${commissionYear || "2010"}_2025.csv`,
                `${index}_2010_2025.csv`,
                `${index}.csv`,
                `reservoir_${index}.csv`,
            ];

            let csvData = null;
            let loadedFile = null;

            for (const fileName of possibleFiles) {
                try {
                    console.log(`Trying to load: /data/dynamicData/${fileName}`);
                    const response = await fetch(`/data/dynamicData/${fileName}`);

                    if (response.ok) {
                        csvData = await response.text();
                        loadedFile = fileName;
                        console.log(`Successfully loaded: ${fileName}`);
                        break;
                    }
                } catch (err) {
                    console.log(`Failed to load ${fileName}:`, err.message);
                }
            }

            if (!csvData) {
                throw new Error(
                    `无法找到INDEX ${index}对应的时间序列数据文件。尝试的文件: ${possibleFiles.join(
                        ", "
                    )}`
                );
            }

            const parsedData = parseCSVData(csvData);

            if (parsedData.length === 0) {
                throw new Error("CSV文件为空或格式不正确");
            }

            setTimeSeriesData({
                data: parsedData,
                fileName: loadedFile,
                totalRecords: parsedData.length,
                dateRange: {
                    start: parsedData[0].date,
                    end: parsedData[parsedData.length - 1].date,
                },
            });

            console.log(`Loaded ${parsedData.length} records from ${loadedFile}`);
        } catch (err) {
            console.error("加载时间序列数据失败:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const parseCSVData = (csvText) => {
        const lines = csvText.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
            throw new Error("CSV文件格式不正确：缺少数据行");
        }

        const header = lines[0].split(",").map((h) => h.trim());
        console.log("CSV Header:", header);

        // 验证必需的列
        const requiredColumns = ["Time", "area_km2", "elevation_m", "changed_storage_mcm"];
        const missingColumns = requiredColumns.filter((col) => !header.includes(col));

        if (missingColumns.length > 0) {
            console.warn("Missing columns:", missingColumns);
        }

        return lines
            .slice(1)
            .map((line, index) => {
                try {
                    const values = line.split(",").map((v) => v.trim());
                    const rowData = {};

                    header.forEach((col, i) => {
                        rowData[col] = values[i] || null;
                    });

                    // 解析日期
                    let parsedDate;
                    try {
                        parsedDate = new Date(rowData.Time);
                        if (isNaN(parsedDate.getTime())) {
                            throw new Error("Invalid date");
                        }
                    } catch (dateError) {
                        console.warn(`Invalid date at row ${index + 2}: ${rowData.Time}`);
                        return null;
                    }

                    return {
                        date: rowData.Time,
                        timestamp: parsedDate.getTime(),
                        time: parsedDate,
                        area_km2: parseFloat(rowData.area_km2) || 0,
                        elevation_m: parseFloat(rowData.elevation_m) || 0,
                        changed_storage_mcm: parseFloat(rowData.changed_storage_mcm) || 0,
                        // 计算相对变化（如果需要）
                        yearMonth: `${parsedDate.getFullYear()}-${String(
                            parsedDate.getMonth() + 1
                        ).padStart(2, "0")}`,
                    };
                } catch (parseError) {
                    console.warn(`Error parsing row ${index + 2}:`, parseError);
                    return null;
                }
            })
            .filter((item) => item !== null)
            .sort((a, b) => a.timestamp - b.timestamp);
    };

    // 根据时间范围过滤数据
    const filteredData = useMemo(() => {
        if (!timeSeriesData?.data) return [];

        const data = timeSeriesData.data;
        const now = new Date();
        let startDate;

        switch (selectedTimeRange) {
            case "1year":
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            case "3years":
                startDate = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
                break;
            case "5years":
                startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
                break;
            default:
                return data;
        }

        return data.filter((item) => item.timestamp >= startDate.getTime());
    }, [timeSeriesData, selectedTimeRange]);

    // 计算统计信息
    const statistics = useMemo(() => {
        if (!filteredData.length) return null;

        const calculateStats = (values) => {
            const validValues = values.filter((v) => v > 0);
            if (validValues.length === 0) return { min: 0, max: 0, avg: 0, latest: 0 };

            return {
                min: Math.min(...validValues),
                max: Math.max(...validValues),
                avg: validValues.reduce((sum, v) => sum + v, 0) / validValues.length,
                latest: values[values.length - 1] || 0,
            };
        };

        return {
            area: calculateStats(filteredData.map((d) => d.area_km2)),
            elevation: calculateStats(filteredData.map((d) => d.elevation_m)),
            storage: calculateStats(filteredData.map((d) => d.changed_storage_mcm)),
        };
    }, [filteredData]);

    const handleZoomToReservoir = () => {
        onZoomToReservoir(reservoir);
    };

    const handleDownloadData = () => {
        if (!filteredData.length) return;

        const csvContent = [
            "Date,Area(km²),Elevation(m),Changed Storage(MCM)",
            ...filteredData.map(
                (item) =>
                    `${item.date},${item.area_km2},${item.elevation_m},${item.changed_storage_mcm}`
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${reservoir.reservoir_name || reservoir.INDEX}_time_series.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">正在加载动态监测数据...</p>
                    <p className="text-sm text-gray-500 mt-2">INDEX: {reservoir.INDEX}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-lg">
                    <div className="text-red-500 mb-4">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">无法加载动态数据</h3>
                        <p className="text-sm">{error}</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg text-left text-sm">
                        <h4 className="font-semibold text-blue-800 mb-2">调试信息:</h4>
                        <ul className="text-blue-700 space-y-1">
                            <li>• 水库: {reservoir.reservoir_name}</li>
                            <li>• INDEX: {reservoir.INDEX}</li>
                            <li>• Commission Year: {reservoir.commission_year || "N/A"}</li>
                        </ul>
                    </div>

                    <div className="mt-6 space-x-3">
                        <button
                            onClick={handleZoomToReservoir}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors inline-flex items-center space-x-2"
                        >
                            <ZoomIn className="w-4 h-4" />
                            <span>查看位置</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors inline-flex items-center space-x-2"
                        >
                            <X className="w-4 h-4" />
                            <span>关闭</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-white flex flex-col">
            {/* 头部控制栏 */}
            <div className="flex-shrink-0 border-b border-gray-200 p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                            <Droplets className="w-5 h-5 text-blue-500" />
                            <span>{reservoir.reservoir_name || `水库 ${reservoir.INDEX}`}</span>
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            动态监测数据 ({filteredData.length} 条记录)
                        </p>
                        {timeSeriesData && (
                            <p className="text-xs text-gray-500">
                                数据来源: {timeSeriesData.fileName} | 时间范围:{" "}
                                {timeSeriesData.dateRange.start} ~ {timeSeriesData.dateRange.end}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                        {/* 时间范围选择 */}
                        <select
                            value={selectedTimeRange}
                            onChange={(e) => setSelectedTimeRange(e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                            <option value="all">全部时间</option>
                            <option value="5years">近5年</option>
                            <option value="3years">近3年</option>
                            <option value="1year">近1年</option>
                        </select>

                        {/* 图表视图选择 */}
                        <select
                            value={activeChart}
                            onChange={(e) => setActiveChart(e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                            <option value="all">全部图表</option>
                            <option value="elevation">水位</option>
                            <option value="area">面积</option>
                            <option value="storage">库容</option>
                        </select>

                        <button
                            onClick={handleDownloadData}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors inline-flex items-center space-x-1"
                        >
                            <Download className="w-3 h-3" />
                            <span>下载</span>
                        </button>

                        <button
                            onClick={handleZoomToReservoir}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors inline-flex items-center space-x-1"
                        >
                            <ZoomIn className="w-3 h-3" />
                            <span>定位</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 统计信息卡片 */}
            {statistics && (
                <div className="flex-shrink-0 p-4 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-3 gap-4">
                        <StatCard
                            title="水位 (m)"
                            icon={<Mountain className="w-4 h-4" />}
                            data={statistics.elevation}
                            color="blue"
                        />
                        <StatCard
                            title="面积 (km²)"
                            icon={<Droplets className="w-4 h-4" />}
                            data={statistics.area}
                            color="green"
                        />
                        <StatCard
                            title="库容变化 (MCM)"
                            icon={<TrendingUp className="w-4 h-4" />}
                            data={statistics.storage}
                            color="orange"
                        />
                    </div>
                </div>
            )}

            {/* 图表区域 */}
            <div className="flex-1 p-4 overflow-y-auto">
                {filteredData.length > 0 ? (
                    <TimeSeriesCharts data={filteredData} activeChart={activeChart} />
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">所选时间范围内无数据</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// 统计卡片组件
const StatCard = ({ title, icon, data, color }) => {
    const colorClasses = {
        blue: "bg-blue-50 border-blue-200 text-blue-800",
        green: "bg-green-50 border-green-200 text-green-800",
        orange: "bg-orange-50 border-orange-200 text-orange-800",
    };

    return (
        <div className={`rounded-lg p-3 border ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{title}</span>
                {icon}
            </div>
            <div className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span>最新:</span>
                    <span className="font-semibold">{data.latest.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs opacity-75">
                    <span>最大:</span>
                    <span>{data.max.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs opacity-75">
                    <span>最小:</span>
                    <span>{data.min.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs opacity-75">
                    <span>平均:</span>
                    <span>{data.avg.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

// 时间序列图表组件
const TimeSeriesCharts = ({ data, activeChart = "all" }) => {
    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTooltipDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const charts = [
        {
            id: "elevation",
            title: "水位变化 (m)",
            dataKey: "elevation_m",
            color: "#3B82F6",
            unit: "m",
        },
        {
            id: "area",
            title: "水域面积 (km²)",
            dataKey: "area_km2",
            color: "#10B981",
            unit: "km²",
        },
        {
            id: "storage",
            title: "库容变化 (MCM)",
            dataKey: "changed_storage_mcm",
            color: "#F59E0B",
            unit: "MCM",
        },
    ];

    const activeCharts =
        activeChart === "all" ? charts : charts.filter((chart) => chart.id === activeChart);

    return (
        <div className="space-y-6">
            {activeCharts.map((chart) => (
                <div key={chart.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="font-medium mb-4 text-gray-800 flex items-center space-x-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: chart.color }}
                        />
                        <span>{chart.title}</span>
                    </h4>

                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="timestamp"
                                type="number"
                                scale="time"
                                domain={["dataMin", "dataMax"]}
                                tickFormatter={formatDate}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                domain={["dataMin - 5", "dataMax + 5"]}
                            />
                            <Tooltip
                                labelFormatter={(timestamp) => formatTooltipDate(timestamp)}
                                formatter={(value, name) => [
                                    `${Number(value).toFixed(2)} ${chart.unit}`,
                                    chart.title,
                                ]}
                                contentStyle={{
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey={chart.dataKey}
                                stroke={chart.color}
                                strokeWidth={2}
                                dot={false}
                                connectNulls={false}
                                activeDot={{
                                    r: 4,
                                    fill: chart.color,
                                    strokeWidth: 2,
                                    stroke: "#ffffff",
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ))}
        </div>
    );
};

export default DynamicInfoPanel;
