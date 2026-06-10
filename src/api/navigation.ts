import apiClient from './client';

// 导航栏目类型
export interface NavCategory {
  id: number;
  name: string;
  name_en: string | null;
  slug: string;
  icon: string | null;
  banner_image: string | null;
  sort_order: number;
  status: number;
  created_at: string;
  updated_at: string;
  subcategories?: NavSubcategory[];
}

export interface NavSubcategory {
  id: number;
  parent_id: number;
  name: string;
  name_en: string | null;
  slug: string;
  description: string | null;
  description_en: string | null;
  icon: string | null;
  content_type: 'article' | 'product' | 'case' | 'link' | 'custom';
  display_mode: 'list' | 'single' | 'form';
  sort_order: number;
  status: number;
  created_at: string;
  updated_at: string;
}

// 文章类型
export interface Article {
  id: number;
  subcategory_id: number;
  title: string;
  title_en: string | null;
  summary: string | null;
  summary_en: string | null;
  content: string | null;
  content_en: string | null;
  cover_image: string | null;
  author: string | null;
  source: string | null;
  is_featured: number;
  status: number;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  images?: ArticleImage[];
}

export interface ArticleImage {
  id: number;
  article_id: number;
  image_url: string;
  title: string | null;
  sort_order: number;
}

// 导航栏目 API
export const navCategoryApi = {
  getAll: () => apiClient.get('/nav-categories'),
  getById: (id: number) => apiClient.get(`/nav-categories/${id}`),
  getSubcategories: (id: number) => apiClient.get(`/nav-categories/${id}/subcategories`),
  create: (data: Partial<NavCategory>) => apiClient.post('/nav-categories', data),
  update: (id: number, data: Partial<NavCategory>) => apiClient.put(`/nav-categories/${id}`, data),
  delete: (id: number) => apiClient.delete(`/nav-categories/${id}`),
};

// 二级栏目 API
export const navSubcategoryApi = {
  getAll: (parentId?: number) => apiClient.get('/nav-subcategories', { params: { parent_id: parentId } }),
  getById: (id: number) => apiClient.get(`/nav-subcategories/${id}`),
  create: (data: Partial<NavSubcategory>) => apiClient.post('/nav-subcategories', data),
  update: (id: number, data: Partial<NavSubcategory>) => apiClient.put(`/nav-subcategories/${id}`, data),
  delete: (id: number) => apiClient.delete(`/nav-subcategories/${id}`),
};

// 文章 API
export const articleApi = {
  getAll: (params?: { subcategory_id?: number; page?: number; pageSize?: number; is_featured?: number }) =>
    apiClient.get('/articles', { params }),
  getById: (id: number) => apiClient.get(`/articles/${id}`),
  create: (data: Partial<Article>) => apiClient.post('/articles', data),
  update: (id: number, data: Partial<Article>) => apiClient.put(`/articles/${id}`, data),
  delete: (id: number) => apiClient.delete(`/articles/${id}`),
};
