/**
 * server-static.js — 无MySQL依赖的静态数据版本后端
 * 所有数据从 db_export.json 读取，适合部署到 Render / Railway 等平台
 * 
 * 启动命令: node server-static.js
 * 端口: process.env.PORT || 3000
 */

import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ─── 加载数据 ─────────────────────────────────────
const dbPath = path.join(__dirname, 'db_export.json');
const DB = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// 内存数据（可写）
let navCategories = DB.nav_categories || [];
let navSubcategories = DB.nav_subcategories || [];
let articles = DB.articles || [];
let products = DB.products || [];
let cases = DB.cases || [];
let heroSlides = DB.hero_slides || [];
let teamMembers = DB.team_members || [];
let certificates = DB.certificates || [];
let siteSettings = DB.site_settings || [];
let inquiries = DB.inquiries || [];

// ─── 工具函数 ─────────────────────────────────────
const ok = (res, data, message = 'success') => res.json({ code: 0, data, message });
const notFound = (res, msg = '未找到') => res.status(404).json({ code: 404, data: null, message: msg });

function paginate(list, page = 1, pageSize = 20) {
  const p = Number(page), ps = Number(pageSize);
  const total = list.length;
  const items = list.slice((p - 1) * ps, p * ps);
  return { list: items, total, page: p, pageSize: ps };
}

// ─── 应用配置 ──────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件（如有 uploads 目录）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 前端静态文件（Vite build 输出）
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback：非API路由返回index.html
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Health check
app.get('/api/v1/health', (req, res) => ok(res, { status: 'ok', timestamp: new Date().toISOString() }));

// ─── 导航栏目 ──────────────────────────────────────
app.get('/api/v1/nav-categories', (req, res) => {
  const cats = navCategories
    .filter(c => c.status === 1)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(cat => ({
      ...cat,
      subcategories: navSubcategories
        .filter(s => s.parent_id === cat.id && s.status === 1)
        .sort((a, b) => a.sort_order - b.sort_order),
    }));
  ok(res, cats);
});

app.get('/api/v1/nav-categories/:id', (req, res) => {
  const cat = navCategories.find(c => c.id === Number(req.params.id));
  if (!cat) return notFound(res, '栏目不存在');
  ok(res, cat);
});

// ─── 二级导航 ──────────────────────────────────────
app.get('/api/v1/nav-subcategories', (req, res) => {
  const { parent_id } = req.query;
  let list = navSubcategories.filter(s => s.status === 1);
  if (parent_id) list = list.filter(s => s.parent_id === Number(parent_id));
  list = list.sort((a, b) => a.sort_order - b.sort_order);
  ok(res, list);
});

app.get('/api/v1/nav-subcategories/by-slug/:slug', (req, res) => {
  const sub = navSubcategories.find(s => s.slug === req.params.slug);
  if (!sub) return notFound(res, '子栏目不存在');
  ok(res, sub);
});

app.get('/api/v1/nav-subcategories/:id', (req, res) => {
  const sub = navSubcategories.find(s => s.id === Number(req.params.id));
  if (!sub) return notFound(res, '子栏目不存在');
  ok(res, sub);
});

// ─── 文章 ──────────────────────────────────────────
app.get('/api/v1/articles', (req, res) => {
  const { subcategory_id, page = 1, pageSize = 20, is_featured } = req.query;
  let list = articles.filter(a => a.status === 1);
  if (subcategory_id) {
    const ids = String(subcategory_id).split(',').map(Number).filter(Boolean);
    list = list.filter(a => ids.includes(a.subcategory_id));
  }
  if (is_featured !== undefined) {
    list = list.filter(a => a.is_featured == is_featured);
  }
  list = list.sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at);
  });
  ok(res, paginate(list, page, pageSize));
});

app.get('/api/v1/articles/:id', (req, res) => {
  const article = articles.find(a => a.id === Number(req.params.id) && a.status === 1);
  if (!article) return notFound(res, '文章不存在');
  ok(res, { ...article, images: [] });
});

// ─── 产品 ──────────────────────────────────────────
app.get('/api/v1/products', (req, res) => {
  const { category_id, page = 1, pageSize = 20 } = req.query;
  let list = products.filter(p => p.status === 1);
  if (category_id) list = list.filter(p => p.category_id === Number(category_id));
  list = list.sort((a, b) => a.sort_order - b.sort_order);
  ok(res, paginate(list, page, pageSize));
});

app.get('/api/v1/products/:id', (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return notFound(res, '产品不存在');
  ok(res, product);
});

// ─── 案例 ──────────────────────────────────────────
app.get('/api/v1/cases', (req, res) => {
  const { page = 1, pageSize = 20 } = req.query;
  let list = cases.filter(c => c.status === 1).sort((a, b) => a.sort_order - b.sort_order);
  ok(res, paginate(list, page, pageSize));
});

app.get('/api/v1/cases/:id', (req, res) => {
  const item = cases.find(c => c.id === Number(req.params.id));
  if (!item) return notFound(res, '案例不存在');
  ok(res, item);
});

// ─── 轮播图 ────────────────────────────────────────
app.get('/api/v1/hero-slides', (req, res) => {
  const list = heroSlides.filter(s => s.status === 1).sort((a, b) => a.sort_order - b.sort_order);
  ok(res, list);
});

// ─── 团队 ──────────────────────────────────────────
app.get('/api/v1/team', (req, res) => {
  const list = teamMembers.filter(t => t.status === 1).sort((a, b) => a.sort_order - b.sort_order);
  ok(res, list);
});

// ─── 证书荣誉 ──────────────────────────────────────
app.get('/api/v1/certificates', (req, res) => {
  const list = certificates.filter(c => c.status === 1).sort((a, b) => a.sort_order - b.sort_order);
  ok(res, list);
});

// ─── 站点设置 ──────────────────────────────────────
app.get('/api/v1/settings', (req, res) => {
  const map = {};
  siteSettings.forEach(s => { map[s.key] = s.value; });
  ok(res, map);
});

// ─── 留言/询问（只读，提交返回成功） ──────────────
app.get('/api/v1/inquiries', (req, res) => ok(res, paginate(inquiries)));
app.post('/api/v1/inquiries', (req, res) => {
  const newItem = { id: Date.now(), ...req.body, status: 0, created_at: new Date().toISOString() };
  inquiries.push(newItem);
  ok(res, newItem, '提交成功');
});

// ─── 认证（只读模式，不允许后台登录） ──────────────
app.post('/api/v1/auth/login', (req, res) => {
  // 在线预览版本不开放管理后台
  res.status(403).json({ code: 403, data: null, message: '在线预览版本不支持后台登录' });
});

// ─── 启动 ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Static API Server] 运行中: http://localhost:${PORT}`);
  console.log(`[Static API Server] 数据统计: ${articles.length}篇文章 / ${products.length}个产品 / ${cases.length}个案例`);
});
