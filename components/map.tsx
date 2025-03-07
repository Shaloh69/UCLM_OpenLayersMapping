"use client";

import { useEffect } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";

export default function MapComponent() {
  useEffect(() => {
    const map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([121.77, 13.41]), // Center the map (Philippines)
        zoom: 6,
      }),
    });

    return () => map.setTarget(undefined);
  }, []);

  return <div id="map" className="absolute top-0 left-0 w-full h-full" />;
}
