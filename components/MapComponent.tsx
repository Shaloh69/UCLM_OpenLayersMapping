"use client";

import "ol/ol.css";
import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import OSM from "ol/source/OSM";
import { Fill, Stroke, Style } from "ol/style";
import { fromLonLat } from "ol/proj";

const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Base map layer (OpenStreetMap)
    const baseLayer = new TileLayer({
      source: new OSM(),
    });

    // Create vector source with error handling
    const vectorSource = new VectorSource({
      url: "/Uclm_Poly.geojson", // Try with a root-relative path instead
      format: new GeoJSON(),
    });

    // Add error listener to the source
    vectorSource.on("error", (error) => {
      console.error("GeoJSON loading error:", error);
      setMapError("Failed to load GeoJSON data");
    });

    // Load the GeoJSON file (campus map)
    const campusLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: "rgba(0, 0, 255, 0.5)", // Blue with transparency
        }),
        stroke: new Stroke({
          color: "#0000FF", // Blue outline
          width: 2,
        }),
      }),
    });

    // Create the map
    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, campusLayer],
      view: new View({
        center: fromLonLat([123.9004, 10.3223]),
        zoom: 17,
      }),
    });

    // Make sure the map renders correctly
    setTimeout(() => {
      map.updateSize();
    }, 200);

    return () => map.setTarget(undefined);
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} className="w-full h-full" id="map" />
      {mapError && (
        <div className="absolute top-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {mapError}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
