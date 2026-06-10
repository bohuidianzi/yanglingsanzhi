-- 杨凌三智科技 数据库初始化脚本
-- 包含所有17张表，与实际数据库完全一致
-- 运行环境: MySQL 8.4+, utf8mb4

CREATE DATABASE IF NOT EXISTS yanglingsanzhi DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE yanglingsanzhi;

-- ============================================================
-- 1. 管理员用户表
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  real_name VARCHAR(100),
  avatar VARCHAR(500),
  last_login_at DATETIME,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO admin_users (username, password, real_name)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihO', '超级管理员');

-- ============================================================
-- 2. 一级栏目表
-- ============================================================
CREATE TABLE IF NOT EXISTS nav_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(200) DEFAULT '',
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(100) DEFAULT '',
  banner_image VARCHAR(500) DEFAULT NULL,
  sort_order INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO nav_categories (id, name, name_en, slug, sort_order) VALUES
(1, '首页', 'Home', 'home', 0),
(2, '关于我们', 'About Us', 'about', 1),
(3, '新闻动态', 'News', 'news', 2),
(4, '产品系列', 'Products', 'products', 3),
(5, '成果转化', 'Achievements', 'achievements', 4),
(6, '合作加盟', 'Cooperation', 'cooperation', 5),
(7, '联系我们', 'Contact', 'contact', 6);

-- ============================================================
-- 3. 二级栏目表
-- ============================================================
CREATE TABLE IF NOT EXISTS nav_subcategories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(200) DEFAULT '',
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  description_en TEXT,
  icon VARCHAR(100) DEFAULT '',
  content_type ENUM('article','product','case','link','custom') DEFAULT 'article',
  display_mode ENUM('list','single','form') NOT NULL DEFAULT 'single',
  sort_order INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_parent_slug (parent_id, slug),
  FOREIGN KEY (parent_id) REFERENCES nav_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 关于我们二级栏目
INSERT IGNORE INTO nav_subcategories (id, parent_id, name, name_en, slug, display_mode, sort_order) VALUES
(7, 2, '公司简介', 'Company Profile', 'profile', 'single', 1),
(8, 2, '科研依托', 'Research Support', 'research', 'single', 2),
(9, 2, '核心团队', 'Core Team', 'team', 'single', 3),
(10, 2, '资质荣誉', 'Qualifications', 'qualifications', 'single', 4);

-- 新闻动态二级栏目
INSERT IGNORE INTO nav_subcategories (id, parent_id, name, name_en, slug, display_mode, sort_order) VALUES
(11, 3, '公司新闻', 'Company News', 'company-news', 'list', 1),
(12, 3, '行业资讯', 'Industry News', 'industry-news', 'list', 2),
(13, 3, '技术文章', 'Technical Articles', 'technical-articles', 'list', 3);

-- 产品系列二级栏目
INSERT IGNORE INTO nav_subcategories (id, parent_id, name, name_en, slug, content_type, display_mode, sort_order) VALUES
(14, 4, '土壤水蚀', 'Soil Erosion', 'soil-erosion', 'product', 'single', 1),
(15, 4, '土壤风蚀', 'Wind Erosion', 'wind-erosion', 'product', 'single', 2),
(16, 4, '生态气象', 'Ecological Meteorology', 'ecological-meteorology', 'product', 'single', 3),
(17, 4, '盐碱地治理', 'Saline-alkali', 'saline-alkali', 'product', 'single', 4),
(18, 4, '智慧水保云平台', 'Smart Platform', 'smart-platform', 'product', 'single', 5);

-- 成果转化二级栏目
INSERT IGNORE INTO nav_subcategories (id, parent_id, name, name_en, slug, display_mode, sort_order) VALUES
(19, 5, '技术成果', 'Technical Achievements', 'tech-achievements', 'single', 1),
(20, 5, '技术推广', 'Technology Promotion', 'tech-promotion', 'single', 2),
(21, 5, '产学研合作', 'Industry-University', 'industry-university', 'single', 3);

-- 合作加盟二级栏目
INSERT IGNORE INTO nav_subcategories (id, parent_id, name, name_en, slug, display_mode, sort_order) VALUES
(22, 6, '合作模式', 'Cooperation Model', 'cooperation-model', 'single', 1),
(23, 6, '代理商招募', 'Agent Recruitment', 'agent-recruitment', 'form', 2),
(24, 6, '合伙人计划', 'Partner Program', 'partner-program', 'single', 3);

-- 联系我们二级栏目
INSERT IGNORE INTO nav_subcategories (id, parent_id, name, name_en, slug, display_mode, sort_order) VALUES
(25, 7, '联系方式', 'Contact Info', 'contact-info', 'single', 1),
(26, 7, '在线留言', 'Online Message', 'message', 'form', 2),
(27, 7, '加入我们', 'Join Us', 'join-us', 'single', 3);

-- ============================================================
-- 4. 文章表
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subcategory_id INT NOT NULL,
  title VARCHAR(300) NOT NULL,
  title_en VARCHAR(500) DEFAULT '',
  summary VARCHAR(500) DEFAULT '',
  summary_en VARCHAR(800) DEFAULT '',
  content LONGTEXT,
  content_en LONGTEXT,
  cover_image VARCHAR(500) DEFAULT '',
  author VARCHAR(100) DEFAULT '',
  source VARCHAR(200) DEFAULT '',
  is_featured TINYINT DEFAULT 0,
  view_count INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  published_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY subcategory_id (subcategory_id),
  FOREIGN KEY (subcategory_id) REFERENCES nav_subcategories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 5. 文章图片表
-- ============================================================
CREATE TABLE IF NOT EXISTS article_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(200) DEFAULT '',
  sort_order INT DEFAULT 0,
  KEY article_id (article_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 6. 轮播图表
-- ============================================================
CREATE TABLE IF NOT EXISTS hero_slides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL DEFAULT '',
  subtitle VARCHAR(200) NOT NULL DEFAULT '',
  description VARCHAR(500) DEFAULT '',
  image_url VARCHAR(500) NOT NULL DEFAULT '',
  fallback_url VARCHAR(500) DEFAULT '',
  link_url VARCHAR(300) DEFAULT '',
  link_text VARCHAR(50) DEFAULT '',
  sort_order INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 默认轮播
INSERT IGNORE INTO hero_slides (id, title, subtitle, description, image_url, sort_order, status) VALUES
(1, '智慧水保 守护绿水青山', '水土保持智能监测解决方案', '依托国家级重点实验室，提供全系列水土保持监测产品', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1920&q=80', 0, 1),
(2, '科研驱动 创新引领', '国家级科研力量', '水土保持与荒漠化整治全国重点实验室技术支持', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80', 1, 1),
(3, '14年深耕 品质信赖', '行业深耕制造', '全国20余省市的成功案例，成熟的产品体系', 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=1920&q=80', 2, 1);

-- ============================================================
-- 7. 产品分类表
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(500),
  sort_order INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 8. 产品表
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  model VARCHAR(200),
  summary VARCHAR(500),
  description TEXT,
  cover_image VARCHAR(500),
  application_scenes TEXT,
  sort_order INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 9. 产品图片表
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  title VARCHAR(200),
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 10. 产品参数表
-- ============================================================
CREATE TABLE IF NOT EXISTS product_params (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  param_name VARCHAR(200) NOT NULL,
  param_value VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 11. 产品文档表
-- ============================================================
CREATE TABLE IF NOT EXISTS product_docs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 12. 案例表
-- ============================================================
CREATE TABLE IF NOT EXISTS cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  summary VARCHAR(500),
  description TEXT,
  cover_image VARCHAR(500),
  location VARCHAR(200),
  province VARCHAR(100),
  is_featured TINYINT DEFAULT 0,
  sort_order INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 13. 案例图片表
-- ============================================================
CREATE TABLE IF NOT EXISTS case_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  title VARCHAR(200),
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 14. 荣誉资质表
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  type VARCHAR(100),
  certificate_number VARCHAR(200),
  description TEXT,
  image VARCHAR(500),
  issue_date DATE,
  sort_order INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 15. 团队成员表
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(200),
  bio TEXT,
  avatar VARCHAR(500),
  is_featured TINYINT DEFAULT 0,
  sort_order INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 16. 网站设置表
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES
('site_name', '杨凌三智科技有限公司'),
('site_description', '专注于水土保持监测与生态治理的高科技企业'),
('site_keywords', '水土保持,生态监测,盐碱地治理,智慧水保'),
('company_intro', '杨凌三智科技有限公司是一家专注于水土保持监测与生态治理领域的高科技企业，致力于为用户提供先进的监测设备和解决方案。'),
('contact_phone', '029-87012345'),
('contact_email', 'info@sanzhi-tech.com'),
('contact_address', '陕西省杨凌示范区'),
('contact_working_hours', '周一至周五 9:00-18:00'),
('footer_icp', '陕ICP备2025XXXXXX号');

-- ============================================================
-- 17. 询盘/留言表
-- ============================================================
CREATE TABLE IF NOT EXISTS inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  company VARCHAR(200),
  message TEXT NOT NULL,
  source VARCHAR(50),
  status ENUM('pending','processed','ignored') DEFAULT 'pending',
  remark TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 初始化完成
-- ============================================================
SELECT 'Database initialized successfully! 17 tables created.' AS result;
