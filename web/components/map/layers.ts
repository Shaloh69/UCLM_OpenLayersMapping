import Map from "ol/Map";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { fromLonLat } from "ol/proj";
import { Fill, Stroke, Style, Text } from "ol/style";
import { Feature } from "ol";
import { Polygon } from "ol/geom";
import { defaults as defaultControls } from "ol/control";
import Rotate from "ol/control/Rotate";
import CircleStyle from "ol/style/Circle";
import { Extent, createEmpty, extend, buffer } from "ol/extent";

// Helper function to create a random color
export const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const hexToRGBA = (hex: string, opacity: number = 0.5) => {
  hex = hex.replace(/^#/, "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const setupLayers = (
  mapElement: HTMLElement,
  backdropColor: string,
  centerCoordinates: [number, number],
  initialZoom: number,
  mapUrl: string,
  pointsUrl: string
) => {
  const backdropLayer = new VectorLayer({
    source: new VectorSource({
      features: [
        new Feature(
          new Polygon([
            [
              [-20037508.34, -20037508.34],
              [-20037508.34, 20037508.34],
              [20037508.34, 20037508.34],
              [20037508.34, -20037508.34],
              [-20037508.34, -20037508.34],
            ],
          ])
        ),
      ],
    }),
    style: new Style({
      fill: new Fill({
        color: backdropColor,
      }),
    }),
  });

  const pointsSource = new VectorSource({
    url: pointsUrl,
    format: new GeoJSON({
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    }),
  });

  const pointsLayer = new VectorLayer({
    source: pointsSource,
    style: (feature, resolution) => {
      const properties = feature.getProperties();
      const isDestination = properties.isDestination === true;
      const isHidable = properties.isHidable === true;

      // If point is hidable, don't render marker or text
      if (isHidable) {
        return null; // Return null to hide the feature
      }

      // Base marker styling
      const color = properties["marker-color"] || "#3b82f6"; // Default blue
      const size =
        properties["marker-size"] === "large"
          ? 12
          : properties["marker-size"] === "medium"
            ? 9
            : 6;

      // Enhanced marker with glow effect
      const baseStyle = new Style({
        image: new CircleStyle({
          radius: size + 4, // Outer glow
          fill: new Fill({
            color: `rgba(59, 130, 246, 0.2)` // Blue glow
          }),
        }),
        zIndex: isDestination ? 100 : 50,
      });

      const markerStyle = new Style({
        image: new CircleStyle({
          radius: size,
          fill: new Fill({
            color: color
          }),
          stroke: new Stroke({
            color: "#ffffff",
            width: 2
          }),
        }),
        zIndex: isDestination ? 100 : 50,
      });

      // Only show text labels for destinations when zoomed in enough
      const showText = isDestination && resolution < 0.6; // Show at zoom level ~19+

      if (showText && properties.name) {
        const textStyle = new Style({
          text: new Text({
            text: properties.name,
            font: 'bold 12px Inter, sans-serif',
            fill: new Fill({ color: '#1f2937' }), // Dark gray text
            stroke: new Stroke({
              color: '#ffffff',
              width: 3
            }),
            offsetY: -size - 8, // Position above marker
            textAlign: 'center',
            textBaseline: 'bottom',
          }),
          zIndex: isDestination ? 101 : 51,
        });

        return [baseStyle, markerStyle, textStyle];
      }

      return [baseStyle, markerStyle];
    },
    zIndex: 10, // Above buildings but below roads
  });

  const vectorSource = new VectorSource({
    url: mapUrl,
    format: new GeoJSON({
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    }),
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: (feature) => {
      try {
        const properties = feature.getProperties();
        const fillColor = properties.fill || properties.fillColor || "#0080ff";
        const strokeColor =
          properties.stroke || properties.strokeColor || "black";
        const fillOpacity = properties["fill-opacity"] ?? 0.5;

        return new Style({
          fill: new Fill({
            color: hexToRGBA(fillColor, fillOpacity),
          }),
          stroke: new Stroke({
            color: strokeColor,
            width: properties.strokeWidth || 3,
          }),
        });
      } catch (error) {
        console.error("Style creation error:", error);
        return new Style();
      }
    },
  });

  const view = new View({
    center: fromLonLat(centerCoordinates),
    zoom: initialZoom,
    minZoom: 17.5, // Restrict zoom out to prevent losing context
    maxZoom: 21,
    enableRotation: true,
    rotation: 44.86,
    constrainResolution: true,
    smoothResolutionConstraint: true,
    // Note: extent will be set dynamically after features load
  });

  const map = new Map({
    target: mapElement,
    layers: [backdropLayer, vectorLayer, pointsLayer],
    view,
    controls: defaultControls({
      zoom: true,
      rotate: true,
      attribution: false,
    }).extend([new Rotate()]),
  });

  // Calculate extent from all sources and constrain map bounds
  let combinedExtent: Extent | null = null;
  let isAdjustingCenter = false;

  const updateMapExtent = () => {
    const extent = createEmpty();
    let hasFeatures = false;

    const vectorFeatures = vectorSource.getFeatures();
    if (vectorFeatures.length > 0) {
      vectorFeatures.forEach((feature) => {
        const geom = feature.getGeometry();
        if (geom) {
          extend(extent, geom.getExtent());
          hasFeatures = true;
        }
      });
    }

    const pointFeatures = pointsSource.getFeatures();
    if (pointFeatures.length > 0) {
      pointFeatures.forEach((feature) => {
        const geom = feature.getGeometry();
        if (geom) {
          extend(extent, geom.getExtent());
          hasFeatures = true;
        }
      });
    }

    if (hasFeatures) {
      // Tighter buffer to keep map focused on campus (15% for smooth panning)
      const bufferSize = Math.max(
        extent[2] - extent[0],
        extent[3] - extent[1]
      ) * 0.15;

      combinedExtent = buffer(extent, bufferSize);

      // Use OpenLayers' built-in extent constraint for smooth panning
      // This prevents jarring repositioning while allowing smooth interaction
      const viewOptions = view.getProperties();
      viewOptions.extent = combinedExtent;

      // Create a new view with extent constraint
      const constrainedView = new View({
        center: view.getCenter(),
        zoom: view.getZoom(),
        minZoom: 17.5,
        maxZoom: 21,
        enableRotation: true,
        rotation: view.getRotation(),
        constrainResolution: true,
        smoothResolutionConstraint: true,
        extent: combinedExtent, // This handles panning constraints smoothly
      });

      map.setView(constrainedView);

      // Fit to the extent with animation
      constrainedView.fit(combinedExtent, {
        padding: [50, 50, 50, 50],
        maxZoom: 19,
        duration: 1000,
      });
    }
  };

  vectorSource.once("featuresloadend", updateMapExtent);
  pointsSource.once("featuresloadend", updateMapExtent);

  // Extent constraint is now handled by the View's extent property
  // This provides smooth panning without jarring snapping behavior

  return {
    map,
    vectorSource,
    pointsSource,
    view,
    getExtent: () => combinedExtent,
  };
};
