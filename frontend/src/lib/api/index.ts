/**
 * API services index
 * @module lib/api
 */

export { ApiClient } from './Client';
export { AuthService } from './AuthService';
export { DashboardService } from './DashboardService';

// Create singleton instances for use throughout the app
import { ApiClient } from './Client';
import { AuthService } from './AuthService';
import { DashboardService } from './DashboardService';

const apiClient = new ApiClient();
const authService = new AuthService(apiClient);
const dashboardService = new DashboardService(apiClient);

export { apiClient, authService, dashboardService }; 