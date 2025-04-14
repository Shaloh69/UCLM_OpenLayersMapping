// app/route/page.tsx (or pages/route.tsx depending on your setup)
"use client";

import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

// Import your existing MapComponent instead of the mobile-specific one
const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
});

export default function RoutePage() {
  const searchParams = useSearchParams();

  return (
    <div className="h-screen w-full">
      <MapComponent
        roadsUrl="/UCLM_Roads.geojson"
        nodesUrl="/UCLM_Nodes.geojson"
        mapUrl="/UCLM_Map.geojson"
        pointsUrl="/UCLM_Points.geojson"
        searchParams={searchParams} // Pass the searchParams if your component can accept them
        mobileMode={true} // You can add a flag to slightly adjust UI for mobile if needed
        debug={false}
      />
    </div>
  );
}
