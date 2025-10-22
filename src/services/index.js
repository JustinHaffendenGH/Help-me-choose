/**
 * Services Index
 * Central export point for all service singletons
 */

export { favoritesService } from './favoritesService.js';
export { dataService } from './dataService.js';
export { apiService } from './apiService.js';

/**
 * Combined services object for convenience
 * Usage: import { services } from './services/index.js'
 */
export const services = {
  favorites: () => import('./favoritesService.js').then((m) => m.favoritesService),
  data: () => import('./dataService.js').then((m) => m.dataService),
  api: () => import('./apiService.js').then((m) => m.apiService),
};
