import client from './client';
import { ApiResponse, LoginResult } from '../types/api';

export const login = (data: { username: string; password: string }) =>
  client.post<ApiResponse<LoginResult>>('/auth/login', data);

export const getProfile = () =>
  client.get<ApiResponse<any>>('/auth/profile');

export const changePassword = (data: { oldPassword: string; newPassword: string }) =>
  client.put<ApiResponse<null>>('/auth/password', data);
