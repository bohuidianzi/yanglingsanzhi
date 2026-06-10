import client from './client';
import { Certificate, ApiResponse } from '../types/api';

export const getCertificates = (params?: { type?: string }) =>
  client.get<ApiResponse<Certificate[]>>('/certificates', { params });
