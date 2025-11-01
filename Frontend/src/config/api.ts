const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  
  ENDPOINTS: {
    LOGIN: '/login',
    REGISTER: '/register',
    REFRESH: '/token/refresh',
    USER: '/users',
  },
  

  TOKEN_REFRESH_THRESHOLD: 300, // 5 minutes in seconds
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
