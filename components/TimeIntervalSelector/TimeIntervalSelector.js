import React, { useState } from "react";

export const TimeIntervalSelector = ({
    label,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    selectedStartDate,
    setSelectedStartDate,
    selectedEndDate,
    setSelectedEndDate,
    options,
    updateOption
}) => {
    const months = [
        { value: "01", label: "Jan" },
        { value: "02", label: "Feb" },
        { value: "03", label: "Mar" },
        { value: "04", label: "Apr" },
        { value: "05", label: "May" },
        { value: "06", label: "Jun" },
        { value: "07", label: "Jul" },
        { value: "08", label: "Aug" },
        { value: "09", label: "Sep" },
        { value: "10", label: "Oct" },
        { value: "11", label: "Nov" },
        { value: "12", label: "Dec" }
    ];

    const [isTimeIntervalOpen, setTimeIntervalOpen] = useState(true);

    return (
        <div className="variable-selector">
            <div className="variable-section">
                <button
                    className="section-title"
                    onClick={() => setTimeIntervalOpen(!isTimeIntervalOpen)}
                >
                    Time Interval
                    <span
                        className={`toggle-icon ${
                            isTimeIntervalOpen ? "open" : "closed"
                        }`}
                    >
                        ▼
                    </span>
                </button>
                {isTimeIntervalOpen && (
                    <>
                        <div className="date-picker-list">
                            <button
                                className={`dateType-selector-button ${
                                    options.dateType === "Yearly"
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    updateOption("dateType", "Yearly")
                                }
                            >
                                Yearly
                            </button>
                            <button
                                className={`dateType-selector-button ${
                                    options.dateType === "Monthly"
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    updateOption("dateType", "Monthly")
                                }
                            >
                                Monthly
                            </button>
                        </div>
                        <div className="date-picker-list">
                            <p className=" font-medium text-gray-700 date-selector-text-box">
                                {label}
                            </p>

                            {/* 年份选择 */}
                            <select
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(e.target.value)
                                }
                            >
                                {options.overview === "forecast" ? (
                                    <option value="2025">2025</option>
                                ) : (
                                    Array.from(
                                        { length: 21 },
                                        (_, i) => 1990 + i
                                    ).map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))
                                )}
                            </select>

                            {/* 月份选择（如果不是 Yearly 类型） */}
                            {options.dateType !== "Yearly" && (
                                <select
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={selectedMonth}
                                    onChange={(e) =>
                                        setSelectedMonth(e.target.value)
                                    }
                                >
                                    {options.overview === "forecast"
                                        ? [
                                              "06",
                                              "07",
                                              "08",
                                              "09",
                                              "10",
                                              "11"
                                          ].map((month) => (
                                              <option key={month} value={month}>
                                                  {
                                                      months.find(
                                                          (m) =>
                                                              m.value === month
                                                      ).label
                                                  }
                                              </option>
                                          ))
                                        : months.map((month) => (
                                              <option
                                                  key={month.value}
                                                  value={month.value}
                                              >
                                                  {month.label}
                                              </option>
                                          ))}
                                </select>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
