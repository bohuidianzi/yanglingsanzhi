export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  model: string | null;
  summary: string | null;
  description: string | null;
  cover_image: string | null;
  application_scenes: string | null;
  is_recommended: number;
  status: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  category_name?: string;
  images?: ProductImage[];
  params?: ProductParam[];
  docs?: ProductDoc[];
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  title: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProductParam {
  id: number;
  product_id: number;
  param_name: string;
  param_value: string;
  sort_order: number;
  created_at: string;
}

export interface ProductDoc {
  id: number;
  product_id: number;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  sort_order: number;
  created_at: string;
}

export interface Case {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  cover_image: string | null;
  location: string | null;
  province: string | null;
  is_featured: number;
  status: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  images?: CaseImage[];
}

export interface CaseImage {
  id: number;
  case_id: number;
  image_url: string;
  title: string | null;
  sort_order: number;
  created_at: string;
}

export interface TeamMember {
  id: number;
  name: string;
  title: string | null;
  bio: string | null;
  avatar: string | null;
  is_featured: number;
  status: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: number;
  title: string;
  type: 'patent' | 'cma' | 'promotion' | 'other';
  certificate_number: string | null;
  description: string | null;
  image: string | null;
  issue_date: string | null;
  status: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  message: string;
  source: string | null;
  status: 'pending' | 'processed' | 'ignored';
  remark: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  real_name: string | null;
  avatar: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: number;
  setting_key: string;
  setting_value: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: AdminUser;
}
