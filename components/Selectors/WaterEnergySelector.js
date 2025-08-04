import React, { useState } from "react";

export const WaterEnergySelector = ({ options, updateOption }) => {
    const [isWaterOpen, setWaterOpen] = useState(true);

    const waterOptions = [
        { value: "reservoirs", label: "Reservoirs & Dams" },
        { value: "hydropower", label: "Hydropower Station" },
    ];

    return (
        <div className="variable-selector">
            <div className="variable-section">
                <button className="section-title" onClick={() => setWaterOpen(!isWaterOpen)}>
                    Water
                    <span className={`toggle-icon ${isWaterOpen ? "open" : "closed"}`}>▼</span>
                </button>
                {isWaterOpen && (
                    <div className="variable-list">
                        {waterOptions.map((opt) => (
                            <button
                                key={opt.value}
                                className={`variable-item ${
                                    options.activeTab === opt.value ? "selected" : ""
                                }`}
                                // onClick={() => updateOption("activeTab", opt.value)}
                                onClick={() => {
                                    updateOption("activeTab", opt.value);

                                    // set default attribute when switching water_energy
                                    const defaultAttributeMap = {
                                        reservoirs: "normal_capacity_mcm",
                                        hydropower: "water_head_m",
                                    };
                                    updateOption(
                                        "selectedAttribute",
                                        defaultAttributeMap[opt.value]
                                    );
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
