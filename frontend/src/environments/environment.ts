export const environment = {
  production: true,
  /**
   * In production we deploy the Angular app behind the same domain as the API,
   * so relative `/api` calls get routed through the platform (e.g., Vercel).
   */
  apiBaseUrl: '/api'
};
