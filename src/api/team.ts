import client from './client';
import { TeamMember, ApiResponse } from '../types/api';

export const getTeamMembers = (params?: { is_featured?: number }) =>
  client.get<ApiResponse<TeamMember[]>>('/team', { params });
