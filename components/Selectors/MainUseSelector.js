import React, { useState } from "react";

export const MainUseSelector = ({ options, updateOption, availableUses = [] }) => {
    const [isMainUseOpen, setMainUseOpen] = useState(true);

    const handleUseToggle = (use) => {
        const currentUses = options.selectedUses || [];
        const isSelected = currentUses.includes(use);

        let newUses;
        if (isSelected) {
            newUses = currentUses.filter((u) => u !== use);
        } else {
            newUses = [...currentUses, use];
        }

        updateOption("selectedUses", newUses);
    };

    const clearAllUses = () => {
        updateOption("selectedUses", []);
    };

    const selectedCount = (options.selectedUses || []).length;

    return (
        <div className="variable-selector">
            <div className="variable-section">
                <button className="section-title" onClick={() => setMainUseOpen(!isMainUseOpen)}>
                    Main Use ({selectedCount}/{availableUses.length})
                    <span className={`toggle-icon ${isMainUseOpen ? "open" : "closed"}`}>▼</span>
                </button>
                {isMainUseOpen && (
                    <div className="variable-list">
                        {selectedCount > 0 && (
                            <button
                                className="variable-item clear-all"
                                onClick={clearAllUses}
                                style={{
                                    background: "#fee",
                                    color: "#c53030",
                                    fontStyle: "italic",
                                    marginBottom: "4px",
                                }}
                            >
                                Clear All ({selectedCount})
                            </button>
                        )}
                        {availableUses.map((use) => (
                            <button
                                key={use}
                                className={`variable-item ${
                                    (options.selectedUses || []).includes(use) ? "selected" : ""
                                }`}
                                onClick={() => handleUseToggle(use)}
                            >
                                {use}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
