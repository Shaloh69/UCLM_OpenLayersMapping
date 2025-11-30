module.exports = {

"[project]/components/map/typeSafeGeometryUtils.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "calculatePathLength": (()=>calculatePathLength),
    "getSafeCoordinates": (()=>getSafeCoordinates),
    "getSafeGeometryType": (()=>getSafeGeometryType),
    "getSafeLength": (()=>getSafeLength)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/geom/Point.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$LineString$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/geom/LineString.js [app-ssr] (ecmascript)");
;
;
const getSafeCoordinates = (geometry)=>{
    if (!geometry) return null;
    try {
        if (geometry instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]) {
            return geometry.getCoordinates();
        }
        if (geometry instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$LineString$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]) {
            const firstCoord = geometry.getFirstCoordinate();
            return firstCoord || null;
        }
        // Fallback for other geometry types
        if (typeof geometry.getFirstCoordinate === "function") {
            return geometry.getFirstCoordinate();
        }
        if (typeof geometry.getCoordinates === "function") {
            const coords = geometry.getCoordinates();
            if (Array.isArray(coords) && coords.length > 0) {
                if (Array.isArray(coords[0])) {
                    return coords[0];
                }
                return coords;
            }
        }
    } catch (error) {
        console.error("Error getting coordinates from geometry:", error);
    }
    return null;
};
const getSafeLength = (geometry)=>{
    if (!geometry) return 0;
    try {
        if (geometry instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$LineString$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]) {
            return geometry.getLength();
        }
        // Fallback for other geometry types
        if (typeof geometry.getLength === "function") {
            return geometry.getLength();
        }
    } catch (error) {
        console.error("Error calculating geometry length:", error);
    }
    return 0;
};
const getSafeGeometryType = (geometry)=>{
    if (!geometry) return "unknown";
    try {
        return geometry.getType();
    } catch (error) {
        console.error("Error getting geometry type:", error);
        return "unknown";
    }
};
const calculatePathLength = (features)=>{
    let totalLength = 0;
    features.forEach((feature)=>{
        const geometry = feature.getGeometry();
        totalLength += getSafeLength(geometry);
    });
    return totalLength;
};
}}),
"[project]/components/map/routeProcessor.ts [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const e = new Error(`Could not parse module '[project]/components/map/routeProcessor.ts'

Expression expected`);
e.code = 'MODULE_UNPARSEABLE';
throw e;}}),
"[project]/components/map/layers.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "getRandomColor": (()=>getRandomColor),
    "hexToRGBA": (()=>hexToRGBA),
    "setupLayers": (()=>setupLayers)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/ol/proj.js [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$layer$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/layer/Vector.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$source$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/source/Vector.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$Feature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Feature$3e$__ = __turbopack_import__("[project]/node_modules/ol/Feature.js [app-ssr] (ecmascript) <export default as Feature>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Polygon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Polygon$3e$__ = __turbopack_import__("[project]/node_modules/ol/geom/Polygon.js [app-ssr] (ecmascript) <export default as Polygon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__ = __turbopack_import__("[project]/node_modules/ol/style/Style.js [app-ssr] (ecmascript) <export default as Style>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Fill$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Fill$3e$__ = __turbopack_import__("[project]/node_modules/ol/style/Fill.js [app-ssr] (ecmascript) <export default as Fill>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$format$2f$GeoJSON$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/format/GeoJSON.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/style/Circle.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Stroke$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stroke$3e$__ = __turbopack_import__("[project]/node_modules/ol/style/Stroke.js [app-ssr] (ecmascript) <export default as Stroke>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$View$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/View.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_import__("[project]/node_modules/ol/proj.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$Map$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/Map.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$control$2f$defaults$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/control/defaults.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$control$2f$Rotate$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/control/Rotate.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/extent.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
const getRandomColor = ()=>{
    const letters = "0123456789ABCDEF";
    let color = "#";
    for(let i = 0; i < 6; i++){
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};
const hexToRGBA = (hex, opacity = 0.5)=>{
    hex = hex.replace(/^#/, "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
const setupLayers = (mapElement, backdropColor, centerCoordinates, initialZoom, mapUrl, pointsUrl)=>{
    const backdropLayer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$layer$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
        source: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$source$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            features: [
                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$Feature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Feature$3e$__["Feature"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Polygon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Polygon$3e$__["Polygon"]([
                    [
                        [
                            -20037508.34,
                            -20037508.34
                        ],
                        [
                            -20037508.34,
                            20037508.34
                        ],
                        [
                            20037508.34,
                            20037508.34
                        ],
                        [
                            20037508.34,
                            -20037508.34
                        ],
                        [
                            -20037508.34,
                            -20037508.34
                        ]
                    ]
                ]))
            ]
        }),
        style: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__["Style"]({
            fill: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Fill$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Fill$3e$__["Fill"]({
                color: backdropColor
            })
        })
    });
    const pointsSource = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$source$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
        url: pointsUrl,
        format: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$format$2f$GeoJSON$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857"
        })
    });
    const pointsLayer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$layer$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
        source: pointsSource,
        style: (feature)=>{
            const properties = feature.getProperties();
            const color = properties["marker-color"] || "#ff0000";
            const size = properties["marker-size"] === "large" ? 10 : properties["marker-size"] === "medium" ? 6 : 4;
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__["Style"]({
                image: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
                    radius: size,
                    fill: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Fill$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Fill$3e$__["Fill"]({
                        color
                    }),
                    stroke: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Stroke$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stroke$3e$__["Stroke"]({
                        color: "black",
                        width: 1
                    })
                })
            });
        }
    });
    const vectorSource = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$source$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
        url: mapUrl,
        format: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$format$2f$GeoJSON$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857"
        })
    });
    const vectorLayer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$layer$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
        source: vectorSource,
        style: (feature)=>{
            try {
                const properties = feature.getProperties();
                const fillColor = properties.fill || properties.fillColor || "#0080ff";
                const strokeColor = properties.stroke || properties.strokeColor || "black";
                const fillOpacity = properties["fill-opacity"] ?? 0.5;
                return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__["Style"]({
                    fill: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Fill$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Fill$3e$__["Fill"]({
                        color: hexToRGBA(fillColor, fillOpacity)
                    }),
                    stroke: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Stroke$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stroke$3e$__["Stroke"]({
                        color: strokeColor,
                        width: properties.strokeWidth || 3
                    })
                });
            } catch (error) {
                console.error("Style creation error:", error);
                return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__["Style"]();
            }
        }
    });
    const view = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$View$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
        center: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fromLonLat"])(centerCoordinates),
        zoom: initialZoom,
        minZoom: 16,
        maxZoom: 21,
        enableRotation: true,
        rotation: 44.86,
        constrainResolution: true,
        smoothResolutionConstraint: true
    });
    const map = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$Map$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
        target: mapElement,
        layers: [
            backdropLayer,
            vectorLayer,
            pointsLayer
        ],
        view,
        controls: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$control$2f$defaults$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaults"])({
            zoom: true,
            rotate: true,
            attribution: false
        }).extend([
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$control$2f$Rotate$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]()
        ])
    });
    // Calculate extent from all sources and constrain map bounds
    let combinedExtent = null;
    let isAdjustingCenter = false;
    const updateMapExtent = ()=>{
        const extent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createEmpty"])();
        let hasFeatures = false;
        const vectorFeatures = vectorSource.getFeatures();
        if (vectorFeatures.length > 0) {
            vectorFeatures.forEach((feature)=>{
                const geom = feature.getGeometry();
                if (geom) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["extend"])(extent, geom.getExtent());
                    hasFeatures = true;
                }
            });
        }
        const pointFeatures = pointsSource.getFeatures();
        if (pointFeatures.length > 0) {
            pointFeatures.forEach((feature)=>{
                const geom = feature.getGeometry();
                if (geom) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["extend"])(extent, geom.getExtent());
                    hasFeatures = true;
                }
            });
        }
        if (hasFeatures) {
            combinedExtent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buffer"])(extent, Math.max(extent[2] - extent[0], extent[3] - extent[1]) * 0.2);
            view.fit(combinedExtent, {
                padding: [
                    50,
                    50,
                    50,
                    50
                ],
                maxZoom: 19,
                duration: 1000
            });
        }
    };
    vectorSource.once("featuresloadend", updateMapExtent);
    pointsSource.once("featuresloadend", updateMapExtent);
    view.on("change:center", ()=>{
        if (!combinedExtent || isAdjustingCenter) return;
        const currentCenter = view.getCenter();
        if (!currentCenter) return;
        const currentExtent = view.calculateExtent();
        const [minX, minY, maxX, maxY] = combinedExtent;
        const [viewMinX, viewMinY, viewMaxX, viewMaxY] = currentExtent;
        let newCenter = [
            ...currentCenter
        ];
        let needsAdjustment = false;
        if (viewMinX < minX) {
            newCenter[0] += minX - viewMinX;
            needsAdjustment = true;
        } else if (viewMaxX > maxX) {
            newCenter[0] -= viewMaxX - maxX;
            needsAdjustment = true;
        }
        if (viewMinY < minY) {
            newCenter[1] += minY - viewMinY;
            needsAdjustment = true;
        } else if (viewMaxY > maxY) {
            newCenter[1] -= viewMaxY - maxY;
            needsAdjustment = true;
        }
        if (needsAdjustment) {
            isAdjustingCenter = true;
            view.setCenter(newCenter);
            setTimeout(()=>{
                isAdjustingCenter = false;
            }, 10);
        }
    });
    return {
        map,
        vectorSource,
        pointsSource,
        view,
        getExtent: ()=>combinedExtent
    };
};
}}),
"[project]/components/map/locationTracking.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "isCoordinateInsideSchool": (()=>isCoordinateInsideSchool),
    "setupLocationTracking": (()=>setupLocationTracking)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/ol/proj.js [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/extent.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$Feature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/Feature.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/geom/Point.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_import__("[project]/node_modules/ol/proj.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__ = __turbopack_import__("[project]/node_modules/ol/geom/Circle.js [app-ssr] (ecmascript) <export default as Circle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$layer$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/layer/Vector.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$source$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/source/Vector.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__ = __turbopack_import__("[project]/node_modules/ol/style/Style.js [app-ssr] (ecmascript) <export default as Style>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Fill$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Fill$3e$__ = __turbopack_import__("[project]/node_modules/ol/style/Fill.js [app-ssr] (ecmascript) <export default as Fill>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Stroke$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stroke$3e$__ = __turbopack_import__("[project]/node_modules/ol/style/Stroke.js [app-ssr] (ecmascript) <export default as Stroke>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/style/Circle.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
const isCoordinateInsideSchool = (coords, boundary)=>{
    if (!boundary) return true; // If no boundary defined, assume inside
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["containsCoordinate"])(boundary, coords);
};
const setupLocationTracking = (map, locationErrorRef, isOutsideSchoolRef, schoolBoundaryRef, isUpdatingPositionRef)=>{
    // GPS Marker & Accuracy Circle
    const userPositionFeature = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$Feature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
        geometry: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fromLonLat"])([
            0,
            0
        ]))
    });
    const accuracyFeature = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$Feature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
        geometry: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__["Circle"]((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fromLonLat"])([
            0,
            0
        ]), 10)
    });
    const userPositionLayer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$layer$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
        source: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$source$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            features: [
                accuracyFeature,
                userPositionFeature
            ]
        }),
        style: (feature)=>{
            if (feature === userPositionFeature) {
                return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__["Style"]({
                    image: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
                        radius: 8,
                        fill: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Fill$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Fill$3e$__["Fill"]({
                            color: "#ff0000"
                        }),
                        stroke: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Stroke$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stroke$3e$__["Stroke"]({
                            color: "#ffffff",
                            width: 2
                        })
                    })
                });
            } else if (feature === accuracyFeature) {
                return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__["Style"]({
                    fill: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Fill$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Fill$3e$__["Fill"]({
                        color: "rgba(0, 0, 255, 0.2)"
                    }),
                    stroke: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Stroke$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stroke$3e$__["Stroke"]({
                        color: "blue",
                        width: 1
                    })
                });
            }
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__["Style"]();
        }
    });
    map.addLayer(userPositionLayer);
    // Better approach to update user position
    const updateUserPosition = (position)=>{
        if (isUpdatingPositionRef.current) return; // Prevent concurrent updates
        isUpdatingPositionRef.current = true;
        try {
            const { latitude, longitude, accuracy } = position.coords;
            const coords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fromLonLat"])([
                longitude,
                latitude
            ]);
            // Update geometry directly without changing state if possible
            userPositionFeature.setGeometry(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](coords));
            accuracyFeature.setGeometry(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__["Circle"](coords, accuracy || 10));
            // Check if the user is outside the school boundary
            const isOutside = schoolBoundaryRef.current && !isCoordinateInsideSchool(coords, schoolBoundaryRef.current);
            // Only update ref if it has changed - no state updates here
            if (isOutside !== isOutsideSchoolRef.current) {
                isOutsideSchoolRef.current = !!isOutside;
                if (isOutside) {}
            }
        } finally{
            // Make sure we reset the flag even if there's an error
            isUpdatingPositionRef.current = false;
        }
    };
    const watchId = navigator.geolocation.watchPosition(updateUserPosition, (error)=>{
        console.error("Error getting location:", error);
        // Update ref instead of state directly
        const errorMsg = `Location error: ${error.message}`;
        if (locationErrorRef.current !== errorMsg) {
            locationErrorRef.current = errorMsg;
        }
    }, {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
    });
    return {
        watchId,
        userPositionFeature,
        accuracyFeature
    };
};
}}),
"[project]/components/map/components.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "CustomizationPanel": (()=>CustomizationPanel),
    "EditControls": (()=>EditControls)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
const EditControls = ({ isEditMode, toggleEditMode, drawType, handleDrawInteractionToggle, handleDeleteSelected, handleExportMap })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute top-4 right-4 z-10 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col space-y-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: `px-3 py-2 rounded-md text-sm font-medium ${isEditMode ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`,
                    onClick: toggleEditMode,
                    children: isEditMode ? "Exit Edit Mode" : "Edit Map"
                }, void 0, false, {
                    fileName: "[project]/components/map/components.tsx",
                    lineNumber: 18,
                    columnNumber: 7
                }, this),
                isEditMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex space-x-2",
                            children: [
                                "Point",
                                "LineString",
                                "Polygon"
                            ].map((type)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: `px-3 py-1 text-xs rounded-md ${drawType === type ? "bg-green-500 text-white" : "bg-gray-200"}`,
                                    onClick: ()=>handleDrawInteractionToggle(type),
                                    children: type === "LineString" ? "Line" : type === "Polygon" ? "Area" : "Point"
                                }, type, false, {
                                    fileName: "[project]/components/map/components.tsx",
                                    lineNumber: 31,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/map/components.tsx",
                            lineNumber: 29,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex space-x-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "px-3 py-1 text-xs bg-red-500 text-white rounded-md",
                                    onClick: handleDeleteSelected,
                                    children: "Delete"
                                }, void 0, false, {
                                    fileName: "[project]/components/map/components.tsx",
                                    lineNumber: 47,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "px-3 py-1 text-xs bg-gray-700 text-white rounded-md",
                                    onClick: handleExportMap,
                                    children: "Export"
                                }, void 0, false, {
                                    fileName: "[project]/components/map/components.tsx",
                                    lineNumber: 53,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/map/components.tsx",
                            lineNumber: 46,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true)
            ]
        }, void 0, true, {
            fileName: "[project]/components/map/components.tsx",
            lineNumber: 17,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/map/components.tsx",
        lineNumber: 16,
        columnNumber: 3
    }, this);
const CustomizationPanel = ({ featureProperties, updateFeatureProperty, markerSizeOptions, onClose })=>{
    const isPoint = featureProperties?.geometry?.getType?.() === "Point" || featureProperties?.["marker-color"] !== undefined;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute top-4 left-4 z-10 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg w-64",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-bold",
                        children: "Customize Feature"
                    }, void 0, false, {
                        fileName: "[project]/components/map/components.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "text-gray-500 hover:text-gray-700",
                        onClick: onClose,
                        children: "✕"
                    }, void 0, false, {
                        fileName: "[project]/components/map/components.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/map/components.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-sm font-medium mb-1",
                                children: "Name"
                            }, void 0, false, {
                                fileName: "[project]/components/map/components.tsx",
                                lineNumber: 88,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                className: "w-full px-2 py-1 border rounded",
                                value: featureProperties?.name ?? "",
                                onChange: (e)=>updateFeatureProperty("name", e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/components/map/components.tsx",
                                lineNumber: 89,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/map/components.tsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, this),
                    isPoint ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium mb-1",
                                        children: "Marker Color"
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/components.tsx",
                                        lineNumber: 102,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "color",
                                        className: "block w-full",
                                        value: featureProperties?.["marker-color"] ?? "#ff0000",
                                        onChange: (e)=>updateFeatureProperty("marker-color", e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/components.tsx",
                                        lineNumber: 105,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/map/components.tsx",
                                lineNumber: 101,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium mb-1",
                                        children: "Size"
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/components.tsx",
                                        lineNumber: 115,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        className: "w-full px-2 py-1 border rounded",
                                        value: featureProperties?.["marker-size"] ?? "medium",
                                        onChange: (e)=>updateFeatureProperty("marker-size", e.target.value),
                                        children: markerSizeOptions.map((size)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: size,
                                                children: size.charAt(0).toUpperCase() + size.slice(1)
                                            }, size, false, {
                                                fileName: "[project]/components/map/components.tsx",
                                                lineNumber: 124,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/components.tsx",
                                        lineNumber: 116,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/map/components.tsx",
                                lineNumber: 114,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium mb-1",
                                        children: "Fill Color"
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/components.tsx",
                                        lineNumber: 134,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "color",
                                        className: "block w-full",
                                        value: featureProperties?.fill ?? "#0080ff",
                                        onChange: (e)=>updateFeatureProperty("fill", e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/components.tsx",
                                        lineNumber: 137,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/map/components.tsx",
                                lineNumber: 133,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium mb-1",
                                        children: "Stroke Color"
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/components.tsx",
                                        lineNumber: 147,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "color",
                                        className: "block w-full",
                                        value: featureProperties?.stroke ?? "#000000",
                                        onChange: (e)=>updateFeatureProperty("stroke", e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/components.tsx",
                                        lineNumber: 150,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/map/components.tsx",
                                lineNumber: 146,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium mb-1",
                                        children: "Opacity"
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/components.tsx",
                                        lineNumber: 160,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "range",
                                        min: "0",
                                        max: "1",
                                        step: "0.1",
                                        className: "w-full",
                                        value: featureProperties?.["fill-opacity"] ?? 0.5,
                                        onChange: (e)=>updateFeatureProperty("fill-opacity", parseFloat(e.target.value))
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/components.tsx",
                                        lineNumber: 161,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/map/components.tsx",
                                lineNumber: 159,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium mb-1",
                                        children: "Stroke Width"
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/components.tsx",
                                        lineNumber: 177,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        className: "w-full px-2 py-1 border rounded",
                                        min: "1",
                                        max: "10",
                                        value: featureProperties?.strokeWidth ?? 3,
                                        onChange: (e)=>updateFeatureProperty("strokeWidth", parseInt(e.target.value))
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/components.tsx",
                                        lineNumber: 180,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/map/components.tsx",
                                lineNumber: 176,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/components/map/components.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/map/components.tsx",
        lineNumber: 78,
        columnNumber: 5
    }, this);
};
}}),
"[project]/components/map/enhancedLocationTracking.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "EnhancedLocationTracker": (()=>EnhancedLocationTracker),
    "calculateBearing": (()=>calculateBearing),
    "calculateDistance": (()=>calculateDistance),
    "isCoordinateInsideSchool": (()=>isCoordinateInsideSchool),
    "setupEnhancedLocationTracking": (()=>setupEnhancedLocationTracking)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/ol/proj.js [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_import__("[project]/node_modules/ol/proj.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$sphere$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/sphere.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/extent.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$Feature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/Feature.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/geom/Point.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__ = __turbopack_import__("[project]/node_modules/ol/geom/Circle.js [app-ssr] (ecmascript) <export default as Circle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$layer$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/layer/Vector.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$source$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/source/Vector.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__ = __turbopack_import__("[project]/node_modules/ol/style/Style.js [app-ssr] (ecmascript) <export default as Style>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Icon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Icon$3e$__ = __turbopack_import__("[project]/node_modules/ol/style/Icon.js [app-ssr] (ecmascript) <export default as Icon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Fill$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Fill$3e$__ = __turbopack_import__("[project]/node_modules/ol/style/Fill.js [app-ssr] (ecmascript) <export default as Fill>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Stroke$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stroke$3e$__ = __turbopack_import__("[project]/node_modules/ol/style/Stroke.js [app-ssr] (ecmascript) <export default as Stroke>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/style/Circle.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
const calculateBearing = (start, end)=>{
    const [lon1, lat1] = start;
    const [lon2, lat2] = end;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    const bearingRad = Math.atan2(y, x);
    const bearingDeg = bearingRad * 180 / Math.PI;
    return (bearingDeg + 360) % 360;
};
const calculateDistance = (coord1, coord2)=>{
    const point1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fromLonLat"])(coord1);
    const point2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fromLonLat"])(coord2);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$sphere$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDistance"])(point1, point2);
};
// Smooth angle interpolation (handles wrapping)
const interpolateAngle = (current, target, factor)=>{
    let diff = target - current;
    // Normalize to [-180, 180]
    while(diff > 180)diff -= 360;
    while(diff < -180)diff += 360;
    return current + diff * factor;
};
const isCoordinateInsideSchool = (coords, boundary)=>{
    if (!boundary) return true;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["containsCoordinate"])(boundary, coords);
};
class EnhancedLocationTracker {
    map;
    options;
    // Feature references
    userPositionFeature;
    accuracyFeature;
    directionArrowFeature;
    userPositionLayer;
    // Position tracking
    currentPosition = null;
    previousPosition = null;
    watchId = null;
    positionHistory = [];
    maxHistoryLength = 10;
    // Route tracking
    routePath = [];
    startPosition = null;
    destinationPosition = null;
    totalRouteDistance = 0;
    // Animation
    animationFrameId = null;
    targetRotation = 0;
    currentRotation = 0;
    // Callbacks
    onPositionUpdate;
    onRouteProgressUpdate;
    locationErrorRef;
    isOutsideSchoolRef;
    schoolBoundaryRef;
    constructor(map, options, locationErrorRef, isOutsideSchoolRef, schoolBoundaryRef){
        this.map = map;
        this.locationErrorRef = locationErrorRef;
        this.isOutsideSchoolRef = isOutsideSchoolRef;
        this.schoolBoundaryRef = schoolBoundaryRef;
        // Default options
        this.options = {
            autoFollow: true,
            rotateMap: true,
            smoothAnimation: true,
            animationDuration: 1000,
            zoomLevel: 19,
            showAccuracyCircle: true,
            showDirectionArrow: true,
            trackingMode: "route",
            ...options
        };
        // Initialize features
        this.userPositionFeature = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$Feature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            geometry: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fromLonLat"])([
                0,
                0
            ])),
            name: "userPosition"
        });
        this.accuracyFeature = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$Feature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            geometry: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__["Circle"]((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fromLonLat"])([
                0,
                0
            ]), 10),
            name: "accuracy"
        });
        // Create direction arrow using SVG data URL
        const arrowSvg = this.createDirectionArrowSVG();
        this.directionArrowFeature = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$Feature$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            geometry: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fromLonLat"])([
                0,
                0
            ])),
            name: "directionArrow"
        });
        // Create layer with styled features
        this.userPositionLayer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$layer$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            source: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$source$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
                features: [
                    this.accuracyFeature,
                    this.userPositionFeature,
                    this.directionArrowFeature
                ]
            }),
            style: (feature)=>this.getFeatureStyle(feature),
            zIndex: 1000
        });
        this.map.addLayer(this.userPositionLayer);
    }
    // =============================================
    // Styling
    // =============================================
    createDirectionArrowSVG() {
        const svg = `
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="1" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx="20" cy="20" r="18" fill="#3B82F6" opacity="0.3"/>
        <circle cx="20" cy="20" r="14" fill="#3B82F6" stroke="white" stroke-width="2" filter="url(#shadow)"/>
        <path d="M20 8 L26 24 L20 20 L14 24 Z" fill="white" filter="url(#shadow)"/>
      </svg>
    `;
        return "data:image/svg+xml," + encodeURIComponent(svg);
    }
    getFeatureStyle(feature) {
        const name = feature.get("name");
        if (name === "userPosition") {
            // Pulsing user position dot
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__["Style"]({
                image: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
                    radius: 10,
                    fill: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Fill$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Fill$3e$__["Fill"]({
                        color: "#3B82F6"
                    }),
                    stroke: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Stroke$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stroke$3e$__["Stroke"]({
                        color: "#ffffff",
                        width: 3
                    })
                })
            });
        } else if (name === "accuracy" && this.options.showAccuracyCircle) {
            // Accuracy circle
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__["Style"]({
                fill: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Fill$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Fill$3e$__["Fill"]({
                    color: "rgba(59, 130, 246, 0.1)"
                }),
                stroke: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Stroke$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stroke$3e$__["Stroke"]({
                    color: "#3B82F6",
                    width: 1.5,
                    lineDash: [
                        5,
                        5
                    ]
                })
            });
        } else if (name === "directionArrow" && this.options.showDirectionArrow) {
            // Direction arrow
            const rotation = this.currentPosition?.heading || 0;
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__["Style"]({
                image: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Icon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Icon$3e$__["Icon"]({
                    src: this.createDirectionArrowSVG(),
                    scale: 0.8,
                    rotation: rotation * Math.PI / 180,
                    rotateWithView: false
                })
            });
        }
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__["Style"]();
    }
    // =============================================
    // Position Tracking
    // =============================================
    startTracking(onPositionUpdate, onRouteProgressUpdate) {
        this.onPositionUpdate = onPositionUpdate;
        this.onRouteProgressUpdate = onRouteProgressUpdate;
        if (this.watchId !== null) {
            return;
        }
        this.watchId = navigator.geolocation.watchPosition((position)=>this.handlePositionUpdate(position), (error)=>this.handlePositionError(error), {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 15000
        });
        // Start animation loop
        this.startAnimationLoop();
    }
    stopTracking() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    handlePositionUpdate(geoPosition) {
        const { latitude, longitude, accuracy, heading, speed } = geoPosition.coords;
        // Calculate derived heading from movement if not provided by device
        let effectiveHeading = heading;
        if (this.previousPosition && (heading === null || heading === undefined)) {
            effectiveHeading = calculateBearing(this.previousPosition.coordinates, [
                longitude,
                latitude
            ]);
        }
        const newPosition = {
            coordinates: [
                longitude,
                latitude
            ],
            accuracy: accuracy || 10,
            heading: effectiveHeading,
            speed: speed,
            timestamp: Date.now()
        };
        // Update position history
        this.previousPosition = this.currentPosition;
        this.currentPosition = newPosition;
        this.positionHistory.push(newPosition);
        if (this.positionHistory.length > this.maxHistoryLength) {
            this.positionHistory.shift();
        }
        // Record start position if not set
        if (!this.startPosition) {
            this.startPosition = [
                longitude,
                latitude
            ];
        }
        // Update map features
        this.updateMapFeatures();
        // Check boundary
        this.checkBoundary();
        // Auto-follow if enabled
        if (this.options.autoFollow) {
            this.centerMapOnUser();
        }
        // Calculate route progress
        if (this.destinationPosition) {
            const progress = this.calculateRouteProgress();
            if (this.onRouteProgressUpdate) {
                this.onRouteProgressUpdate(progress);
            }
        }
        // Callback
        if (this.onPositionUpdate) {
            this.onPositionUpdate(newPosition);
        }
    }
    handlePositionError(error) {
        const errorMsg = `Location error: ${error.message}`;
        this.locationErrorRef.current = errorMsg;
    }
    updateMapFeatures() {
        if (!this.currentPosition) return;
        const coords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fromLonLat"])(this.currentPosition.coordinates);
        // Update position marker
        this.userPositionFeature.setGeometry(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](coords));
        // Update accuracy circle
        this.accuracyFeature.setGeometry(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__["Circle"](coords, this.currentPosition.accuracy));
        // Update direction arrow
        this.directionArrowFeature.setGeometry(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](coords));
        // Refresh styles
        this.userPositionLayer.changed();
    }
    checkBoundary() {
        if (!this.currentPosition || !this.schoolBoundaryRef.current) return;
        const coords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fromLonLat"])(this.currentPosition.coordinates);
        const isOutside = !isCoordinateInsideSchool(coords, this.schoolBoundaryRef.current);
        if (isOutside !== this.isOutsideSchoolRef.current) {
            this.isOutsideSchoolRef.current = isOutside;
            if (isOutside) {}
        }
    }
    // =============================================
    // Map Control
    // =============================================
    centerMapOnUser() {
        if (!this.currentPosition) return;
        const view = this.map.getView();
        const coords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fromLonLat"])(this.currentPosition.coordinates);
        if (this.options.smoothAnimation) {
            view.animate({
                center: coords,
                zoom: this.options.zoomLevel,
                duration: 500
            });
        } else {
            view.setCenter(coords);
            view.setZoom(this.options.zoomLevel);
        }
    }
    startAnimationLoop() {
        const animate = ()=>{
            if (this.options.rotateMap && this.currentPosition?.heading !== null && this.currentPosition?.heading !== undefined) {
                // Smooth rotation interpolation
                const targetRotation = -(this.currentPosition.heading * Math.PI / 180);
                this.currentRotation = interpolateAngle(this.currentRotation, targetRotation, 0.1 // Smoothing factor
                );
                const view = this.map.getView();
                view.setRotation(this.currentRotation);
            }
            this.animationFrameId = requestAnimationFrame(animate);
        };
        animate();
    }
    // =============================================
    // Route Management
    // =============================================
    setRoute(path) {
        this.routePath = path;
        if (path.length > 0) {
            this.destinationPosition = path[path.length - 1];
            // Calculate total route distance
            this.totalRouteDistance = 0;
            for(let i = 0; i < path.length - 1; i++){
                this.totalRouteDistance += calculateDistance(path[i], path[i + 1]);
            }
        }
    }
    clearRoute() {
        this.routePath = [];
        this.destinationPosition = null;
        this.totalRouteDistance = 0;
        this.startPosition = null;
    }
    calculateRouteProgress() {
        if (!this.currentPosition || !this.destinationPosition || this.routePath.length === 0) {
            return {
                distanceToDestination: 0,
                distanceTraveled: 0,
                percentComplete: 0,
                estimatedTimeRemaining: 0,
                isOffRoute: false,
                distanceFromRoute: 0,
                nextWaypoint: null,
                distanceToNextWaypoint: 0,
                bearingToNextWaypoint: null
            };
        }
        const userCoords = this.currentPosition.coordinates;
        // Distance to destination
        const distanceToDestination = calculateDistance(userCoords, this.destinationPosition);
        // Distance traveled (from start)
        const distanceTraveled = this.startPosition ? calculateDistance(this.startPosition, userCoords) : 0;
        // Percent complete
        const percentComplete = this.totalRouteDistance > 0 ? Math.min(100, (this.totalRouteDistance - distanceToDestination) / this.totalRouteDistance * 100) : 0;
        // Find next waypoint
        let nextWaypoint = null;
        let minDistanceToWaypoint = Infinity;
        for (const waypoint of this.routePath){
            const dist = calculateDistance(userCoords, waypoint);
            if (dist < minDistanceToWaypoint) {
                minDistanceToWaypoint = dist;
                nextWaypoint = waypoint;
            }
        }
        // Bearing to next waypoint
        const bearingToNextWaypoint = nextWaypoint ? calculateBearing(userCoords, nextWaypoint) : null;
        // Check if off route (more than 50m from any waypoint)
        const isOffRoute = minDistanceToWaypoint > 50;
        // Estimated time remaining (based on average walking speed 1.4 m/s)
        const walkingSpeed = this.currentPosition.speed || 1.4;
        const estimatedTimeRemaining = distanceToDestination / walkingSpeed;
        return {
            distanceToDestination,
            distanceTraveled,
            percentComplete,
            estimatedTimeRemaining,
            isOffRoute,
            distanceFromRoute: minDistanceToWaypoint,
            nextWaypoint,
            distanceToNextWaypoint: minDistanceToWaypoint,
            bearingToNextWaypoint
        };
    }
    // =============================================
    // Configuration
    // =============================================
    setOptions(options) {
        this.options = {
            ...this.options,
            ...options
        };
        this.userPositionLayer.changed(); // Refresh styles
    }
    getOptions() {
        return {
            ...this.options
        };
    }
    getCurrentPosition() {
        return this.currentPosition;
    }
    getPositionHistory() {
        return [
            ...this.positionHistory
        ];
    }
    // =============================================
    // Utilities
    // =============================================
    destroy() {
        this.stopTracking();
        this.map.removeLayer(this.userPositionLayer);
    }
}
const setupEnhancedLocationTracking = (map, options, locationErrorRef, isOutsideSchoolRef, schoolBoundaryRef)=>{
    return new EnhancedLocationTracker(map, options, locationErrorRef, isOutsideSchoolRef, schoolBoundaryRef);
};
}}),
"[project]/components/map/editControls.ts [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const e = new Error(`Could not parse module '[project]/components/map/editControls.ts'

Expression expected`);
e.code = 'MODULE_UNPARSEABLE';
throw e;}}),
"[project]/components/map/roadSystem.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "findClosestNode": (()=>findClosestNode),
    "findShortestPath": (()=>findShortestPath),
    "setupRoadSystem": (()=>setupRoadSystem)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/ol/proj.js [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/geom/Point.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_import__("[project]/node_modules/ol/proj.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$LineString$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/geom/LineString.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$source$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Vector$3e$__ = __turbopack_import__("[project]/node_modules/ol/source/Vector.js [app-ssr] (ecmascript) <export default as Vector>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$format$2f$GeoJSON$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/format/GeoJSON.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$layer$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Vector$3e$__ = __turbopack_import__("[project]/node_modules/ol/layer/Vector.js [app-ssr] (ecmascript) <export default as Vector>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__ = __turbopack_import__("[project]/node_modules/ol/style/Style.js [app-ssr] (ecmascript) <export default as Style>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Stroke$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stroke$3e$__ = __turbopack_import__("[project]/node_modules/ol/style/Stroke.js [app-ssr] (ecmascript) <export default as Stroke>");
;
;
;
;
;
;
;
const findClosestNode = (longitude, latitude, nodesSource)=>{
    const features = nodesSource.getFeatures();
    if (!features.length) return null;
    let closestNode = null;
    let minDistance = Infinity;
    features.forEach((feature)=>{
        const properties = feature.getProperties();
        const geometry = feature.getGeometry();
        if (!geometry) return;
        let coordinates = [
            0,
            0
        ];
        // Handle different geometry types
        if (geometry instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]) {
            coordinates = geometry.getCoordinates();
        } else {
            // For other geometry types, attempt to get the first coordinate if possible
            try {
                // This is unsafe but we're checking the actual type at runtime
                const coords = geometry.getFirstCoordinate?.();
                if (coords) {
                    coordinates = coords;
                } else {
                    return; // Skip if we can't get coordinates
                }
            } catch (e) {
                return; // Skip this feature on error
            }
        }
        // Convert from EPSG:3857 to EPSG:4326
        const geoCoords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toLonLat"])(coordinates);
        // Calculate distance (simple Euclidean for now)
        const dx = longitude - geoCoords[0];
        const dy = latitude - geoCoords[1];
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) {
            minDistance = distance;
            closestNode = {
                id: properties.id || `node-${Math.random().toString(36).substring(2, 9)}`,
                name: properties.name || "Unnamed Node",
                isDestination: !!properties.isDestination,
                coordinates: geoCoords,
                description: properties.description,
                category: properties.category,
                imageUrl: properties.imageUrl
            };
        }
    });
    return closestNode;
};
const findShortestPath = (startNodeId, endNodeId, roadsSource, nodesSource)=>{
    // Build a graph from the road network
    const graph = {};
    const nodeCoordinates = {};
    // Record all node coordinates
    nodesSource.getFeatures().forEach((feature)=>{
        const props = feature.getProperties();
        const geometry = feature.getGeometry();
        if (props.id && geometry) {
            let coordinates = [
                0,
                0
            ];
            // Handle different geometry types
            if (geometry instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]) {
                coordinates = geometry.getCoordinates();
            } else {
                // Skip if not a point
                return;
            }
            nodeCoordinates[props.id] = coordinates;
            graph[props.id] = {};
        }
    });
    nodesSource.on("featuresloadend", ()=>{
        console.log("🚩 roadsystem.txt - featuresloadend triggered");
        const features = nodesSource.getFeatures();
        console.log("🚩 roadsystem.txt - features count:", features.length);
    });
    // Add edges to the graph
    roadsSource.getFeatures().forEach((feature)=>{
        const props = feature.getProperties();
        if (props.from && props.to) {
            const geometry = feature.getGeometry();
            if (!geometry) return;
            // Calculate road segment length
            let distance = 0;
            if (geometry instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$LineString$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]) {
                distance = geometry.getLength();
            } else if (geometry.getType() === "LineString") {
                try {
                    // Use type assertion for LineString
                    const lineString = geometry;
                    distance = lineString.getLength();
                } catch (error) {
                    console.error("Error calculating line length:", error);
                }
            }
            // Add to graph in both directions (assuming bidirectional roads)
            if (!graph[props.from]) graph[props.from] = {};
            if (!graph[props.to]) graph[props.to] = {};
            graph[props.from][props.to] = distance;
            graph[props.to][props.from] = distance;
        }
        console.log("😊😊Graph structure:", JSON.stringify(graph));
        console.log("Looking for path between:", startNodeId, "and", endNodeId);
        console.log("Nodes available:", Object.keys(graph));
    });
    // Check if both nodes exist in the graph
    if (!graph[startNodeId] || !graph[endNodeId]) {
        return [];
    }
    // Dijkstra's algorithm
    const distances = {};
    const previous = {};
    const unvisited = new Set();
    // Initialize
    Object.keys(graph).forEach((node)=>{
        distances[node] = node === startNodeId ? 0 : Infinity;
        previous[node] = null;
        unvisited.add(node);
    });
    // Main algorithm
    while(unvisited.size > 0){
        // Find node with minimum distance
        let current = null;
        let minDistance = Infinity;
        // Convert Set to Array for iteration to avoid TypeScript error
        Array.from(unvisited).forEach((node)=>{
            if (distances[node] < minDistance) {
                minDistance = distances[node];
                current = node;
            }
        });
        // If we can't find a node or we found the end node
        if (current === null || current === endNodeId) break;
        // Remove current from unvisited
        unvisited.delete(current);
        // Check all neighbors
        for(const neighbor in graph[current]){
            if (!unvisited.has(neighbor)) continue;
            const distance = distances[current] + graph[current][neighbor];
            if (distance < distances[neighbor]) {
                distances[neighbor] = distance;
                previous[neighbor] = current;
            }
        }
    }
    // Build the path
    const path = [];
    let current = endNodeId;
    if (previous[endNodeId] === null && startNodeId !== endNodeId) {
        // No path found
        return [];
    }
    // Construct the path
    while(current){
        path.unshift(current);
        current = previous[current] || "";
        if (current === startNodeId) {
            path.unshift(current);
            break;
        }
        if (!previous[current]) break;
    }
    // Convert path to features
    const pathFeatures = [];
    for(let i = 0; i < path.length - 1; i++){
        const fromNode = path[i];
        const toNode = path[i + 1];
        // Find the road segment between these nodes
        const roadSegment = roadsSource.getFeatures().find((feature)=>{
            const props = feature.getProperties();
            return props.from === fromNode && props.to === toNode || props.from === toNode && props.to === fromNode;
        });
        if (roadSegment) {
            pathFeatures.push(roadSegment);
        }
    }
    return pathFeatures;
};
const setupRoadSystem = (roadsUrl, nodesUrl)=>{
    // Create source for roads
    const roadsSource = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$source$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Vector$3e$__["Vector"]({
        url: roadsUrl,
        format: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$format$2f$GeoJSON$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857"
        })
    });
    // Create source for nodes/destinations
    const nodesSource = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$source$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Vector$3e$__["Vector"]({
        url: nodesUrl,
        format: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$format$2f$GeoJSON$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857"
        })
    });
    // Create layer for roads with styling
    const roadsLayer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$layer$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Vector$3e$__["Vector"]({
        source: roadsSource,
        style: (feature)=>{
            const properties = feature.getProperties();
            const roadType = properties.type || "secondary";
            // Different styling based on road type
            let color = "#555555";
            let width = 3;
            let lineDash = [];
            switch(roadType){
                case "main":
                    color = "#333333";
                    width = 5;
                    break;
                case "secondary":
                    color = "#666666";
                    width = 3;
                    break;
                case "path":
                    color = "#888888";
                    width = 2;
                    lineDash = [
                        4,
                        4
                    ];
                    break;
            }
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__["Style"]({
                stroke: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Stroke$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stroke$3e$__["Stroke"]({
                    color: color,
                    width: width,
                    lineDash: lineDash
                })
            });
        },
        zIndex: 5
    });
    // Load initial roads data
    roadsSource.on("featuresloadend", ()=>{
        const features = roadsSource.getFeatures();
    });
    // Handle potential errors loading roads
    roadsSource.on("featuresloaderror", (error)=>{});
    // Load initial nodes data
    nodesSource.on("featuresloadend", ()=>{
        const features = nodesSource.getFeatures();
        // Count destinations for debugging
        const destinations = features.filter((feature)=>{
            const props = feature.getProperties();
            return props.isDestination === true;
        });
        console.log(`✅ featuresloadend in road system triggered ${features}, total features: ${features.length}`);
        console.log(`✅ featuresloadend in road system triggered, total features: ${destinations}`);
    });
    // Handle potential errors loading nodes
    nodesSource.on("featuresloaderror", (error)=>{});
    return {
        roadsLayer,
        roadsSource,
        nodesSource
    };
};
}}),
"[externals]/ [external] (fs, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("fs");

module.exports = mod;
}}),
"[externals]/ [external] (util, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("util");

module.exports = mod;
}}),
"[externals]/ [external] (stream, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("stream");

module.exports = mod;
}}),
"[externals]/ [external] (zlib, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("zlib");

module.exports = mod;
}}),
"[externals]/ [external] (assert, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("assert");

module.exports = mod;
}}),
"[externals]/ [external] (buffer, cjs)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const mod = __turbopack_external_require__("buffer");

module.exports = mod;
}}),
"[project]/components/map/qrCodeUtils.ts [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: require } = __turbopack_context__;
{
const e = new Error(`Could not parse module '[project]/components/map/qrCodeUtils.ts'

Expression expected`);
e.code = 'MODULE_UNPARSEABLE';
throw e;}}),
"[project]/components/map/DestinationSelector.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
// CategoryGroup component wrapped in React.memo for performance
const CategoryGroup = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].memo(({ category, destinations, onSelect })=>{
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // Skip rendering empty categories
    if (destinations.length === 0) {
        return null;
    }
    // Memoize the toggle function
    const toggleExpanded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setExpanded((prev)=>!prev);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between bg-gray-100 p-2 rounded-t cursor-pointer",
                onClick: toggleExpanded,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-medium",
                        children: [
                            category,
                            " (",
                            destinations.length,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/map/DestinationSelector.tsx",
                        lineNumber: 38,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: expanded ? "▼" : "►"
                    }, void 0, false, {
                        fileName: "[project]/components/map/DestinationSelector.tsx",
                        lineNumber: 41,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/map/DestinationSelector.tsx",
                lineNumber: 34,
                columnNumber: 9
            }, this),
            expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pl-2 border-l-2 border-gray-200",
                children: destinations.map((destination)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-2 hover:bg-gray-50 cursor-pointer flex items-center",
                        onClick: ()=>onSelect(destination),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-2 h-2 bg-blue-500 rounded-full mr-2"
                            }, void 0, false, {
                                fileName: "[project]/components/map/DestinationSelector.tsx",
                                lineNumber: 52,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: destination.name
                            }, void 0, false, {
                                fileName: "[project]/components/map/DestinationSelector.tsx",
                                lineNumber: 53,
                                columnNumber: 17
                            }, this),
                            destination.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-1 text-xs text-gray-500",
                                children: [
                                    " ",
                                    "- ",
                                    destination.description.substring(0, 30),
                                    destination.description.length > 30 ? "..." : ""
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/map/DestinationSelector.tsx",
                                lineNumber: 55,
                                columnNumber: 19
                            }, this)
                        ]
                    }, destination.id, true, {
                        fileName: "[project]/components/map/DestinationSelector.tsx",
                        lineNumber: 47,
                        columnNumber: 15
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/map/DestinationSelector.tsx",
                lineNumber: 45,
                columnNumber: 11
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/map/DestinationSelector.tsx",
        lineNumber: 33,
        columnNumber: 7
    }, this);
});
// Set display name for React DevTools
CategoryGroup.displayName = "CategoryGroup";
const DestinationSelector = ({ destinations, onSelect, onClose, categories = [] })=>{
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [filteredDestinations, setFilteredDestinations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(destinations);
    // Memoize the search handler to prevent recreating it on every render
    const handleSearchChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        setSearchQuery(e.target.value);
    }, []);
    // Filter destinations based on search query - memoized
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!searchQuery.trim()) {
            setFilteredDestinations(destinations);
            return;
        }
        const query = searchQuery.toLowerCase().trim();
        const filtered = destinations.filter((dest)=>dest.name.toLowerCase().includes(query) || dest.description && dest.description.toLowerCase().includes(query) || dest.category && dest.category.toLowerCase().includes(query));
        setFilteredDestinations(filtered);
    }, [
        searchQuery,
        destinations
    ]);
    // Make sure we have the latest destinations
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setFilteredDestinations(destinations);
    }, [
        destinations
    ]);
    // Memoize the used categories
    const usedCategories = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return categories.length > 0 ? categories : Array.from(new Set(destinations.map((d)=>d.category || "Other")));
    }, [
        categories,
        destinations
    ]);
    // Memoize the destinations grouped by category
    const destinationsByCategory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const result = {};
        // Initialize empty arrays for each category
        usedCategories.forEach((category)=>{
            result[category] = [];
        });
        // Fill with filtered destinations
        filteredDestinations.forEach((dest)=>{
            const category = dest.category || "Other";
            if (!result[category]) {
                result[category] = [];
            }
            result[category].push(dest);
        });
        return result;
    }, [
        filteredDestinations,
        usedCategories
    ]);
    // Memoize the empty state component
    const EmptyState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (destinations.length === 0) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-4 bg-yellow-100 rounded-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "font-medium text-yellow-800",
                        children: "No destinations loaded"
                    }, void 0, false, {
                        fileName: "[project]/components/map/DestinationSelector.tsx",
                        lineNumber: 148,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-yellow-700 mt-1",
                        children: "Please check your data files or refresh the page."
                    }, void 0, false, {
                        fileName: "[project]/components/map/DestinationSelector.tsx",
                        lineNumber: 149,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/map/DestinationSelector.tsx",
                lineNumber: 147,
                columnNumber: 9
            }, this);
        }
        return null;
    }, [
        destinations.length
    ]);
    // Memoize the no results component
    const NoResults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (filteredDestinations.length === 0 && destinations.length > 0 && searchQuery.trim() !== "") {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center text-gray-500 py-4",
                children: [
                    'No destinations found for "',
                    searchQuery,
                    '"'
                ]
            }, void 0, true, {
                fileName: "[project]/components/map/DestinationSelector.tsx",
                lineNumber: 166,
                columnNumber: 9
            }, this);
        }
        return null;
    }, [
        filteredDestinations.length,
        destinations.length,
        searchQuery
    ]);
    // Memoize the category groups
    const CategoryGroups = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return Object.entries(destinationsByCategory).map(([category, dests])=>{
            if (dests.length === 0) return null;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CategoryGroup, {
                category: category,
                destinations: dests,
                onSelect: onSelect
            }, category, false, {
                fileName: "[project]/components/map/DestinationSelector.tsx",
                lineNumber: 180,
                columnNumber: 9
            }, this);
        });
    }, [
        destinationsByCategory,
        onSelect
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-lg shadow-lg p-4 w-80 max-h-[70vh] overflow-y-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-bold",
                        children: "Select Destination"
                    }, void 0, false, {
                        fileName: "[project]/components/map/DestinationSelector.tsx",
                        lineNumber: 193,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "text-gray-500 hover:text-gray-700",
                        onClick: onClose,
                        children: "✕"
                    }, void 0, false, {
                        fileName: "[project]/components/map/DestinationSelector.tsx",
                        lineNumber: 194,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/map/DestinationSelector.tsx",
                lineNumber: 192,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    type: "text",
                    className: "w-full px-3 py-2 border rounded-md",
                    placeholder: "Search destinations...",
                    value: searchQuery,
                    onChange: handleSearchChange
                }, void 0, false, {
                    fileName: "[project]/components/map/DestinationSelector.tsx",
                    lineNumber: 200,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/map/DestinationSelector.tsx",
                lineNumber: 199,
                columnNumber: 7
            }, this),
            EmptyState || /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    CategoryGroups,
                    NoResults
                ]
            }, void 0, true, {
                fileName: "[project]/components/map/DestinationSelector.tsx",
                lineNumber: 210,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 pt-2 border-t text-xs text-gray-500",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            "Total destinations: ",
                            destinations.length
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/map/DestinationSelector.tsx",
                        lineNumber: 218,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            "Filtered destinations: ",
                            filteredDestinations.length
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/map/DestinationSelector.tsx",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/map/DestinationSelector.tsx",
                lineNumber: 217,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/map/DestinationSelector.tsx",
        lineNumber: 191,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].memo(DestinationSelector);
}}),
"[project]/components/map/KioskQRModal.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
;
;
;
const KioskQRModal = ({ qrCodeUrl, destination, routeInfo, onClose, autoCloseTime = 60 })=>{
    const [countdown, setCountdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(autoCloseTime);
    const [isScanning, setIsScanning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const timer = setInterval(()=>{
            setCountdown((prev)=>{
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return ()=>clearInterval(timer);
    }, [
        onClose,
        autoCloseTime
    ]);
    const formattedDistance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!routeInfo) return "Unknown";
        return routeInfo.distance < 1000 ? `${Math.round(routeInfo.distance)}m` : `${(routeInfo.distance / 1000).toFixed(2)}km`;
    }, [
        routeInfo
    ]);
    const formattedTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!routeInfo) return "Unknown";
        const minutes = Math.ceil(routeInfo.estimatedTime);
        return minutes === 1 ? "1 min" : `${minutes} mins`;
    }, [
        routeInfo
    ]);
    const calories = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!routeInfo) return 0;
        return Math.round(routeInfo.distance / 1000 * 65);
    }, [
        routeInfo
    ]);
    const progressPercent = (autoCloseTime - countdown) / autoCloseTime * 100;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: {
                opacity: 0
            },
            animate: {
                opacity: 1
            },
            exit: {
                opacity: 0
            },
            className: "fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-md",
            onClick: (e)=>e.target === e.currentTarget && onClose(),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    scale: 0.9,
                    opacity: 0,
                    y: 20
                },
                animate: {
                    scale: 1,
                    opacity: 1,
                    y: 0
                },
                exit: {
                    scale: 0.9,
                    opacity: 0,
                    y: 20
                },
                transition: {
                    type: "spring",
                    damping: 25,
                    stiffness: 300
                },
                className: "max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden mx-4 relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 left-0 right-0 h-1 bg-gray-200",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            className: "h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
                            initial: {
                                width: 0
                            },
                            animate: {
                                width: `${progressPercent}%`
                            },
                            transition: {
                                duration: 0.5
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/map/KioskQRModal.tsx",
                            lineNumber: 79,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/map/KioskQRModal.tsx",
                        lineNumber: 78,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 p-6 relative overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 opacity-10",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"
                                }, void 0, false, {
                                    fileName: "[project]/components/map/KioskQRModal.tsx",
                                    lineNumber: 90,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                lineNumber: 89,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative z-10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between items-start mb-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].h2, {
                                                        initial: {
                                                            x: -20,
                                                            opacity: 0
                                                        },
                                                        animate: {
                                                            x: 0,
                                                            opacity: 1
                                                        },
                                                        transition: {
                                                            delay: 0.1
                                                        },
                                                        className: "text-3xl font-bold text-white mb-2",
                                                        children: [
                                                            "Navigate to ",
                                                            destination.name
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                                        lineNumber: 96,
                                                        columnNumber: 19
                                                    }, this),
                                                    destination.category && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                                        initial: {
                                                            x: -20,
                                                            opacity: 0
                                                        },
                                                        animate: {
                                                            x: 0,
                                                            opacity: 1
                                                        },
                                                        transition: {
                                                            delay: 0.2
                                                        },
                                                        className: "inline-flex items-center px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                                lineNumber: 111,
                                                                columnNumber: 23
                                                            }, this),
                                                            destination.category
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                                        lineNumber: 105,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                lineNumber: 95,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                                initial: {
                                                    scale: 0
                                                },
                                                animate: {
                                                    scale: 1
                                                },
                                                transition: {
                                                    delay: 0.3,
                                                    type: "spring"
                                                },
                                                className: "flex flex-col items-end",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-white font-semibold mb-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-2xl",
                                                            children: [
                                                                countdown,
                                                                "s"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/map/KioskQRModal.tsx",
                                                            lineNumber: 124,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs opacity-80",
                                                            children: "Auto-closing"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/map/KioskQRModal.tsx",
                                                            lineNumber: 125,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/map/KioskQRModal.tsx",
                                                    lineNumber: 123,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                lineNumber: 117,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                        lineNumber: 94,
                                        columnNumber: 15
                                    }, this),
                                    destination.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].p, {
                                        initial: {
                                            y: 10,
                                            opacity: 0
                                        },
                                        animate: {
                                            y: 0,
                                            opacity: 1
                                        },
                                        transition: {
                                            delay: 0.3
                                        },
                                        className: "text-white/90 text-sm max-w-2xl",
                                        children: destination.description
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                        lineNumber: 131,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                lineNumber: 93,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/map/KioskQRModal.tsx",
                        lineNumber: 88,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid md:grid-cols-2 gap-8 items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            x: -30,
                                            opacity: 0
                                        },
                                        animate: {
                                            x: 0,
                                            opacity: 1
                                        },
                                        transition: {
                                            delay: 0.4
                                        },
                                        className: "relative",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                                        lineNumber: 155,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "relative bg-white p-6 rounded-2xl shadow-xl",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].img, {
                                                                src: qrCodeUrl,
                                                                alt: "Route QR Code",
                                                                className: "w-full h-auto object-contain",
                                                                whileHover: {
                                                                    scale: 1.05
                                                                },
                                                                transition: {
                                                                    type: "spring",
                                                                    stiffness: 300
                                                                },
                                                                onMouseEnter: ()=>setIsScanning(true),
                                                                onMouseLeave: ()=>setIsScanning(false)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                                lineNumber: 159,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                                                children: isScanning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                    initial: {
                                                                        top: 0,
                                                                        opacity: 0
                                                                    },
                                                                    animate: {
                                                                        top: "100%",
                                                                        opacity: [
                                                                            0,
                                                                            1,
                                                                            0
                                                                        ]
                                                                    },
                                                                    exit: {
                                                                        opacity: 0
                                                                    },
                                                                    transition: {
                                                                        duration: 2,
                                                                        repeat: Infinity
                                                                    },
                                                                    className: "absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/map/KioskQRModal.tsx",
                                                                    lineNumber: 172,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                                lineNumber: 170,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                                        lineNumber: 158,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                                        lineNumber: 184,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-2xl"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                                        lineNumber: 185,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-2xl"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                                        lineNumber: 186,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-pink-500 rounded-br-2xl"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                                        lineNumber: 187,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                lineNumber: 153,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                                initial: {
                                                    y: 10,
                                                    opacity: 0
                                                },
                                                animate: {
                                                    y: 0,
                                                    opacity: 1
                                                },
                                                transition: {
                                                    delay: 0.6
                                                },
                                                className: "mt-4 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-medium text-gray-700",
                                                    children: "📱 Position your camera over the QR code"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/map/KioskQRModal.tsx",
                                                    lineNumber: 196,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                lineNumber: 190,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                        lineNumber: 147,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            x: 30,
                                            opacity: 0
                                        },
                                        animate: {
                                            x: 0,
                                            opacity: 1
                                        },
                                        transition: {
                                            delay: 0.4
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-2xl font-bold text-gray-800 mb-4 flex items-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mr-3",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            className: "w-6 h-6",
                                                            fill: "none",
                                                            viewBox: "0 0 24 24",
                                                            stroke: "currentColor",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                strokeLinecap: "round",
                                                                strokeLinejoin: "round",
                                                                strokeWidth: 2,
                                                                d: "M13 10V3L4 14h7v7l9-11h-7z"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                                lineNumber: 211,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/map/KioskQRModal.tsx",
                                                            lineNumber: 210,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                                        lineNumber: 209,
                                                        columnNumber: 19
                                                    }, this),
                                                    "Quick Start Guide"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                lineNumber: 208,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-3",
                                                children: [
                                                    {
                                                        icon: "📱",
                                                        title: "Open Camera",
                                                        desc: "Launch your phone's camera app"
                                                    },
                                                    {
                                                        icon: "🎯",
                                                        title: "Point & Scan",
                                                        desc: "Aim at the QR code above"
                                                    },
                                                    {
                                                        icon: "🔔",
                                                        title: "Tap Notification",
                                                        desc: "Click the banner that appears"
                                                    },
                                                    {
                                                        icon: "🗺️",
                                                        title: "Navigate",
                                                        desc: "Follow live directions on your phone"
                                                    }
                                                ].map((step, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                                        initial: {
                                                            x: 20,
                                                            opacity: 0
                                                        },
                                                        animate: {
                                                            x: 0,
                                                            opacity: 1
                                                        },
                                                        transition: {
                                                            delay: 0.5 + index * 0.1
                                                        },
                                                        className: "flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow group",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform",
                                                                children: step.icon
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                                lineNumber: 231,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "font-semibold text-gray-800",
                                                                        children: step.title
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                                                        lineNumber: 235,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-sm text-gray-600",
                                                                        children: step.desc
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                                                        lineNumber: 236,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                                lineNumber: 234,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm",
                                                                children: index + 1
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                                lineNumber: 238,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, index, true, {
                                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                                        lineNumber: 224,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                lineNumber: 217,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                                initial: {
                                                    y: 10,
                                                    opacity: 0
                                                },
                                                animate: {
                                                    y: 0,
                                                    opacity: 1
                                                },
                                                transition: {
                                                    delay: 0.9
                                                },
                                                className: "mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-amber-800 flex items-center",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            className: "w-5 h-5 mr-2",
                                                            fill: "currentColor",
                                                            viewBox: "0 0 20 20",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                fillRule: "evenodd",
                                                                d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z",
                                                                clipRule: "evenodd"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                                lineNumber: 253,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/map/KioskQRModal.tsx",
                                                            lineNumber: 252,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: "Don't forget your phone!"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/map/KioskQRModal.tsx",
                                                            lineNumber: 255,
                                                            columnNumber: 21
                                                        }, this),
                                                        " Keep it with you during navigation."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/map/KioskQRModal.tsx",
                                                    lineNumber: 251,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                lineNumber: 245,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                        lineNumber: 203,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                lineNumber: 145,
                                columnNumber: 13
                            }, this),
                            routeInfo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                initial: {
                                    y: 20,
                                    opacity: 0
                                },
                                animate: {
                                    y: 0,
                                    opacity: 1
                                },
                                transition: {
                                    delay: 0.7
                                },
                                className: "mt-8 grid grid-cols-3 gap-4",
                                children: [
                                    {
                                        label: "Distance",
                                        value: formattedDistance,
                                        icon: "🏃",
                                        color: "from-blue-500 to-blue-600"
                                    },
                                    {
                                        label: "Walking Time",
                                        value: formattedTime,
                                        icon: "⏱️",
                                        color: "from-purple-500 to-purple-600"
                                    },
                                    {
                                        label: "Calories",
                                        value: `${calories} cal`,
                                        icon: "🔥",
                                        color: "from-pink-500 to-pink-600"
                                    }
                                ].map((stat, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        whileHover: {
                                            scale: 1.05,
                                            y: -5
                                        },
                                        className: `bg-gradient-to-br ${stat.color} p-5 rounded-2xl text-white shadow-lg relative overflow-hidden group`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"
                                            }, void 0, false, {
                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                lineNumber: 279,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative z-10",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-3xl mb-2",
                                                        children: stat.icon
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                                        lineNumber: 281,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs opacity-90 mb-1",
                                                        children: stat.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                                        lineNumber: 282,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-2xl font-bold",
                                                        children: stat.value
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                                        lineNumber: 283,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                                lineNumber: 280,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, index, true, {
                                        fileName: "[project]/components/map/KioskQRModal.tsx",
                                        lineNumber: 274,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                lineNumber: 263,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/map/KioskQRModal.tsx",
                        lineNumber: 144,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 flex justify-between items-center border-t border-gray-200",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].p, {
                                initial: {
                                    opacity: 0
                                },
                                animate: {
                                    opacity: 1
                                },
                                transition: {
                                    delay: 0.8
                                },
                                className: "text-sm text-gray-600 italic",
                                children: "🔄 Map resets automatically for the next user"
                            }, void 0, false, {
                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                lineNumber: 293,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                whileHover: {
                                    scale: 1.05
                                },
                                whileTap: {
                                    scale: 0.95
                                },
                                onClick: onClose,
                                className: "px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow",
                                children: [
                                    "Close (",
                                    countdown,
                                    "s)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/map/KioskQRModal.tsx",
                                lineNumber: 302,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/map/KioskQRModal.tsx",
                        lineNumber: 292,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/map/KioskQRModal.tsx",
                lineNumber: 70,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/map/KioskQRModal.tsx",
            lineNumber: 63,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/map/KioskQRModal.tsx",
        lineNumber: 62,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].memo(KioskQRModal);
}}),
"[project]/components/map/RouteOverlay.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
const RouteOverlay = ({ startNode, endNode, routeInfo, onCancel, onGenerateQR, isLoading = false })=>{
    if (!startNode || !endNode) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute bottom-4 left-4 right-4 mx-auto w-80 bg-white bg-opacity-95 p-4 rounded-lg shadow-lg z-30",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex space-x-2",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors",
                onClick: onGenerateQR,
                disabled: isLoading,
                children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                        }, void 0, false, {
                            fileName: "[project]/components/map/RouteOverlay.tsx",
                            lineNumber: 36,
                            columnNumber: 15
                        }, this),
                        "Generating..."
                    ]
                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            xmlns: "http://www.w3.org/2000/svg",
                            className: "h-5 w-5 mr-1.5",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                            }, void 0, false, {
                                fileName: "[project]/components/map/RouteOverlay.tsx",
                                lineNumber: 48,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/map/RouteOverlay.tsx",
                            lineNumber: 41,
                            columnNumber: 15
                        }, this),
                        "Generate QR"
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/components/map/RouteOverlay.tsx",
                lineNumber: 29,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/map/RouteOverlay.tsx",
            lineNumber: 28,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/map/RouteOverlay.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = RouteOverlay;
}}),
"[project]/components/map/EnhancedMobileRoutePanel.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
;
;
;
const EnhancedMobileRoutePanel = ({ destination, currentLocation, routeInfo, routeProgress, onClose })=>{
    const [showDirections, setShowDirections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isPanelExpanded, setIsPanelExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dragY, setDragY] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const formatDistance = (meters)=>{
        if (meters < 1000) {
            return `${Math.round(meters)}m`;
        }
        return `${(meters / 1000).toFixed(2)}km`;
    };
    const formatTime = (seconds)=>{
        if (seconds < 60) {
            return "< 1 min";
        }
        const minutes = Math.ceil(seconds / 60);
        return minutes === 1 ? "1 min" : `${minutes} mins`;
    };
    const formatBearing = (degrees)=>{
        if (degrees === null) return "N";
        const directions = [
            "N",
            "NE",
            "E",
            "SE",
            "S",
            "SW",
            "W",
            "NW"
        ];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    };
    const etaTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!routeProgress?.estimatedTimeRemaining) {
            return "";
        }
        const now = new Date();
        const eta = new Date(now.getTime() + routeProgress.estimatedTimeRemaining * 1000);
        return eta.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }, [
        routeProgress?.estimatedTimeRemaining
    ]);
    const displayDistance = routeProgress?.distanceToDestination ?? routeInfo?.distance ?? 0;
    const displayTime = routeProgress?.estimatedTimeRemaining ?? (routeInfo?.estimatedTime ? routeInfo.estimatedTime * 60 : 0);
    const percentComplete = routeProgress?.percentComplete ?? 0;
    const handleDrag = (_, info)=>{
        setDragY(info.offset.y);
    };
    const handleDragEnd = (_, info)=>{
        if (info.offset.y > 100 && onClose) {
            onClose();
        }
        setDragY(0);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
        drag: "y",
        dragConstraints: {
            top: 0,
            bottom: 300
        },
        dragElastic: 0.2,
        onDrag: handleDrag,
        onDragEnd: handleDragEnd,
        initial: {
            y: "100%"
        },
        animate: {
            y: 0
        },
        exit: {
            y: "100%"
        },
        transition: {
            type: "spring",
            damping: 30,
            stiffness: 300
        },
        className: "fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 rounded-t-3xl max-h-[85vh] overflow-hidden",
        style: {
            boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.2)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full flex justify-center py-3 cursor-grab active:cursor-grabbing bg-gradient-to-b from-gray-50 to-white",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    animate: {
                        scaleX: dragY > 0 ? 1.5 : 1
                    },
                    className: "w-12 h-1.5 bg-gray-300 rounded-full"
                }, void 0, false, {
                    fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                    lineNumber: 92,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                lineNumber: 91,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-4 pb-4 max-h-[calc(85vh-3rem)] overflow-y-auto",
                children: [
                    routeProgress && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            y: -10
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        className: "mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                    className: "absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full",
                                    initial: {
                                        width: 0
                                    },
                                    animate: {
                                        width: `${Math.min(100, percentComplete)}%`
                                    },
                                    transition: {
                                        duration: 0.5,
                                        ease: "easeOut"
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0 bg-white/30 animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                        lineNumber: 114,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                    lineNumber: 108,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                lineNumber: 107,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between mt-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                                        initial: {
                                            opacity: 0
                                        },
                                        animate: {
                                            opacity: 1
                                        },
                                        transition: {
                                            delay: 0.2
                                        },
                                        className: "text-xs font-semibold text-blue-600",
                                        children: [
                                            percentComplete.toFixed(0),
                                            "% Complete"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                        lineNumber: 118,
                                        columnNumber: 15
                                    }, this),
                                    etaTime && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                                        initial: {
                                            opacity: 0
                                        },
                                        animate: {
                                            opacity: 1
                                        },
                                        transition: {
                                            delay: 0.3
                                        },
                                        className: "text-xs font-semibold text-purple-600",
                                        children: [
                                            "ETA: ",
                                            etaTime
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                        lineNumber: 127,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                lineNumber: 117,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                        lineNumber: 102,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                        children: routeProgress?.isOffRoute && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                y: -20,
                                scale: 0.9
                            },
                            animate: {
                                opacity: 1,
                                y: 0,
                                scale: 1
                            },
                            exit: {
                                opacity: 0,
                                y: -20,
                                scale: 0.9
                            },
                            className: "mb-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-2xl flex items-center shadow-lg",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                    animate: {
                                        rotate: [
                                            0,
                                            10,
                                            -10,
                                            0
                                        ]
                                    },
                                    transition: {
                                        repeat: Infinity,
                                        duration: 2
                                    },
                                    className: "text-3xl mr-3",
                                    children: "⚠️"
                                }, void 0, false, {
                                    fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                    lineNumber: 149,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-bold text-orange-900",
                                            children: "You're off the route!"
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                            lineNumber: 157,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-orange-700",
                                            children: [
                                                formatDistance(routeProgress.distanceFromRoute),
                                                " away from path"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                            lineNumber: 160,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                    lineNumber: 156,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                            lineNumber: 143,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            y: 10
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            delay: 0.1
                        },
                        className: "mb-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center mb-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                    animate: {
                                        scale: [
                                            1,
                                            1.1,
                                            1
                                        ]
                                    },
                                    transition: {
                                        repeat: Infinity,
                                        duration: 2
                                    },
                                    className: "w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg mr-3",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-6 h-6",
                                        fill: "currentColor",
                                        viewBox: "0 0 20 20",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            fillRule: "evenodd",
                                            d: "M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z",
                                            clipRule: "evenodd"
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                            lineNumber: 182,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                        lineNumber: 181,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                    lineNumber: 176,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-2xl font-bold text-gray-900 leading-tight",
                                            children: destination.name
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                            lineNumber: 186,
                                            columnNumber: 15
                                        }, this),
                                        destination.category && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mt-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                                    lineNumber: 191,
                                                    columnNumber: 19
                                                }, this),
                                                destination.category
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                            lineNumber: 190,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                    lineNumber: 185,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                            lineNumber: 175,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                        lineNumber: 169,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: 1
                        },
                        transition: {
                            delay: 0.2
                        },
                        className: "grid grid-cols-3 gap-3 mb-4",
                        children: [
                            {
                                label: "Distance",
                                value: formatDistance(displayDistance),
                                icon: "🎯",
                                gradient: "from-blue-500 to-blue-600",
                                bgGradient: "from-blue-50 to-blue-100"
                            },
                            {
                                label: "Time",
                                value: formatTime(displayTime),
                                icon: "⏱️",
                                gradient: "from-purple-500 to-purple-600",
                                bgGradient: "from-purple-50 to-purple-100"
                            },
                            {
                                label: "Direction",
                                value: formatBearing(routeProgress?.bearingToNextWaypoint ?? null),
                                icon: "🧭",
                                gradient: "from-pink-500 to-pink-600",
                                bgGradient: "from-pink-50 to-pink-100"
                            }
                        ].map((metric, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                initial: {
                                    scale: 0,
                                    opacity: 0
                                },
                                animate: {
                                    scale: 1,
                                    opacity: 1
                                },
                                transition: {
                                    delay: 0.3 + index * 0.1,
                                    type: "spring"
                                },
                                whileHover: {
                                    scale: 1.05,
                                    y: -5
                                },
                                className: `bg-gradient-to-br ${metric.bgGradient} rounded-2xl p-4 shadow-md relative overflow-hidden`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${metric.gradient} opacity-10 rounded-bl-full`
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                        lineNumber: 219,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative z-10",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl mb-1",
                                                children: metric.icon
                                            }, void 0, false, {
                                                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                                lineNumber: 221,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-gray-600 mb-1 font-medium",
                                                children: metric.label
                                            }, void 0, false, {
                                                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                                lineNumber: 222,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-lg font-bold text-gray-900",
                                                children: metric.value
                                            }, void 0, false, {
                                                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                                lineNumber: 223,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                        lineNumber: 220,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, index, true, {
                                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                lineNumber: 211,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                        lineNumber: 200,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                        children: isPanelExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                height: 0
                            },
                            animate: {
                                opacity: 1,
                                height: "auto"
                            },
                            exit: {
                                opacity: 0,
                                height: 0
                            },
                            transition: {
                                duration: 0.3
                            },
                            className: "border-t border-gray-200 pt-4 mb-4 overflow-hidden",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-3",
                                children: [
                                    {
                                        label: "Traveled",
                                        value: formatDistance(routeProgress?.distanceTraveled ?? 0),
                                        icon: "📍"
                                    },
                                    {
                                        label: "Calories",
                                        value: `${Math.round((routeProgress?.distanceTraveled ?? 0) / 1000 * 65)} cal`,
                                        icon: "🔥"
                                    },
                                    {
                                        label: "Location",
                                        value: currentLocation?.name ?? "Locating...",
                                        icon: "📌"
                                    },
                                    {
                                        label: "Next Point",
                                        value: formatDistance(routeProgress?.distanceToNextWaypoint ?? 0),
                                        icon: "➡️"
                                    }
                                ].map((stat, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            y: 20
                                        },
                                        animate: {
                                            opacity: 1,
                                            y: 0
                                        },
                                        transition: {
                                            delay: index * 0.1
                                        },
                                        className: "bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 shadow-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center mb-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-lg mr-2",
                                                        children: stat.icon
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                                        lineNumber: 254,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-gray-600 font-medium",
                                                        children: stat.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                                        lineNumber: 255,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                                lineNumber: 253,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "font-bold text-gray-900 truncate",
                                                children: stat.value
                                            }, void 0, false, {
                                                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                                lineNumber: 257,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, index, true, {
                                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                        lineNumber: 246,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                lineNumber: 239,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                            lineNumber: 232,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                        lineNumber: 230,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2 mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                whileHover: {
                                    scale: 1.02
                                },
                                whileTap: {
                                    scale: 0.98
                                },
                                onClick: ()=>setShowDirections(!showDirections),
                                className: `flex-1 py-3 px-4 rounded-2xl font-semibold transition-all shadow-md ${showDirections ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700"}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-5 h-5 mr-2",
                                            fill: "none",
                                            viewBox: "0 0 24 24",
                                            stroke: "currentColor",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                            }, void 0, false, {
                                                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                                lineNumber: 279,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                            lineNumber: 278,
                                            columnNumber: 15
                                        }, this),
                                        showDirections ? "Hide" : "Show",
                                        " Steps"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                    lineNumber: 277,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                lineNumber: 267,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                whileHover: {
                                    scale: 1.02
                                },
                                whileTap: {
                                    scale: 0.98
                                },
                                onClick: ()=>setIsPanelExpanded(!isPanelExpanded),
                                className: "px-4 py-3 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold shadow-md",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: `w-6 h-6 transition-transform ${isPanelExpanded ? "rotate-180" : ""}`,
                                    fill: "none",
                                    viewBox: "0 0 24 24",
                                    stroke: "currentColor",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        strokeWidth: 2,
                                        d: "M19 9l-7 7-7-7"
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                        lineNumber: 292,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                    lineNumber: 291,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                lineNumber: 285,
                                columnNumber: 11
                            }, this),
                            onClose && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].button, {
                                whileHover: {
                                    scale: 1.02
                                },
                                whileTap: {
                                    scale: 0.98
                                },
                                onClick: onClose,
                                className: "px-4 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow-lg",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "w-6 h-6",
                                    fill: "none",
                                    viewBox: "0 0 24 24",
                                    stroke: "currentColor",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        strokeWidth: 2,
                                        d: "M6 18L18 6M6 6l12 12"
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                        lineNumber: 304,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                    lineNumber: 303,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                lineNumber: 297,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                        lineNumber: 266,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                        children: showDirections && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                height: 0
                            },
                            animate: {
                                opacity: 1,
                                height: "auto"
                            },
                            exit: {
                                opacity: 0,
                                height: 0
                            },
                            transition: {
                                duration: 0.3
                            },
                            className: "border-t border-gray-200 pt-4 overflow-hidden",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mr-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-6 h-6",
                                                fill: "none",
                                                viewBox: "0 0 24 24",
                                                stroke: "currentColor",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: 2,
                                                    d: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                                    lineNumber: 323,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                                lineNumber: 322,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                            lineNumber: 321,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-bold text-gray-900 text-lg",
                                            children: "Navigation Steps"
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                            lineNumber: 326,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                    lineNumber: 320,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3 max-h-64 overflow-y-auto pr-2",
                                    children: [
                                        {
                                            step: 1,
                                            title: `Start at ${currentLocation?.name ?? "current location"}`,
                                            desc: `Head ${formatBearing(routeProgress?.bearingToNextWaypoint ?? null)} toward ${destination.name}`,
                                            icon: "🟢",
                                            color: "green"
                                        },
                                        {
                                            step: 2,
                                            title: "Follow the highlighted path",
                                            desc: routeProgress?.isOffRoute ? "⚠️ Return to the marked route" : `Continue for ${formatDistance(displayDistance * 0.6)}`,
                                            icon: "🔵",
                                            color: "blue"
                                        },
                                        {
                                            step: 3,
                                            title: `Arrive at ${destination.name}`,
                                            desc: destination.description ?? "Your destination",
                                            icon: "🔴",
                                            color: "red"
                                        }
                                    ].map((navStep, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                                            initial: {
                                                x: -20,
                                                opacity: 0
                                            },
                                            animate: {
                                                x: 0,
                                                opacity: 1
                                            },
                                            transition: {
                                                delay: index * 0.1
                                            },
                                            className: `flex items-start p-4 bg-gradient-to-r from-${navStep.color}-50 to-${navStep.color}-100 rounded-2xl shadow-sm border border-${navStep.color}-200`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-3xl mr-3",
                                                    children: navStep.icon
                                                }, void 0, false, {
                                                    fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                                    lineNumber: 342,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "font-bold text-gray-900 mb-1",
                                                            children: navStep.title
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                                            lineNumber: 344,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-gray-700",
                                                            children: navStep.desc
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                                            lineNumber: 345,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                                    lineNumber: 343,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `w-8 h-8 bg-${navStep.color}-500 rounded-full flex items-center justify-center text-white font-bold shadow-md`,
                                                    children: navStep.step
                                                }, void 0, false, {
                                                    fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                                    lineNumber: 347,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, index, true, {
                                            fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                            lineNumber: 335,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                                    lineNumber: 329,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                            lineNumber: 313,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                        lineNumber: 311,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                lineNumber: 99,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    scale: 0,
                    opacity: 0
                },
                animate: {
                    scale: 1,
                    opacity: 1
                },
                transition: {
                    delay: 0.5,
                    type: "spring"
                },
                className: "absolute top-6 right-4 flex items-center bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].span, {
                        animate: {
                            scale: [
                                1,
                                1.2,
                                1
                            ]
                        },
                        transition: {
                            repeat: Infinity,
                            duration: 1.5
                        },
                        className: "w-2 h-2 bg-white rounded-full mr-2"
                    }, void 0, false, {
                        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                        lineNumber: 365,
                        columnNumber: 9
                    }, this),
                    "LIVE"
                ]
            }, void 0, true, {
                fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
                lineNumber: 359,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/map/EnhancedMobileRoutePanel.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = EnhancedMobileRoutePanel;
}}),
"[project]/components/map/MapComponent.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/ol/proj.js [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$routeProcessor$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/components/map/routeProcessor.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$layers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/components/map/layers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$locationTracking$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/components/map/locationTracking.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$enhancedLocationTracking$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/components/map/enhancedLocationTracking.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$editControls$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/components/map/editControls.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$components$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/components/map/components.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$roadSystem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/components/map/roadSystem.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$qrCodeUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/components/map/qrCodeUtils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$DestinationSelector$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/components/map/DestinationSelector.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$KioskQRModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/components/map/KioskQRModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$RouteOverlay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/components/map/RouteOverlay.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$EnhancedMobileRoutePanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/components/map/EnhancedMobileRoutePanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/router.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/geom/Point.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_import__("[project]/node_modules/ol/proj.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$source$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Vector$3e$__ = __turbopack_import__("[project]/node_modules/ol/source/Vector.js [app-ssr] (ecmascript) <export default as Vector>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$layer$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Vector$3e$__ = __turbopack_import__("[project]/node_modules/ol/layer/Vector.js [app-ssr] (ecmascript) <export default as Vector>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__ = __turbopack_import__("[project]/node_modules/ol/style/Style.js [app-ssr] (ecmascript) <export default as Style>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Stroke$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stroke$3e$__ = __turbopack_import__("[project]/node_modules/ol/style/Stroke.js [app-ssr] (ecmascript) <export default as Stroke>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/ol/extent.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const CampusMap = ({ mapUrl = "/UCLM_Map.geojson", pointsUrl = "/UCLM_Points.geojson", roadsUrl = "/UCLM_Roads.geojson", nodesUrl = "/UCLM_Nodes.geojson", backdropColor = "#f7f2e4", initialZoom = 15, centerCoordinates = [
    123.9545,
    10.3265
], routeData, mobileMode = false, debug = false, searchParams })=>{
    const routerSearchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const effectiveSearchParams = searchParams || routerSearchParams;
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isEditMode, setIsEditMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [drawType, setDrawType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loadingState, setLoadingState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    // Feature customization state
    const [showCustomizePanel, setShowCustomizePanel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedFeature, setSelectedFeature] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [featureProperties, setFeatureProperties] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const markerSizeOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            "small",
            "medium",
            "large"
        ], []);
    // Road system and navigation state
    const [showDestinationSelector, setShowDestinationSelector] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [destinations, setDestinations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedDestination, setSelectedDestination] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentLocation, setCurrentLocation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeRoute, setActiveRoute] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showRouteOverlay, setShowRouteOverlay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [routeInfo, setRouteInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const allFeaturesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])([]);
    // User location permission state
    const [locationPermissionRequested, setLocationPermissionRequested] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [locationTrackingEnabled, setLocationTrackingEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [defaultStartLocation, setDefaultStartLocation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const { qrCodeUrl, showQRModal, isGenerating, error, generateRouteQRCode, closeQRModal, resetKiosk } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$qrCodeUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useKioskRouteManager"])({
        currentLocation,
        selectedDestination,
        routeInfo,
        defaultStartLocation
    });
    // Map instance and source references
    const mapInstanceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const vectorSourceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const pointsSourceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const drawInteractionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const modifyInteractionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const selectInteractionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Road system references
    const roadsSourceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const nodesSourceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const routeLayerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Store UI in refs to minimize re-renders
    const locationErrorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [locationError, setLocationError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const isOutsideSchoolRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [isOutsideSchool, setIsOutsideSchool] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const schoolBoundaryRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const updatePositionTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastValidCenterRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const expandedExtentRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isUpdatingPositionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const locationWatchIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const locationNodeIntervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Enhanced location tracking
    const enhancedTrackerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [routeProgress, setRouteProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [userPosition, setUserPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [useEnhancedTracking, setUseEnhancedTracking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const requestLocationPermission = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setLocationPermissionRequested(true);
        // This will now be in response to a user gesture
        navigator.geolocation.getCurrentPosition(()=>{
            // Start location tracking now that we have permission
            const cleanup = initLocationTracking();
            return ()=>{
                if (cleanup) cleanup();
            };
        }, (error)=>{
            console.error("Location permission denied", error);
            setLocationError("Location permission denied. Using default entry point for navigation.");
        });
    }, []);
    const initLocationTracking = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!mapInstanceRef.current) return undefined;
        setLocationTrackingEnabled(true);
        // Use enhanced tracking for mobile mode
        if (mobileMode && useEnhancedTracking) {
            // Create enhanced tracker
            const tracker = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$enhancedLocationTracking$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setupEnhancedLocationTracking"])(mapInstanceRef.current, {
                autoFollow: true,
                rotateMap: true,
                smoothAnimation: true,
                animationDuration: 1000,
                zoomLevel: 19,
                showAccuracyCircle: true,
                showDirectionArrow: true,
                trackingMode: "route"
            }, locationErrorRef, isOutsideSchoolRef, schoolBoundaryRef);
            enhancedTrackerRef.current = tracker;
            // Start tracking with callbacks
            tracker.startTracking((position)=>{
                setUserPosition(position);
                // Update current location node
                if (nodesSourceRef.current) {
                    const closestNode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$roadSystem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findClosestNode"])(position.coordinates[0], position.coordinates[1], nodesSourceRef.current);
                    if (closestNode && (!currentLocation || closestNode.id !== currentLocation.id)) {
                        setCurrentLocation(closestNode);
                        // If there's an active destination, update the route
                        if (selectedDestination) {
                            displayRoute(closestNode.id, selectedDestination.id);
                        }
                    }
                }
            }, (progress)=>{
                setRouteProgress(progress);
            });
            // Return cleanup function
            return ()=>{
                if (enhancedTrackerRef.current) {
                    enhancedTrackerRef.current.stopTracking();
                    enhancedTrackerRef.current.destroy();
                    enhancedTrackerRef.current = null;
                }
            };
        } else {
            // Use standard tracking for desktop
            const { watchId, userPositionFeature } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$locationTracking$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setupLocationTracking"])(mapInstanceRef.current, locationErrorRef, isOutsideSchoolRef, schoolBoundaryRef, isUpdatingPositionRef);
            locationWatchIdRef.current = watchId;
            // Update current location node when user position changes
            const updateCurrentLocationNode = ()=>{
                if (!userPositionFeature || !nodesSourceRef.current || isUpdatingPositionRef.current) return;
                const geometry = userPositionFeature.getGeometry();
                if (!geometry) return;
                const coords = geometry.getFirstCoordinate ? geometry.getFirstCoordinate() : geometry instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] ? geometry.getCoordinates() : null;
                if (!coords) return;
                // Convert to geo coordinates
                const geoCoords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toLonLat"])(coords);
                // Find the closest node
                const closestNode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$roadSystem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findClosestNode"])(geoCoords[0], geoCoords[1], nodesSourceRef.current);
                if (closestNode && (!currentLocation || closestNode.id !== currentLocation.id)) {
                    setCurrentLocation(closestNode);
                    // If there's an active destination, update the route
                    if (selectedDestination) {
                        displayRoute(closestNode.id, selectedDestination.id);
                    }
                }
            };
            // Set up timer to update current location node
            const locationNodeInterval = setInterval(updateCurrentLocationNode, 3000);
            locationNodeIntervalRef.current = locationNodeInterval;
            // Return cleanup function
            return ()=>{
                if (locationWatchIdRef.current) {
                    navigator.geolocation.clearWatch(locationWatchIdRef.current);
                    locationWatchIdRef.current = null;
                }
                if (locationNodeIntervalRef.current) {
                    clearInterval(locationNodeIntervalRef.current);
                    locationNodeIntervalRef.current = null;
                }
            };
        }
    }, [
        currentLocation,
        selectedDestination,
        mobileMode,
        useEnhancedTracking
    ]);
    const getFeatureCoordinates = (feature)=>{
        const geometry = feature.getGeometry();
        if (geometry && geometry instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]) {
            const coords = geometry.getCoordinates();
            const geoCoords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toLonLat"])(coords);
            // Explicitly cast to [number, number] tuple
            return geoCoords;
        }
        return [
            0,
            0
        ]; // Default coordinates as tuple
    };
    // Helper function to process the route data
    const processRouteData = (routeData)=>{
        // Check if sources are available
        if (!nodesSourceRef.current) {
            console.error("Nodes source not initialized");
            return;
        }
        // Find start and end nodes
        const startNodeId = routeData.startNodeId;
        const endNodeId = routeData.endNodeId;
        console.log(`Processing route from ${startNodeId} to ${endNodeId}`);
        const features = nodesSourceRef.current.getFeatures();
        const startFeature = features.find((f)=>f.get("id") === startNodeId);
        const endFeature = features.find((f)=>f.get("id") === endNodeId);
        if (!startFeature || !endFeature) {
            console.error("Could not find start or end node features");
            return;
        }
        // Create node objects
        const startNode = {
            id: startFeature.get("id"),
            name: startFeature.get("name") || "Start",
            isDestination: true,
            coordinates: getFeatureCoordinates(startFeature),
            category: startFeature.get("category")
        };
        const endNode = {
            id: endFeature.get("id"),
            name: endFeature.get("name") || "Destination",
            isDestination: true,
            coordinates: getFeatureCoordinates(endFeature),
            category: endFeature.get("category")
        };
        // Set nodes in state
        setCurrentLocation(startNode);
        setSelectedDestination(endNode);
        // Find and display route
        displayRoute(startNode.id, endNode.id);
        // Set route UI to visible
        setShowRouteOverlay(true);
        // Set route info if available
        if (routeData.routeInfo) {
            setRouteInfo(routeData.routeInfo);
        }
    };
    // Update feature property
    const updateFeatureProperty = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((property, value)=>{
        if (!selectedFeature) return;
        selectedFeature.set(property, value);
        // Update local state to reflect changes
        setFeatureProperties((prev)=>({
                ...prev,
                [property]: value
            }));
    }, [
        selectedFeature
    ]);
    // Handle destination selection
    const handleDestinationSelect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((destination)=>{
        setSelectedDestination(destination);
        setShowDestinationSelector(false);
        if (currentLocation) {
            // Find and display the route from current location
            displayRoute(currentLocation.id, destination.id);
        } else if (defaultStartLocation) {
            // Use default start location (main gate) when current location is not available
            displayRoute(defaultStartLocation.id, destination.id);
        } else {
            // Show error message to user
            setLocationError("No starting point available. Please grant location permission or try again.");
        }
    }, [
        currentLocation,
        defaultStartLocation
    ]);
    // Display route between two nodes
    const displayRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((startNodeId, endNodeId)=>{
        if (!roadsSourceRef.current || !nodesSourceRef.current || !mapInstanceRef.current) {
            return;
        }
        // Clear existing route
        if (routeLayerRef.current) {
            mapInstanceRef.current.removeLayer(routeLayerRef.current);
            routeLayerRef.current = null;
        }
        // Find the shortest path
        const pathFeatures = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$roadSystem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findShortestPath"])(startNodeId, endNodeId, roadsSourceRef.current, nodesSourceRef.current);
        if (pathFeatures.length === 0) {
            return;
        }
        // Create a route source and layer
        const routeSource = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$source$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Vector$3e$__["Vector"]({
            features: pathFeatures
        });
        const routeLayer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$layer$2f$Vector$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Vector$3e$__["Vector"]({
            source: routeSource,
            style: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Style$3e$__["Style"]({
                stroke: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$style$2f$Stroke$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Stroke$3e$__["Stroke"]({
                    color: "#4285F4",
                    width: 6,
                    lineDash: []
                }),
                zIndex: 10
            })
        });
        // Add the layer to the map
        mapInstanceRef.current.addLayer(routeLayer);
        routeLayerRef.current = routeLayer;
        // Calculate route information (distance and time)
        let totalDistance = 0;
        pathFeatures.forEach((feature)=>{
            const geometry = feature.getGeometry();
            if (geometry) {
                // Check if the geometry is a LineString that has getLength method
                if (geometry.getType() === "LineString") {
                    try {
                        // Use type assertion to access getLength
                        const lineString = geometry;
                        totalDistance += lineString.getLength(); // in meters
                    } catch (error) {
                        console.error("Error calculating line length:", error);
                    }
                }
            }
        });
        // Estimate time (assuming walking speed of 5km/h = 1.38m/s)
        const estimatedTimeMinutes = totalDistance / (1.38 * 60);
        setRouteInfo({
            distance: totalDistance,
            estimatedTime: estimatedTimeMinutes
        });
        setActiveRoute(pathFeatures);
        setShowRouteOverlay(true);
        // Set route path for enhanced tracking
        if (enhancedTrackerRef.current && mobileMode) {
            // Extract route coordinates from path features
            const routePath = [];
            pathFeatures.forEach((feature)=>{
                const geometry = feature.getGeometry();
                if (geometry && geometry.getType() === "LineString") {
                    const lineString = geometry;
                    const coords = lineString.getCoordinates();
                    coords.forEach((coord)=>{
                        const geoCoord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toLonLat"])(coord);
                        routePath.push([
                            geoCoord[0],
                            geoCoord[1]
                        ]);
                    });
                }
            });
            if (routePath.length > 0) {
                enhancedTrackerRef.current.setRoute(routePath);
            }
        }
    }, [
        mobileMode
    ]);
    // Generate QR code for the current route
    const handleGenerateQR = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        generateRouteQRCode();
    }, [
        generateRouteQRCode
    ]);
    // Clear active route
    const clearRoute = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (routeLayerRef.current && mapInstanceRef.current) {
            mapInstanceRef.current.removeLayer(routeLayerRef.current);
            routeLayerRef.current = null;
        }
        setActiveRoute([]);
        setSelectedDestination(null);
        setShowRouteOverlay(false);
        setRouteInfo(undefined);
        setRouteProgress(null);
        resetRouteProcessor();
        // Clear route from enhanced tracker
        if (enhancedTrackerRef.current) {
            enhancedTrackerRef.current.clearRoute();
        }
    }, []);
    // Toggle edit mode - memoized
    const toggleEditMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!mapInstanceRef.current) return;
        const newEditMode = !isEditMode;
        setIsEditMode(newEditMode);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$editControls$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setupEditControls"])(newEditMode, mapInstanceRef.current, vectorSourceRef.current, pointsSourceRef.current, modifyInteractionRef, selectInteractionRef, drawInteractionRef, setSelectedFeature, setFeatureProperties, setShowCustomizePanel, setDrawType);
    }, [
        isEditMode
    ]);
    // Handle draw interaction toggles
    const handleDrawInteractionToggle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((type)=>{
        // If already active, toggle it off
        if (drawType === type) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$editControls$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toggleDrawInteraction"])(null, isEditMode, mapInstanceRef.current, vectorSourceRef.current, pointsSourceRef.current, drawInteractionRef, selectInteractionRef, setSelectedFeature, setFeatureProperties, setShowCustomizePanel);
            setDrawType(null);
        } else {
            // Otherwise, activate the new type
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$editControls$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toggleDrawInteraction"])(type, isEditMode, mapInstanceRef.current, vectorSourceRef.current, pointsSourceRef.current, drawInteractionRef, selectInteractionRef, setSelectedFeature, setFeatureProperties, setShowCustomizePanel);
            setDrawType(type);
        }
    }, [
        drawType,
        isEditMode
    ]);
    // Memoize handlers for UI components
    const handleCloseCustomizePanel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setShowCustomizePanel(false);
    }, []);
    const handleCloseDestinationSelector = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setShowDestinationSelector(false);
    }, []);
    const handleShowDestinationSelector = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setShowDestinationSelector(true);
    }, []);
    const handleDeleteSelected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$editControls$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteSelectedFeature"])(selectInteractionRef.current, vectorSourceRef.current, pointsSourceRef.current, setShowCustomizePanel, setSelectedFeature);
    }, []);
    const { featuresReady, allFeatures, resetRouteProcessor } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$routeProcessor$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouteProcessor"])(nodesUrl, roadsUrl, mapInstanceRef, displayRoute, setCurrentLocation, setSelectedDestination, setRouteInfo, setShowRouteOverlay, routeData // This can be from props or from URL params
    );
    const handleExportMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$editControls$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exportGeoJSON"])(vectorSourceRef.current, "map_export.geojson");
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (effectiveSearchParams && mobileMode) {
            console.log("Mobile mode - checking URL params:", effectiveSearchParams.toString());
            const routeData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$qrCodeUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseRouteFromUrl"])(effectiveSearchParams);
            if (routeData) {
                console.log("Found route data:", routeData);
                // Wait for map and sources to be fully initialized
                const checkSourcesLoaded = ()=>{
                    if (mapInstanceRef.current && roadsSourceRef.current && roadsSourceRef.current.getState() === "ready" && nodesSourceRef.current && nodesSourceRef.current.getState() === "ready") {
                        console.log("Sources ready, processing route");
                        processRouteData(routeData);
                    } else {
                        console.log("Sources not ready yet, waiting...");
                        setTimeout(checkSourcesLoaded, 300);
                    }
                };
                checkSourcesLoaded();
            }
        }
    }, [
        effectiveSearchParams,
        mobileMode
    ]);
    const initializeMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!mapRef.current) return;
        const updateUIStates = ()=>{
            if (locationErrorRef.current !== locationError) {
                setLocationError(locationErrorRef.current);
            }
            if (isOutsideSchoolRef.current !== isOutsideSchool) {
                setIsOutsideSchool(isOutsideSchoolRef.current);
            }
        };
        const uiUpdateInterval = setInterval(updateUIStates, 1000);
        const { map, vectorSource, pointsSource, view } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$layers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setupLayers"])(mapRef.current, backdropColor, centerCoordinates, initialZoom, mapUrl, pointsUrl);
        mapInstanceRef.current = map;
        vectorSourceRef.current = vectorSource;
        pointsSourceRef.current = pointsSource;
        const { roadsLayer, roadsSource, nodesSource } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$roadSystem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setupRoadSystem"])(roadsUrl, nodesUrl);
        // Add road layer to map
        map.addLayer(roadsLayer);
        // Store road system refs
        roadsSourceRef.current = roadsSource;
        nodesSourceRef.current = nodesSource;
        // Define a function to process features to avoid code duplication
        const processFeatures = (features)=>{
            const loadedDestinations = [];
            // Set default start location (main gate)
            let mainGate = null;
            features.forEach((feature)=>{
                const props = feature.getProperties();
                const geometry = feature.getGeometry();
                if (props.isDestination && geometry) {
                    // Handle geometry correctly
                    if (geometry instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]) {
                        const coords = geometry.getCoordinates();
                        // Convert to geo coordinates
                        const geoCoords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toLonLat"])(coords);
                        // Create node object
                        const node = {
                            id: props.id || `node-${Math.random().toString(36).substring(2, 9)}`,
                            name: props.name || "Unnamed Location",
                            isDestination: !!props.isDestination,
                            coordinates: geoCoords,
                            description: props.description,
                            category: props.category || "General",
                            imageUrl: props.imageUrl
                        };
                        // Find and set main gate as default starting point
                        if (props.category === "Gates" && props.id === "gate1") {
                            mainGate = node;
                        }
                        // Add to destinations
                        loadedDestinations.push(node);
                    }
                }
            });
            // Set destinations in state
            if (loadedDestinations.length > 0) {
                setDestinations(loadedDestinations);
                // Set default start location
                if (mainGate) {
                    setDefaultStartLocation(mainGate);
                }
                // Check for pending route from URL parameters
                processPendingRoute(loadedDestinations, mainGate);
            } else {
                loadDestinationsDirectly();
            }
        };
        // Function to process pending route
        const processPendingRoute = (loadedDestinations, mainGate)=>{
            const pendingRouteData = sessionStorage.getItem("pendingRoute");
            if (pendingRouteData) {
                try {
                    const routeData = JSON.parse(pendingRouteData);
                    // Find nodes by ID
                    const startNode = loadedDestinations.find((d)=>d.id === routeData.startNodeId) || mainGate;
                    const endNode = loadedDestinations.find((d)=>d.id === routeData.endNodeId) || null;
                    if (startNode && endNode) {
                        // Use the default start node or the one from the URL
                        setCurrentLocation(startNode);
                        setSelectedDestination(endNode);
                        // Display the route
                        displayRoute(startNode.id, endNode.id);
                        // If route info was provided, use it
                        if (routeData.routeInfo) {
                            setRouteInfo(routeData.routeInfo);
                        }
                    }
                    // Clear the pending route
                    sessionStorage.removeItem("pendingRoute");
                } catch (error) {
                    console.error("Error processing pending route:", error);
                }
            }
        };
        // Function to load destinations directly from GeoJSON
        const loadDestinationsDirectly = ()=>{
            fetch(nodesUrl).then((response)=>response.json()).then((data)=>{
                const directLoadedDestinations = [];
                let mainGate = null;
                data.features.forEach((feature)=>{
                    if (feature.properties.isDestination) {
                        // Create node object directly from GeoJSON
                        const coords = feature.geometry.coordinates;
                        const node = {
                            id: feature.properties.id || `node-${Math.random().toString(36).substring(2, 9)}`,
                            name: feature.properties.name || "Unnamed Location",
                            isDestination: true,
                            coordinates: coords,
                            description: feature.properties.description,
                            category: feature.properties.category || "General",
                            imageUrl: feature.properties.imageUrl
                        };
                        // Find and set main gate as default starting point
                        if (feature.properties.category === "Gates" && feature.properties.id === "gate1") {
                            mainGate = node;
                        }
                        directLoadedDestinations.push(node);
                    }
                });
                if (directLoadedDestinations.length > 0) {
                    setDestinations(directLoadedDestinations);
                    if (mainGate) {
                        setDefaultStartLocation(mainGate);
                    }
                    // Check for pending route
                    processPendingRoute(directLoadedDestinations, mainGate);
                }
            }).catch((error)=>{
                console.error("Error loading destinations directly:", error);
            });
        };
        // Handle feature loaded event
        const handleFeaturesLoaded = ()=>{
            const features = nodesSource.getFeatures();
            processFeatures(features);
        };
        // Register event for future loads
        nodesSource.on("featuresloadend", handleFeaturesLoaded);
        // Also check if features are already loaded
        if (nodesSource.getState() === "ready") {
            const features = nodesSource.getFeatures();
            processFeatures(features);
        } else {
            // If no features are available yet, try loading directly after a short delay
            const checkFeaturesTimer = setTimeout(()=>{
                const features = nodesSource.getFeatures();
                if (features.length > 0) {
                    processFeatures(features);
                } else {
                    loadDestinationsDirectly();
                }
            }, 500);
            // Clean up timer in component cleanup
            updatePositionTimeoutRef.current = checkFeaturesTimer;
        }
        // Force a refresh/reload of the nodes source
        try {
            nodesSource.refresh();
        } catch (e) {
            console.error("Error refreshing source:", e);
        }
        // Load destinations from nodes source
        nodesSource.on("featuresloadend", ()=>{
            const features = nodesSource.getFeatures();
            const loadedDestinations = [];
            // Set default start location (main gate)
            let mainGate = null;
            features.forEach((feature)=>{
                const props = feature.getProperties();
                const geometry = feature.getGeometry();
                if (props.isDestination && geometry) {
                    // Handle geometry correctly
                    if (geometry instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$geom$2f$Point$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]) {
                        const coords = geometry.getCoordinates();
                        // Convert to geo coordinates
                        const geoCoords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toLonLat"])(coords);
                        // Create node object
                        const node = {
                            id: props.id || `node-${Math.random().toString(36).substring(2, 9)}`,
                            name: props.name || "Unnamed Location",
                            isDestination: !!props.isDestination,
                            coordinates: geoCoords,
                            description: props.description,
                            category: props.category || "General",
                            imageUrl: props.imageUrl
                        };
                        // Find and set main gate as default starting point
                        if (props.category === "Gates" && props.id === "gate1") {
                            mainGate = node;
                        }
                        // Add to destinations
                        loadedDestinations.push(node);
                    }
                }
            });
            // If no destinations were loaded, try to load them directly from the GeoJSON file
            if (loadedDestinations.length === 0) {
                fetch(nodesUrl).then((response)=>response.json()).then((data)=>{
                    const directLoadedDestinations = [];
                    data.features.forEach((feature)=>{
                        if (feature.properties.isDestination) {
                            // Create node object directly from GeoJSON
                            const coords = feature.geometry.coordinates;
                            const node = {
                                id: feature.properties.id || `node-${Math.random().toString(36).substring(2, 9)}`,
                                name: feature.properties.name || "Unnamed Location",
                                isDestination: true,
                                coordinates: coords,
                                description: feature.properties.description,
                                category: feature.properties.category || "General",
                                imageUrl: feature.properties.imageUrl
                            };
                            // Find and set main gate as default starting point
                            if (feature.properties.category === "Gates" && feature.properties.id === "gate1") {
                                mainGate = node;
                            }
                            directLoadedDestinations.push(node);
                        }
                    });
                    if (directLoadedDestinations.length > 0) {
                        setDestinations(directLoadedDestinations);
                        if (mainGate) {
                            setDefaultStartLocation(mainGate);
                        }
                    }
                }).catch((error)=>{
                    console.error("Error loading destinations directly:", error);
                });
            } else {
                setDestinations(loadedDestinations);
                // Set default start location
                if (mainGate) {
                    setDefaultStartLocation(mainGate);
                }
            }
            // Check for pending route from URL parameters
            const pendingRouteData = sessionStorage.getItem("pendingRoute");
            if (pendingRouteData) {
                try {
                    const routeData = JSON.parse(pendingRouteData);
                    // Find nodes by ID
                    const startNode = loadedDestinations.find((d)=>d.id === routeData.startNodeId) || mainGate;
                    const endNode = loadedDestinations.find((d)=>d.id === routeData.endNodeId) || null;
                    if (startNode && endNode) {
                        // Use the default start node or the one from the URL
                        setCurrentLocation(startNode);
                        setSelectedDestination(endNode);
                        // Display the route
                        displayRoute(startNode.id, endNode.id);
                        // If route info was provided, use it
                        if (routeData.routeInfo) {
                            setRouteInfo(routeData.routeInfo);
                        }
                    }
                    // Clear the pending route
                    sessionStorage.removeItem("pendingRoute");
                } catch (error) {
                    console.error("Error processing pending route:", error);
                }
            }
        });
        vectorSource.on("featuresloadend", ()=>{
            try {
                const extent = vectorSource.getExtent();
                const features = vectorSource.getFeatures();
                // Store the school boundary for location checking
                if (extent && extent.every((v)=>isFinite(v))) {
                    // Add some padding to the boundary
                    const expandedBoundary = [
                        extent[0] - 500,
                        extent[1] - 500,
                        extent[2] + 500,
                        extent[3] + 500
                    ];
                    schoolBoundaryRef.current = expandedBoundary;
                }
                if (extent && extent.every((v)=>isFinite(v))) {
                    const paddingFactor = 1.5;
                    const centerPoint = [
                        (extent[0] + extent[2]) / 2,
                        (extent[1] + extent[3]) / 2
                    ];
                    const expanded = [
                        centerPoint[0] - (extent[2] - extent[0]) * paddingFactor / 2,
                        centerPoint[1] - (extent[3] - extent[1]) * paddingFactor / 2,
                        centerPoint[0] + (extent[2] - extent[0]) * paddingFactor / 2,
                        centerPoint[1] + (extent[3] - extent[1]) * paddingFactor / 2
                    ];
                    // Store in ref for access from other functions
                    expandedExtentRef.current = expanded;
                    view.fit(extent, {
                        padding: [
                            20,
                            20,
                            20,
                            20
                        ],
                        maxZoom: 18
                    });
                    lastValidCenterRef.current = view.getCenter() || null;
                } else {
                    console.error("Invalid map extent:", extent);
                    view.setCenter((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fromLonLat"])(centerCoordinates));
                    view.setZoom(initialZoom);
                }
            } catch (error) {
                console.error("Error processing map extent:", error);
            }
        });
        // FIX: Improve the pointerdrag handler to avoid state updates
        let isUpdatingCenter = false;
        map.on("pointerdrag", ()=>{
            if (isUpdatingCenter) return;
            const currentCenter = view.getCenter();
            if (!currentCenter || !expandedExtentRef.current) return;
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["containsCoordinate"])(expandedExtentRef.current, currentCenter)) {
                isUpdatingCenter = true;
                try {
                    const clampedCenter = [
                        Math.max(expandedExtentRef.current[0], Math.min(currentCenter[0], expandedExtentRef.current[2])),
                        Math.max(expandedExtentRef.current[1], Math.min(currentCenter[1], expandedExtentRef.current[3]))
                    ];
                    // Only update if the center has significantly changed
                    if (!lastValidCenterRef.current || Math.abs(clampedCenter[0] - (lastValidCenterRef.current[0] || 0)) > 0.1 || Math.abs(clampedCenter[1] - (lastValidCenterRef.current[1] || 0)) > 0.1) {
                        lastValidCenterRef.current = clampedCenter;
                        view.setCenter(clampedCenter);
                    }
                } finally{
                    isUpdatingCenter = false;
                }
            } else {
                lastValidCenterRef.current = currentCenter;
            }
        });
        vectorSource.on("featuresloaderror", (error)=>{
            console.error("Features load error:", error);
            locationErrorRef.current = "Failed to load map data. Please try again later.";
        });
        const handleResize = ()=>{
            try {
                map.updateSize();
                const extent = vectorSource.getExtent();
                if (extent && extent.every((v)=>isFinite(v))) {
                    view.fit(extent, {
                        padding: [
                            20,
                            20,
                            20,
                            20
                        ],
                        maxZoom: 18
                    });
                }
            } catch (resizeError) {
                console.error("Resize error:", resizeError);
            }
        };
        window.addEventListener("resize", handleResize);
        window.mapEditor = {
            toggleEditMode,
            deleteSelected: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$editControls$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteSelectedFeature"])(selectInteractionRef.current, vectorSourceRef.current, pointsSourceRef.current, setShowCustomizePanel, setSelectedFeature),
            exportGeoJSON: (filename = "map_export.geojson")=>{
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$editControls$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exportGeoJSON"])(vectorSource, filename);
            }
        };
        return ()=>{
            clearInterval(uiUpdateInterval);
            if (locationWatchIdRef.current) {
                navigator.geolocation.clearWatch(locationWatchIdRef.current);
                locationWatchIdRef.current = null;
            }
            if (locationNodeIntervalRef.current) {
                clearInterval(locationNodeIntervalRef.current);
                locationNodeIntervalRef.current = null;
            }
            window.removeEventListener("resize", handleResize);
            delete window.mapEditor;
            map.setTarget(undefined);
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const cleanup = initializeMap();
        return ()=>{
            if (cleanup) cleanup();
        };
    }, []);
    // Memoize UI components to reduce re-renders
    const OutsideSchoolAlert = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (isOutsideSchool && locationTrackingEnabled) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-20 left-0 right-0 mx-auto w-64 bg-yellow-500 text-white p-3 rounded-lg z-20 text-center shadow-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Notice:"
                    }, void 0, false, {
                        fileName: "[project]/components/map/MapComponent.tsx",
                        lineNumber: 1212,
                        columnNumber: 11
                    }, this),
                    " You appear to be outside the campus boundaries. Navigation will use the main gate as your starting point."
                ]
            }, void 0, true, {
                fileName: "[project]/components/map/MapComponent.tsx",
                lineNumber: 1211,
                columnNumber: 9
            }, this);
        }
        return null;
    }, [
        isOutsideSchool,
        locationTrackingEnabled
    ]);
    // Memoize location error alert
    const LocationErrorAlert = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (locationError) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-20 left-0 right-0 mx-auto w-80 bg-red-500 text-white p-3 rounded-lg z-20 text-center shadow-lg",
                children: locationError
            }, void 0, false, {
                fileName: "[project]/components/map/MapComponent.tsx",
                lineNumber: 1224,
                columnNumber: 9
            }, this);
        }
        return null;
    }, [
        locationError
    ]);
    // Memoize location permission request button
    const LocationPermissionButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!locationPermissionRequested) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-20 left-4 z-40 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-bold mb-2",
                        children: "Location Access"
                    }, void 0, false, {
                        fileName: "[project]/components/map/MapComponent.tsx",
                        lineNumber: 1237,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm mb-3",
                        children: "Grant location access to enable real-time navigation on campus."
                    }, void 0, false, {
                        fileName: "[project]/components/map/MapComponent.tsx",
                        lineNumber: 1238,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 w-full",
                        onClick: requestLocationPermission,
                        children: "Enable Location"
                    }, void 0, false, {
                        fileName: "[project]/components/map/MapComponent.tsx",
                        lineNumber: 1241,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/map/MapComponent.tsx",
                lineNumber: 1236,
                columnNumber: 9
            }, this);
        }
        return null;
    }, [
        locationPermissionRequested,
        requestLocationPermission
    ]);
    // Memoize edit controls
    const EditControlsComponent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$components$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EditControls"], {
            isEditMode: isEditMode,
            toggleEditMode: toggleEditMode,
            drawType: drawType,
            handleDrawInteractionToggle: handleDrawInteractionToggle,
            handleDeleteSelected: handleDeleteSelected,
            handleExportMap: handleExportMap
        }, void 0, false, {
            fileName: "[project]/components/map/MapComponent.tsx",
            lineNumber: 1256,
            columnNumber: 7
        }, this), [
        isEditMode,
        toggleEditMode,
        drawType,
        handleDrawInteractionToggle,
        handleDeleteSelected,
        handleExportMap
    ]);
    // Memoize customization panel
    const CustomizationPanelComponent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (showCustomizePanel) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$components$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CustomizationPanel"], {
                featureProperties: featureProperties,
                updateFeatureProperty: updateFeatureProperty,
                markerSizeOptions: markerSizeOptions,
                onClose: handleCloseCustomizePanel
            }, void 0, false, {
                fileName: "[project]/components/map/MapComponent.tsx",
                lineNumber: 1279,
                columnNumber: 9
            }, this);
        }
        return null;
    }, [
        showCustomizePanel,
        featureProperties,
        updateFeatureProperty,
        markerSizeOptions,
        handleCloseCustomizePanel
    ]);
    // Memoize navigation status bar
    const NavigationStatusBar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute top-4 right-4 z-30 bg-white bg-opacity-90 p-2 rounded-lg shadow-lg",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-sm font-medium",
                children: currentLocation ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-green-600",
                    children: [
                        "● Current location: ",
                        currentLocation.name
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/map/MapComponent.tsx",
                    lineNumber: 1302,
                    columnNumber: 13
                }, this) : locationPermissionRequested && defaultStartLocation ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-yellow-600",
                    children: [
                        "● Using default: ",
                        defaultStartLocation.name
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/map/MapComponent.tsx",
                    lineNumber: 1306,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-gray-600",
                    children: "● Location: Not available"
                }, void 0, false, {
                    fileName: "[project]/components/map/MapComponent.tsx",
                    lineNumber: 1310,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/map/MapComponent.tsx",
                lineNumber: 1300,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/map/MapComponent.tsx",
            lineNumber: 1299,
            columnNumber: 7
        }, this), [
        currentLocation,
        locationPermissionRequested,
        defaultStartLocation
    ]);
    // Memoize destination selector button
    const DestinationSelectorButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute bottom-4 right-4 z-30",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none",
                onClick: handleShowDestinationSelector,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    xmlns: "http://www.w3.org/2000/svg",
                    width: "24",
                    height: "24",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                        }, void 0, false, {
                            fileName: "[project]/components/map/MapComponent.tsx",
                            lineNumber: 1337,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                            cx: "12",
                            cy: "10",
                            r: "3"
                        }, void 0, false, {
                            fileName: "[project]/components/map/MapComponent.tsx",
                            lineNumber: 1338,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/map/MapComponent.tsx",
                    lineNumber: 1326,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/map/MapComponent.tsx",
                lineNumber: 1322,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/map/MapComponent.tsx",
            lineNumber: 1321,
            columnNumber: 7
        }, this), [
        handleShowDestinationSelector
    ]);
    // Memoize destination selector
    const DestinationSelectorComponent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (showDestinationSelector) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 left-4 z-40",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$DestinationSelector$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    destinations: destinations,
                    onSelect: handleDestinationSelect,
                    onClose: handleCloseDestinationSelector,
                    categories: [
                        "Gates",
                        "Main Buildings",
                        "Maritime",
                        "Business",
                        "Facilities",
                        "Sports Facilities"
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/map/MapComponent.tsx",
                    lineNumber: 1351,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/map/MapComponent.tsx",
                lineNumber: 1350,
                columnNumber: 9
            }, this);
        }
        return null;
    }, [
        showDestinationSelector,
        destinations,
        handleDestinationSelect,
        handleCloseDestinationSelector
    ]);
    // Memoize route overlay
    const RouteOverlayComponent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (showRouteOverlay && selectedDestination) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$RouteOverlay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                startNode: currentLocation || defaultStartLocation,
                endNode: selectedDestination,
                routeInfo: routeInfo,
                onCancel: clearRoute,
                onGenerateQR: handleGenerateQR
            }, void 0, false, {
                fileName: "[project]/components/map/MapComponent.tsx",
                lineNumber: 1380,
                columnNumber: 9
            }, this);
        }
        return null;
    }, [
        showRouteOverlay,
        selectedDestination,
        currentLocation,
        defaultStartLocation,
        routeInfo,
        clearRoute,
        handleGenerateQR
    ]);
    const renderMobileUI = ()=>{
        if (!mobileMode) return null;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "fixed top-0 left-0 right-0 bg-white p-3 shadow-md z-40",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "w-10 h-10 flex items-center justify-center rounded-full bg-gray-100",
                                onClick: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].back(),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    width: "24",
                                    height: "24",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "m15 18-6-6 6-6"
                                    }, void 0, false, {
                                        fileName: "[project]/components/map/MapComponent.tsx",
                                        lineNumber: 1424,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/map/MapComponent.tsx",
                                    lineNumber: 1413,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/map/MapComponent.tsx",
                                lineNumber: 1409,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-lg font-bold text-gray-900",
                                children: selectedDestination ? `Navigate to ${selectedDestination.name}` : "Campus Map"
                            }, void 0, false, {
                                fileName: "[project]/components/map/MapComponent.tsx",
                                lineNumber: 1428,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white",
                                onClick: ()=>{
                                    if (mapInstanceRef.current && currentLocation) {
                                        const coords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fromLonLat"])(currentLocation.coordinates);
                                        mapInstanceRef.current.getView().setCenter(coords);
                                        mapInstanceRef.current.getView().setZoom(18);
                                    } else {
                                        initLocationTracking();
                                    }
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    width: "20",
                                    height: "20",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                            cx: "12",
                                            cy: "12",
                                            r: "10"
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/MapComponent.tsx",
                                            lineNumber: 1457,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                            cx: "12",
                                            cy: "12",
                                            r: "1"
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/MapComponent.tsx",
                                            lineNumber: 1458,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M12 2v4"
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/MapComponent.tsx",
                                            lineNumber: 1459,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M12 18v4"
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/MapComponent.tsx",
                                            lineNumber: 1460,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M4.93 4.93l2.83 2.83"
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/MapComponent.tsx",
                                            lineNumber: 1461,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M16.24 16.24l2.83 2.83"
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/MapComponent.tsx",
                                            lineNumber: 1462,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M2 12h4"
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/MapComponent.tsx",
                                            lineNumber: 1463,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M18 12h4"
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/MapComponent.tsx",
                                            lineNumber: 1464,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M4.93 19.07l2.83-2.83"
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/MapComponent.tsx",
                                            lineNumber: 1465,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M16.24 7.76l2.83-2.83"
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/MapComponent.tsx",
                                            lineNumber: 1466,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/map/MapComponent.tsx",
                                    lineNumber: 1446,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/map/MapComponent.tsx",
                                lineNumber: 1434,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/map/MapComponent.tsx",
                        lineNumber: 1408,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/map/MapComponent.tsx",
                    lineNumber: 1407,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "fixed right-4 bottom-24 z-40 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200",
                    onClick: ()=>{
                        if (mapInstanceRef.current && currentLocation) {
                            const coords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ol$2f$proj$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["fromLonLat"])(currentLocation.coordinates);
                            mapInstanceRef.current.getView().setCenter(coords);
                            mapInstanceRef.current.getView().setZoom(18);
                        } else {
                            initLocationTracking();
                        }
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        xmlns: "http://www.w3.org/2000/svg",
                        width: "20",
                        height: "20",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "#4b5563",
                        strokeWidth: "2",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: "12",
                                cy: "12",
                                r: "10"
                            }, void 0, false, {
                                fileName: "[project]/components/map/MapComponent.tsx",
                                lineNumber: 1496,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: "12",
                                cy: "12",
                                r: "1"
                            }, void 0, false, {
                                fileName: "[project]/components/map/MapComponent.tsx",
                                lineNumber: 1497,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M12 2v4"
                            }, void 0, false, {
                                fileName: "[project]/components/map/MapComponent.tsx",
                                lineNumber: 1498,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M12 18v4"
                            }, void 0, false, {
                                fileName: "[project]/components/map/MapComponent.tsx",
                                lineNumber: 1499,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M4.93 4.93l2.83 2.83"
                            }, void 0, false, {
                                fileName: "[project]/components/map/MapComponent.tsx",
                                lineNumber: 1500,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M16.24 16.24l2.83 2.83"
                            }, void 0, false, {
                                fileName: "[project]/components/map/MapComponent.tsx",
                                lineNumber: 1501,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M2 12h4"
                            }, void 0, false, {
                                fileName: "[project]/components/map/MapComponent.tsx",
                                lineNumber: 1502,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M18 12h4"
                            }, void 0, false, {
                                fileName: "[project]/components/map/MapComponent.tsx",
                                lineNumber: 1503,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M4.93 19.07l2.83-2.83"
                            }, void 0, false, {
                                fileName: "[project]/components/map/MapComponent.tsx",
                                lineNumber: 1504,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M16.24 7.76l2.83-2.83"
                            }, void 0, false, {
                                fileName: "[project]/components/map/MapComponent.tsx",
                                lineNumber: 1505,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/map/MapComponent.tsx",
                        lineNumber: 1485,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/map/MapComponent.tsx",
                    lineNumber: 1473,
                    columnNumber: 9
                }, this),
                showRouteOverlay && selectedDestination && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$EnhancedMobileRoutePanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    destination: selectedDestination,
                    currentLocation: currentLocation,
                    routeInfo: routeInfo,
                    routeProgress: routeProgress,
                    onClose: clearRoute
                }, void 0, false, {
                    fileName: "[project]/components/map/MapComponent.tsx",
                    lineNumber: 1511,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full h-screen",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: mapRef,
                className: "w-full h-full absolute top-0 left-0",
                style: {
                    boxShadow: mobileMode ? "none" : "0 4px 20px rgba(0,0,0,0.15)",
                    borderRadius: mobileMode ? "0" : "12px"
                }
            }, void 0, false, {
                fileName: "[project]/components/map/MapComponent.tsx",
                lineNumber: 1525,
                columnNumber: 7
            }, this),
            OutsideSchoolAlert && !mobileMode && OutsideSchoolAlert,
            LocationErrorAlert,
            !mobileMode && LocationPermissionButton,
            !mobileMode && EditControlsComponent,
            !mobileMode && CustomizationPanelComponent,
            !mobileMode && NavigationStatusBar,
            !mobileMode && DestinationSelectorButton,
            showDestinationSelector && !mobileMode && DestinationSelectorComponent,
            mobileMode && renderMobileUI(),
            RouteOverlayComponent,
            showQRModal && selectedDestination && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$map$2f$KioskQRModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                qrCodeUrl: qrCodeUrl,
                destination: selectedDestination,
                routeInfo: routeInfo,
                onClose: closeQRModal,
                autoCloseTime: 60
            }, void 0, false, {
                fileName: "[project]/components/map/MapComponent.tsx",
                lineNumber: 1549,
                columnNumber: 9
            }, this),
            isGenerating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white p-6 rounded-lg shadow-xl flex flex-col items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"
                        }, void 0, false, {
                            fileName: "[project]/components/map/MapComponent.tsx",
                            lineNumber: 1562,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-800 font-medium",
                            children: "Generating QR Code..."
                        }, void 0, false, {
                            fileName: "[project]/components/map/MapComponent.tsx",
                            lineNumber: 1563,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/map/MapComponent.tsx",
                    lineNumber: 1561,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/map/MapComponent.tsx",
                lineNumber: 1560,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-20 left-0 right-0 mx-auto w-80 bg-red-500 text-white p-3 rounded-lg z-30 text-center shadow-lg",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/map/MapComponent.tsx",
                lineNumber: 1569,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/map/MapComponent.tsx",
        lineNumber: 1524,
        columnNumber: 5
    }, this);
};
const MemoizedCampusMap = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].memo(CampusMap);
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(()=>Promise.resolve(MemoizedCampusMap), {
    ssr: false
});
}}),
"[project]/app/navigation/page.tsx [app-rsc] (ecmascript, Next.js server component, client modules ssr)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: require } = __turbopack_context__;
{
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__da7c43._.js.map