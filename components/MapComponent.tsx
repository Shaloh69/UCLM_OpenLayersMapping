"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { fromLonLat } from "ol/proj";
import { Fill, Stroke, Style } from "ol/style";
import { containsCoordinate, Extent } from "ol/extent";
import { Feature } from "ol";
import { Point, Circle as CircleGeometry, Polygon } from "ol/geom";
import { defaults as defaultControls } from "ol/control";
import Rotate from "ol/control/Rotate";
import CircleStyle from "ol/style/Circle";

interface MapProps {
  mapUrl?: string;
  initialZoom?: number;
  backdropColor?: string;
  debug?: boolean;
  centerCoordinates?: [number, number];
}

const CampusMap: React.FC<MapProps> = ({
  mapUrl = "/UCLM_Map.geojson",
  backdropColor = "#f7f2e4",
  initialZoom = 15,
  debug = false,
  centerCoordinates = [-3.8688, 40.0333],
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const logDebug = (message: string) => {
    if (debug) {
      console.log(message);
      setDebugInfo((prev) => [...prev.slice(-10), message]);
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const backdropLayer = new VectorLayer({
      source: new VectorSource({
        features: [
          new Feature(
            new Polygon([
              [
                [-20037.34, -20037508.34],
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
      url: "/UCLM_Points.geojson",
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

    const hexToRGBA = (hex: string, opacity: number = 0.5) => {
      hex = hex.replace(/^#/, "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        try {
          const properties = feature.getProperties();
          const fillColor =
            properties.fill || properties.fillColor || "#0080ff";
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
      minZoom: 18.2,
      maxZoom: 20,
      enableRotation: true,
      rotation: 44.86,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [backdropLayer, vectorLayer, pointsLayer],
      view,
      controls: defaultControls().extend([new Rotate()]),
    });

    // GPS Marker & Accuracy Circle
    const userPositionFeature = new Feature({
      geometry: new Point(fromLonLat([0, 0])),
    });

    const accuracyFeature = new Feature({
      geometry: new CircleGeometry(fromLonLat([0, 0]), 10),
    });

    const userPositionLayer = new VectorLayer({
      source: new VectorSource({
        features: [accuracyFeature, userPositionFeature],
      }),
      style: (feature) => {
        if (feature === userPositionFeature) {
          return new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({ color: "#ff0000" }),
              stroke: new Stroke({ color: "#ffffff", width: 2 }),
            }),
          });
        } else if (feature === accuracyFeature) {
          return new Style({
            fill: new Fill({ color: "rgba(0, 0, 255, 0.2)" }),
            stroke: new Stroke({ color: "blue", width: 1 }),
          });
        }
        return new Style();
      },
    });

    map.addLayer(userPositionLayer);

    const updateUserPosition = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      const coords = fromLonLat([longitude, latitude]);

      userPositionFeature.setGeometry(new Point(coords));
      accuracyFeature.setGeometry(new CircleGeometry(coords, accuracy || 10));
    };

    const watchId = navigator.geolocation.watchPosition(
      updateUserPosition,
      (error) => {
        console.error("Error getting location:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    vectorSource.on("featuresloadend", () => {
      try {
        const extent: Extent = vectorSource.getExtent();
        const features = vectorSource.getFeatures();

        features.forEach((feature, index) => {
          try {
            const properties = feature.getProperties();
            logDebug(
              `Feature ${index + 1} Properties: ${JSON.stringify(properties)}`
            );
          } catch (propError) {
            console.error(
              `Property processing error for feature ${index}:`,
              propError
            );
          }
        });

        if (extent && extent.every((v) => isFinite(v))) {
          const paddingFactor = 1.5;
          const centerPoint = [
            (extent[0] + extent[2]) / 2,
            (extent[1] + extent[3]) / 2,
          ];

          const expandedExtent: Extent = [
            centerPoint[0] - ((extent[2] - extent[0]) * paddingFactor) / 2,
            centerPoint[1] - ((extent[3] - extent[1]) * paddingFactor) / 2,
            centerPoint[0] + ((extent[2] - extent[0]) * paddingFactor) / 2,
            centerPoint[1] + ((extent[3] - extent[1]) * paddingFactor) / 2,
          ];

          view.fit(extent, {
            padding: [20, 20, 20, 20],
            maxZoom: 18,
          });

          view.setMinZoom(18.2);
          view.setMaxZoom(22);

          map.on("pointerdrag", (event) => {
            const currentCenter = view.getCenter();

            if (currentCenter) {
              if (!containsCoordinate(expandedExtent, currentCenter)) {
                const clampedCenter = [
                  Math.max(
                    expandedExtent[0],
                    Math.min(currentCenter[0], expandedExtent[2])
                  ),
                  Math.max(
                    expandedExtent[1],
                    Math.min(currentCenter[1], expandedExtent[3])
                  ),
                ];

                view.setCenter(clampedCenter);
              }
            }
          });
        } else {
          console.error("Invalid map extent:", extent);
          view.setCenter(fromLonLat(centerCoordinates));
          view.setZoom(initialZoom);
        }

        logDebug(`Loaded ${features.length} features successfully`);
      } catch (error) {
        console.error("Error processing map extent:", error);
      }
    });

    vectorSource.on("featuresloaderror", (error) => {
      console.error("Features load error:", error);
      logDebug("Failed to load map features");
    });

    const handleResize = () => {
      try {
        map.updateSize();
        const extent: Extent = vectorSource.getExtent();
        if (extent && extent.every((v) => isFinite(v))) {
          view.fit(extent, {
            padding: [20, 20, 20, 20],
            maxZoom: 18,
          });
        }
      } catch (resizeError) {
        console.error("Resize error:", resizeError);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      navigator.geolocation.clearWatch(watchId);
      map.setTarget(undefined);
    };
  }, [mapUrl, initialZoom, centerCoordinates]);

  return (
    <div className="relative w-full h-screen">
      <div
        ref={mapRef}
        className="w-full h-full absolute top-0 left-0"
        style={{
          boxShadow: "0 0 15px rgba(0,0,0,0.2)",
          borderRadius: "8px",
        }}
      />

      {debug && (
        <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-lg max-h-[300px] overflow-y-auto z-10">
          <h3 className="font-bold mb-2">Debug Information</h3>
          {debugInfo.map((msg, index) => (
            <div key={index} className="text-xs text-gray-700 mb-1">
              {msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(CampusMap), { ssr: false });
