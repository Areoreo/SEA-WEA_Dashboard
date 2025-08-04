import React, { useState } from "react";

export const SpatialUnitSelector = ({ options, updateOption }) => {
    const [isSpatialOpen, setSpatialOpen] = useState(true);

    const spatialOptions = [
        { value: "basins", label: "Basins" },
        { value: "countries", label: "Countries" },
    ];

    return (
        <div className="variable-selector">
            <div className="variable-section">
                <button className="section-title" onClick={() => setSpatialOpen(!isSpatialOpen)}>
                    Spatial Unit
                    <span className={`toggle-icon ${isSpatialOpen ? "open" : "closed"}`}>▼</span>
                </button>
                {isSpatialOpen && (
                    <div className="variable-list">
                        {spatialOptions.map((opt) => (
                            <button
                                key={opt.value}
                                className={`variable-item ${
                                    options.spatialUnit === opt.value ? "selected" : ""
                                }`}
                                onClick={() => updateOption("spatialUnit", opt.value)}
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
