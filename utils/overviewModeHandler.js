/**
 * Overview模式处理逻辑
 *
 * 这个模块处理Current和Future模式的切换逻辑，
 * 通过options.overview控制数据过滤和显示
 */

/**
 * 根据overview模式过滤数据
 * @param {Array} allData - 完整的水库数据数组
 * @param {string} overviewMode - "current" 或 "future"
 * @returns {Array} 过滤后的数据
 */
export function filterDataByOverview(allData, overviewMode) {
    if (!allData || !Array.isArray(allData)) {
        return [];
    }

    const validStatuses = {
        current: ["Operational"],
        future: ["Under_construction", "Planned"],
    };

    const allowedStatuses = validStatuses[overviewMode];
    if (!allowedStatuses) {
        console.warn(`未知的overview模式: ${overviewMode}`);
        return allData;
    }

    const filtered = allData.filter((item) => {
        // 检查status字段
        if (!item.status) return false;

        // 检查是否在允许的状态列表中
        return allowedStatuses.includes(item.status);
    });

    console.log(`📊 Overview模式 "${overviewMode}":`, {
        总数据: allData.length,
        过滤后: filtered.length,
        允许状态: allowedStatuses,
        状态分布: getStatusDistribution(filtered),
    });

    return filtered;
}

/**
 * 获取数据的状态分布统计
 * @param {Array} data 数据数组
 * @returns {Object} 状态分布统计
 */
function getStatusDistribution(data) {
    const distribution = {};
    data.forEach((item) => {
        const status = item.status || "Unknown";
        distribution[status] = (distribution[status] || 0) + 1;
    });
    return distribution;
}

/**
 * 在现有Dashboard组件中集成overview模式处理
 * 这个函数应该在您的主要dashboard组件中调用
 */
export function enhanceDashboardWithOverview(DashboardComponent) {
    return function EnhancedDashboard(props) {
        const { options = {}, ...otherProps } = props;
        const overviewMode = options.overview || "current";

        // 过滤数据
        const filteredData = useMemo(() => {
            return filterDataByOverview(props.data, overviewMode);
        }, [props.data, overviewMode]);

        // 获取模式相关的配置
        const modeConfig = getModeConfig(overviewMode);

        // 将过滤后的数据和配置传递给原组件
        return React.createElement(DashboardComponent, {
            ...otherProps,
            data: filteredData,
            overviewMode,
            modeConfig,
            options,
        });
    };
}

/**
 * 获取不同模式的配置信息
 * @param {string} mode - "current" 或 "future"
 * @returns {Object} 模式配置
 */
export function getModeConfig(mode) {
    const configs = {
        current: {
            title: "Current Water Infrastructure",
            description: "Operational reservoirs and hydropower stations",
            statuses: ["Operational"],
            statusColors: {
                Operational: "#22C55E", // 绿色
            },
            mapMarkerColor: "#22C55E",
            chartTheme: "current",
        },
        future: {
            title: "Future Water Infrastructure",
            description: "Planned and under-construction projects",
            statuses: ["Under_construction", "Planned"],
            statusColors: {
                Under_construction: "#F59E0B", // 橙色
                Planned: "#3B82F6", // 蓝色
            },
            mapMarkerColor: "#F59E0B",
            chartTheme: "future",
        },
    };

    return configs[mode] || configs.current;
}

/**
 * 在您的主要dashboard组件中使用的hook
 * 处理overview模式变化和相关的状态管理
 */
export function useOverviewMode(initialData, options) {
    const [overviewMode, setOverviewMode] = useState(options?.overview || "current");
    const [basinSystem, setBasinSystem] = useState(null);

    // 当options变化时更新模式
    useEffect(() => {
        if (options?.overview !== overviewMode) {
            setOverviewMode(options.overview || "current");
        }
    }, [options?.overview]);

    // 初始化basin系统
    useEffect(() => {
        const initBasinSystem = async () => {
            const { getBasinSystem } = await import("./simplifiedBasinAssignment");
            const system = await getBasinSystem();
            setBasinSystem(system);
        };
        initBasinSystem();
    }, []);

    // 过滤数据
    const filteredData = useMemo(() => {
        const baseFilteredData = filterDataByOverview(initialData, overviewMode);

        // 如果basin系统已初始化，添加basin信息
        if (basinSystem && baseFilteredData.length > 0) {
            return basinSystem.assignBasinsBatch(baseFilteredData);
        }

        return baseFilteredData;
    }, [initialData, overviewMode, basinSystem]);

    // 获取当前模式配置
    const modeConfig = useMemo(() => getModeConfig(overviewMode), [overviewMode]);

    // 统计信息
    const stats = useMemo(() => {
        if (!filteredData.length) return null;

        const statusStats = getStatusDistribution(filteredData);
        const basinStats = basinSystem ? basinSystem.getBasinStats(filteredData) : {};

        return {
            total: filteredData.length,
            statusStats,
            basinStats,
            criticalReservoirs: filteredData.filter((item) => item.is_critical_reservoir).length,
            criticalHydropower: filteredData.filter((item) => item.is_critical_hydropower).length,
        };
    }, [filteredData, basinSystem]);

    return {
        overviewMode,
        filteredData,
        modeConfig,
        stats,
        basinSystem,
    };
}
