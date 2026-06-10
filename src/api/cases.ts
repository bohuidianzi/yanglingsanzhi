import client from './client';
import { Case, ApiResponse, PaginatedData } from '../types/api';

export const getCases = (params?: {
  province?: string;
  is_featured?: number;
  page?: number;
  pageSize?: number;
}) => client.get<ApiResponse<PaginatedData<Case>>>('/cases', { params });

export const getCase = (id: number) =>
  client.get<ApiResponse<Case>>(`/cases/${id}`);
