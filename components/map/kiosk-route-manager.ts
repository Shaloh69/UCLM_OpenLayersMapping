import { useState, useCallback, useRef, MutableRefObject } from "react";
import { RouteData, generateRouteQR } from "./qrCodeUtils";
import { RoadNode } from "./roadSystem";

interface UseKioskRouteManagerOptions {
  currentLocation: RoadNode | null;
  selectedDestination: RoadNode | null;
  routeInfo?: {
    distance: number;
    estimatedTime: number;
  };
  defaultStartLocation: RoadNode | null;
  debug: boolean;
  onReset?: () => void;
  updateDebugCallback?: () => void;
}

export const useKioskRouteManager = ({
  currentLocation,
  selectedDestination,
  routeInfo,
  defaultStartLocation,
  onReset,
  updateDebugCallback,
}: UseKioskRouteManagerOptions) => {
  const [qrCodeUrl, setQRCodeUrl] = useState<string>("");
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Function to reset the kiosk state
  const resetKiosk = useCallback(() => {
    setShowQRModal(false);
    setQRCodeUrl("");
    setError(null);

    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    if (onReset) {
      onReset();
    }

      "Kiosk state reset - ready for next user",
      updateDebugCallback
    );

  // Function to generate QR code for current route
  const generateRouteQRCode = useCallback(async () => {
    // Prevent multiple simultaneous generations
    if (isProcessingRef.current) {
        "Already generating QR code, please wait",
        updateDebugCallback
      );
      return;
    }

    // Clear any previous error
    setError(null);

    // Set processing flag
    isProcessingRef.current = true;
    setIsGenerating(true);

    try {
      const startNodeId = currentLocation
        ? currentLocation.id
        : defaultStartLocation
          ? defaultStartLocation.id
          : null;

      if (!startNodeId || !selectedDestination) {
        throw new Error("Missing start location or destination");
      }

      if (!routeInfo) {
        throw new Error("Missing route information");
      }

      // Create route data object
      const routeData: RouteData = {
        startNodeId,
        endNodeId: selectedDestination.id,
        routeInfo: {
          distance: routeInfo.distance,
          estimatedTime: routeInfo.estimatedTime,
        },
        timestamp: Date.now(),
      };

      // Generate QR code
        `Generating QR code for route: ${startNodeId} → ${selectedDestination.id}`,
        updateDebugCallback
      );

      const qrCode = await generateRouteQR(
        routeData,
        {
          primaryColor: "#4285F4",
          secondaryColor: "#34A853",
          cornerRadius: 10,
          errorCorrection: "H",
        },
        updateDebugCallback
      );

      // Update state with generated QR code
      setQRCodeUrl(qrCode);
      setShowQRModal(true);

        "QR code generated successfully",
        updateDebugCallback
      );
    } catch (error) {
      // Handle errors
      const errorMessage =
        error instanceof Error ? error.message : String(error);

        `Error generating QR code: ${errorMessage}`,
        updateDebugCallback
      );

      setError(errorMessage);
    } finally {
      // Reset processing flag
      isProcessingRef.current = false;
      setIsGenerating(false);
    }
  }, [
    currentLocation,
    selectedDestination,
    routeInfo,
    defaultStartLocation,
    updateDebugCallback,
  ]);

  // Handle closing the QR modal
  const closeQRModal = useCallback(() => {
    resetKiosk();
  }, [resetKiosk]);

  // Process route data from URL parameters
  const processRouteFromUrl = useCallback((searchParams: URLSearchParams) => {
    // Implementation for processing incoming routes if needed
    // This would be used on the mobile device, not on the kiosk
  }, []);

  return {
    qrCodeUrl,
    showQRModal,
    isGenerating,
    error,
    generateRouteQRCode,
    closeQRModal,
    resetKiosk,
  };
};
