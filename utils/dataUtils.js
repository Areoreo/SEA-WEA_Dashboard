/**
 * Data utilities for SEA-WEA dashboard
 */

// Categorize data into three types: critical, non-critical, unknown
export const categorizeReservoirData = (item, activeTab, selectedAttribute) => {
    const attributeValue = item[selectedAttribute];

    // Check if data is unknown/missing
    if (
        attributeValue === null ||
        attributeValue === undefined ||
        attributeValue === "SEAWEA_UNKNOWN" ||
        (typeof attributeValue === "number" && attributeValue <= 0)
    ) {
        return "unknown";
    }

    // Determine critical vs non-critical based on active tab
    if (activeTab === "reservoirs") {
        return item.is_critical_reservoir ? "critical" : "non-critical";
    } else {
        return item.is_critical_hydropower ? "critical" : "non-critical";
    }
};

// Check if an attribute is "meaningful" for summation
export const isMeaningfulAttribute = (attribute) => {
    const meaningfulAttributes = ["normal_capacity_mcm", "normal_area_km2", "power_mw"];
    return meaningfulAttributes.includes(attribute);
};

// Get basin from coordinates (simplified - you may want to use actual basin boundaries)
export const getBasinFromCoordinates = (lat, lng) => {
    // Simplified basin classification based on geographic regions
    // This is a placeholder - you should replace with actual basin boundary data

    if (lat >= 20 && lat <= 30 && lng >= 100 && lng <= 110) {
        return "Red River Basin";
    } else if (lat >= 10 && lat <= 20 && lng >= 105 && lng <= 115) {
        return "Mekong River Basin";
    } else if (lat >= 15 && lat <= 25 && lng >= 95 && lng <= 105) {
        return "Irrawaddy River Basin";
    } else if (lat >= 5 && lat <= 15 && lng >= 100 && lng <= 110) {
        return "Chao Phraya Basin";
    } else if (lat >= 0 && lat <= 10 && lng >= 95 && lng <= 115) {
        return "Peninsular Malaysia Basin";
    } else if (lat >= 15 && lat <= 25 && lng >= 110 && lng <= 120) {
        return "Pearl River Basin";
    } else {
        return "Other Southeast Asian Basins";
    }
};

// Aggregate data by basin for summary view
export const aggregateDataByBasin = (filteredData, activeTab, selectedAttribute) => {
    const basinAggregation = {};
    const isMeaningful = isMeaningfulAttribute(selectedAttribute);

    filteredData.forEach((item) => {
        const basin = getBasinFromCoordinates(item.latitude, item.longitude);
        const category = categorizeReservoirData(item, activeTab, selectedAttribute);

        if (!basinAggregation[basin]) {
            basinAggregation[basin] = {
                basin,
                critical: 0,
                "non-critical": 0,
                unknown: 0,
                // Add sum values for meaningful attributes
                criticalSum: 0,
                "non-criticalSum": 0,
                unknownSum: 0,
                total: 0,
                totalSum: 0,
                items: [],
                // Calculate centroid for basin marker placement
                centerLat: 0,
                centerLng: 0,
                count: 0,
                attribute: selectedAttribute,
                isMeaningful: isMeaningful,
            };
        }

        // Always increment counts
        basinAggregation[basin][category]++;
        basinAggregation[basin].total++;

        // For meaningful attributes, also sum the values
        if (isMeaningful) {
            const attributeValue = item[selectedAttribute];
            const validValue =
                attributeValue && typeof attributeValue === "number" && attributeValue > 0
                    ? attributeValue
                    : 0;

            basinAggregation[basin][category + "Sum"] += validValue;
            basinAggregation[basin].totalSum += validValue;
        }

        basinAggregation[basin].items.push(item);

        // Update centroid calculation
        basinAggregation[basin].centerLat += item.latitude;
        basinAggregation[basin].centerLng += item.longitude;
        basinAggregation[basin].count++;
    });

    // Finalize centroid calculations
    Object.values(basinAggregation).forEach((basin) => {
        basin.centerLat = basin.centerLat / basin.count;
        basin.centerLng = basin.centerLng / basin.count;
    });

    return Object.values(basinAggregation);
};

// Get color for data category
export const getCategoryColor = (category) => {
    switch (category) {
        case "critical":
            return "#ef4444"; // Red
        case "non-critical":
            return "#3b82f6"; // Blue
        case "unknown":
            return "#6b7280"; // Gray
        default:
            return "#6b7280";
    }
};

// Get category label for display
export const getCategoryLabel = (category, activeTab) => {
    const threshold = activeTab === "reservoirs" ? ">100MCM" : ">30MW";
    const nonCriticalThreshold = activeTab === "reservoirs" ? "<100MCM" : "0-30MW";

    switch (category) {
        case "critical":
            return `Critical (${threshold})`;
        case "non-critical":
            return `Non-critical (${nonCriticalThreshold})`;
        case "unknown":
            return "SEA-WEA Unknown";
        default:
            return category;
    }
};

// Get units for display
export const getAttributeUnits = (attribute) => {
    switch (attribute) {
        case "normal_capacity_mcm":
            return "MCM";
        case "normal_area_km2":
            return "km²";
        case "dam_height_m":
            return "m";
        case "dam_length_m":
            return "m";
        case "power_mw":
            return "MW";
        case "water_head_m":
            return "m";
        default:
            return "";
    }
};

// Format values for display
export const formatAttributeValue = (value, attribute) => {
    if (value === null || value === undefined || value === 0) return "0";

    const units = getAttributeUnits(attribute);

    // For large numbers, add commas
    const formattedNumber =
        typeof value === "number"
            ? value.toLocaleString(undefined, { maximumFractionDigits: 1 })
            : value;

    return units ? `${formattedNumber} ${units}` : formattedNumber;
};
