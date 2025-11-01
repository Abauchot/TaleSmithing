interface JWTPayload {
  exp: number;
  iat: number;
  username?: string;
  email?: string;
  roles?: string[];
  [key: string]: any;
}

/**
 * Base64 URL decode
 */
const base64UrlDecode = (str: string): string => {

  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error('Invalid base64 string');
    }
    base64 += new Array(5 - pad).join('=');
  }
  
  try {
    if (typeof atob !== 'undefined') {
      return atob(base64);
    }
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let buffer = 0;
    let bits = 0;
    
    for (let i = 0; i < base64.length; i++) {
      const char = base64[i];
      if (char === '=') break;
      
      const index = chars.indexOf(char);
      if (index === -1) continue;
      
      buffer = (buffer << 6) | index;
      bits += 6;
      
      if (bits >= 8) {
        bits -= 8;
        result += String.fromCharCode((buffer >> bits) & 0xff);
        buffer &= (1 << bits) - 1;
      }
    }
    
    return result;
  } catch (error) {
    throw new Error('Failed to decode base64 string');
  }
};

/**
 * Decode JWT token without external libraries
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = parts[1];
    const decodedPayload = base64UrlDecode(payload);
    
    return JSON.parse(decodedPayload) as JWTPayload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    const currentTime = Date.now() / 1000;
    
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Check if token will expire soon (within threshold seconds)
 */
export const willTokenExpireSoon = (token: string, thresholdSeconds: number = 300): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    const currentTime = Date.now() / 1000;
    return decoded.exp < (currentTime + thresholdSeconds);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get time until token expires (in seconds)
 */
export const getTokenTimeToExpiry = (token: string): number => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }
    
    const currentTime = Date.now() / 1000;
    const timeToExpiry = decoded.exp - currentTime;
    
    return Math.max(0, timeToExpiry);
  } catch (error) {
    console.error('Error getting token expiry time:', error);
    return 0;
  }
};

/**
 * Extract user data from token
 */
export const getUserFromToken = (token: string): any => {
  try {
    const decoded = decodeToken(token);
    if (!decoded) {
      return null;
    }
    
    return {
      email: decoded.email || decoded.username,
      roles: decoded.roles || [],
      ...decoded,
    };
  } catch (error) {
    console.error('Error extracting user from token:', error);
    return null;
  }
};
