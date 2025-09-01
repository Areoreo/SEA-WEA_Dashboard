/**
 * 简化的Basin Assignment系统
 * 使用SEA_boundary.geojson进行点位分配
 *
 * 这个版本简化了之前复杂的逻辑，直接使用现有的边界文件进行basin分配
 */

/**
 * 点在多边形内算法 (Ray Casting Algorithm)
 * @param {Array} point - [longitude, latitude]
 * @param {Array} polygon - 多边形坐标数组 [[lng, lat], ...]
 * @returns {boolean} 如果点在多边形内返回true
 */
function pointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];

        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
            inside = !inside;
        }
    }
    return inside;
}

/**
 * 简化的Basin分配系统
 */
export class SimplifiedBasinSystem {
    constructor() {
        this.boundaryData = null;
        this.cache = new Map();
        this.initialized = false;
    }

    /**
     * 初始化系统，加载边界数据
     */
    async initialize() {
        if (this.initialized) return;

        try {
            console.log("🔄 加载basin边界数据...");

            // 尝试加载专门的basin边界文件
            try {
                const response = await fetch("/data/basins_boundary.geojson");
                if (response.ok) {
                    this.boundaryData = await response.json();
                    console.log("✅ 成功加载basins_boundary.geojson");
                }
            } catch (error) {
                console.log("ℹ️ basins_boundary.geojson未找到，使用SEA_boundary.geojson作为测试");
            }

            // 如果没有专门的basin文件，使用SEA_boundary.geojson
            if (!this.boundaryData) {
                const response = await fetch("/data/SEA_boundary.geojson");
                if (response.ok) {
                    this.boundaryData = await response.json();
                    console.log("✅ 成功加载SEA_boundary.geojson作为测试数据");
                } else {
                    throw new Error("无法加载任何边界数据");
                }
            }

            this.initialized = true;
            console.log(`✅ Basin系统初始化完成，包含${this.boundaryData.features.length}个区域`);
        } catch (error) {
            console.error("❌ Basin系统初始化失败:", error);
            this.initialized = false;
        }
    }

    /**
     * 获取点位所属的basin
     * @param {number} latitude 纬度
     * @param {number} longitude 经度
     * @returns {string} Basin名称
     */
    getBasin(latitude, longitude) {
        if (!this.initialized || !this.boundaryData) {
            return this.getFallbackBasin(latitude, longitude);
        }

        // 创建缓存key
        const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const point = [longitude, latitude];

        // 遍历所有区域，找到包含该点的区域
        for (const feature of this.boundaryData.features) {
            const basinName = this.getBasinName(feature);

            if (this.isPointInFeature(point, feature)) {
                this.cache.set(cacheKey, basinName);
                return basinName;
            }
        }

        // 如果没有找到匹配的区域，使用fallback方法
        const fallbackBasin = this.getFallbackBasin(latitude, longitude);
        this.cache.set(cacheKey, fallbackBasin);
        return fallbackBasin;
    }

    /**
     * 从feature中提取basin名称
     * @param {Object} feature GeoJSON feature
     * @returns {string} Basin名称
     */
    getBasinName(feature) {
        const props = feature.properties;

        // 按优先级查找basin名称
        if (props.basin_name) return props.basin_name;
        if (props.basin) return props.basin;
        if (props.name && props.type === "basin") return props.name;
        if (props.name) {
            // 如果是国家数据，转换为相应的主要流域
            return this.countryToBasin(props.name);
        }

        return "Unknown Basin";
    }

    /**
     * 将国家名转换为主要流域名称
     * @param {string} countryName 国家名称
     * @returns {string} 主要流域名称
     */
    countryToBasin(countryName) {
        const countryBasinMap = {
            Vietnam: "Mekong River Basin",
            Cambodia: "Mekong River Basin",
            Laos: "Mekong River Basin",
            Thailand: "Chao Phraya Basin",
            Myanmar: "Irrawaddy River Basin",
            China: "Pearl River Basin",
            Malaysia: "Peninsular Malaysia Basins",
            Indonesia: "Indonesian River Basins",
            Philippines: "Philippine River Basins",
            Singapore: "Singapore River Basin",
        };

        return countryBasinMap[countryName] || `${countryName} River Basins`;
    }

    /**
     * 判断点是否在feature内
     * @param {Array} point [longitude, latitude]
     * @param {Object} feature GeoJSON feature
     * @returns {boolean}
     */
    isPointInFeature(point, feature) {
        const geometry = feature.geometry;

        if (geometry.type === "Polygon") {
            return pointInPolygon(point, geometry.coordinates[0]);
        } else if (geometry.type === "MultiPolygon") {
            for (const polygon of geometry.coordinates) {
                if (pointInPolygon(point, polygon[0])) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Fallback方法：基于地理位置的简化分配
     * @param {number} lat 纬度
     * @param {number} lng 经度
     * @returns {string} Basin名称
     */
    getFallbackBasin(lat, lng) {
        // 基于地理位置的简化判断
        if (lat >= 20 && lat <= 30 && lng >= 102 && lng <= 108) {
            return "Red River Basin";
        } else if (lat >= 8 && lat <= 22 && lng >= 95 && lng <= 108) {
            return "Mekong River Basin";
        } else if (lat >= 15 && lat <= 28 && lng >= 93 && lng <= 101) {
            return "Irrawaddy River Basin";
        } else if (lat >= 13 && lat <= 18 && lng >= 99 && lng <= 102) {
            return "Chao Phraya Basin";
        } else if (lat >= 21 && lat <= 26 && lng >= 110 && lng <= 117) {
            return "Pearl River Basin";
        } else if (lat >= 1 && lat <= 7 && lng >= 99 && lng <= 105) {
            return "Peninsular Malaysia Basins";
        } else {
            return "Other Southeast Asian Basins";
        }
    }

    /**
     * 批量处理多个点位
     * @param {Array} points 包含latitude和longitude属性的点位数组
     * @returns {Array} 包含basin信息的点位数组
     */
    assignBasinsBatch(points) {
        return points.map((point) => ({
            ...point,
            basin: this.getBasin(point.latitude, point.longitude),
        }));
    }

    /**
     * 获取basin统计信息
     * @param {Array} points 点位数组
     * @returns {Object} Basin统计结果
     */
    getBasinStats(points) {
        const stats = {};
        points.forEach((point) => {
            const basin = this.getBasin(point.latitude, point.longitude);
            stats[basin] = (stats[basin] || 0) + 1;
        });

        return Object.entries(stats)
            .sort(([, a], [, b]) => b - a)
            .reduce((acc, [basin, count]) => {
                acc[basin] = count;
                return acc;
            }, {});
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.clear();
        console.log("🧹 Basin分配缓存已清除");
    }
}

/**
 * 全局实例，供整个应用使用
 */
let globalBasinSystem = null;

/**
 * 获取全局basin系统实例
 * @returns {SimplifiedBasinSystem}
 */
export async function getBasinSystem() {
    if (!globalBasinSystem) {
        globalBasinSystem = new SimplifiedBasinSystem();
        await globalBasinSystem.initialize();
    }
    return globalBasinSystem;
}

/**
 * 兼容性函数：替换原有的getBasinFromCoordinates
 * @param {number} lat 纬度
 * @param {number} lng 经度
 * @returns {string} Basin名称
 */
export async function getBasinFromCoordinates(lat, lng) {
    const system = await getBasinSystem();
    return system.getBasin(lat, lng);
}
