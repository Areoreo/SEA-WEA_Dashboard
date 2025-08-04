import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import georaster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";

import { MapLegend } from "@components/MapLegend";

export default function DashMapTif({
    data,
    options,
    selectedDate,
    selectedFeature,
    setSelectedProvince,
    setTimeSeries,
    setSelectedFeature
}) {
    // Check if data is null, if so, set the default URL
    if (data === null) {
        data = {
            url: "/api/get_Yield_Yearly_Country_SEA",
            datatype: "geojson",
            data_vartype: "Yield",
            data_adminLevel: "Country"
        }; // Set default URL if data is null
    }

    // // Check if options is null, if so, set the default options
    // if (options === null) {
    //     options = {
    //         varType: "Yield", // Var Type
    //         region: "SEA", // Region
    //         overview: "forecast", // Overview
    //         adminLevel: "Grid", // Administrative Level
    //         dateType: "Monthly", // Date
    //         date: "202502" // Date Picker Value
    //     };
    // }

    useEffect(() => {
        console.log("Received data in DashMapTif:", data);
        console.log("Selected date in DashMapTif:", selectedDate);
    }, [data, selectedDate]);

    //根据地块value值来动态设置fill color
    const styleGeoJSON = (feature) => {
        const baseKey = `y${selectedDate}`;
        const value =
            feature.properties[`${baseKey}_0`] ??
            feature.properties[baseKey] ??
            -99999; // 先尝试 ensemble 0 的值，再尝试无 ensemble 的值

        console.log("feature value:", { value });

        // 根据 options.varType 选择颜色函数
        const colorFunction = data_url.data_vartype.startsWith("SPI")
            ? getColor
            : data_url.data_vartype === "Yield" &&
              data_url.data_adminLevel === "Country"
            ? getColorYield
            : data_url.data_vartype === "Yield" &&
              data_url.data_adminLevel === "Prov"
            ? getColorYieldProv
            : data_url.data_vartype === "Production" &&
              data_url.data_adminLevel === "Prov"
            ? getColorProductionProv
            : data_url.data_vartype === "Production" &&
              data_url.data_adminLevel === "Country"
            ? getColorProductionCountry
            : data_url.data_vartype === "Area" &&
              data_url.data_adminLevel === "Prov"
            ? getColorAreaProv
            : data_url.data_vartype === "Area" &&
              data_url.data_adminLevel === "Country"
            ? getColorAreaCountry
            : data_url.data_vartype === "Prcp" &&
              data_url.data_adminLevel === "Prov" &&
              data_url.data_dateType === "Yearly"
            ? getColorPrcpProv
            : data_url.data_vartype === "Prcp" &&
              data_url.data_adminLevel === "Prov" &&
              data_url.data_dateType === "Monthly"
            ? getColorPrcpProvMonthly
            : data_url.data_vartype === "Prcp" &&
              data_url.data_adminLevel === "Country" &&
              data_url.data_dateType === "Yearly"
            ? getColorPrcpProv
            : data_url.data_vartype === "Prcp" &&
              data_url.data_adminLevel === "Country" &&
              data_url.data_dateType === "Monthly"
            ? getColorPrcpProvMonthly
            : data_url.data_vartype === "Temp"
            ? getColorTemp
            : data_url.data_vartype === "SMPct"
            ? getColorSMPct
            : getColor; // 默认使用 getColor

        return {
            fillColor: colorFunction(value), // 动态设置填充颜色
            color: "#666", // 边框颜色
            weight: 2, // 边框宽度
            dashArray: "3",
            fillOpacity: 0.7 // 填充透明度
        };
    };

    const [countryBoundaries, setCountryBoundaries] = useState(null); // 存储国家边界数据

    // 仅当 adminLevel === "Grid" 时加载国家边界
    useEffect(() => {
        if (options.adminLevel !== "Grid") return;

        fetch("/data/SEA_boundary.geojson")
            .then((res) => res.json())
            .then((data) => setCountryBoundaries(data))
            .catch((error) =>
                console.error("Error loading country boundaries:", error)
            );

        console.log("fetched country boundaries:", { countryBoundaries });
    }, [options.adminLevel]);

    // 根据 region 过滤国家边界
    const filteredBoundaries = countryBoundaries
        ? {
              ...countryBoundaries,
              features: countryBoundaries.features.filter(
                  (feature) =>
                      options.region === "SEA" ||
                      feature.properties.name === options.region
              )
          }
        : null;

    // 国家边界样式
    const countryBoundaryStyle = (color) => ({
        color: color,
        weight: 2,
        opacity: 1,
        fillOpacity: 0
    });

    return (
        <MapContainer
            // key={`map-${selectedDate}-${data.datatype}`} // Use a unique key based on the data URL
            key={`map-${data.url}`}
            center={[18, 85]}
            zoom={4.5}
            zoomSnap={0.1}
            zoomDelta={0.25}
            minZoom={4} // 设置最小缩放
            maxZoom={10} // 设置最大缩放
            maxBounds={[
                [-5, 55],
                [40, 125]
            ]} // 设置拖拽边界（南西和东北角的坐标）
            scrollWheelZoom={false}
            // style={{ height: "500px", width: "100%" }}
            className="map-container"
        >
            <MapLegend data={data} selectedDate={selectedDate} />
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>;'
            />
            {/* 仅当 adminLevel === "Grid" 且数据存在时绘制国家边界 */}
            {options.adminLevel === "Grid" && filteredBoundaries && (
                <GeoJSON
                    data={filteredBoundaries}
                    style={countryBoundaryStyle("#333")}
                />
            )}
            {data.datatype === "geojson" && (
                <GeoJSONLayer
                    data_url={data}
                    options={options}
                    selectedDate={selectedDate}
                    selectedFeature={selectedFeature}
                    setSelectedProvince={setSelectedProvince}
                    setTimeSeries={setTimeSeries}
                    setSelectedFeature={setSelectedFeature}
                    style={styleGeoJSON}
                />
            )}
            {data.datatype === "geotiff" && (
                <GeoTIFFLayer data_url={data} selectedDate={selectedDate} />
            )}
            <InfoControl />
            {/* <LegendControl data={data} /> */}
            {/* <ZoomControl /> Add custom zoom control */}
        </MapContainer>
    );
}

// GeoJSON Layer Component
function GeoJSONLayer({
    data_url,
    options,
    selectedDate,
    selectedFeature,
    setSelectedProvince,
    setTimeSeries,
    setSelectedFeature
}) {
    console.log("Received data URL in geojsonlayer:", data_url);
    const map = useMap();
    const infoRef = useRef(null); // Create a ref to store the info control
    const highlightRef = useRef(null); // Create a ref to store the highlighted layer
    const geoJsonLayerRef = useRef(null); // Create a ref to store the GeoJSON layer

    // 去除矩形框的尝试
    const removeBoundingBox = () => {
        map.eachLayer((layer) => {
            if (layer instanceof L.Rectangle) {
                map.removeLayer(layer);
            }
        });
    };

    // Update GeoJSON data when selectedDate changes
    // useEffect(() => {
    //   if (data_url && selectedDate) {
    //     debugger;
    //       // Filter or get new GeoJSON data based on the selectedDate
    //       const filteredData = data_url.data.features.filter((item) => item.year === selectedDate);

    //       setGeoJsonData(filteredData);

    //       // Update the GeoJSON layer on the map
    //       if (geoJsonLayerRef.current) {
    //           geoJsonLayerRef.current.clearLayers();
    //           geoJsonLayerRef.current.addData(filteredData);
    //       }
    //   }
    // }, [data_url, selectedDate]);

    // START: 地块样式设置
    const handleFeatureClick = (feature, layer) => {
        removeBoundingBox(); // **先移除所有 bounding box**
        setSelectedFeature(feature);

        layer.setStyle({
            color: "#EB5A3C", // 红色边框
            weight: 4,
            opacity: 1
        });

        // Ensure the layer is brought to the front
        // if (layer.bringToFront) {
        //     layer.bringToFront();
        // }
        // 检查当前图层是否在最前面
        if (layer.bringToFront && layer.bringToBack) {
            const isAtFront =
                map.hasLayer(layer) &&
                layer === map._layers[Object.keys(map._layers).pop()];
            if (isAtFront) {
                layer.bringToBack(); // 如果在最前，则移到底层
                layer.bringToFront();
            } else {
                layer.bringToFront(); // 如果不在最前，则移到首层
            }
        }
    };
    // 点击省份时处理时间序列数据
    const handleProvClickToGenerateTimeSeries = (feature) => {
        const { properties } = feature;
        setSelectedProvince(properties.name);

        const timeSeriesData = Object.keys(properties)
            .filter((key) => key.startsWith("y"))
            .map((key) => ({
                year: parseInt(key.replace("y", ""), 10),
                value: properties[key]
            }));

        setTimeSeries(timeSeriesData);
    };
    useEffect(() => {
        // Initialize info control and add to map
        const info = L.control({ position: "topright" });

        info.onAdd = function () {
            this._div = L.DomUtil.create("div", "info");
            this.update();
            return this._div;
        };

        info.update = function (content) {
            // this._div.innerHTML = '<h4>Country</h4>' + (content ? content : '');
        };

        info.addTo(map);
        infoRef.current = info; // Store the info control in the ref

        // Define the highlight style
        const highlightStyle = {
            weight: 3,
            color: "#ff0000",
            dashArray: "-",
            fillOpacity: 0.7
        };

        const styleGeoJSON = (feature) => {
            const baseKey = `y${selectedDate}`;
            const value =
                feature.properties[`${baseKey}_0`] ??
                feature.properties[baseKey] ??
                0; // 先尝试 ensemble 0 的值，再尝试无 ensemble 的值

            // 根据 options.varType 选择颜色函数
            const colorFunction = data_url.data_vartype.startsWith("SPI")
                ? getColor
                : data_url.data_vartype === "Yield" &&
                  data_url.data_adminLevel === "Country"
                ? getColorYield
                : data_url.data_vartype === "Yield" &&
                  data_url.data_adminLevel === "Prov"
                ? getColorYieldProv
                : data_url.data_vartype === "Production" &&
                  data_url.data_adminLevel === "Prov"
                ? getColorProductionProv
                : data_url.data_vartype === "Production" &&
                  data_url.data_adminLevel === "Country"
                ? getColorProductionCountry
                : data_url.data_vartype === "Area" &&
                  data_url.data_adminLevel === "Prov"
                ? getColorAreaProv
                : data_url.data_vartype === "Area" &&
                  data_url.data_adminLevel === "Country"
                ? getColorAreaCountry
                : data_url.data_vartype === "Prcp" &&
                  data_url.data_adminLevel === "Prov" &&
                  data_url.data_dateType === "Yearly"
                ? getColorPrcpProv
                : data_url.data_vartype === "Prcp" &&
                  data_url.data_adminLevel === "Prov" &&
                  data_url.data_dateType === "Monthly"
                ? getColorPrcpProvMonthly
                : data_url.data_vartype === "Prcp" &&
                  data_url.data_adminLevel === "Country" &&
                  data_url.data_dateType === "Yearly"
                ? getColorPrcpProv
                : data_url.data_vartype === "Prcp" &&
                  data_url.data_adminLevel === "Country" &&
                  data_url.data_dateType === "Monthly"
                ? getColorPrcpProvMonthly
                : data_url.data_vartype === "Temp"
                ? getColorTemp
                : data_url.data_vartype === "SMPct"
                ? getColorSMPct
                : getColor; // 默认使用 getColor

            return {
                fillColor: colorFunction(value), // 动态设置填充颜色
                color: "#666", // 边框颜色
                weight: 2, // 边框宽度
                dashArray: "3",
                fillOpacity: 0.7 // 填充透明度
            };
        };

        const resetFeatureStyle = (layer, feature) => {
            // 恢复默认样式
            layer.setStyle({
                color: "#666",
                weight: 2,
                dashArray: "3"
            });
        };

        // fetch data
        fetch(data_url.url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Network response was not ok (${response.status})`
                    );
                }
                return response.json();
            })
            .then((data) => {
                if (!data || !data.features) {
                    throw new Error("Invalid GeoJSON data received");
                }
                console.log("Received GeoJSON data:", data);

                // Remove the existing GeoJSON layer, if any
                if (geoJsonLayerRef.current) {
                    map.removeLayer(geoJsonLayerRef.current);
                }

                const geojsonLayer = L.geoJSON(data, {
                    style: styleGeoJSON,
                    onEachFeature: function (feature, layer) {
                        // 获取当前地块的值和名称
                        const value =
                            feature.properties[`y${selectedDate}_0`] ??
                            feature.properties[`y${selectedDate}`] ??
                            0;
                        const name = feature.properties.name;

                        // 根据 options.varType 选择颜色函数
                        const colorFunction = data_url.data_vartype.startsWith(
                            "SPI"
                        )
                            ? getColor
                            : data_url.data_vartype === "Yield" &&
                              data_url.data_adminLevel === "Country"
                            ? getColorYield
                            : data_url.data_vartype === "Yield" &&
                              data_url.data_adminLevel === "Prov"
                            ? getColorYieldProv
                            : data_url.data_vartype === "Production" &&
                              data_url.data_adminLevel === "Prov"
                            ? getColorProductionProv
                            : data_url.data_vartype === "Production" &&
                              data_url.data_adminLevel === "Country"
                            ? getColorProductionCountry
                            : data_url.data_vartype === "Area" &&
                              data_url.data_adminLevel === "Prov"
                            ? getColorAreaProv
                            : data_url.data_vartype === "Area" &&
                              data_url.data_adminLevel === "Country"
                            ? getColorAreaCountry
                            : data_url.data_vartype === "Prcp" &&
                              data_url.data_adminLevel === "Prov" &&
                              data_url.data_dateType === "Yearly"
                            ? getColorPrcpProv
                            : data_url.data_vartype === "Prcp" &&
                              data_url.data_adminLevel === "Prov" &&
                              data_url.data_dateType === "Monthly"
                            ? getColorPrcpProvMonthly
                            : data_url.data_vartype === "Prcp" &&
                              data_url.data_adminLevel === "Country" &&
                              data_url.data_dateType === "Yearly"
                            ? getColorPrcpProv
                            : data_url.data_vartype === "Prcp" &&
                              data_url.data_adminLevel === "Country" &&
                              data_url.data_dateType === "Monthly"
                            ? getColorPrcpProvMonthly
                            : data_url.data_vartype === "Temp"
                            ? getColorTemp
                            : data_url.data_vartype === "SMPct"
                            ? getColorSMPct
                            : getColor; // 默认使用 getColor

                        // 绑定 Tooltip，显示地块名称和值
                        layer.bindTooltip(
                            `<b>${name}</b><br>${options.varType}: ${
                                value !== undefined ? value.toFixed(2) : "N/A"
                            }`,
                            { direction: "top", sticky: true }
                        );

                        // 默认样式
                        layer.setStyle({
                            fillColor: colorFunction(value), // 动态设置填充颜色
                            color: "#666", // 边框颜色
                            weight: 2, // 边框宽度
                            fillOpacity: 0.7, // 填充透明度
                            dashArray: "3"
                        });

                        // Hover 高亮
                        layer.on("mouseover", () => {
                            layer.setStyle({
                                color: "#EB5A3C", // Hover 时边框颜色
                                weight: 4
                            });
                        });

                        // 移出取消
                        layer.on("mouseout", () => {
                            if (selectedFeature !== feature) {
                                layer.setStyle(styleGeoJSON(feature));
                                // resetFeatureStyle(layer, feature);
                            }
                        });

                        // 点击选中
                        layer.on("click", () => {
                            removeBoundingBox();
                            // 如果有其他选中的地块，先重置其样式
                            if (
                                selectedFeature &&
                                selectedFeature !== feature
                            ) {
                                resetFeatureStyle(layer, selectedFeature); // 重置上一个选中地块的样式
                            }
                            handleFeatureClick(feature, layer); // 高亮当前选中地块
                            handleProvClickToGenerateTimeSeries(feature);
                        });
                        layer.on("mouseover", function (e) {
                            // Update info control with feature details
                            infoRef.current.update(
                                "<b>" +
                                    feature.properties.name +
                                    "</b><br>" +
                                    feature.properties.region
                            );

                            // Highlight the feature
                            layer.setStyle(highlightStyle);
                            highlightRef.current = layer;
                        });

                        layer.on("mouseout", function (e) {
                            // Reset the info control
                            if (infoRef.current) {
                                infoRef.current.update();
                            }

                            // Reset the feature style
                            if (highlightRef.current) {
                                highlightRef.current.setStyle(
                                    styleGeoJSON(feature)
                                );
                                highlightRef.current = null;
                            }
                        });
                    }
                });
                console.log("geojsonLayer:", geojsonLayer);
                geojsonLayer.addTo(map);
                geoJsonLayerRef.current = geojsonLayer; // Store the new layer
            })
            .catch((error) => console.error("Error loading GeoJSON:", error));
    }, [map, selectedDate]);

    return null;
}

// GeoTIFF Layer Component
function GeoTIFFLayer({ data_url, selectedDate }) {
    console.log("Received data URL in GeoTIFFLayer:", data_url);
    const map = useMap();
    const colorFunctions = {
        Prcp: getColorPrcp,
        Temp: getColorTemp,
        SPI: getColor,
        SMPct: getColorSMPct,
        Yield: getColorYield,
        Production: getColorProduction,
        Area: getColorArea
    };
    // Function to get color based on vartype and pixel value
    function getColorByVartype(data_url, pixelValue) {
        const vartype = data_url.data_vartype;
        const colorFunction = colorFunctions[vartype] || getColor; // Default to getColorTemp if vartype is unknown
        return colorFunction(pixelValue);
    }

    useEffect(() => {
        const loadGeoTIFFData = async () => {
            try {
                const response = await fetch(data_url.url);
                const arrayBuffer = await response.arrayBuffer();
                const parsedRaster = await georaster(arrayBuffer);
                const bandIndex = Number(selectedDate - 1950);
                const layer = new GeoRasterLayer({
                    georaster: parsedRaster,
                    opacity: 0.7,
                    pixelValuesToColorFn: (values) => {
                        const pixelValue =
                            data_url.data_vartype === "Yield" ||
                            data_url.data_vartype === "Area" ||
                            data_url.data_vartype === "Production" ||
                            data_url.data_vartype === "Prcp" ||
                            data_url.data_vartype === "Temp" ||
                            data_url.data_vartype.startsWith("SPI")
                                ? values[0]
                                : values[bandIndex];
                        if (
                            pixelValue === 0 ||
                            pixelValue < -9999 ||
                            isNaN(pixelValue)
                        ) {
                            return null;
                        }
                        // return null;
                        return getColorByVartype(data_url, pixelValue);
                    },
                    resolution: 64
                });

                layer.addTo(map);
                // map.fitBounds(layer.getBounds());
            } catch (error) {
                console.error("Error loading GeoTIFF data:", error);
            }
        };

        loadGeoTIFFData();
    }, [map, data_url.data_url, selectedDate]); // Adding `data_url` and `map` as dependencies

    return null;
}

// Info Control Component
function InfoControl() {
    const map = useMap();
    const infoRef = useRef(null);

    useEffect(() => {
        const info = L.control();

        info.onAdd = function () {
            this._div = L.DomUtil.create("div", "info");
            this.update();
            return this._div;
        };

        info.update = function (content) {
            // this._div.innerHTML = '<h4>Crop Area Data</h4>' + (content ? content : '');
        };

        info.addTo(map);
        infoRef.current = info;
    }, [map]);

    return null;
}

// Legend Control Component
function LegendControl({ data }) {
    const map = useMap();
    const legendRef = useRef(null);
    const legendConfig = {
        Prcp: {
            title: "Precipitation (mm)",
            grades: [0, 200, 400, 600, 800, 1000],
            colors: [
                "hsl(200, 100%, 50%)",
                "hsl(150, 100%, 50%)",
                "hsl(100, 100%, 50%)",
                "hsl(50, 100%, 50%)",
                "hsl(0, 100%, 50%)"
            ]
        },
        PrcpProv: {
            title: "Precipitation (mm)",
            grades: [0, 600, 1200, 1800, 2400, 3000],
            colors: [
                "hsl(200, 100%, 50%)",
                "hsl(150, 100%, 50%)",
                "hsl(100, 100%, 50%)",
                "hsl(50, 100%, 50%)",
                "hsl(0, 100%, 50%)"
            ]
        },
        PrcpProvMonthly: {
            title: "Precipitation (mm)",
            grades: [0, 100, 200, 300, 400, 500],
            colors: [
                "hsl(200, 100%, 50%)",
                "hsl(150, 100%, 50%)",
                "hsl(100, 100%, 50%)",
                "hsl(50, 100%, 50%)",
                "hsl(0, 100%, 50%)"
            ]
        },
        SPI: {
            title: "SPI",
            grades: [2, 1.5, 1, 0, -1, -1.5, -2],
            labels: ["W3", "W2", "W1", "D0", "D1", "D2", "D3"],
            colors: [
                "#14713d",
                "#3cb371",
                "#98fb98",
                "#FFF",
                "#f5deb3",
                "#d2691e",
                "#b22222"
            ]
        },
        Temp: {
            title: "Temperature (℃)",
            grades: [10, 15, 20, 25, 30, 35],
            colors: [
                "#08306B",
                "#4292C6",
                "#41AB5D",
                "#F7DC6F",
                "#E67E22",
                "#C0392B"
            ]
        },
        Yield: {
            title: "Yield (ton/ha)",
            grades: [1, 3, 5, 7],
            colors: [
                "#00f", // Blue for 1°C (cool)
                "#0099ff", // Light blue for 5°C
                "#ffff00", // Yellow for 10°C
                "#ffcc00", // Orange for 20°C
                "#ff3300" // Red for 30°C (hot)],
            ]
        },
        YieldProv: {
            title: "Yield (ton/ha)",
            grades: [1, 3, 5, 7],
            colors: [
                "#00f", // Blue for 1°C (cool)
                "#0099ff", // Light blue for 5°C
                "#ffff00", // Yellow for 10°C
                "#ffcc00", // Orange for 20°C
                "#ff3300" // Red for 30°C (hot)],
            ]
        },
        Production: {
            title: "Production (ton)",
            grades: [1, 3, 5, 7],
            colors: [
                "#00f", // Blue for 1°C (cool)
                "#0099ff", // Light blue for 5°C
                "#ffff00", // Yellow for 10°C
                "#ffcc00", // Orange for 20°C
                "#ff3300" // Red for 30°C (hot)],
            ]
        },
        SMPct: {
            title: "SMPct",
            grades: [20, 40, 60, 80]
        }
    };

    useEffect(() => {
        if (legendRef.current) {
            // If the legend already exists, remove it before adding a new one
            legendRef.current.remove();
        }

        const legend = L.control({ position: "bottomright" });

        legend.onAdd = function () {
            const div = L.DomUtil.create("div", "info legend");
            let vartype = data.data_vartype.startsWith("SPI")
                ? "SPI"
                : data.data_vartype === "Yield"
                ? "YieldProv"
                : data.data_vartype === "Prcp" &&
                  data.data_adminLevel === "Prov" &&
                  data.data_dateType === "Yearly"
                ? "PrcpProv"
                : data.data_vartype === "Prcp" &&
                  data.data_adminLevel === "Country" &&
                  data.data_dateType === "Yearly"
                ? "PrcpProv"
                : data.data_vartype === "Prcp" &&
                  data.data_adminLevel === "Prov" &&
                  data.data_dateType === "Monthly"
                ? "PrcpProvMonthly"
                : data.data_vartype === "Prcp" &&
                  data.data_adminLevel === "Country" &&
                  data.data_dateType === "Monthly"
                ? "PrcpProvMonthly"
                : data.data_vartype || "Default";

            // note that here country prcp data is just using pro data styles because they seems OK to apply

            const adminLevel = data.data_adminLevel;
            const config = legendConfig[vartype] || legendConfig.Default;

            const { title, grades, colors, labels } = config;

            // 清除现有的 legend，防止切换 varType 时残留
            const existingLegend = document.querySelector(".legend-container");
            if (existingLegend) {
                existingLegend.remove();
            }

            // Add the legend title (this is used for general categories but not for SPI)
            div.innerHTML = `
      <div style="text-align: center; font-size: 1.3rem; font-weight: bold; margin-bottom: 2px;">
        <strong>${title}</strong>
      </div><br>
      `;
            if (vartype === "Prcp") {
                // Continuous color gradient legend
                const gradientBar = `
          <div style="
            background: linear-gradient(to right, ${colors.join(", ")});
            width: 100%;
            height: 20px;
            border: 1px solid #000;
            margin-bottom: 8px;">
          </div>
        `;

                div.innerHTML += gradientBar;

                // Add labels below the gradient bar
                const labels = grades
                    .map((grade) => `<span>${grade}</span>`)
                    .join(" ");
                div.innerHTML += `
          <div style="
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-top: 4px;">
            ${labels}
          </div>`;
            } else if (vartype === "PrcpProv") {
                // Continuous color gradient legend
                const gradientBar = `
                                <div style="
                                  background: linear-gradient(to right, ${colors.join(
                                      ", "
                                  )});
                                  width: 100%;
                                  height: 20px;
                                  border: 1px solid #000;
                                  margin-bottom: 8px;">
                                </div>
                              `;

                div.innerHTML += gradientBar;

                // Add labels below the gradient bar
                const labels = grades
                    .map((grade) => `<span>${grade}</span>`)
                    .join(" ");
                div.innerHTML += `
                                <div style="
                                  display: flex;
                                  justify-content: space-between;
                                  font-size: 12px;
                                  margin-top: 4px;">
                                  ${labels}
                                </div>`;
            } else if (vartype === "PrcpProvMonthly") {
                // Continuous color gradient legend
                const gradientBar = `
                                <div style="
                                  background: linear-gradient(to right, hsl(200, 100%, 50%),hsl(150, 100%, 50%),hsl(100, 100%, 50%),hsl(50, 100%, 50%), hsl(0, 100%, 50%));

                                  
                                  width: 100%;
                                  height: 20px;
                                  border: 1px solid #000;
                                  margin-bottom: 8px;">
                                </div>
                              `;

                div.innerHTML += gradientBar;

                // Add labels below the gradient bar
                const labels = grades
                    .map((grade) => `<span>${grade}</span>`)
                    .join(" ");
                div.innerHTML += `
                                <div style="
                                  display: flex;
                                  justify-content: space-between;
                                  font-size: 12px;
                                  margin-top: 4px;">
                                  ${labels}
                                </div>`;
            } else if (vartype === "SPI") {
                div.innerHTML = ``; // for this part no preset div.innerHTML is used

                const tooltipTexts = {
                    D3: "Extreme Drought Major crop losses, widespread water shortages.",
                    D2: "Severe Drought Likely crop loss, water restrictions may be needed.",
                    D1: "Some damage to crops, low streamflow, water shortages possible.",
                    D0: "Typical climate conditions, no significant anomalies.",
                    W1: "Above-normal precipitation, beneficial for agriculture and water supply.",
                    W2: "High rainfall, increased runoff, risk of localized flooding.",
                    W3: "Unusual flooding, excessive soil moisture, potential waterlogging."
                };

                const legendTexts = {
                    D3: "Severly Dry",
                    D2: "Severely Dry",
                    D1: "Moderately Dry",
                    D0: "Near Normal",
                    W1: "Moderately Wet",
                    W2: "Severly Wet",
                    W3: "Extremely Wet"
                };
                // Vertical SPI Legend Color Bar with Tooltips
                const legendContainer = document.createElement("div");
                legendContainer.className = "legend-container";

                for (let i = 0; i < grades.length; i++) {
                    const tooltipText =
                        tooltipTexts[labels[i]] || "No information available";

                    const legendItem = document.createElement("div");
                    legendItem.className = "legend-item";

                    // 问号图标
                    const infoIcon = document.createElement("div");
                    infoIcon.className = "info-icon";
                    infoIcon.innerHTML = `?`;

                    const tooltip = document.createElement("div");
                    tooltip.className = "tooltip";
                    tooltip.textContent = tooltipText;
                    infoIcon.appendChild(tooltip);

                    // 颜色块
                    const colorBox = document.createElement("div");
                    colorBox.className = "color-box";
                    colorBox.style.backgroundColor = colors[i];

                    // 标签文本
                    const legendText = document.createElement("span");
                    legendText.className = "legend-text";
                    legendText.textContent = legendTexts[labels[i]];

                    legendItem.appendChild(infoIcon);
                    legendItem.appendChild(colorBox);
                    legendItem.appendChild(legendText);

                    legendContainer.appendChild(legendItem);
                }
                div.appendChild(legendContainer);
            } else if (vartype === "Yield" && adminLevel === "Country") {
                const gradientBar = `
                <div style="
                  background: linear-gradient(to right, hsl(30, 100%, 40%), hsl(75, 100%, 40%), hsl(120, 100%, 40%));
                  width: 20vw;
                  height: 20px;
                  border: 1px solid #000;
                  margin-bottom: 8px;">
                </div>`;

                div.innerHTML += gradientBar;

                // 确保标签数匹配渐变步数
                const numLabels = grades.length;
                const step = Math.floor(100 / (numLabels - 1)); // 让标签均匀分布

                // 生成刻度标签
                const labels = grades
                    .map((grade) => `<span>${Math.floor(grade)}</span>`)
                    .join(" ");

                div.innerHTML += `
                <div style="
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  margin-top: 4px;">
                  ${labels}
                </div>`;
            } else if (vartype === "YieldProv") {
                // const grades = [1, 2.5, 4, 5.5, 7];

                const gradientBar = `
                <div style="
                  background: linear-gradient(to right, hsl(30, 100%, 40%), hsl(100, 100%, 40%));
                  width: 20vw;
                  height: 20px;
                  border: 1px solid #000;
                  margin-bottom: 8px;">
                </div>`;

                div.innerHTML += gradientBar;

                // 确保标签数匹配渐变步数
                const numLabels = grades.length;
                const step = Math.floor(100 / (numLabels - 1)); // 让标签均匀分布

                // 生成刻度标签
                const labels = grades
                    .map((grade) => `<span>${Math.floor(grade)}</span>`)
                    .join(" ");

                div.innerHTML += `
                <div style="
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  margin-top: 4px;">
                  ${labels}
                </div>`;
            } else if (vartype === "SMPct") {
                const gradientBar = `
                <div style="
                  background: linear-gradient(to right, hsl(210, 10%, 90%), hsl(210, 100%, 40%));
                  width: 20vw;
                  height: 20px;
                  border: 1px solid #000;
                  margin-bottom: 8px;">
                </div>`;

                div.innerHTML += gradientBar;

                // 确保标签数匹配渐变步数
                const numLabels = grades.length;
                const step = Math.floor(100 / (numLabels - 1)); // 让标签均匀分布

                // 生成刻度标签
                const labels = grades
                    .map((grade) => `<span>${Math.floor(grade)}</span>`)
                    .join(" ");

                div.innerHTML += `
                <div style="
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  margin-top: 4px;">
                  ${labels}
                </div>`;
            } else if (vartype === "Temp") {
                const gradientBar = `
                <div style="
                  background: linear-gradient(to right, ${colors.join(", ")});
                  width: 20vw;
                  height: 20px;
                  border: 1px solid #000;
                  margin-bottom: 8px;">
                </div>`;

                div.innerHTML += gradientBar;

                // 计算标签刻度
                const numLabels = grades.length;
                const step = Math.floor(100 / (numLabels - 1)); // 均匀分布标签

                // 生成标签
                const labels = grades
                    .map((grade) => `<span>${grade}</span>`)
                    .join(" ");

                div.innerHTML += `
                <div style="
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  margin-top: 4px;">
                  ${labels}
                </div>`;
            } else {
                // Default legend
                div.innerHTML += `
          <div style="
            width: 30px;
            height: 20px;
            background-color: ${colors[0]};
            border: 2px solid #000;
            margin-bottom: 4px;">
          </div>
          <span class="text-sm">${grades[0]}</span>`;
            }

            return div;
        };

        legend.addTo(map);
        legendRef.current = legend;

        return () => {
            // Clean up the legend when the component unmounts or re-renders
            if (legendRef.current) {
                legendRef.current.remove();
            }
        };
    }, [map, data.data_vartype]);

    return null;
}

// Zoom Control Component
function ZoomControl() {
    const map = useMap();

    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const zoomChange = e.deltaY < 0 ? 1 : -1;
                const newZoom = map.getZoom() + zoomChange;
                map.setZoom(
                    Math.min(
                        Math.max(newZoom, map.getMinZoom()),
                        map.getMaxZoom()
                    )
                );
            }
        };

        map.getContainer().addEventListener("wheel", handleWheel, {
            passive: false
        });

        return () => {
            map.getContainer().removeEventListener("wheel", handleWheel);
        };
    }, [map]);

    return null;
}

// Function to generate color based on value
function getColor(d) {
    return d > 2
        ? "#14713d" // Dark Blue - Extremely Wet
        : d > 1.5
        ? "#3cb371" // Light Blue - Very Wet
        : d > 1
        ? "#98fb98" // Green - Moderately Wet
        : d >= -0.99
        ? "#EEE" // Yellow - Near Normal
        : d >= -1.49
        ? "#f5deb3" // Orange - Moderately Dry
        : d >= -1.99
        ? "#d2691e" // Deep Orange - Severely Dry
        : d >= -10
        ? "#b22222" // Red - Extremely Dry
        : "#eee"; // no data
}

// OLD getColor() function
// function getColor(d) {
//     return d > 2
//         ? "#fff"
//         : d > 1.5
//         ? "#FFFF00"
//         : d > 1
//         ? "#FFFF00"
//         : d > -1.0
//         ? "#FCD37F"
//         : d > -1.5
//         ? "#FFAA00"
//         : d > -2
//         ? "#74c476"
//         : "#eee"; // Light green
// }

function getColorPrcp(d) {
    if (d <= 0) return "#FFFFFF"; // No precipitation

    // 定义颜色范围：HSL（色相、饱和度、亮度）
    const minVal = 0; // 最小降水量
    const maxVal = 1000; // 最大降水量（超过 150mm 按 100 计算）

    const minHue = 200; // 蓝色 (H=240)
    const maxHue = 0; // 红色 (H=0)

    // 归一化 d 值到 [0, 1]，并计算插值色相
    let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));
    let hue = minHue + ratio * (maxHue - minHue); // 从蓝色到红色

    return `hsl(${hue}, 100%, 50%)`; // 保持饱和度 100%，亮度 50%
}

function getColorPrcpProv(d) {
    if (d <= 0) return "#FFFFFF"; // No precipitation

    // define color range：HSL
    const minVal = 0; // 最小降水量
    const maxVal = 3000; // 最大降水量

    const minHue = 200;
    const maxHue = 0;

    let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));
    let hue = minHue + ratio * (maxHue - minHue);

    return `hsl(${hue}, 100%, 50%)`;
}

function getColorPrcpProvMonthly(d) {
    if (d <= 0) return "#FFFFFF"; // No precipitation

    // define color range：HSL
    const minVal = 0; // 最小降水量
    const maxVal = 500; // 最大降水量

    const minHue = 200;
    const maxHue = 0;

    let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));
    let hue = minHue + ratio * (maxHue - minHue);

    return `hsl(${hue}, 100%, 50%)`;
}

function getColorTemp(temp) {
    // if (d <= 0) return "#333"; // if no value

    // // define data range
    // const minVal = 15; // min
    // const maxVal = 30; // max

    // // HSL
    // const minSaturation = 30;
    // const maxSaturation = 100;
    // const minLightness = 90;
    // const maxLightness = 40;

    // // 归一化 d 值到 [0, 1]
    // let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));

    // // 计算 HSL 颜色值
    // let saturation = minSaturation + ratio * (maxSaturation - minSaturation);
    // let lightness = minLightness - ratio * (minLightness - maxLightness);

    // // 返回计算出的 HSL 颜色值
    // return `hsl(0, ${saturation}%, ${lightness}%)`;

    if (temp == null || temp == 0 || isNaN(temp)) {
        console.error("getColorTemp received invalid temperature:", temp);
        return "#333"; // 默认灰色，避免错误
    }

    const colorStops = [
        { temp: 10, color: "#08306B" }, // Dark Blue - Unusually Cold
        { temp: 20, color: "#4292C6" }, // Light Blue - Cool
        { temp: 25, color: "#41AB5D" }, // Green - Moderate
        { temp: 30, color: "#F7DC6F" }, // Yellow - Warm
        { temp: 35, color: "#E67E22" }, // Orange - Hot
        { temp: 40, color: "#C0392B" } // Red - Extreme Heat
    ];

    // 遍历颜色映射表，找到温度所在区间
    for (let i = 0; i < colorStops.length - 1; i++) {
        const t1 = colorStops[i].temp;
        const t2 = colorStops[i + 1].temp;

        if (temp <= t1) return colorStops[i].color;
        if (temp <= t2) {
            const factor = (temp - t1) / (t2 - t1);
            return interpolateColor(
                colorStops[i].color,
                colorStops[i + 1].color,
                factor
            );
        }
    }

    return colorStops[colorStops.length - 1].color;
}

function getColorYield(d) {
    if (d <= 0) return "#FFFFFF"; // No precipitation

    const minVal = 1;
    const maxVal = 7;

    const minHue = 30;
    const maxHue = 120;

    // 归一化 d 值到 [0, 1]，并计算插值色相
    let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));
    let hue = minHue - ratio * (minHue - maxHue);

    return `hsl(${hue}, 100%, 40%)`;
}

function getColorYieldProv(d) {
    if (d <= 0) return "#FFFFFF"; // No precipitation

    // 定义颜色范围：HSL（色相、饱和度、亮度）
    const minVal = 1; // 最小降水量
    const maxVal = 7; // 最大降水量（超过 100mm 按 100 计算）

    const minHue = 30;
    const maxHue = 100;

    // 归一化 d 值到 [0, 1]，并计算插值色相
    let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));
    let hue = minHue - ratio * (minHue - maxHue);

    return `hsl(${hue}, 100%, 40%)`;
}

function getColorProduction(d) {
    if (d <= 0) return "#FFFFFF"; // No precipitation

    const minVal = 0;
    const maxVal = 10000;

    const minHue = 30;
    const maxHue = 120;

    // 归一化 d 值到 [0, 1]，并计算插值色相
    let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));
    let hue = minHue - ratio * (minHue - maxHue);

    return `hsl(${hue}, 100%, 40%)`;
}

function getColorProductionProv(d) {
    if (d <= 0) return "#FFFFFF"; // No precipitation

    const minVal = 0;
    const maxVal = 2000000;

    const minHue = 30;
    const maxHue = 120;

    // 归一化 d 值到 [0, 1]，并计算插值色相
    let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));
    let hue = minHue - ratio * (minHue - maxHue);

    return `hsl(${hue}, 100%, 40%)`;
}

function getColorProductionCountry(d) {
    if (d <= 0) return "#FFFFFF"; // No precipitation

    const minVal = 0;
    const maxVal = 10000000;

    const minHue = 30;
    const maxHue = 120;

    // 归一化 d 值到 [0, 1]，并计算插值色相
    let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));
    let hue = minHue - ratio * (minHue - maxHue);

    return `hsl(${hue}, 100%, 40%)`;
}

function getColorArea(d) {
    if (d <= 0) return "#FFFFFF"; // No precipitation

    const minVal = 0;
    const maxVal = 10000;

    const minHue = 30;
    const maxHue = 120;

    // 归一化 d 值到 [0, 1]，并计算插值色相
    let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));
    let hue = minHue - ratio * (minHue - maxHue);

    return `hsl(${hue}, 100%, 40%)`;
}

function getColorAreaProv(d) {
    if (d <= 0) return "#FFFFFF";

    const minVal = 0;
    const maxVal = 500000;

    const minHue = 30;
    const maxHue = 120;

    // 归一化 d 值到 [0, 1]，并计算插值色相
    let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));
    let hue = minHue - ratio * (minHue - maxHue);

    return `hsl(${hue}, 100%, 40%)`;
}

function getColorAreaCountry(d) {
    if (d <= 0) return "#FFFFFF";

    const minVal = 0;
    const maxVal = 10000000;

    const minHue = 30;
    const maxHue = 120;

    // 归一化 d 值到 [0, 1]，并计算插值色相
    let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));
    let hue = minHue - ratio * (minHue - maxHue);

    return `hsl(${hue}, 100%, 40%)`;
}

function getColorSMPct(d) {
    if (d <= 0) return "hsl(210, 10%, 100%)"; // 最浅色（灰蓝）

    // 定义数据范围
    const minVal = 20; // 最小值
    const maxVal = 80; // 最大值

    // HSL 颜色范围
    const minSaturation = 10; // 最小饱和度
    const maxSaturation = 100; // 最大饱和度
    const minLightness = 90; // 最小亮度（最浅色）
    const maxLightness = 40; // 最大亮度（最深色）

    // 归一化数据 d 到 [0, 1]
    let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));

    // 计算 HSL 颜色值
    let saturation = minSaturation + ratio * (maxSaturation - minSaturation);
    let lightness = minLightness - ratio * (minLightness - maxLightness);

    // 返回计算出的 HSL 颜色值
    return `hsl(210, ${saturation}%, ${lightness}%)`;
}

function interpolateColor(color1, color2, factor) {
    if (factor > 1) factor = 1;
    if (factor < 0) factor = 0;

    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);

    const r1 = (c1 >> 16) & 255,
        g1 = (c1 >> 8) & 255,
        b1 = c1 & 255;
    const r2 = (c2 >> 16) & 255,
        g2 = (c2 >> 8) & 255,
        b2 = c2 & 255;

    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    return `rgb(${r}, ${g}, ${b})`;
}
