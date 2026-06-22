import client from './client';
import { Product, Category, ApiResponse, PaginatedData } from '../types/api';

export const getCategories = () =>
  client.get<ApiResponse<Category[]>>('/categories');

export const getProducts = (params?: {
  category_id?: number;
  page?: number;
  pageSize?: number;
  keyword?: string;
  is_recommended?: number;
}) => client.get<ApiResponse<PaginatedData<Product>>>('/products', { params });

export const getProduct = (id: number) =>
  client.get<ApiResponse<Product>>(`/products/${id}`);
