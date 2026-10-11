export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  // Uploaded media (images/videos) is served by the backend at a relative "/uploads/..." path.
  // In dev, frontend (4200) and backend (8080) are different origins, so we need to prefix
  // that relative path with the backend's origin for <img>/<video> src to resolve correctly.
  mediaBaseUrl: 'http://localhost:8080'
};
