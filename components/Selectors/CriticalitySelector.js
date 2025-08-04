import React, { useState } from "react";

export const CriticalitySelector = ({ options, updateOption }) => {
    const [isCriticalityOpen, setCriticalityOpen] = useState(true);

    const getCriticalThreshold = () => {
        return options.activeTab === "reservoirs" ? ">100MCM" : ">30MW";
    };

    const getNonCriticalThreshold = () => {
        return options.activeTab === "reservoirs" ? "<100MCM" : "0-30MW";
    };

    return (
        <div className="variable-selector">
            <div className="variable-section">
                <button
                    className="section-title"
                    onClick={() => setCriticalityOpen(!isCriticalityOpen)}
                >
                    Layers
                    <span className={`toggle-icon ${isCriticalityOpen ? "open" : "closed"}`}>
                        ▼
                    </span>
                </button>
                {isCriticalityOpen && (
                    <div className="variable-list" style={{ padding: "8px 0" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "4px 6px",
                                marginBottom: "4px",
                            }}
                        >
                            <input
                                type="checkbox"
                                id="show-critical"
                                checked={options.showCritical}
                                onChange={(e) => updateOption("showCritical", e.target.checked)}
                                style={{ marginRight: "8px" }}
                            />
                            <label
                                htmlFor="show-critical"
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
                                        backgroundColor: "#ef4444",
                                        borderRadius: "50%",
                                        marginRight: "6px",
                                    }}
                                ></span>
                                Critical ({getCriticalThreshold()})
                            </label>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "4px 6px",
                            }}
                        >
                            <input
                                type="checkbox"
                                id="show-non-critical"
                                checked={options.showNonCritical}
                                onChange={(e) => updateOption("showNonCritical", e.target.checked)}
                                style={{ marginRight: "8px" }}
                            />
                            <label
                                htmlFor="show-non-critical"
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
                                        backgroundColor: "#3b82f6",
                                        borderRadius: "50%",
                                        marginRight: "6px",
                                    }}
                                ></span>
                                Non-critical ({getNonCriticalThreshold()})
                            </label>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
