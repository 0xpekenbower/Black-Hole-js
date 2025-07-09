/**
 * API module exports
 * @module lib/api
 */

export * from './AuthService';
export * from './Client';
export * from './DashboardService';
export * from './TokenManager';
export * from './ChatService';

import { AuthService } from './AuthService';
import { DashboardService } from './DashboardService';
import { ChatService } from './ChatService';

export const authService = new AuthService();
export const dashboardService = new DashboardService();
export const chatService = new ChatService(); 