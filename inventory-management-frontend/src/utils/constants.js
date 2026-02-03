// utils/constants.js
export const APP_NAME = 'InventoryPro';
export const APP_VERSION = '1.0.0';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const ROLES = {
  ADMIN: 'ADMIN',
  INVENTORY_STAFF: 'INVENTORY_STAFF',
  SALES_EXECUTIVE: 'SALES_EXECUTIVE',
};

export const ORDER_STATUSES = {
  SALES: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
  PURCHASE: ['DRAFT', 'PENDING', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
};

export const ADJUSTMENT_TYPES = {
  INCREASE: 'INCREASE',
  DECREASE: 'DECREASE',
  CORRECTION: 'CORRECTION',
};

export const NOTIFICATION_TYPES = {
  LOW_STOCK: 'LOW_STOCK',
  ORDER_STATUS: 'ORDER_STATUS',
  SYSTEM: 'SYSTEM',
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
};

export const UNITS_OF_MEASURE = [
  'UNIT',
  'PIECE',
  'BOX',
  'CASE',
  'PACK',
  'DOZEN',
  'KG',
  'G',
  'LB',
  'OZ',
  'L',
  'ML',
  'GAL',
  'M',
  'CM',
  'FT',
  'IN',
];

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
};

export const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#6366F1',
};