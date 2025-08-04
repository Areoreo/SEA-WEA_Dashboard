import React, { useState } from "react";

export const CountrySelector = ({ options, updateOption, availableCountries = [] }) => {
    const [isCountryOpen, setCountryOpen] = useState(true);

    const handleCountryToggle = (country) => {
        const currentCountries = options.selectedCountries || [];
        const isSelected = currentCountries.includes(country);

        let newCountries;
        if (isSelected) {
            newCountries = currentCountries.filter((c) => c !== country);
        } else {
            newCountries = [...currentCountries, country];
        }

        updateOption("selectedCountries", newCountries);
    };

    const clearAllCountries = () => {
        updateOption("selectedCountries", []);
    };

    const selectedCount = (options.selectedCountries || []).length;

    return (
        <div className="variable-selector">
            <div className="variable-section">
                <button className="section-title" onClick={() => setCountryOpen(!isCountryOpen)}>
                    Countries ({selectedCount}/{availableCountries.length})
                    <span className={`toggle-icon ${isCountryOpen ? "open" : "closed"}`}>▼</span>
                </button>
                {isCountryOpen && (
                    <div className="variable-list">
                        {selectedCount > 0 && (
                            <button
                                className="variable-item clear-all"
                                onClick={clearAllCountries}
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
                        {availableCountries.map((country) => (
                            <button
                                key={country}
                                className={`variable-item ${
                                    (options.selectedCountries || []).includes(country)
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() => handleCountryToggle(country)}
                            >
                                {country}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
