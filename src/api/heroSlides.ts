import api from './client';

export interface HeroSlide {
  id?: number;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  fallback_url: string;
  link_url: string;
  link_text: string;
  sort_order: number;
  status: number;
}

export const heroSlideApi = {
  // 公开接口：获取启用的轮播
  getList: () => api.get('/hero-slides'),
  // 后台接口：获取全部
  getAll: () => api.get('/hero-slides/all'),
  create: (data: Partial<HeroSlide>) => api.post('/hero-slides', data),
  update: (id: number, data: Partial<HeroSlide>) => api.put(`/hero-slides/${id}`, data),
  delete: (id: number) => api.delete(`/hero-slides/${id}`),
};
