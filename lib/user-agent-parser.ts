/**
 * Parse user agent string to extract browser and OS information
 * for display in security-related emails
 */

interface ParsedUserAgent {
  browser: string;
  os: string;
  device: string;
}

export function parseUserAgent(userAgent?: string): ParsedUserAgent | null {
  if (!userAgent) return null;

  // Extract browser
  let browser = 'Unknown Browser';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browser = 'Opera';
  }

  // Extract OS
  let os = 'Unknown OS';
  if (userAgent.includes('Mac OS X')) {
    os = 'macOS';
  } else if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
  }

  // Combine for device string
  const device = `${browser} on ${os}`;

  return {
    browser,
    os,
    device,
  };
}

/**
 * Get a simplified location from IP address
 * Note: This requires an IP geolocation service
 */
export function getLocationFromIP(ipAddress?: string): string | null {
  if (!ipAddress) return null;

  // Check for localhost/private IPs
  if (
    ipAddress === '::1' ||
    ipAddress === '127.0.0.1' ||
    ipAddress.startsWith('192.168.') ||
    ipAddress.startsWith('10.') ||
    ipAddress.startsWith('172.')
  ) {
    return 'Local Network';
  }

  // For production: integrate with a geolocation API like:
  // - ipapi.co
  // - ipinfo.io
  // - MaxMind GeoIP2

  return null; // Return null for now until geolocation is implemented
}
