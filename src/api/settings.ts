import client from './client';
import { ApiResponse } from '../types/api';

export const getSettings = () =>
  client.get<ApiResponse<Record<string, string>>>('/settings');

export const getSetting = (key: string) =>
  client.get<ApiResponse<string>>(`/settings/${key}`);
