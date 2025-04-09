import { Fill, Stroke, Style } from "ol/style";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import Select from "ol/interaction/Select";
import { click } from "ol/events/condition";
import { saveAs } from "file-saver";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import CircleStyle from "ol/style/Circle";
import Collection from "ol/Collection";
import Geometry from "ol/geom/Geometry";
import Point from "ol/geom/Point";
import Map from "ol/Map";
import { MutableRefObject } from "react";
import { fromLonLat } from "ol/proj";
import { Polygon } from "ol/geom";
import { debugLog } from "./components";
import { getRandomColor, hexToRGBA } from "./layers";
import { DebugCallback } from "./types";

// Export GeoJSON data
export const exportGeoJSON = (
  source: any,
  filename: string,
  debugInfoRef: MutableRefObject<string[]>,
  debug: boolean,
  updateDebugCallback?: DebugCallback
) => {
  const features = source.getFeatures();
  const geoJsonFormat = new GeoJSON({
    dataProjection: "EPSG:4326",
    featureProjection: "EPSG:3857",
  });

  const geoJsonStr = geoJsonFormat.writeFeatures(features);
  const blob = new Blob([geoJsonStr], { type: "application/json" });
  saveAs(blob, filename);
  debugLog(
    debugInfoRef,
    debug,
    `Exported GeoJSON with ${features.length} features`,
    updateDebugCallback
  );
};

// Add marker functionality
export const addMarker = (
  lon: number,
  lat: number,
  pointsSource: any,
  debugInfoRef: MutableRefObject<string[]>,
  debug: boolean,
  options: any = {},
  updateDebugCallback?: DebugCallback
) => {
  if (!pointsSource) return;

  const feature = new Feature({
    geometry: new Point(fromLonLat([lon, lat])),
    ...options,
  });

  // Set default properties if not provided
  if (!options["marker-color"]) {
    feature.set("marker-color", getRandomColor());
  }
  if (!options["marker-size"]) {
    feature.set("marker-size", "medium");
  }
  if (!options.name) {
    feature.set("name", `Marker ${pointsSource.getFeatures().length + 1}`);
  }

  pointsSource.addFeature(feature);
  debugLog(
    debugInfoRef,
    debug,
    `Added marker at [${lon}, ${lat}]`,
    updateDebugCallback
  );
  return feature;
};

// Add polygon functionality
export const addPolygon = (
  coordinates: number[][],
  vectorSource: any,
  debugInfoRef: MutableRefObject<string[]>,
  debug: boolean,
  options: any = {},
  updateDebugCallback?: DebugCallback
) => {
  if (!vectorSource) return;

  const transformedCoords = coordinates.map((coord) => fromLonLat(coord));
  const feature = new Feature({
    geometry: new Polygon([transformedCoords]),
    ...options,
  });

  // Set default properties if not provided
  if (!options.fill) {
    feature.set("fill", getRandomColor());
  }
  if (!options["fill-opacity"]) {
    feature.set("fill-opacity", 0.5);
  }
  if (!options.stroke) {
    feature.set("stroke", "#000000");
  }
  if (!options.strokeWidth) {
    feature.set("strokeWidth", 2);
  }
  if (!options.name) {
    feature.set("name", `Polygon ${vectorSource.getFeatures().length + 1}`);
  }

  vectorSource.addFeature(feature);
  debugLog(
    debugInfoRef,
    debug,
    `Added polygon with ${coordinates.length} points`,
    updateDebugCallback
  );
  return feature;
};

// Delete selected feature
export const deleteSelectedFeature = (
  selectInteraction: Select | null,
  vectorSource: any,
  pointsSource: any,
  setShowCustomizePanel: (show: boolean) => void,
  setSelectedFeature: (feature: Feature | null) => void,
  debugInfoRef: MutableRefObject<string[]>,
  debug: boolean,
  updateDebugCallback?: DebugCallback
) => {
  if (!selectInteraction) return;

  const selectedFeatures = selectInteraction.getFeatures();
  if (selectedFeatures.getLength() === 0) {
    debugLog(
      debugInfoRef,
      debug,
      "No feature selected to delete",
      updateDebugCallback
    );
    return;
  }

  const feature = selectedFeatures.item(0);
  if (!feature) return;

  // Try to remove from both sources
  vectorSource.removeFeature(feature);
  pointsSource.removeFeature(feature);

  // Close customization panel and clear selection
  setShowCustomizePanel(false);
  setSelectedFeature(null);
  selectedFeatures.clear();

  debugLog(
    debugInfoRef,
    debug,
    "Deleted selected feature",
    updateDebugCallback
  );
};

// Setup edit controls
export const setupEditControls = (
  editMode: boolean,
  map: Map,
  vectorSource: any,
  pointsSource: any,
  modifyInteractionRef: MutableRefObject<Modify | null>,
  selectInteractionRef: MutableRefObject<Select | null>,
  drawInteractionRef: MutableRefObject<Draw | null>,
  setSelectedFeature: (feature: Feature | null) => void,
  setFeatureProperties: (props: { [key: string]: any }) => void,
  setShowCustomizePanel: (show: boolean) => void,
  setDrawType: (type: "Point" | "LineString" | "Polygon" | null) => void,
  debug: boolean,
  debugInfoRef: MutableRefObject<string[]>,
  updateDebugCallback?: DebugCallback
) => {
  // Remove existing interactions
  if (modifyInteractionRef.current) {
    map.removeInteraction(modifyInteractionRef.current);
    modifyInteractionRef.current = null;
  }
  if (selectInteractionRef.current) {
    map.removeInteraction(selectInteractionRef.current);
    selectInteractionRef.current = null;
  }
  if (drawInteractionRef.current) {
    map.removeInteraction(drawInteractionRef.current);
    drawInteractionRef.current = null;
  }

  if (!editMode) {
    debugLog(debugInfoRef, debug, "Edit mode disabled", updateDebugCallback);
    return;
  }

  debugLog(debugInfoRef, debug, "Edit mode enabled", updateDebugCallback);

  // Create select interaction
  const select = new Select({
    condition: click,
    style: (feature) => {
      const properties = feature.getProperties();
      const isPoint = feature.getGeometry() instanceof Point;

      if (isPoint) {
        const color = properties["marker-color"] || "#ff0000";
        const size =
          properties["marker-size"] === "large"
            ? 12
            : properties["marker-size"] === "medium"
              ? 8
              : 6;

        return new Style({
          image: new CircleStyle({
            radius: size,
            fill: new Fill({ color }),
            stroke: new Stroke({ color: "#ffffff", width: 2 }),
          }),
        });
      } else {
        const fillColor = properties.fill || properties.fillColor || "#0080ff";
        const strokeColor =
          properties.stroke || properties.strokeColor || "#000000";
        const fillOpacity = properties["fill-opacity"] ?? 0.5;

        return new Style({
          fill: new Fill({
            color: hexToRGBA(fillColor, fillOpacity),
          }),
          stroke: new Stroke({
            color: "#ffffff",
            width: 4,
          }),
        });
      }
    },
  });

  // Handle feature selection
  select.on("select", (event) => {
    const feature = event.selected[0];

    if (feature) {
      const properties = feature.getProperties();
      delete properties.geometry; // Remove geometry from properties display

      setSelectedFeature(feature);
      setFeatureProperties(properties);
      setShowCustomizePanel(true);

      debugLog(debugInfoRef, debug, "Feature selected", updateDebugCallback);
    } else {
      setSelectedFeature(null);
      setFeatureProperties({});
      setShowCustomizePanel(false);
    }
  });

  // Create modify interaction
  const modify = new Modify({
    features: select.getFeatures(),
  });

  // Add interactions to map
  map.addInteraction(select);
  map.addInteraction(modify);

  // Save references
  selectInteractionRef.current = select;
  modifyInteractionRef.current = modify;

  setDrawType(null);
};

// Toggle draw interaction
export const toggleDrawInteraction = (
  type: "Point" | "LineString" | "Polygon" | null,
  editMode: boolean,
  map: Map | null,
  vectorSource: any,
  pointsSource: any,
  drawInteractionRef: MutableRefObject<Draw | null>,
  selectInteractionRef: MutableRefObject<Select | null>,
  setSelectedFeature: (feature: Feature | null) => void,
  setFeatureProperties: (props: { [key: string]: any }) => void,
  setShowCustomizePanel: (show: boolean) => void,
  debug: boolean,
  debugInfoRef: MutableRefObject<string[]>,
  updateDebugCallback?: DebugCallback
) => {
  if (!map || !editMode) return;

  // Remove existing draw interaction
  if (drawInteractionRef.current) {
    map.removeInteraction(drawInteractionRef.current);
    drawInteractionRef.current = null;
  }

  if (!type) {
    debugLog(debugInfoRef, debug, "Draw mode disabled", updateDebugCallback);
    return;
  }

  debugLog(
    debugInfoRef,
    debug,
    `Draw mode enabled: ${type}`,
    updateDebugCallback
  );

  // Create draw interaction with the appropriate source
  const source = type === "Point" ? pointsSource : vectorSource;

  const draw = new Draw({
    source,
    type,
    style: new Style({
      fill: new Fill({
        color: "rgba(255, 255, 255, 0.2)",
      }),
      stroke: new Stroke({
        color: "#ffcc33",
        width: 2,
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: "#ffcc33",
        }),
      }),
    }),
  });

  // Set default properties for new features
  draw.on("drawend", (event) => {
    const feature = event.feature;

    if (type === "Point") {
      feature.set("marker-color", getRandomColor());
      feature.set("marker-size", "medium");
      feature.set("name", `Marker ${pointsSource.getFeatures().length}`);
    } else {
      feature.set("fill", getRandomColor());
      feature.set("fill-opacity", 0.5);
      feature.set("stroke", "#000000");
      feature.set("strokeWidth", 2);
      feature.set("name", `${type} ${vectorSource.getFeatures().length}`);
    }

    // Select the newly created feature
    if (selectInteractionRef.current) {
      const selected = selectInteractionRef.current.getFeatures();
      selected.clear();
      selected.push(feature);

      const properties = feature.getProperties();
      delete properties.geometry;

      setSelectedFeature(feature);
      setFeatureProperties(properties);
      setShowCustomizePanel(true);
    }

    debugLog(
      debugInfoRef,
      debug,
      `Created new ${type} feature`,
      updateDebugCallback
    );
  });

  map.addInteraction(draw);
  drawInteractionRef.current = draw;
};
