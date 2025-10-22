/**
 * Components Index
 * Central export point for all UI components
 */

export { Card } from './Card.js';
export { Grid } from './Grid.js';
export { Button } from './Button.js';
export { SearchBar } from './SearchBar.js';
export { Modal } from './Modal.js';
export { Badge } from './Badge.js';
export { Pagination } from './Pagination.js';
export { Loader } from './Loader.js';

/**
 * Combined components object
 */
export const components = {
  Card: () => import('./Card.js').then((m) => m.Card),
  Grid: () => import('./Grid.js').then((m) => m.Grid),
  Button: () => import('./Button.js').then((m) => m.Button),
  SearchBar: () => import('./SearchBar.js').then((m) => m.SearchBar),
  Modal: () => import('./Modal.js').then((m) => m.Modal),
  Badge: () => import('./Badge.js').then((m) => m.Badge),
  Pagination: () => import('./Pagination.js').then((m) => m.Pagination),
  Loader: () => import('./Loader.js').then((m) => m.Loader),
};
