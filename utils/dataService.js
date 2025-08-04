// utils/dataService.js
export class DataService {
    static async loadGeoJSON(filename) {
        try {
            const response = await fetch(`/data/geojson/${filename}`);
            if (!response.ok) throw new Error("Failed to load GeoJSON");
            return await response.json();
        } catch (error) {
            console.error("Error loading GeoJSON:", error);
            return null;
        }
    }

    static async loadReservoirData() {
        try {
            const response = await fetch("/data/reservoirs.json");
            if (!response.ok) throw new Error("Failed to load reservoir data");
            return await response.json();
        } catch (error) {
            console.error("Error loading reservoir data:", error);
            return [];
        }
    }

    static async loadHydropowerData() {
        try {
            const response = await fetch("/data/hydropower.json");
            if (!response.ok) throw new Error("Failed to load hydropower data");
            return await response.json();
        } catch (error) {
            console.error("Error loading hydropower data:", error);
            return [];
        }
    }

    static filterDataByOptions(data, options) {
        // Implement filtering logic based on user selections
        return data.filter((item) => {
            // Add your filtering logic here
            return true;
        });
    }
}
