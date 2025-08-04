import React, { useState, useEffect } from "react";

export const ResponsiveNavbar = ({
    options,
    updateOption,
    onSidebarToggle = null,
    sidebarOpen = true,
}) => {
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Handle responsive breakpoints
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setMobileMenuOpen(false);
            }
        };

        // Initial check
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleOverviewClick = (newOverview) => {
        updateOption("overview", newOverview);
        if (isMobile) {
            setMobileMenuOpen(false);
        }
    };

    return (
        <>
            <div className="dash-top-container bg-white shadow-sm border-b">
                <div className="dash-top-left">
                    {/* Logo Section */}
                    <div className="header-logo--container flex items-center">
                        <h1 className="text-2xl font-bold text-gray-800">SEA-WEA</h1>
                    </div>

                    {/* Mobile Sidebar Toggle Button */}
                    {isMobile && onSidebarToggle && (
                        <button
                            className="mobile-sidebar-toggle p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                            onClick={onSidebarToggle}
                            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    )}

                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <button
                            className="mobile-menu-button p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle navigation menu"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={
                                        mobileMenuOpen
                                            ? "M6 18L18 6M6 6l12 12"
                                            : "M12 5v.01M12 12v.01M12 19v.01"
                                    }
                                />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Desktop Navigation */}
                {!isMobile && (
                    <div className="flex items-center space-x-4">
                        {/* Current/Future Toggle */}
                        <div className="dash-top-buttons flex space-x-2">
                            <button
                                className={`dash-top-button px-4 py-2 rounded transition-all duration-200 ${
                                    options.overview === "current"
                                        ? "bg-blue-500 text-white active"
                                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                                onClick={() => handleOverviewClick("current")}
                            >
                                Current
                            </button>
                            <button
                                className={`dash-top-button px-4 py-2 rounded transition-all duration-200 ${
                                    options.overview === "future"
                                        ? "bg-blue-500 text-white active"
                                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                                onClick={() => handleOverviewClick("future")}
                            >
                                Future
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex space-x-4">
                            <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors">
                                Overview
                            </button>
                            <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors">
                                Methods
                            </button>
                            <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors">
                                About Us
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobile && (
                <div
                    className={`mobile-menu-container bg-white border-b shadow-lg transition-all duration-300 ${
                        mobileMenuOpen
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                >
                    <div className="p-4 space-y-3">
                        {/* Current/Future Toggle for Mobile */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Time Period:</p>
                            <div className="flex space-x-2">
                                <button
                                    className={`flex-1 py-2 px-3 rounded text-sm transition-all duration-200 ${
                                        options.overview === "current"
                                            ? "bg-blue-500 text-white"
                                            : "border border-gray-300 text-gray-700"
                                    }`}
                                    onClick={() => handleOverviewClick("current")}
                                >
                                    Current
                                </button>
                                <button
                                    className={`flex-1 py-2 px-3 rounded text-sm transition-all duration-200 ${
                                        options.overview === "future"
                                            ? "bg-blue-500 text-white"
                                            : "border border-gray-300 text-gray-700"
                                    }`}
                                    onClick={() => handleOverviewClick("future")}
                                >
                                    Future
                                </button>
                            </div>
                        </div>

                        {/* Mobile Navigation Links */}
                        <div className="border-t pt-3 space-y-2">
                            <button
                                className="w-full text-left py-2 px-3 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Overview
                            </button>
                            <button
                                className="w-full text-left py-2 px-3 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Methods
                            </button>
                            <button
                                className="w-full text-left py-2 px-3 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                About Us
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ResponsiveNavbar;
