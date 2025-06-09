/**
 * API module exports
 * @module lib/api
 */

export * from './Client';
export * from './AuthService';
export * from './TokenManager';
export * from './DashboardService';

import { ApiClient } from './Client';
import { AuthService } from './AuthService';
import { DashboardService } from './DashboardService';

const apiClient = new ApiClient();
const authService = new AuthService(apiClient);
const dashboardService = new DashboardService(apiClient);

export { apiClient, authService, dashboardService }; 