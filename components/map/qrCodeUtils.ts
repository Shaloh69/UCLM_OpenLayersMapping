import QRCode from "qrcode";
import { MutableRefObject, useCallback, useRef, useState } from "react";
import { RoadNode } from "./roadSystem";

// =============================================
// Interface Definitions
// =============================================

export interface RouteData {
  startNodeId: string;
  endNodeId: string;
  routeInfo?: {
    distance: number;
    estimatedTime: number;
    description?: string;
  };
  timestamp?: number;
  metadata?: {
    creator?: string;
    campusId?: string;
  };
}

export interface QRCodeOptions {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  cornerRadius?: number;
  borderSize?: number;
  errorCorrection?: "L" | "M" | "Q" | "H";
}

// =============================================
// Styling Helper Functions
// =============================================

// Helper function for rounded rectangles
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// =============================================
// QR Code Generation
// =============================================

export const generateRouteQR = async (
  routeData: RouteData,
  options: QRCodeOptions = {},
): Promise<string> => {
  try {
    // Add timestamp to ensure QR code is unique
    const dataWithTimestamp = {
      ...routeData,
      timestamp: Date.now(),
    };

    // Get base URL - default to window.location.origin
    let baseUrl = window.location.origin;

    // Check if we're running in a kiosk and have an ngrok URL available
    if (window.electron?.isElectron) {
      try {
        const ngrokUrl = await window.electron.getNgrokUrl();
        if (ngrokUrl) {
          baseUrl = ngrokUrl;
        }
      } catch (error) {
        console.error("Error getting ngrok URL:", error);
      }
    }

    // Build the route URL with parameters
    const params = new URLSearchParams();
    params.set("startNode", routeData.startNodeId);
    params.set("endNode", routeData.endNodeId);

    if (routeData.routeInfo) {
      params.set("distance", routeData.routeInfo.distance.toString());
      params.set("time", routeData.routeInfo.estimatedTime.toString());

      if (routeData.routeInfo.description) {
        params.set("desc", routeData.routeInfo.description);
      }
    }

    // Add metadata if available
    if (routeData.metadata?.campusId) {
      params.set("campus", routeData.metadata.campusId);
    }

    const fullUrl = `${baseUrl}/route?${params.toString()}`;

    // Set QR code options with defaults
    const {
      primaryColor = "#4285F4",
      secondaryColor = "#34A853",
      errorCorrection = "H",
      cornerRadius = 10,
      borderSize = 2,
      logoUrl = null,
    } = options;

    // First, generate basic QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(fullUrl, {
      errorCorrectionLevel: errorCorrection,
      margin: borderSize,
      width: 400,
      color: {
        dark: primaryColor,
        light: "#ffffff",
      },
    });

    // If we don't need to add styling, return the basic QR code
    if (!cornerRadius && !logoUrl) {
      return qrCodeDataUrl;
    }

    // For advanced styling, use canvas
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement("canvas");
        const size = 400;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(qrCodeDataUrl);
          return;
        }

        const image = new Image();
        image.onload = () => {
          // Draw gradient background
          const gradient = ctx.createLinearGradient(0, 0, size, size);
          gradient.addColorStop(0, primaryColor);
          gradient.addColorStop(1, secondaryColor || primaryColor);

          // Fill background with gradient if cornerRadius > 0, otherwise white
          if (cornerRadius > 0) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, size, size);

            ctx.save();
            roundedRect(ctx, 0, 0, size, size, cornerRadius);
            ctx.clip();
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);

            // Draw white background for QR code
            ctx.fillStyle = "#ffffff";
            roundedRect(ctx, 10, 10, size - 20, size - 20, cornerRadius - 5);
            ctx.fill();

            // Draw QR code
            ctx.drawImage(image, 10, 10, size - 20, size - 20);
            ctx.restore();
          } else {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, size, size);
            ctx.drawImage(image, 0, 0, size, size);
          }

          // Add logo if specified
          if (logoUrl) {
            const logo = new Image();
            logo.onload = () => {
              // Calculate logo size (25% of QR code)
              const logoSize = size * 0.25;
              const logoX = (size - logoSize) / 2;
              const logoY = (size - logoSize) / 2;

              // Create rounded white background for logo
              ctx.save();
              ctx.fillStyle = "#ffffff";
              roundedRect(
                ctx,
                logoX - 10,
                logoY - 10,
                logoSize + 20,
                logoSize + 20,
                12
              );
              ctx.fill();

              // Add shadow
              ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
              ctx.shadowBlur = 10;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;

              // Draw logo
              ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
              ctx.restore();

              // Convert to data URL and resolve promise
              resolve(canvas.toDataURL("image/png"));
            };

            logo.onerror = () => {
              // If logo fails to load, return the styled QR code without logo
              resolve(canvas.toDataURL("image/png"));
            };

            logo.src = logoUrl;
          } else {
            // No logo, just return the styled QR code
            resolve(canvas.toDataURL("image/png"));
          }
        };

        image.onerror = () => {
          // If QR code image fails to load, return the original data URL
          resolve(qrCodeDataUrl);
        };

        image.src = qrCodeDataUrl;
      } catch (error) {
        console.error("Error applying QR styling:", error);
        // If any error occurs during styling, return the basic QR code
        resolve(qrCodeDataUrl);
      }
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};

// =============================================
// Route Data Parsing
// =============================================

// Parse route data from URL parameters
export const parseRouteFromUrl = (
  urlParams: URLSearchParams,
): RouteData | null => {
  try {
    const startNodeId = urlParams.get("startNode");
    const endNodeId = urlParams.get("endNode");

    if (!startNodeId || !endNodeId) {
      console.warn("Missing required route parameters in URL");
      return null;
    }

    const routeData: RouteData = {
      startNodeId,
      endNodeId,
      timestamp: Date.now(),
    };

    // Parse optional route info
    const distance = urlParams.get("distance");
    const time = urlParams.get("time");
    const desc = urlParams.get("desc");
    const campus = urlParams.get("campus");

    if (distance && time) {
      routeData.routeInfo = {
        distance: parseFloat(distance),
        estimatedTime: parseFloat(time),
        description: desc || undefined,
      };
    }

    if (campus) {
      routeData.metadata = {
        ...routeData.metadata,
        campusId: campus,
      };
    }

    return routeData;
  } catch (error) {
    console.error("Error parsing route data from URL:", error);
    return null;
  }
};

// =============================================
// Kiosk Route Management
// =============================================

// This merged hook combines QR generation with kiosk state management
export const useKioskRouteManager = (options: {
  currentLocation: RoadNode | null;
  selectedDestination: RoadNode | null;
  routeInfo?: {
    distance: number;
    estimatedTime: number;
  };
  defaultStartLocation: RoadNode | null;
  onReset?: () => void;
}) => {
  const {
    currentLocation,
    selectedDestination,
    routeInfo,
    defaultStartLocation,
    onReset,
  } = options;

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
  }, [onReset]);

  // Function to generate QR code for current route
  const generateRouteQRCode = useCallback(async () => {
    // Prevent multiple simultaneous generations
    if (isProcessingRef.current) {
      console.warn("Already generating QR code, please wait");
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
      const qrCode = await generateRouteQR(routeData, {
        primaryColor: "#4285F4",
        secondaryColor: "#34A853",
        cornerRadius: 10,
        errorCorrection: "H",
      });

      // Update state with generated QR code
      setQRCodeUrl(qrCode);
      setShowQRModal(true);
    } catch (error) {
      // Handle errors
      const errorMessage =
        error instanceof Error ? error.message : String(error);

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
  ]);

  // Handle closing the QR modal
  const closeQRModal = useCallback(() => {
    resetKiosk();
  }, [resetKiosk]);

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
