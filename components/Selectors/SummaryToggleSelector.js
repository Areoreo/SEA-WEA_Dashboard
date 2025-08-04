import React, { useState } from "react";

export const SummaryToggleSelector = ({ options, updateOption }) => {
    const [isSummaryOpen, setSummaryOpen] = useState(true);

    return (
        <div className="variable-selector">
            <div className="variable-section">
                <button className="section-title" onClick={() => setSummaryOpen(!isSummaryOpen)}>
                    Summary
                    <span className={`toggle-icon ${isSummaryOpen ? "open" : "closed"}`}>▼</span>
                </button>
                {isSummaryOpen && (
                    <div className="variable-list" style={{ padding: "8px 0" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "8px 6px",
                                marginBottom: "4px",
                            }}
                        >
                            <input
                                type="checkbox"
                                id="show-summary"
                                checked={options.showSummary || false}
                                onChange={(e) => updateOption("showSummary", e.target.checked)}
                                style={{ marginRight: "8px" }}
                            />
                            <label
                                htmlFor="show-summary"
                                style={{
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <span
                                    style={{
                                        display: "inline-block",
                                        width: "12px",
                                        height: "12px",
                                        backgroundColor: "#10b981",
                                        borderRadius: "2px",
                                        marginRight: "6px",
                                    }}
                                ></span>
                                Show Basin Summary
                            </label>
                        </div>

                        <div
                            className="text-xs text-gray-600"
                            style={{ padding: "4px 6px", fontStyle: "italic" }}
                        >
                            Display aggregated data by basin with bar charts
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
