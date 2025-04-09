import Map from "ol/Map";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { fromLonLat } from "ol/proj";
import { Fill, Stroke, Style } from "ol/style";
import { Feature } from "ol";
import { Polygon } from "ol/geom";
import { defaults as defaultControls } from "ol/control";
import Rotate from "ol/control/Rotate";
import CircleStyle from "ol/style/Circle";

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
    style: (feature) => {
      const properties = feature.getProperties();
      const color = properties["marker-color"] || "#ff0000";
      const size =
        properties["marker-size"] === "large"
          ? 10
          : properties["marker-size"] === "medium"
            ? 6
            : 4;

      return new Style({
        image: new CircleStyle({
          radius: size,
          fill: new Fill({ color }),
          stroke: new Stroke({ color: "black", width: 1 }),
        }),
      });
    },
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
    minZoom: 15,
    maxZoom: 22,
    enableRotation: true,
    rotation: 44.86,
  });

  const map = new Map({
    target: mapElement,
    layers: [backdropLayer, vectorLayer, pointsLayer],
    view,
    controls: defaultControls().extend([new Rotate()]),
  });

  return { map, vectorSource, pointsSource, view };
};
