// import React, { useEffect, useState, useCallback } from "react";
// import { useMap } from "react-leaflet";

// // 比例尺控件组件
// export const ScaleControl = () => {
//     const map = useMap();
//     const [scale, setScale] = useState("");
//     const [zoom, setZoom] = useState(5);

//     const updateScale = useCallback(() => {
//         if (!map) return;

//         const zoom = map.getZoom();
//         setZoom(zoom);

//         try {
//             // 获取地图边界
//             const bounds = map.getBounds();
//             const center = bounds.getCenter();

//             // 计算100像素代表的实际距离
//             const pointA = map.containerPointToLatLng([0, 0]);
//             const pointB = map.containerPointToLatLng([100, 0]);
//             const distance = pointA.distanceTo(pointB); // 距离（米）

//             // 格式化比例尺显示
//             let scaleText;
//             let scaleWidth = 100; // 基础宽度100px

//             if (distance >= 1000) {
//                 const km = Math.round(distance / 1000);
//                 if (km >= 10) {
//                     const roundedKm = Math.round(km / 10) * 10;
//                     scaleText = `${roundedKm} km`;
//                     scaleWidth = (roundedKm * 1000 * 100) / distance;
//                 } else {
//                     scaleText = `${km} km`;
//                     scaleWidth = (km * 1000 * 100) / distance;
//                 }
//             } else {
//                 const meters = Math.round(distance);
//                 if (meters >= 100) {
//                     const roundedMeters = Math.round(meters / 100) * 100;
//                     scaleText = `${roundedMeters} m`;
//                     scaleWidth = (roundedMeters * 100) / distance;
//                 } else if (meters >= 10) {
//                     const roundedMeters = Math.round(meters / 10) * 10;
//                     scaleText = `${roundedMeters} m`;
//                     scaleWidth = (roundedMeters * 100) / distance;
//                 } else {
//                     scaleText = `${meters} m`;
//                 }
//             }

//             // 确保scaleWidth在合理范围内
//             scaleWidth = Math.max(20, Math.min(200, scaleWidth));

//             setScale({ text: scaleText, width: scaleWidth });
//         } catch (error) {
//             console.warn("Error calculating scale:", error);
//             setScale({ text: "Scale unavailable", width: 100 });
//         }
//     }, [map]);

//     useEffect(() => {
//         if (!map) return;

//         // 监听地图变化事件
//         const events = ["zoomend", "moveend", "resize"];
//         events.forEach((event) => {
//             map.on(event, updateScale);
//         });

//         // 初始化
//         updateScale();

//         // 清理事件监听器
//         return () => {
//             events.forEach((event) => {
//                 map.off(event, updateScale);
//             });
//         };
//     }, [map, updateScale]);

//     if (!scale) return null;

//     return (
//         <div className="absolute bottom-4 left-4 z-[1000] bg-white bg-opacity-95 rounded-lg px-3 py-2 shadow-lg border">
//             <div className="flex items-center space-x-3 text-sm">
//                 <div className="flex flex-col items-center">
//                     <div
//                         className="border-b-2 border-l-2 border-r-2 border-black h-2"
//                         style={{ width: `${scale.width}px` }}
//                     ></div>
//                     <div className="text-xs font-medium text-center mt-1">{scale.text}</div>
//                 </div>
//                 <div className="text-xs text-gray-600 border-l pl-3">
//                     <div>
//                         Zoom: <span className="font-medium">{zoom}</span>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // 缩放响应式标记大小计算 Hook
// export const useZoomBasedSizing = () => {
//     const map = useMap();
//     const [zoomLevel, setZoomLevel] = useState(5);
//     const [markerSizeMultiplier, setMarkerSizeMultiplier] = useState(1);

//     const updateSizing = useCallback(() => {
//         if (!map) return;

//         const zoom = map.getZoom();
//         setZoomLevel(zoom);

//         // 计算标记大小倍数 - 基于缩放等级
//         // 使用更平滑的缩放曲线
//         let multiplier;

//         if (zoom <= 2) {
//             multiplier = 0.3;
//         } else if (zoom <= 4) {
//             // zoom 2-4: 0.3 to 0.6
//             multiplier = 0.3 + (zoom - 2) * 0.15;
//         } else if (zoom <= 6) {
//             // zoom 4-6: 0.6 to 1.0
//             multiplier = 0.6 + (zoom - 4) * 0.2;
//         } else if (zoom <= 9) {
//             // zoom 6-9: 1.0 to 2.0
//             multiplier = 1.0 + (zoom - 6) * 0.33;
//         } else if (zoom <= 12) {
//             // zoom 9-12: 2.0 to 3.5
//             multiplier = 2.0 + (zoom - 9) * 0.5;
//         } else if (zoom <= 15) {
//             // zoom 12-15: 3.5 to 5.0
//             multiplier = 3.5 + (zoom - 12) * 0.5;
//         } else {
//             // zoom > 15: 5.0
//             multiplier = 5.0;
//         }

//         setMarkerSizeMultiplier(multiplier);
//     }, [map]);

//     useEffect(() => {
//         if (!map) return;

//         // 监听缩放事件
//         map.on("zoomend", updateSizing);
//         updateSizing(); // 初始化

//         return () => {
//             map.off("zoomend", updateSizing);
//         };
//     }, [map, updateSizing]);

//     return {
//         zoomLevel,
//         markerSizeMultiplier,
//         getScaledSize: (baseSize) => {
//             // 计算缩放后的大小，确保在合理范围内
//             const scaledSize = baseSize * markerSizeMultiplier;
//             return Math.max(4, Math.min(50, scaledSize)); // 最小4px，最大50px
//         },
//     };
// };

// // 地图视角控制组件
// export const MapViewController = ({
//     targetLocation = null,
//     zoomLevel = null,
//     onViewChangeComplete = null,
// }) => {
//     const map = useMap();
//     const [isAnimating, setIsAnimating] = useState(false);

//     useEffect(() => {
//         if (!map || !targetLocation) return;

//         setIsAnimating(true);

//         const { latitude, longitude } = targetLocation;
//         const targetZoom = zoomLevel || Math.max(10, map.getZoom());

//         // 使用平滑动画飞行到目标位置
//         map.flyTo([latitude, longitude], targetZoom, {
//             duration: 1.5, // 动画持续时间（秒）
//             easeLinearity: 0.1,
//         });

//         // 监听动画完成
//         const handleMoveEnd = () => {
//             setIsAnimating(false);
//             if (onViewChangeComplete) {
//                 onViewChangeComplete();
//             }
//             map.off("moveend", handleMoveEnd);
//         };

//         map.on("moveend", handleMoveEnd);

//         return () => {
//             map.off("moveend", handleMoveEnd);
//         };
//     }, [map, targetLocation, zoomLevel, onViewChangeComplete]);

//     return null; // 这是一个纯功能组件，不渲染任何内容
// };

// // 地图状态信息组件（可选的调试工具）
// export const MapDebugInfo = ({ show = false }) => {
//     const map = useMap();
//     const [mapInfo, setMapInfo] = useState({});
//     const { zoomLevel, markerSizeMultiplier } = useZoomBasedSizing();

//     useEffect(() => {
//         if (!map || !show) return;

//         const updateInfo = () => {
//             const center = map.getCenter();
//             const bounds = map.getBounds();
//             const zoom = map.getZoom();

//             setMapInfo({
//                 zoom,
//                 center: {
//                     lat: center.lat.toFixed(4),
//                     lng: center.lng.toFixed(4),
//                 },
//                 bounds: {
//                     north: bounds.getNorth().toFixed(4),
//                     south: bounds.getSouth().toFixed(4),
//                     east: bounds.getEast().toFixed(4),
//                     west: bounds.getWest().toFixed(4),
//                 },
//                 markerMultiplier: markerSizeMultiplier.toFixed(2),
//             });
//         };

//         const events = ["zoomend", "moveend"];
//         events.forEach((event) => {
//             map.on(event, updateInfo);
//         });

//         updateInfo(); // 初始化

//         return () => {
//             events.forEach((event) => {
//                 map.off(event, updateInfo);
//             });
//         };
//     }, [map, show, markerSizeMultiplier]);

//     if (!show) return null;

//     return (
//         <div className="absolute top-4 right-4 z-[1000] bg-black bg-opacity-75 text-white text-xs rounded p-2 font-mono">
//             <div>Zoom: {mapInfo.zoom}</div>
//             <div>
//                 Center: {mapInfo.center?.lat}, {mapInfo.center?.lng}
//             </div>
//             <div>Marker Scale: {mapInfo.markerMultiplier}x</div>
//             {mapInfo.bounds && (
//                 <div className="mt-1 pt-1 border-t border-gray-600">
//                     <div>N: {mapInfo.bounds.north}</div>
//                     <div>S: {mapInfo.bounds.south}</div>
//                     <div>E: {mapInfo.bounds.east}</div>
//                     <div>W: {mapInfo.bounds.west}</div>
//                 </div>
//             )}
//         </div>
//     );
// };

// // 水库掩膜显示组件
// export const ReservoirMaskLayer = ({ maskData, style = {} }) => {
//     const map = useMap();
//     const [maskLayer, setMaskLayer] = useState(null);

//     useEffect(() => {
//         if (!map || !maskData) {
//             // 清除现有图层
//             if (maskLayer) {
//                 map.removeLayer(maskLayer);
//                 setMaskLayer(null);
//             }
//             return;
//         }

//         // 动态导入L（确保在客户端环境）
//         import("leaflet")
//             .then(({ default: L }) => {
//                 // 清除旧图层
//                 if (maskLayer) {
//                     map.removeLayer(maskLayer);
//                 }

//                 // 默认样式
//                 const defaultStyle = {
//                     fillColor: "#4299e1",
//                     weight: 2,
//                     opacity: 1,
//                     color: "#2b6cb0",
//                     dashArray: "3",
//                     fillOpacity: 0.4,
//                 };

//                 // 创建新的GeoJSON图层
//                 const newMaskLayer = L.geoJSON(maskData, {
//                     style: { ...defaultStyle, ...style },
//                     onEachFeature: (feature, layer) => {
//                         if (feature.properties) {
//                             const popupContent = `
//                             <div class="reservoir-mask-popup">
//                                 <h4 class="font-semibold">Water Surface Area</h4>
//                                 ${
//                                     feature.properties.name
//                                         ? `<p><strong>Name:</strong> ${feature.properties.name}</p>`
//                                         : ""
//                                 }
//                                 ${
//                                     feature.properties.area
//                                         ? `<p><strong>Area:</strong> ${feature.properties.area} km²</p>`
//                                         : ""
//                                 }
//                                 ${
//                                     feature.properties.poly_id
//                                         ? `<p><strong>Polygon ID:</strong> ${feature.properties.poly_id}</p>`
//                                         : ""
//                                 }
//                             </div>
//                         `;
//                             layer.bindPopup(popupContent);
//                         }
//                     },
//                 }).addTo(map);

//                 setMaskLayer(newMaskLayer);

//                 // 可选：自动调整视图以适应掩膜
//                 try {
//                     const bounds = newMaskLayer.getBounds();
//                     if (bounds.isValid()) {
//                         map.fitBounds(bounds, { padding: [20, 20] });
//                     }
//                 } catch (error) {
//                     console.warn("Could not fit bounds for reservoir mask:", error);
//                 }
//             })
//             .catch((error) => {
//                 console.error("Error loading Leaflet for mask layer:", error);
//             });

//         // 清理函数
//         return () => {
//             if (maskLayer) {
//                 map.removeLayer(maskLayer);
//             }
//         };
//     }, [map, maskData, style]);

//     return null; // 这是一个纯功能组件
// };

// // 地图加载状态组件
// export const MapLoadingOverlay = ({ loading, message = "Loading map data..." }) => {
//     if (!loading) return null;

//     return (
//         <div className="absolute inset-0 z-[2000] bg-white bg-opacity-80 flex items-center justify-center">
//             <div className="text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//                 <p className="text-gray-600">{message}</p>
//             </div>
//         </div>
//     );
// };

// // 导出所有组件
// export default {
//     ScaleControl,
//     useZoomBasedSizing,
//     MapViewController,
//     MapDebugInfo,
//     ReservoirMaskLayer,
//     MapLoadingOverlay,
// };

import React, { useEffect, useState, useCallback } from "react";
import { useMap } from "react-leaflet";

// 比例尺控件组件
export const ScaleControl = () => {
    const map = useMap();
    const [scale, setScale] = useState("");
    const [zoom, setZoom] = useState(5);

    const updateScale = useCallback(() => {
        if (!map) return;

        const zoom = map.getZoom();
        setZoom(zoom);

        try {
            // 获取地图边界
            const bounds = map.getBounds();
            const center = bounds.getCenter();

            // 计算100像素代表的实际距离
            const pointA = map.containerPointToLatLng([0, 0]);
            const pointB = map.containerPointToLatLng([100, 0]);
            const distance = pointA.distanceTo(pointB); // 距离（米）

            // 格式化比例尺显示
            let scaleText;
            let scaleWidth = 100; // 基础宽度100px

            if (distance >= 1000) {
                const km = Math.round(distance / 1000);
                if (km >= 10) {
                    const roundedKm = Math.round(km / 10) * 10;
                    scaleText = `${roundedKm} km`;
                    scaleWidth = (roundedKm * 1000 * 100) / distance;
                } else {
                    scaleText = `${km} km`;
                    scaleWidth = (km * 1000 * 100) / distance;
                }
            } else {
                const meters = Math.round(distance);
                if (meters >= 100) {
                    const roundedMeters = Math.round(meters / 100) * 100;
                    scaleText = `${roundedMeters} m`;
                    scaleWidth = (roundedMeters * 100) / distance;
                } else if (meters >= 10) {
                    const roundedMeters = Math.round(meters / 10) * 10;
                    scaleText = `${roundedMeters} m`;
                    scaleWidth = (roundedMeters * 100) / distance;
                } else {
                    scaleText = `${meters} m`;
                }
            }

            // 确保scaleWidth在合理范围内
            scaleWidth = Math.max(20, Math.min(200, scaleWidth));

            setScale({ text: scaleText, width: scaleWidth });
        } catch (error) {
            console.warn("Error calculating scale:", error);
            setScale({ text: "Scale unavailable", width: 100 });
        }
    }, [map]);

    useEffect(() => {
        if (!map) return;

        // 监听地图变化事件
        const events = ["zoomend", "moveend", "resize"];
        events.forEach((event) => {
            map.on(event, updateScale);
        });

        // 初始化
        updateScale();

        // 清理事件监听器
        return () => {
            events.forEach((event) => {
                map.off(event, updateScale);
            });
        };
    }, [map, updateScale]);

    if (!scale) return null;

    return (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white bg-opacity-95 rounded-lg px-3 py-2 shadow-lg border">
            <div className="flex items-center space-x-3 text-sm">
                <div className="flex flex-col items-center">
                    <div
                        className="border-b-2 border-l-2 border-r-2 border-black h-2"
                        style={{ width: `${scale.width}px` }}
                    ></div>
                    <div className="text-xs font-medium text-center mt-1">{scale.text}</div>
                </div>
                <div className="text-xs text-gray-600 border-l pl-3">
                    <div>
                        Zoom: <span className="font-medium">{zoom}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 缩放响应式标记大小计算组件（内部使用）
export const ZoomBasedSizeProvider = ({ children, onSizeUpdate }) => {
    const map = useMap();
    const [zoomLevel, setZoomLevel] = useState(5);
    const [markerSizeMultiplier, setMarkerSizeMultiplier] = useState(1);

    const updateSizing = useCallback(() => {
        if (!map) return;

        const zoom = map.getZoom();
        setZoomLevel(zoom);

        // 计算标记大小倍数 - 基于缩放等级
        let multiplier;

        if (zoom <= 2) {
            multiplier = 0.3;
        } else if (zoom <= 4) {
            multiplier = 0.3 + (zoom - 2) * 0.15;
        } else if (zoom <= 6) {
            multiplier = 0.6 + (zoom - 4) * 0.2;
        } else if (zoom <= 9) {
            multiplier = 1.0 + (zoom - 6) * 0.33;
        } else if (zoom <= 12) {
            multiplier = 2.0 + (zoom - 9) * 0.5;
        } else if (zoom <= 15) {
            multiplier = 3.5 + (zoom - 12) * 0.5;
        } else {
            multiplier = 5.0;
        }

        setMarkerSizeMultiplier(multiplier);

        // 通知父组件
        if (onSizeUpdate) {
            onSizeUpdate({
                zoomLevel: zoom,
                markerSizeMultiplier: multiplier,
                getScaledSize: (baseSize) => {
                    const scaledSize = baseSize * multiplier;
                    return Math.max(4, Math.min(50, scaledSize));
                },
            });
        }
    }, [map, onSizeUpdate]);

    useEffect(() => {
        if (!map) return;

        map.on("zoomend", updateSizing);
        updateSizing(); // 初始化

        return () => {
            map.off("zoomend", updateSizing);
        };
    }, [map, updateSizing]);

    return null; // 这是一个功能组件，不渲染任何内容
};

// 地图视角控制组件
export const MapViewController = ({
    targetLocation = null,
    zoomLevel = null,
    onViewChangeComplete = null,
}) => {
    const map = useMap();
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (!map || !targetLocation) return;

        setIsAnimating(true);

        const { latitude, longitude } = targetLocation;
        const targetZoom = zoomLevel || Math.max(10, map.getZoom());

        // 使用平滑动画飞行到目标位置
        map.flyTo([latitude, longitude], targetZoom, {
            duration: 1.5, // 动画持续时间（秒）
            easeLinearity: 0.1,
        });

        // 监听动画完成
        const handleMoveEnd = () => {
            setIsAnimating(false);
            if (onViewChangeComplete) {
                onViewChangeComplete();
            }
            map.off("moveend", handleMoveEnd);
        };

        map.on("moveend", handleMoveEnd);

        return () => {
            map.off("moveend", handleMoveEnd);
        };
    }, [map, targetLocation, zoomLevel, onViewChangeComplete]);

    return null; // 这是一个纯功能组件，不渲染任何内容
};

// 地图状态信息组件（调试用，内部组件）
export const MapDebugInfo = ({ show = false, onInfoUpdate = null }) => {
    const map = useMap();
    const [mapInfo, setMapInfo] = useState({});

    useEffect(() => {
        if (!map || !show) return;

        const updateInfo = () => {
            const center = map.getCenter();
            const bounds = map.getBounds();
            const zoom = map.getZoom();

            const info = {
                zoom,
                center: {
                    lat: center.lat.toFixed(4),
                    lng: center.lng.toFixed(4),
                },
                bounds: {
                    north: bounds.getNorth().toFixed(4),
                    south: bounds.getSouth().toFixed(4),
                    east: bounds.getEast().toFixed(4),
                    west: bounds.getWest().toFixed(4),
                },
            };

            setMapInfo(info);

            if (onInfoUpdate) {
                onInfoUpdate(info);
            }
        };

        const events = ["zoomend", "moveend"];
        events.forEach((event) => {
            map.on(event, updateInfo);
        });

        updateInfo(); // 初始化

        return () => {
            events.forEach((event) => {
                map.off(event, updateInfo);
            });
        };
    }, [map, show, onInfoUpdate]);

    if (!show) return null;

    return (
        <div className="absolute top-4 right-4 z-[1000] bg-black bg-opacity-75 text-white text-xs rounded p-2 font-mono">
            <div>Zoom: {mapInfo.zoom}</div>
            <div>
                Center: {mapInfo.center?.lat}, {mapInfo.center?.lng}
            </div>
            {mapInfo.bounds && (
                <div className="mt-1 pt-1 border-t border-gray-600">
                    <div>N: {mapInfo.bounds.north}</div>
                    <div>S: {mapInfo.bounds.south}</div>
                    <div>E: {mapInfo.bounds.east}</div>
                    <div>W: {mapInfo.bounds.west}</div>
                </div>
            )}
        </div>
    );
};

// 水库掩膜显示组件
export const ReservoirMaskLayer = ({ maskData, style = {} }) => {
    const map = useMap();
    const [maskLayer, setMaskLayer] = useState(null);

    useEffect(() => {
        if (!map || !maskData) {
            // 清除现有图层
            if (maskLayer) {
                map.removeLayer(maskLayer);
                setMaskLayer(null);
            }
            return;
        }

        // 动态导入L（确保在客户端环境）
        import("leaflet")
            .then(({ default: L }) => {
                // 清除旧图层
                if (maskLayer) {
                    map.removeLayer(maskLayer);
                }

                // 默认样式
                const defaultStyle = {
                    fillColor: "#4299e1",
                    weight: 2,
                    opacity: 1,
                    color: "#2b6cb0",
                    dashArray: "3",
                    fillOpacity: 0.4,
                };

                // 创建新的GeoJSON图层
                const newMaskLayer = L.geoJSON(maskData, {
                    style: { ...defaultStyle, ...style },
                    onEachFeature: (feature, layer) => {
                        if (feature.properties) {
                            const popupContent = `
                            <div class="reservoir-mask-popup">
                                <h4 class="font-semibold">Water Surface Area</h4>
                                ${
                                    feature.properties.name
                                        ? `<p><strong>Name:</strong> ${feature.properties.name}</p>`
                                        : ""
                                }
                                ${
                                    feature.properties.area
                                        ? `<p><strong>Area:</strong> ${feature.properties.area} km²</p>`
                                        : ""
                                }
                                ${
                                    feature.properties.poly_id
                                        ? `<p><strong>Polygon ID:</strong> ${feature.properties.poly_id}</p>`
                                        : ""
                                }
                            </div>
                        `;
                            layer.bindPopup(popupContent);
                        }
                    },
                }).addTo(map);

                setMaskLayer(newMaskLayer);

                // 可选：自动调整视图以适应掩膜
                try {
                    const bounds = newMaskLayer.getBounds();
                    if (bounds.isValid()) {
                        map.fitBounds(bounds, { padding: [20, 20] });
                    }
                } catch (error) {
                    console.warn("Could not fit bounds for reservoir mask:", error);
                }
            })
            .catch((error) => {
                console.error("Error loading Leaflet for mask layer:", error);
            });

        // 清理函数
        return () => {
            if (maskLayer) {
                map.removeLayer(maskLayer);
            }
        };
    }, [map, maskData, style]);

    return null; // 这是一个纯功能组件
};

// 地图加载状态组件
export const MapLoadingOverlay = ({ loading, message = "Loading map data..." }) => {
    if (!loading) return null;

    return (
        <div className="absolute inset-0 z-[2000] bg-white bg-opacity-80 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">{message}</p>
            </div>
        </div>
    );
};

// 导出所有组件
export default {
    ScaleControl,
    ZoomBasedSizeProvider,
    MapViewController,
    MapDebugInfo,
    ReservoirMaskLayer,
    MapLoadingOverlay,
};
