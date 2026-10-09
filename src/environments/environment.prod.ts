export const environment = {
  production: true,
  apiUrl: '/api',
  // In production, nginx (see nginx.conf) proxies both the app and /uploads from the same
  // origin, so relative "/uploads/..." URLs already resolve correctly -- no prefix needed.
  mediaBaseUrl: ''
};
