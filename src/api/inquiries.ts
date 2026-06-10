import client from './client';
import { ApiResponse } from '../types/api';

export const submitInquiry = (data: {
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  message: string;
  source?: string;
}) => client.post<ApiResponse<null>>('/inquiries', data);
