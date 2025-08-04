// components/responsive/ResponsiveMenu.js
import React, { useState, useEffect } from 'react';
import { VariableSelector } from "@components/VariableSelector";
import { TimeIntervalSelector } from "@components/TimeIntervalSelector";
import { AdminLevelSelector } from "@components/AdminLevelSelector";

export const ResponsiveMenu = ({
    options,
    updateOption,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    isOpen,
    setIsOpen
}) => {
    const [activeTab, setActiveTab] = useState('variables'); // 'variables', 'time', 'admin', 'region'
    
    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const menu = document.getElementById('hamburger-menu');
            if (menu && !menu.contains(event.target) && 
                !event.target.classList.contains('hamburger-toggle')) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, setIsOpen]);

    // Handle overview selection (hist/forecast)
    const handleOverviewChange = (type) => {
        updateOption("overview", type);
        if (type === "forecast") {
            setSelectedYear("2025");
            setSelectedMonth("04");
        } else {
            setSelectedYear("2000");
            setSelectedMonth("04");
        }
    };

    // Handle region selection (SEA, Thailand, etc.)
    const handleRegionChange = (region) => {
        updateOption("region", region);
    };

    return (
        <div 
            id="hamburger-menu"
            className={`hamburger-menu ${isOpen ? 'open' : ''}`}
        >
            {/* Tab selector */}
            <div className="hamburger-tabs">
                <button 
                    className={`hamburger-tab ${activeTab === 'variables' ? 'active' : ''}`}
                    onClick={() => setActiveTab('variables')}
                >
                    Variables
                </button>
                <button 
                    className={`hamburger-tab ${activeTab === 'time' ? 'active' : ''}`}
                    onClick={() => setActiveTab('time')}
                >
                    Time
                </button>
                <button 
                    className={`hamburger-tab ${activeTab === 'admin' ? 'active' : ''}`}
                    onClick={() => setActiveTab('admin')}
                >
                    Admin Level
                </button>
                <button 
                    className={`hamburger-tab ${activeTab === 'region' ? 'active' : ''}`}
                    onClick={() => setActiveTab('region')}
                >
                    Region
                </button>
            </div>

            {/* Tab content */}
            <div className="hamburger-content">
                {activeTab === 'variables' && (
                    <div className="tab-pane">
                        <h3>Select Variable</h3>
                        <VariableSelector
                            selectedVar={options.varType}
                            updateOption={updateOption}
                        />
                    </div>
                )}
                
                {activeTab === 'time' && (
                    <div className="tab-pane">
                        <h3>Time Settings</h3>
                        <div className="overview-selector">
                            <h4>Time Range</h4>
                            <div className="button-group">
                                <button 
                                    className={`selector-btn ${options.overview === 'hist' ? 'active' : ''}`}
                                    onClick={() => handleOverviewChange('hist')}
                                >
                                    Historical
                                </button>
                                <button 
                                    className={`selector-btn ${options.overview === 'forecast' ? 'active' : ''}`}
                                    onClick={() => handleOverviewChange('forecast')}
                                >
                                    Forecast
                                </button>
                            </div>
                        </div>
                        <TimeIntervalSelector
                            label="Date:"
                            selectedYear={selectedYear}
                            setSelectedYear={setSelectedYear}
                            selectedMonth={selectedMonth}
                            setSelectedMonth={setSelectedMonth}
                            options={options}
                            updateOption={updateOption}
                        />
                    </div>
                )}
                
                {activeTab === 'admin' && (
                    <div className="tab-pane">
                        <h3>Administrative Level</h3>
                        <AdminLevelSelector
                            options={options}
                            updateOption={updateOption}
                        />
                    </div>
                )}
                
                {activeTab === 'region' && (
                    <div className="tab-pane">
                        <h3>Select Region</h3>
                        <div className="region-buttons">
                            {["SEA", "Thailand", "Cambodia", "Laos", "Myanmar", "Vietnam"].map((region) => (
                                <button
                                    key={region}
                                    className={`region-btn ${options.region === region ? 'active' : ''}`}
                                    onClick={() => handleRegionChange(region)}
                                >
                                    {region}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};