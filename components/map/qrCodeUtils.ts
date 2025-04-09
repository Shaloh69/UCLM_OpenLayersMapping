import QRCode from "qrcode";
import { MutableRefObject } from "react";
import { debugLog } from "./components";

export interface RouteData {
  startNodeId: string;
  endNodeId: string;
  routeInfo?: {
    distance: number;
    estimatedTime: number;
    description?: string;
  };
}

// Generate QR code for the route
export const generateRouteQR = async (
  routeData: RouteData,
  debugInfoRef: MutableRefObject<string[]>,
  debug: boolean,
  updateDebugCallback?: () => void
): Promise<string> => {
  try {
    const host = window.location.origin;
    const routeParams = new URLSearchParams();
    routeParams.set("startNode", routeData.startNodeId);
    routeParams.set("endNode", routeData.endNodeId);

    if (routeData.routeInfo) {
      routeParams.set("distance", routeData.routeInfo.distance.toString());
      routeParams.set("time", routeData.routeInfo.estimatedTime.toString());
      if (routeData.routeInfo.description) {
        routeParams.set("desc", routeData.routeInfo.description);
      }
    }

    const fullUrl = `${host}/route?${routeParams.toString()}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(fullUrl, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 300,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    debugLog(
      debugInfoRef,
      debug,
      `Generated QR code for route: ${routeData.startNodeId} to ${routeData.endNodeId}`,
      updateDebugCallback
    );

    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    debugLog(
      debugInfoRef,
      debug,
      `Error generating QR code: ${error}`,
      updateDebugCallback
    );
    throw error;
  }
};

// Parse route data from URL parameters
export const parseRouteFromUrl = (
  urlParams: URLSearchParams,
  debugInfoRef: MutableRefObject<string[]>,
  debug: boolean,
  updateDebugCallback?: () => void
): RouteData | null => {
  try {
    const startNodeId = urlParams.get("startNode");
    const endNodeId = urlParams.get("endNode");

    if (!startNodeId || !endNodeId) {
      debugLog(
        debugInfoRef,
        debug,
        "Missing required route parameters in URL",
        updateDebugCallback
      );
      return null;
    }

    const routeData: RouteData = {
      startNodeId,
      endNodeId,
    };

    // Parse optional route info
    const distance = urlParams.get("distance");
    const time = urlParams.get("time");
    const desc = urlParams.get("desc");

    if (distance && time) {
      routeData.routeInfo = {
        distance: parseFloat(distance),
        estimatedTime: parseFloat(time),
        description: desc || undefined,
      };
    }

    debugLog(
      debugInfoRef,
      debug,
      `Parsed route from URL: ${startNodeId} to ${endNodeId}`,
      updateDebugCallback
    );

    return routeData;
  } catch (error) {
    console.error("Error parsing route data from URL:", error);
    debugLog(
      debugInfoRef,
      debug,
      `Error parsing route data: ${error}`,
      updateDebugCallback
    );
    return null;
  }
};
