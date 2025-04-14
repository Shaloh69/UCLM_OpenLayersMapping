// Enhanced QR Code Generator with custom styling
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

export interface QRCodeOptions {
  primaryColor?: string;
  logoUrl?: string;
  cornerRadius?: number;
  borderSize?: number;
  errorCorrection?: "L" | "M" | "Q" | "H";
}

export const generateRouteQR = async (
  routeData: RouteData,
  debugInfoRef: MutableRefObject<string[]>,
  debug: boolean,
  options: QRCodeOptions = {},
  updateDebugCallback?: () => void
): Promise<string> => {
  try {
    // Get base URL - default to window.location.origin
    let baseUrl = window.location.origin;

    // Check if we're running in a kiosk and have an ngrok URL available
    if (window.electron?.isElectron) {
      try {
        const ngrokUrl = await window.electron.getNgrokUrl();
        if (ngrokUrl) {
          baseUrl = ngrokUrl;
          console.log(`Using ngrok URL: ${ngrokUrl}`);
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
    }

    const fullUrl = `${baseUrl}/route?${params.toString()}`;

    debugLog(
      debugInfoRef,
      debug,
      `Full QR URL: ${fullUrl}`,
      updateDebugCallback
    );

    // Set QR code options with defaults
    const {
      primaryColor = "#4285F4", // Google blue as default
      errorCorrection = "H",
      cornerRadius = 0,
      borderSize = 2,
    } = options;

    // Generate basic QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(fullUrl, {
      errorCorrectionLevel: errorCorrection,
      margin: borderSize,
      width: 400,
      color: {
        dark: primaryColor,
        light: "#ffffff",
      },
    });

    // If we don't need to add a logo or apply corner radius, return the basic QR code
    if (!options.logoUrl && cornerRadius === 0) {
      return qrCodeDataUrl;
    }

    // For advanced styling, we'll use canvas
    return new Promise((resolve) => {
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
        // Draw white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);

        // Draw QR code with rounded corners if specified
        if (cornerRadius > 0) {
          ctx.save();
          roundedRect(ctx, 0, 0, size, size, cornerRadius);
          ctx.clip();
          ctx.drawImage(image, 0, 0, size, size);
          ctx.restore();
        } else {
          ctx.drawImage(image, 0, 0, size, size);
        }

        // Add logo if specified
        if (options.logoUrl) {
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
              logoX - 5,
              logoY - 5,
              logoSize + 10,
              logoSize + 10,
              8
            );
            ctx.fill();

            // Draw logo
            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
            ctx.restore();

            // Convert to data URL and resolve promise
            resolve(canvas.toDataURL("image/png"));
          };
          logo.onerror = () => {
            // If logo fails to load, return the QR code without logo
            resolve(canvas.toDataURL("image/png"));
          };
          logo.src = options.logoUrl;
        } else {
          // No logo, just return the rounded QR code
          resolve(canvas.toDataURL("image/png"));
        }
      };
      image.onerror = () => {
        // If QR code image fails to load, return the original data URL
        resolve(qrCodeDataUrl);
      };
      image.src = qrCodeDataUrl;
    });
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

// Helper function to create rounded rectangles on canvas
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

    debugLog(
      debugInfoRef,
      debug,
      `Parsing route from URL. Start: ${startNodeId}, End: ${endNodeId}`,
      updateDebugCallback
    );

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
