import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Breadcrumbs, Skeleton, Divider, Button, TextField, Alert, Snackbar, Chip } from '@mui/material';
import { navCategoryApi, articleApi } from '../api/navigation';
import type { NavCategory, NavSubcategory, Article } from '../api/navigation';
import { getProducts } from '../api/products';
import { getCases } from '../api/cases';
import type { Product, Case } from '../types/api';
import { useI18n } from '../contexts/I18nContext';
import { V2_COLORS } from '../theme/colors';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import BusinessIcon from '@mui/icons-material/Business';
import EditNoteIcon from '@mui/icons-material/EditNote';

// Fallback栏目数据 — API不可用时根据slug匹配
const fallbackCategoriesMap: Record<string, NavCategory> = {
  'about': { id: 2, name: '关于我们', slug: 'about', name_en: 'About Us', description: '公司介绍、发展历程、团队风采', banner_image: null, sort_order: 2, status: 1, created_at: '', updated_at: '' },
  'products': { id: 3, name: '产品中心', slug: 'products', name_en: 'Products', description: '五大产品系列，覆盖水土保持监测全场景', banner_image: null, sort_order: 3, status: 1, created_at: '', updated_at: '' },
  'cases': { id: 4, name: '案例中心', slug: 'cases', name_en: 'Cases', description: '覆盖全国20+省份，服务水土保持一线', banner_image: null, sort_order: 4, status: 1, created_at: '', updated_at: '' },
  'news': { id: 5, name: '新闻动态', slug: 'news', name_en: 'News', description: '公司新闻、行业资讯、技术文章', banner_image: null, sort_order: 5, status: 1, created_at: '', updated_at: '' },
  'technology': { id: 6, name: '核心技术', slug: 'technology', name_en: 'Technology', description: '专利技术驱动，权威资质保障', banner_image: null, sort_order: 6, status: 1, created_at: '', updated_at: '' },
  'achievements': { id: 7, name: '成果转化', slug: 'achievements', name_en: 'Achievements', description: '从实验室到田间地头，加速科技成果产业化', banner_image: null, sort_order: 7, status: 1, created_at: '', updated_at: '' },
  'cooperation': { id: 8, name: '合作加盟', slug: 'cooperation', name_en: 'Cooperation', description: '共建水土保持智能监测生态', banner_image: null, sort_order: 8, status: 1, created_at: '', updated_at: '' },
};

const fallbackSubcategoriesMap: Record<string, NavSubcategory[]> = {
  'about': [
    { id: 21, parent_id: 2, name: '公司简介', slug: 'profile', description: '了解杨凌三智科技', display_mode: 'single', sort_order: 1, status: 1, created_at: '', updated_at: '' },
    { id: 22, parent_id: 2, name: '发展历程', slug: 'history', description: '14年深耕历程', display_mode: 'list', sort_order: 2, status: 1, created_at: '', updated_at: '' },
    { id: 23, parent_id: 2, name: '团队风采', slug: 'team', description: '核心团队介绍', display_mode: 'list', sort_order: 3, status: 1, created_at: '', updated_at: '' },
  ],
  'products': [
    { id: 31, parent_id: 3, name: '径流泥沙监测', slug: 'runoff', description: '径流小区与泥沙自动监测设备', display_mode: 'list', sort_order: 1, status: 1, created_at: '', updated_at: '' },
    { id: 32, parent_id: 3, name: '全自动气象站', slug: 'weather', description: '多参数气象数据自动采集', display_mode: 'list', sort_order: 2, status: 1, created_at: '', updated_at: '' },
    { id: 33, parent_id: 3, name: '数据管理平台', slug: 'platform', description: '智慧水保云数据平台', display_mode: 'list', sort_order: 3, status: 1, created_at: '', updated_at: '' },
  ],
  'news': [
    { id: 11, parent_id: 5, name: '公司新闻', slug: 'company-news', description: '企业最新动态', display_mode: 'list', sort_order: 1, status: 1, created_at: '', updated_at: '' },
    { id: 12, parent_id: 5, name: '行业资讯', slug: 'industry-news', description: '行业前沿报道', display_mode: 'list', sort_order: 2, status: 1, created_at: '', updated_at: '' },
    { id: 13, parent_id: 5, name: '技术文章', slug: 'technical-articles', description: '技术干货分享', display_mode: 'list', sort_order: 3, status: 1, created_at: '', updated_at: '' },
  ],
  'technology': [
    { id: 51, parent_id: 6, name: '专利技术', slug: 'patents', description: '核心专利技术', display_mode: 'list', sort_order: 1, status: 1, created_at: '', updated_at: '' },
    { id: 52, parent_id: 6, name: '资质认证', slug: 'certifications', description: '权威认证与资质', display_mode: 'list', sort_order: 2, status: 1, created_at: '', updated_at: '' },
  ],
  'achievements': [
    { id: 61, parent_id: 7, name: '技术成果', slug: 'tech-achievements', description: '核心专利技术与产品化成果', display_mode: 'list', sort_order: 1, status: 1, created_at: '', updated_at: '' },
    { id: 62, parent_id: 7, name: '技术推广', slug: 'tech-promotion', description: '水利部推广目录及行业应用', display_mode: 'list', sort_order: 2, status: 1, created_at: '', updated_at: '' },
  ],
  'cooperation': [
    { id: 71, parent_id: 8, name: '区域代理', slug: 'agent', description: '区域代理合作申请', display_mode: 'form', sort_order: 1, status: 1, created_at: '', updated_at: '' },
    { id: 72, parent_id: 8, name: '项目合作', slug: 'project', description: '项目合作申请', display_mode: 'form', sort_order: 2, status: 1, created_at: '', updated_at: '' },
  ],
};

const fallbackArticlesMap: Record<number, Article[]> = {
  21: [{ id: 201, subcategory_id: 21, title: '杨凌三智科技有限公司', summary: '专注于水土保持智能监测领域的高科技企业', content: '<p>杨凌三智科技有限公司，坐落于中国唯一的农业高新技术产业示范区——杨凌，是一家专注于水土保持智能监测领域的高科技企业。公司依托水土保持与荒漠化整治全国重点实验室的科研力量，将前沿科技成果转化为可落地的监测产品与解决方案。</p><p>公司拥有完整的研发、生产、销售和服务体系，产品涵盖土壤水蚀监测、土壤风蚀监测、生态气象监测、盐碱地监测治理和智慧水保云平台五大系列，已在全国20余个省份成功应用。</p>', cover_image: null, author: '', published_at: '2024-01-01', status: 1, sort_order: 1, created_at: '', updated_at: '' }],
  // News fallback articles
  11: [
    { id: 3, subcategory_id: 11, title: '杨凌三智科技获评国家级高新技术企业', summary: '2025年度高新技术企业认定结果公布，杨凌三智科技成功入选。', content: '<p>经陕西省科技厅组织专家评审，杨凌三智科技有限公司凭借在水土保持智能监测领域的创新成果，成功获评国家级高新技术企业。</p>', cover_image: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80', author: '编辑部', published_at: '2025-06-01', status: 1, sort_order: 1, created_at: '', updated_at: '' },
    { id: 4, subcategory_id: 11, title: '公司与西北农林科技大学签订产学研合作协议', summary: '校企合作再升级，共推水土保持监测技术发展。', content: '<p>杨凌三智科技与西北农林科技大学正式签署产学研合作协议。</p>', cover_image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80', author: '编辑部', published_at: '2025-05-15', status: 1, sort_order: 2, created_at: '', updated_at: '' },
  ],
  12: [
    { id: 11, subcategory_id: 12, title: '2025年水土保持监测技术发展报告', summary: '行业最新技术趋势和发展方向分析。', content: '<p>随着国家对生态文明建设的持续投入，水土保持监测技术呈现出多维度创新的发展态势。</p>', cover_image: 'https://images.unsplash.com/photo-1457369804613-9c61ecfca15d?w=800&q=80', author: '研究部', published_at: '2025-06-04', status: 1, sort_order: 1, created_at: '', updated_at: '' },
  ],
  13: [
    { id: 12, subcategory_id: 13, title: '径流泥沙自动监测技术原理与应用', summary: '深入解析径流泥沙自动监测的核心技术原理。', content: '<p>径流泥沙自动监测技术是水土保持领域的核心技术之一。</p>', cover_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', author: '技术部', published_at: '2025-06-03', status: 1, sort_order: 1, created_at: '', updated_at: '' },
  ],
  22: [
    { id: 211, subcategory_id: 22, title: '2011年：公司成立', summary: '西安三智科技有限公司在西安注册成立', content: '<p>西安三智科技有限公司于2011年7月在西安注册成立，专注于非标自动化、试验、环保、水土保持设备的研发、生产和销售。</p>', cover_image: null, author: '', published_at: '2011-07-01', status: 1, sort_order: 1, created_at: '', updated_at: '' },
    { id: 212, subcategory_id: 22, title: '2016年：首个径流泥沙监测产品问世', summary: '自主研发径流泥沙自动监测仪，填补行业空白', content: '<p>经过5年技术积累，公司自主研发的径流泥沙自动监测仪成功问世，实现了水土流失关键参数的自动化、连续化监测。</p>', cover_image: null, author: '', published_at: '2016-06-01', status: 1, sort_order: 2, created_at: '', updated_at: '' },
    { id: 213, subcategory_id: 22, title: '2020年：杨凌三智成立', summary: '杨凌三智科技有限公司在杨凌农创汇注册', content: '<p>在杨凌农业高新技术产业示范区成立杨凌三智科技有限公司，入驻农创汇，享受示范区政策扶持，与水土保持与荒漠化整治全国重点实验室建立深度合作。</p>', cover_image: null, author: '', published_at: '2020-03-01', status: 1, sort_order: 3, created_at: '', updated_at: '' },
    { id: 214, subcategory_id: 22, title: '2024年：产品入选水利部推广目录', summary: '径流泥沙自动监测仪入选水利部先进实用技术推广目录', content: '<p>公司核心产品径流泥沙自动监测仪通过水利部科技推广中心评审，正式入选先进实用技术推广目录，标志着产品技术水平获得权威认可。</p>', cover_image: null, author: '', published_at: '2024-01-01', status: 1, sort_order: 4, created_at: '', updated_at: '' },
  ],
  23: [
    { id: 221, subcategory_id: 23, title: '赵向辉 · 总经理', summary: '高级工程师，30年机械设计及自动化经验', content: '<p>赵向辉，高级工程师，拥有30年机械设计及自动化经验，主持完成多项省部级科研项目，在水土保持监测设备研发领域积累了丰富的工程实践经验。</p>', cover_image: null, author: '', published_at: '', status: 1, sort_order: 1, created_at: '', updated_at: '' },
    { id: 222, subcategory_id: 23, title: '郭明航 · 技术总监', summary: '研究员，35年水保工作经验', content: '<p>郭明航，研究员，原中国科学院水利部水土保持研究所资深专家，35年水土保持科研与工程经验，主持多项国家级科研项目，发表学术论文50余篇。</p>', cover_image: null, author: '', published_at: '', status: 1, sort_order: 2, created_at: '', updated_at: '' },
    { id: 223, subcategory_id: 23, title: '展小云 · 科技副总经理', summary: '生态学博士，12年水保监测经验', content: '<p>展小云，生态学博士，12年水土保持监测经验，负责公司技术路线规划和产品研发方向，在土壤侵蚀监测技术与数据分析领域具有深厚造诣。</p>', cover_image: null, author: '', published_at: '', status: 1, sort_order: 3, created_at: '', updated_at: '' },
  ],
  31: [
    { id: 311, subcategory_id: 31, title: '径流泥沙自动监测仪', summary: '全自动径流泥沙在线监测，荣获国家发明专利', content: '<p>径流泥沙自动监测仪是我司核心产品，采用光学传感与称重双重测量原理，可实时在线监测径流量、泥沙含量、输沙率等关键参数，数据自动上传云平台。无需人工值守，实现24小时不间断监测，精度可达毫米级。</p>', cover_image: null, author: '', published_at: '2024-01-15', status: 1, sort_order: 1, created_at: '', updated_at: '' },
    { id: 312, subcategory_id: 31, title: '模块化径流小区', summary: '标准化径流监测设备，支持多规格组合', content: '<p>模块化径流小区采用标准化设计，可根据不同坡度、坡长需求灵活组合，精确测量地表径流量和泥沙含量。</p>', cover_image: null, author: '', published_at: '', status: 1, sort_order: 2, created_at: '', updated_at: '' },
  ],
  32: [
    { id: 321, subcategory_id: 32, title: '全自动气象站', summary: '多参数气象数据自动采集，支持10余项气象参数', content: '<p>全自动气象站可同时监测温度、湿度、风速、风向、气压、太阳辐射等10余项气象参数，数据采集频率最高可达1分钟/次。设备采用工业级传感器，防护等级IP65，支持太阳能供电。</p>', cover_image: null, author: '', published_at: '', status: 1, sort_order: 1, created_at: '', updated_at: '' },
  ],
  33: [
    { id: 331, subcategory_id: 33, title: '水土保持云数据平台', summary: '数据管理与可视化平台，支持多终端访问', content: '<p>水土保持云数据平台支持PC端、手机端和大屏端多终端访问，具备数据采集、存储、分析、预警和报表自动生成等功能。</p>', cover_image: null, author: '', published_at: '', status: 1, sort_order: 1, created_at: '', updated_at: '' },
  ],
  51: [
    { id: 511, subcategory_id: 51, title: '径流泥沙自动监测仪专利', summary: '国家发明专利授权', content: '<p>径流泥沙自动监测仪荣获国家发明专利授权，专利号ZL202310XXXXX.X。该技术突破了传统人工采样的局限，实现了水土流失关键参数的自动化监测。</p>', cover_image: null, author: '', published_at: '2024-01-15', status: 1, sort_order: 1, created_at: '', updated_at: '' },
    { id: 512, subcategory_id: 51, title: '全自动风蚀监测系统专利', summary: '实用新型专利授权', content: '<p>全自动风蚀监测系统荣获实用新型专利授权，专利号ZL202210XXXXX.X。系统集成风速监测、集沙和数据采集功能，适用于荒漠化地区长期无人值守监测。</p>', cover_image: null, author: '', published_at: '2023-06-20', status: 1, sort_order: 2, created_at: '', updated_at: '' },
  ],
  52: [
    { id: 521, subcategory_id: 52, title: 'CMA计量认证', summary: '中国计量认证', content: '<p>我司核心产品通过CMA中国计量认证，标志着产品测量数据具有法律效力。</p>', cover_image: null, author: '', published_at: '2024-03-01', status: 1, sort_order: 1, created_at: '', updated_at: '' },
    { id: 522, subcategory_id: 52, title: '高新技术企业证书', summary: '国家高新技术企业认定', content: '<p>公司获得国家高新技术企业认定证书，证书号GR202XXXXXXX。</p>', cover_image: null, author: '', published_at: '2023-12-01', status: 1, sort_order: 2, created_at: '', updated_at: '' },
  ],
  61: [
    { id: 611, subcategory_id: 61, title: '径流泥沙自动监测仪获国家发明专利', summary: '核心产品荣获国家发明专利授权', content: '<p>径流泥沙自动监测仪采用光学传感与称重双重测量原理，精度可达毫米级，已成功应用于全国20余个省份。</p>', cover_image: null, author: '', published_at: '2024-01-15', status: 1, sort_order: 1, created_at: '', updated_at: '' },
  ],
  62: [
    { id: 621, subcategory_id: 62, title: '径流泥沙自动监测仪入选水利部推广目录', summary: '产品通过水利部科技推广中心评审', content: '<p>径流泥沙自动监测仪正式入选水利部先进实用技术推广目录，技术水平获权威认可。</p>', cover_image: null, author: '', published_at: '2023-09-01', status: 1, sort_order: 1, created_at: '', updated_at: '' },
  ],
};

/** 产品子栏目 slug → categories 表 category_id 映射 */
const productCategoryMap: Record<string, number> = {
  'soil-water-erosion-series': 1,
  'wind-erosion-series': 2,
  'eco-meteorology-series': 3,
  'saline-alkali-series': 4,
  'smart-cloud-platform': 5,
  'hydraulic-erosion-series': 1,
};

/** fallback 产品数据 */
const fallbackProducts: Product[] = [
  { id: 1, category_id: 1, name: 'SZ-SW01 径流泥沙自动监测仪', slug: 'sz-sw01', model: 'SZ-SW01', summary: '全自动径流泥沙在线监测，光学传感+称重双重测量', cover_image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&q=80', status: 1, sort_order: 1 },
  { id: 2, category_id: 1, name: 'SZ-SW02 坡面侵蚀监测系统', slug: 'sz-sw02', model: 'SZ-SW02', summary: '坡面水土流失多参数自动监测', cover_image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&q=80', status: 1, sort_order: 2 },
  { id: 3, category_id: 2, name: 'SZ-WF01 风蚀自动监测站', slug: 'sz-wf01', model: 'SZ-WF01', summary: '荒漠化地区风蚀数据自动采集', cover_image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80', status: 1, sort_order: 1 },
  { id: 4, category_id: 3, name: 'SZ-EM01 生态气象监测站', slug: 'sz-em01', model: 'SZ-EM01', summary: '多参数气象与生态数据同步采集', cover_image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80', status: 1, sort_order: 1 },
  { id: 5, category_id: 4, name: 'SZ-SA01 土壤盐分在线监测系统', slug: 'sz-sa01', model: 'SZ-SA01', summary: '盐碱地土壤盐分实时在线监测', cover_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80', status: 1, sort_order: 1 },
  { id: 6, category_id: 5, name: '智慧水保云平台', slug: 'smart-water-conservation', model: 'SWCP-1.0', summary: '数据采集/存储/分析/预警一体化云平台', cover_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80', status: 1, sort_order: 1 },
];

export default function CategoryPage() {
  const { slug, subSlug } = useParams<{ slug: string; subSlug?: string }>();
  const { t, isZh } = useI18n();
  // DEBUG: expose state globally
  if (typeof window !== 'undefined') (window as any).__catPage = { slug, subSlug };
  const navigate = useNavigate();
  const [category, setCategory] = useState<NavCategory | null>(null);
  const [subcategories, setSubcategories] = useState<NavSubcategory[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [caseList, setCaseList] = useState<Case[]>([]);
  const [activeSub, setActiveSub] = useState<NavSubcategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Form state
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', company: '', city: '', message: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const getName = useCallback((obj: any) => (obj ? (isZh ? obj.name : (obj.name_en || obj.name)) : ''), [isZh]);
  const getTitle = useCallback((obj: any) => (obj ? (isZh ? obj.title : (obj.title_en || obj.title)) : ''), [isZh]);
  const getSummary = useCallback((obj: any) => (obj ? (isZh ? obj.summary : (obj.summary_en || obj.summary)) : ''), [isZh]);
  const getContent = useCallback((obj: any) => (obj ? (isZh ? obj.content : (obj.content_en || obj.content)) : ''), [isZh]);

  useEffect(() => {
    console.log('[CategoryPage] useEffect RUNNING, slug=', slug, 'subSlug=', subSlug);
    if (!slug) { console.log('[CategoryPage] No slug, skipping'); return; }
    let cancelled = false;
    const dbSlug = slug === 'achievements-main' ? 'achievements' : slug;
    console.log('[CategoryPage] dbSlug=', dbSlug);

    // Fallback辅助函数
    const getFallbackData = () => {
      const cat = fallbackCategoriesMap[dbSlug];
      const subs = fallbackSubcategoriesMap[dbSlug] || [];
      return { cat, subs };
    };

    const loadData = async () => {
      setLoading(true);
      setError(false);
      try {
        console.log('[CategoryPage] Step1: fetch nav-categories');
        const catRes = await navCategoryApi.getAll();
        const cats: NavCategory[] = (catRes?.data?.data as NavCategory[]) || [];
        console.log('[CategoryPage] Step1 done:', cats.length, 'cats, looking for:', dbSlug);
        let found = cats.find((c: NavCategory) => c.slug === dbSlug);

        if (!found) {
          // API中找不到，尝试fallback
          const fb = getFallbackData();
          if (fb.cat) {
            found = fb.cat;
          } else {
            console.warn('[CategoryPage] Category not found:', dbSlug);
            if (!cancelled) { setLoading(false); setError(true); }
            return;
          }
        }
        if (!cancelled) setCategory(found);
        if (cancelled) { console.log('[CategoryPage] Cancelled after category'); return; }

        console.log('[CategoryPage] Step2: fetch subcategories for', found.id);
        let subs: NavSubcategory[] = [];
        try {
          const subRes = await navCategoryApi.getSubcategories(found.id);
          const apiSubs: NavSubcategory[] = (subRes?.data?.data as NavSubcategory[]) || [];
          if (apiSubs.length > 0) {
            subs = apiSubs;
          } else {
            subs = fallbackSubcategoriesMap[dbSlug] || [];
          }
        } catch {
          subs = fallbackSubcategoriesMap[dbSlug] || [];
        }
        console.log('[CategoryPage] Step2 done:', subs.length, 'subs');
        if (!cancelled) setSubcategories(subs);
        if (cancelled) { console.log('[CategoryPage] Cancelled after subs'); return; }

        let targetSub: NavSubcategory | undefined;
        if (subSlug) {
          targetSub = subs.find((s: NavSubcategory) => s.slug === subSlug);
        } else {
          targetSub = subs.length > 0 ? subs[0] : undefined;
        }

        if (targetSub) {
          const ct = targetSub.content_type || 'article';
          console.log('[CategoryPage] Step3: content_type=', ct, 'sub=', targetSub.id, targetSub.name);
          if (!cancelled) setActiveSub(targetSub);

          if (ct === 'product') {
            // 产品类型：从 products API 获取
            const catId = productCategoryMap[targetSub.slug] || 1;
            let productList: Product[] = [];
            try {
              const prodRes = await getProducts({ category_id: catId, pageSize: 50 });
              const apiList: Product[] = (prodRes?.data?.data?.list as Product[]) || [];
              productList = apiList.length > 0 ? apiList : fallbackProducts.filter(p => p.category_id === catId);
            } catch {
              productList = fallbackProducts.filter(p => p.category_id === catId);
            }
            if (!cancelled) { setProducts(productList); setArticles([]); setCaseList([]); }
          } else if (targetSub.slug === 'typical-cases') {
            // 典型案例从 cases 表加载
            let list: Case[] = [];
            try {
              const caseRes = await getCases({ pageSize: 50 });
              list = caseRes.data?.data?.list || [];
            } catch { list = []; }
            if (!cancelled) { setCaseList(list); setArticles([]); setProducts([]); }
          } else {
            // 文章类型
            let articleList: Article[] = [];
            try {
              const artRes = await articleApi.getAll({ subcategory_id: targetSub.id, pageSize: 50 });
              const apiList: Article[] = (artRes?.data?.data?.list as Article[]) || [];
              articleList = apiList.length > 0 ? apiList : (fallbackArticlesMap[targetSub.id] || []);
            } catch {
              articleList = fallbackArticlesMap[targetSub.id] || [];
            }
            console.log('[CategoryPage] Step3 done:', articleList.length, 'articles');
            if (!cancelled) { setArticles(articleList); setProducts([]); }
          }
        } else {
          if (!cancelled) { setActiveSub(null); setArticles([]); }
        }
      } catch (err) {
        console.error('[CategoryPage] Failed to load category, trying fallback:', err);
        // 完全失败时使用fallback
        const fb = getFallbackData();
        if (fb.cat && !cancelled) {
          setCategory(fb.cat);
          setSubcategories(fb.subs);
          const targetSub = subSlug
            ? fb.subs.find(s => s.slug === subSlug)
            : fb.subs[0];
          if (targetSub) {
            setActiveSub(targetSub);
            setArticles(fallbackArticlesMap[targetSub.id] || []);
          }
        } else if (!cancelled) {
          setError(true);
        }
      } finally {
        console.log('[CategoryPage] Finally: loading=false, cancelled=', cancelled);
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, [slug, subSlug]);

  const handleSubNavClick = (sub: NavSubcategory) => {
    navigate(`/${slug}/${sub.slug}`);
  };

  const handleFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleFormSubmit = async () => {
    if (!formData.name || !formData.phone) return;
    setFormSubmitting(true);
    try {
      const apiClient = (await import('../api/client')).default;
      await apiClient.post('/inquiries', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        company: formData.company,
        city: formData.city,
        message: formData.message || '在线合作申请',
        source: 'website_join',
      });
      setFormSuccess(true);
      setFormData({ name: '', phone: '', email: '', company: '', city: '', message: '' });
    } catch (err) {
      console.error('Form submit error:', err);
    }
    setFormSubmitting(false);
  };

  // --- Loading state ---
  if (loading) {
    return (
      <Box>
        <Box sx={{
          bgcolor: V2_COLORS.primary.dark, py: { xs: 7, md: 11 }, minHeight: { xs: 220, md: 300 },
          position: 'relative', overflow: 'hidden',
          background: `linear-gradient(135deg, ${V2_COLORS.primary.dark} 0%, ${V2_COLORS.secondary.dark} 70%, #040F1A 100%)`,
        }}>
          <Container maxWidth="lg">
            <Skeleton height={18} width={160} sx={{ bgcolor: 'rgba(255,255,255,0.12)', mb: 2 }} />
            <Skeleton height={44} width={280} sx={{ bgcolor: 'rgba(255,255,255,0.15)', mb: 1.5 }} />
            <Skeleton height={16} width={120} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
          </Container>
        </Box>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={3}>
            {[1, 2, 3].map(i => (
              <Grid item xs={12} md={4} key={i}>
                <Skeleton height={220} variant="rectangular" sx={{ borderRadius: 3, bgcolor: 'rgba(0,0,0,0.04)' }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  // --- Error state ---
  if (error || !category) {
    return (
      <Box>
        <Box sx={{
          bgcolor: V2_COLORS.primary.dark, py: { xs: 7, md: 11 }, minHeight: { xs: 220, md: 300 },
          display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden',
          background: `linear-gradient(135deg, ${V2_COLORS.primary.dark} 0%, ${V2_COLORS.secondary.dark} 70%, #040F1A 100%)`,
        }}>
          <Container maxWidth="lg" sx={{ color: '#fff', position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.6rem', md: '2.2rem' }, letterSpacing: 3, mb: 1.5 }}>
              {t('页面未找到', 'Page Not Found')}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}>
              <Link to="/" style={{ color: V2_COLORS.accent.light, textDecoration: 'none', fontWeight: 500 }}>
                {t('返回首页', 'Back to Home')}
              </Link>
            </Typography>
          </Container>
        </Box>
      </Box>
    );
  }

  const displayMode = activeSub?.display_mode || 'list';
  const firstArticle = articles.length > 0 ? articles[0] : null;
  const subSlugHref = (s: NavSubcategory) => `/${slug}/${s.slug}`;

  return (
    <Box>
      {/* Banner */}
      <Box sx={{
        position: 'relative',
        py: { xs: 7, md: 11 },
        minHeight: { xs: 220, md: 300 },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: category.banner_image
          ? `linear-gradient(135deg, ${V2_COLORS.primary.dark}F2, ${V2_COLORS.secondary.dark}AA), url(${category.banner_image}) center/cover no-repeat`
          : `linear-gradient(135deg, ${V2_COLORS.primary.dark} 0%, ${V2_COLORS.secondary.dark} 70%, #040F1A 100%)`,
      }}>
        {/* SVG 几何装饰 */}
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', opacity: 0.15 }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="banner-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#fff" opacity="0.5" />
              </pattern>
              <linearGradient id="banner-line-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                <stop offset="50%" stopColor="#fff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#banner-dots)" />
            {/* 对角线装饰 */}
            <line x1="70%" y1="0" x2="100%" y2="70%" stroke="url(#banner-line-grad)" strokeWidth="1" />
            <line x1="80%" y1="0" x2="100%" y2="40%" stroke="url(#banner-line-grad)" strokeWidth="0.5" opacity="0.5" />
            {/* 右下角大圆 */}
            <circle cx="92%" cy="85%" r="120" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.1" />
            <circle cx="92%" cy="85%" r="80" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.08" />
          </svg>
        </Box>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ maxWidth: 700 }}>
            <Breadcrumbs
              separator={<NavigateNextIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }} />}
              sx={{ mb: 2 }}
            >
              <Typography
                component={Link}
                to="/"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.8rem', '&:hover': { color: '#fff' } }}
              >
                <HomeIcon sx={{ fontSize: 15 }} />
                {t('首页', 'Home')}
              </Typography>
              <Typography sx={{ color: V2_COLORS.accent.light, fontWeight: 600, fontSize: '0.8rem' }}>
                {getName(category)}
              </Typography>
              {activeSub && (
                <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>
                  {getName(activeSub)}
                </Typography>
              )}
            </Breadcrumbs>
            <Typography variant="h3" sx={{
              fontWeight: 800, letterSpacing: 3, mb: 1.5, color: '#fff',
              fontSize: { xs: '1.6rem', md: '2.2rem' },
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            }}>
              {getName(category)}
            </Typography>
            {category.name_en && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 40, height: 1, bgcolor: V2_COLORS.accent.main, opacity: 0.6 }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', letterSpacing: 4, textTransform: 'uppercase' }}>
                  {category.name_en}
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ bgcolor: V2_COLORS.background.default, position: 'relative' }}>
        {/* 背景纹理 */}
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03 }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="content-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill={V2_COLORS.primary.main} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#content-dots)" />
          </svg>
        </Box>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: { xs: 'block', md: 'flex' }, gap: 4 }}>
          
          {/* Left Sidebar: Sub-navigation */}
          {subcategories.length > 0 && (
            <Box sx={{
              width: { md: 250 }, flexShrink: 0, mb: { xs: 3, md: 0 },
              bgcolor: '#fff', borderRadius: 3, overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
              alignSelf: 'flex-start', position: 'relative',
            }}>
              {/* 顶部渐变装饰条 */}
              <Box sx={{
                height: 4,
                background: `linear-gradient(90deg, ${V2_COLORS.primary.dark}, ${V2_COLORS.accent.main}, ${V2_COLORS.primary.light})`,
              }} />
              <Typography sx={{
                px: 3, py: 2.5, fontWeight: 700, fontSize: '0.95rem',
                color: V2_COLORS.primary.dark, letterSpacing: 1,
                background: 'linear-gradient(180deg, rgba(15,43,71,0.03) 0%, transparent 100%)',
              }}>
                {getName(category)}
              </Typography>
              <Divider sx={{ mx: 2, borderColor: 'rgba(0,0,0,0.05)' }} />
              <Box sx={{ py: 1 }}>
                {subcategories.map((sub) => {
                  const isActive = activeSub?.id === sub.id;
                  return (
                    <Box
                      key={sub.id}
                      sx={{
                        mx: 1, my: 0.25, px: 2.5, py: 1.5, cursor: 'pointer', fontSize: '0.88rem',
                        borderRadius: 2,
                        borderLeft: 'none',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex', alignItems: 'center', gap: 1.2,
                        bgcolor: isActive
                          ? `linear-gradient(135deg, rgba(15,43,71,0.08), rgba(212,134,42,0.06))`
                          : 'transparent',
                        color: isActive ? V2_COLORS.primary.dark : V2_COLORS.text.secondary,
                        fontWeight: isActive ? 600 : 400,
                        position: 'relative',
                        ...(isActive ? {
                          '&::before': {
                            content: '""', position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                            width: 3, height: '60%', borderRadius: '0 3px 3px 0',
                            background: `linear-gradient(180deg, ${V2_COLORS.accent.main}, ${V2_COLORS.primary.main})`,
                          },
                          boxShadow: '0 2px 8px rgba(15,43,71,0.08)',
                        } : {}),
                        '&:hover': {
                          bgcolor: 'rgba(15,43,71,0.04)',
                          color: V2_COLORS.primary.dark,
                          transform: 'translateX(2px)',
                        },
                      }}
                      onClick={() => handleSubNavClick(sub)}
                    >
                      <ArticleIcon sx={{
                        fontSize: 17,
                        color: isActive ? V2_COLORS.accent.main : 'rgba(0,0,0,0.25)',
                        transition: 'transform 0.25s',
                        transform: isActive ? 'rotate(-6deg)' : 'rotate(0deg)',
                      }} />
                      {getName(sub)}
                    </Box>
                  );
                })}
              </Box>
              {/* 底部渐变阴影 */}
              <Box sx={{
                height: 24,
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.02) 100%)',
              }} />
            </Box>
          )}

          {/* Right Content Area */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {activeSub && displayMode !== 'form' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{
                  fontWeight: 700, color: V2_COLORS.primary.dark,
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                }}>
                  <Box sx={{
                    width: 4, height: 24, borderRadius: 1,
                    background: `linear-gradient(180deg, ${V2_COLORS.accent.main}, ${V2_COLORS.primary.main})`,
                  }} />
                  {getName(activeSub)}
                </Typography>
              </Box>
            )}

            {/* --- PRODUCT MODE: Product grid --- */}
            {activeSub?.content_type === 'product' && (
              products.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'rgba(0,0,0,0.3)' }}>
                  <Typography sx={{ fontSize: '1rem' }}>{t('暂无产品', 'No products yet')}</Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                      <Card
                        component={Link}
                        to={`/products/${product.id}`}
                        sx={{
                          textDecoration: 'none', borderRadius: 3, overflow: 'hidden',
                          border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                          transition: 'all 0.35s ease', height: '100%', display: 'flex', flexDirection: 'column',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: '0 12px 40px rgba(15,43,71,0.12)',
                            borderColor: `${V2_COLORS.primary.main}30`,
                          },
                        }}
                      >
                        <Box sx={{ position: 'relative', height: 180, overflow: 'hidden', bgcolor: V2_COLORS.primary[50] }}>
                          <Box
                            component="img"
                            src={product.cover_image || ''}
                            alt={product.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80';
                            }}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                          />
                          {product.model && (
                            <Chip
                              label={product.model}
                              size="small"
                              sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.7rem', backdropFilter: 'blur(4px)' }}
                            />
                          )}
                        </Box>
                        <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: V2_COLORS.primary.dark, mb: 1, lineHeight: 1.4 }}>
                            {product.name}
                          </Typography>
                          {product.summary && (
                            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.5)', lineHeight: 1.7, flex: 1, mb: 1.5 }}>
                              {product.summary}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', color: V2_COLORS.primary.main, fontWeight: 600, fontSize: '0.85rem' }}>
                            {t('查看详情', 'View Details')}
                            <ArrowForwardIcon sx={{ fontSize: 16, ml: 0.5, opacity: 0.5 }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )
            )}

            {/* --- SINGLE MODE: Direct article content --- */}
            {displayMode === 'single' && (
              articles.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'rgba(0,0,0,0.3)' }}>
                  <Typography sx={{ fontSize: '1rem' }}>{t('暂无内容', 'No content yet')}</Typography>
                </Box>
              ) : (
                <Box sx={{ maxWidth: 780, mx: 'auto' }}>
                  {firstArticle && (
                    <>
                      {/* Cover Image */}
                      {firstArticle.cover_image && (
                        <Box sx={{
                          mb: 4, borderRadius: 3, overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        }}>
                          <img
                            src={firstArticle.cover_image}
                            alt={getTitle(firstArticle)}
                            style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }}
                            onError={(e: any) => { e.target.style.display = 'none'; }}
                          />
                        </Box>
                      )}

                      {/* Title */}
                      <Typography variant="h4" sx={{
                        fontWeight: 800, mb: 2.5, color: V2_COLORS.primary.dark, lineHeight: 1.4,
                        fontSize: { xs: '1.4rem', md: '1.8rem' }, letterSpacing: 0.5,
                      }}>
                        {getTitle(firstArticle)}
                      </Typography>

                      {/* Meta */}
                      <Box sx={{
                        display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap', alignItems: 'center',
                        pb: 3, borderBottom: `1px solid ${V2_COLORS.divider}`,
                      }}>
                        {firstArticle.published_at && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: V2_COLORS.text.secondary, fontSize: '0.85rem' }}>
                            <CalendarTodayIcon sx={{ fontSize: 16 }} />
                            {new Date(firstArticle.published_at).toLocaleDateString(isZh ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </Box>
                        )}
                        {firstArticle.author && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: V2_COLORS.text.secondary, fontSize: '0.85rem' }}>
                            <PersonIcon sx={{ fontSize: 16 }} />
                            {firstArticle.author}
                          </Box>
                        )}
                      </Box>

                      {/* Article Content */}
                      <Box
                        sx={{
                          '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2, my: 3 },
                          '& h1, & h2, & h3': {
                            color: V2_COLORS.primary.dark, fontWeight: 700,
                            mt: 5, mb: 2, position: 'relative',
                            '&::before': {
                              content: '""', display: 'block', width: 32, height: 3,
                              borderRadius: 2, mb: 1.5,
                              background: `linear-gradient(90deg, ${V2_COLORS.accent.main}, ${V2_COLORS.primary.main})`,
                            },
                          },
                          '& h2': { fontSize: '1.35rem', letterSpacing: 0.3 },
                          '& h3': { fontSize: '1.1rem' },
                          '& p': { lineHeight: 1.9, mb: 2.5, color: V2_COLORS.text.primary, fontSize: '0.95rem' },
                          '& ul, & ol': { pl: 3, mb: 2.5 },
                          '& li': { mb: 0.6, lineHeight: 1.9, fontSize: '0.93rem', color: V2_COLORS.text.primary },
                          '& a': { color: V2_COLORS.accent.main, textDecoration: 'none', fontWeight: 500, '&:hover': { textDecoration: 'underline' } },
                          '& table': { width: '100%', borderCollapse: 'collapse', mb: 3, borderRadius: 2, overflow: 'hidden' },
                          '& th, & td': { border: `1px solid ${V2_COLORS.divider}`, p: 1.5, textAlign: 'left', fontSize: '0.88rem' },
                          '& th': { bgcolor: 'rgba(15,43,71,0.04)', fontWeight: 700, color: V2_COLORS.primary.dark },
                          '& blockquote': {
                            borderLeft: `3px solid ${V2_COLORS.accent.main}`,
                            pl: 2.5, py: 1, my: 3, mx: 0,
                            bgcolor: 'rgba(212,134,42,0.04)', borderRadius: '0 8px 8px 0',
                            color: V2_COLORS.text.secondary, fontStyle: 'italic',
                          },
                        }}
                        dangerouslySetInnerHTML={{ __html: getContent(firstArticle) || '' }}
                      />

                      {/* 底部装饰分隔 */}
                      <Box sx={{ mt: 6, pt: 4, borderTop: `1px solid ${V2_COLORS.divider}`, textAlign: 'center' }}>
                        <Box sx={{
                          display: 'inline-flex', alignItems: 'center', gap: 2,
                          color: V2_COLORS.text.disabled, fontSize: '0.8rem',
                        }}>
                          <Box sx={{ width: 24, height: 1, bgcolor: V2_COLORS.divider }} />
                          {t('— 杨凌三智科技 —', '— Yangling Sanzhi Tech —')}
                          <Box sx={{ width: 24, height: 1, bgcolor: V2_COLORS.divider }} />
                        </Box>
                      </Box>
                    </>
                  )}
                </Box>
              )
            )}

            {/* --- LIST MODE: Case cards (典型案例) --- */}
            {displayMode === 'list' && activeSub?.slug === 'typical-cases' && (
              caseList.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'rgba(0,0,0,0.3)' }}>
                  <Typography sx={{ fontSize: '1rem' }}>{t('暂无案例数据', 'No cases yet')}</Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {caseList.map((c) => (
                    <Grid item xs={12} sm={6} md={4} key={c.id}>
                      <Card sx={{ height: '100%', cursor: 'pointer', borderRadius: 3, overflow: 'hidden', transition: 'all 0.35s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(15,43,71,0.12)' } }}
                        onClick={() => navigate(`/cases/${c.id}`)}>
                        {c.cover_image ? (
                          <CardMedia component="img" src={c.cover_image} alt={c.title} sx={{ height: 160, objectFit: 'cover' }}
                            onError={(e: any) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <Box sx={{ height: 160, bgcolor: '#e8f0ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HomeIcon sx={{ fontSize: 36, color: V2_COLORS.primary.light }} />
                          </Box>
                        )}
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 0.5, color: V2_COLORS.primary.main }}>{c.title}</Typography>
                          {c.location && <Chip label={c.location} size="small" sx={{ mb: 1, bgcolor: '#FFF3E0', color: '#E65100' }} />}
                          {c.summary && <Typography variant="body2" sx={{ color: V2_COLORS.text.secondary, lineHeight: 1.7 }}>{c.summary}</Typography>}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )
            )}

            {/* --- LIST MODE: Article cards --- */}
            {displayMode === 'list' && activeSub?.slug !== 'typical-cases' && (
              articles.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'rgba(0,0,0,0.3)' }}>
                  <Typography sx={{ fontSize: '1rem' }}>{t('暂无内容', 'No content yet')}</Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {articles.map((article) => (
                    <Grid item xs={12} sm={6} md={4} key={article.id}>
                      <Card sx={{
                        height: '100%', cursor: 'pointer', borderRadius: 3, overflow: 'hidden',
                        border: '1px solid rgba(0,0,0,0.05)', transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative', bgcolor: '#fff',
                        '&:hover': {
                          transform: 'translateY(-6px)', boxShadow: '0 12px 32px rgba(15,43,71,0.12)',
                          borderColor: V2_COLORS.accent.main + '30',
                          '& .card-accent-bar': { width: '100%', opacity: 1 },
                          '& .card-image-placeholder': { transform: 'scale(1.05)' },
                        },
                      }} onClick={() => navigate(subSlugHref(activeSub!) + '/' + article.id)}>
                        {/* 封面图 / 渐变占位 */}
                        {article.cover_image ? (
                          <CardMedia
                            component="img"
                            height={190}
                            image={article.cover_image}
                            alt={getTitle(article)}
                            sx={{ objectFit: 'cover' }}
                            onError={(e: any) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Box sx={{
                            height: 190,
                            background: `linear-gradient(135deg, ${V2_COLORS.primary.dark}20, ${V2_COLORS.accent.main}15, ${V2_COLORS.primary.light}15)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', overflow: 'hidden',
                          }}>
                            <Box className="card-image-placeholder" sx={{ transition: 'transform 0.35s' }}>
                              <ImageIcon sx={{ fontSize: 48, color: 'rgba(15,43,71,0.12)' }} />
                            </Box>
                            {/* 占位背景纹理 */}
                            <Box sx={{ position: 'absolute', inset: 0, opacity: 0.06 }}>
                              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                  <pattern id={`card-dots-${article.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <circle cx="2" cy="2" r="1" fill={V2_COLORS.primary.main} />
                                  </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill={`url(#card-dots-${article.id})`} />
                              </svg>
                            </Box>
                          </Box>
                        )}

                        {/* 日期徽标 */}
                        {article.published_at && (
                          <Box sx={{
                            position: 'absolute', top: 12, right: 12,
                            bgcolor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
                            px: 1.2, py: 0.4, borderRadius: 1.5,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: V2_COLORS.text.secondary, lineHeight: 1 }}>
                              {new Date(article.published_at).toLocaleDateString(isZh ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })}
                            </Typography>
                          </Box>
                        )}

                        <CardContent sx={{ p: 2.5, pb: 2, '&:last-child': { pb: 2 } }}>
                          <Typography variant="subtitle1" sx={{
                            fontWeight: 700, mb: 1, fontSize: '0.92rem', color: V2_COLORS.primary.dark,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            lineHeight: 1.5, letterSpacing: 0.3,
                          }}>
                            {getTitle(article)}
                          </Typography>
                          {getSummary(article) ? (
                            <Typography variant="body2" sx={{
                              color: V2_COLORS.text.secondary, lineHeight: 1.7, mb: 1.5, fontSize: '0.82rem',
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                              {getSummary(article)}
                            </Typography>
                          ) : (
                            <Box sx={{ height: 48 }} />
                          )}
                        </CardContent>

                        {/* 底部彩色装饰条 */}
                        <Box className="card-accent-bar" sx={{
                          height: 3,
                          background: `linear-gradient(90deg, ${V2_COLORS.primary.dark}, ${V2_COLORS.accent.main}, ${V2_COLORS.primary.light})`,
                          width: '30%', opacity: 0, transition: 'all 0.4s ease',
                          position: 'absolute', bottom: 0, left: 0,
                        }} />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )
            )}

            {/* --- FORM MODE: Application form --- */}
            {displayMode === 'form' && (
              <Box>
                <Box sx={{
                  bgcolor: '#fff', borderRadius: 3, p: { xs: 3, md: 5 },
                  border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                  maxWidth: 660, position: 'relative', overflow: 'hidden',
                }}>
                  {/* 顶部装饰条 */}
                  <Box sx={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                    background: `linear-gradient(90deg, ${V2_COLORS.primary.dark}, ${V2_COLORS.accent.main}, ${V2_COLORS.primary.light})`,
                  }} />

                  <Typography variant="h5" sx={{
                    fontWeight: 700, mb: 1, color: V2_COLORS.primary.dark,
                    display: 'flex', alignItems: 'center', gap: 1.5,
                  }}>
                    <Box sx={{
                      width: 8, height: 32, borderRadius: 1,
                      background: `linear-gradient(180deg, ${V2_COLORS.accent.main}, ${V2_COLORS.primary.main})`,
                    }} />
                    {getName(activeSub)}
                  </Typography>
                  <Typography sx={{ color: V2_COLORS.text.secondary, mb: 4, ml: 3.5, fontSize: '0.9rem' }}>
                    {t('请填写以下信息，我们将尽快与您联系', 'Please fill out the form below and we will contact you shortly.')}
                  </Typography>

                  <Box component="form" onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }}>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth required label={t('姓名', 'Name')}
                          value={formData.name} onChange={handleFormChange('name')}
                          size="small"
                          InputProps={{
                            startAdornment: <PersonIcon sx={{ mr: 1, fontSize: 18, color: V2_COLORS.text.disabled }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth required label={t('手机号', 'Phone')}
                          value={formData.phone} onChange={handleFormChange('phone')}
                          size="small"
                          InputProps={{
                            startAdornment: <PhoneIcon sx={{ mr: 1, fontSize: 18, color: V2_COLORS.text.disabled }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth label={t('邮箱', 'Email')}
                          value={formData.email} onChange={handleFormChange('email')}
                          size="small" type="email"
                          InputProps={{
                            startAdornment: <EmailIcon sx={{ mr: 1, fontSize: 18, color: V2_COLORS.text.disabled }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth label={t('所在城市', 'City')}
                          value={formData.city} onChange={handleFormChange('city')}
                          size="small"
                          InputProps={{
                            startAdornment: <LocationCityIcon sx={{ mr: 1, fontSize: 18, color: V2_COLORS.text.disabled }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth label={t('公司名称', 'Company')}
                          value={formData.company} onChange={handleFormChange('company')}
                          size="small"
                          InputProps={{
                            startAdornment: <BusinessIcon sx={{ mr: 1, fontSize: 18, color: V2_COLORS.text.disabled }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth multiline rows={4}
                          label={t('合作意向描述', 'Cooperation Intention')}
                          value={formData.message} onChange={handleFormChange('message')}
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <EditNoteIcon sx={{ mr: 1, fontSize: 18, color: V2_COLORS.text.disabled, alignSelf: 'flex-start' }} />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sx={{ pt: 1 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={formSubmitting || !formData.name || !formData.phone}
                          startIcon={<SendIcon />}
                          sx={{
                            background: `linear-gradient(135deg, ${V2_COLORS.accent.main}, ${V2_COLORS.accent.dark})`,
                            px: 5, py: 1.4, borderRadius: 2.5, fontWeight: 700, fontSize: '0.95rem',
                            boxShadow: '0 4px 16px rgba(212,134,42,0.35)',
                            transition: 'all 0.3s',
                            '&:hover': {
                              background: `linear-gradient(135deg, ${V2_COLORS.accent.light}, ${V2_COLORS.accent.main})`,
                              boxShadow: '0 6px 24px rgba(212,134,42,0.5)',
                              transform: 'translateY(-1px)',
                            },
                            '&:disabled': {
                              background: 'rgba(0,0,0,0.08)', color: V2_COLORS.text.disabled,
                              boxShadow: 'none',
                            },
                          }}
                        >
                          {formSubmitting ? t('提交中...', 'Submitting...') : t('提交申请', 'Submit Application')}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>

                <Snackbar
                  open={formSuccess}
                  autoHideDuration={4000}
                  onClose={() => setFormSuccess(false)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                  <Alert
                    severity="success"
                    variant="filled"
                    onClose={() => setFormSuccess(false)}
                    sx={{
                      borderRadius: 2, fontWeight: 600,
                      boxShadow: '0 4px 16px rgba(58,143,92,0.3)',
                    }}
                  >
                    {t('提交成功！我们将尽快与您联系', 'Submitted! We will contact you soon.')}
                  </Alert>
                </Snackbar>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
      </Box>
    </Box>
  );
}
