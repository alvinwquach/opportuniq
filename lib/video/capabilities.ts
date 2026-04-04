/**
 * Device capability detection for video processing
 * Determines whether to use client-side FFmpeg WASM or server fallback
 */

import { VIDEO_CONFIG, type ProcessingStrategy } from "./constants";

interface DeviceCapabilities {
  hasSharedArrayBuffer: boolean;
  hasWebAssembly: boolean;
  hasEnoughMemory: boolean;
  isModernDevice: boolean;
  supportsMediaRecorder: boolean;
  supportsOffscreenCanvas: boolean;
}

/**
 * Detect device capabilities for FFmpeg WASM
 */
export function detectCapabilities(): DeviceCapabilities {
  if (typeof window === "undefined") {
    // Server-side: return false for all client capabilities
    return {
      hasSharedArrayBuffer: false,
      hasWebAssembly: false,
      hasEnoughMemory: false,
      isModernDevice: false,
      supportsMediaRecorder: false,
      supportsOffscreenCanvas: false,
    };
  }

  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== "undefined";
  const hasWebAssembly = typeof WebAssembly !== "undefined";

  // Check device memory (navigator.deviceMemory is in GB, may be undefined)
  const deviceMemory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const hasEnoughMemory = deviceMemory >= VIDEO_CONFIG.MIN_DEVICE_MEMORY_GB;

  // Check for low-end mobile devices that struggle with WASM
  const userAgent = navigator.userAgent;
  const isLowEndMobile =
    /(iPhone [5-8]|iPad [2-4]|Android [4-6])/i.test(userAgent) ||
    // Check for devices with limited RAM indicators
    (/Mobile/i.test(userAgent) && deviceMemory < 4);

  const isModernDevice = !isLowEndMobile;

  // MediaRecorder support (useful for fallback strategies)
  const supportsMediaRecorder = typeof MediaRecorder !== "undefined";

  // OffscreenCanvas support (useful for background processing)
  const supportsOffscreenCanvas = typeof OffscreenCanvas !== "undefined";

  return {
    hasSharedArrayBuffer,
    hasWebAssembly,
    hasEnoughMemory,
    isModernDevice,
    supportsMediaRecorder,
    supportsOffscreenCanvas,
  };
}

/**
 * Check if the device can run FFmpeg WASM client-side
 * FFmpeg WASM requires SharedArrayBuffer which needs COOP/COEP headers
 */
export function canUseClientFFmpeg(): boolean {
  const capabilities = detectCapabilities();

  return (
    capabilities.hasSharedArrayBuffer &&
    capabilities.hasWebAssembly &&
    capabilities.hasEnoughMemory &&
    capabilities.isModernDevice
  );
}

/**
 * Get the recommended processing strategy based on device capabilities
 */
export function getProcessingStrategy(): ProcessingStrategy {
  return canUseClientFFmpeg() ? "client" : "server";
}

/**
 * Check if cross-origin isolation is enabled (required for SharedArrayBuffer)
 * This requires COOP and COEP headers to be set on the page
 */
export function isCrossOriginIsolated(): boolean {
  if (typeof window === "undefined") return false;
  return window.crossOriginIsolated === true;
}

/**
 * Get a human-readable reason why client processing isn't available
 */
export function getClientProcessingBlocker(): string | null {
  if (typeof window === "undefined") {
    return "Server-side rendering detected";
  }

  const capabilities = detectCapabilities();

  if (!capabilities.hasWebAssembly) {
    return "WebAssembly not supported in this browser";
  }

  if (!capabilities.hasSharedArrayBuffer) {
    return "SharedArrayBuffer not available (cross-origin isolation required)";
  }

  if (!capabilities.hasEnoughMemory) {
    return `Device has less than ${VIDEO_CONFIG.MIN_DEVICE_MEMORY_GB}GB RAM`;
  }

  if (!capabilities.isModernDevice) {
    return "Device may not have enough resources for video processing";
  }

  return null;
}

/**
 * Log device capabilities for debugging
 */
export function logCapabilities(): void {
  if (typeof window === "undefined") return;

  const capabilities = detectCapabilities();
  const strategy = getProcessingStrategy();
  const blocker = getClientProcessingBlocker();

  console.group("Video Processing Capabilities");
  if (blocker) {
  }
  console.groupEnd();
}
