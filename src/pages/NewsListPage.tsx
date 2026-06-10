import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardMedia,
  Tabs, Tab, Chip, Skeleton, Pagination,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';
import PageBanner from '../components/PageBanner';
import { articleApi, navCategoryApi } from '../api/navigation';
import type { Article, NavSubcategory } from '../api/navigation';
import { V2_COLORS } from '../theme/colors';

// 新闻动态的一级栏目ID
const NEWS_CATEGORY_ID = 3;

// fallback 子栏目
const fallbackSubcategories: NavSubcategory[] = [
  { id: 11, parent_id: 3, name: '公司新闻', name_en: 'Company News', slug: 'company-news', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'list', sort_order: 1, status: 1, created_at: '', updated_at: '' },
  { id: 12, parent_id: 3, name: '行业资讯', name_en: 'Industry News', slug: 'industry-news', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'list', sort_order: 2, status: 1, created_at: '', updated_at: '' },
  { id: 13, parent_id: 3, name: '技术文章', name_en: 'Technical Articles', slug: 'technical-articles', description: null, description_en: null, icon: null, content_type: 'article', display_mode: 'list', sort_order: 3, status: 1, created_at: '', updated_at: '' },
];

// fallback 新闻数据
const fallbackNews: Article[] = [
  {
    id: 3, subcategory_id: 11, title: '杨凌三智科技获评国家级高新技术企业', title_en: null,
    summary: '2025年度高新技术企业认定结果公布，杨凌三智科技成功入选。',
    summary_en: null, content: null, content_en: null,
    cover_image: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80',
    author: '编辑部', source: null, is_featured: 1, status: 1, sort_order: 0,
    published_at: '2025-06-01', created_at: '', updated_at: '',
  },
  {
    id: 4, subcategory_id: 11, title: '公司与西北农林科技大学签订产学研合作协议', title_en: null,
    summary: '校企合作再升级，共推水土保持监测技术发展。',
    summary_en: null, content: null, content_en: null,
    cover_image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
    author: '编辑部', source: null, is_featured: 1, status: 1, sort_order: 0,
    published_at: '2025-05-15', created_at: '', updated_at: '',
  },
  {
    id: 11, subcategory_id: 12, title: '2025年水土保持监测技术发展报告', title_en: null,
    summary: '行业最新技术趋势和发展方向分析。',
    summary_en: null, content: null, content_en: null,
    cover_image: 'https://images.unsplash.com/photo-1457369804613-9c61ecfca15d?w=800&q=80',
    author: '研究部', source: null, is_featured: 1, status: 1, sort_order: 0,
    published_at: '2025-06-04', created_at: '', updated_at: '',
  },
  {
    id: 12, subcategory_id: 13, title: '径流泥沙自动监测技术原理与应用', title_en: null,
    summary: '深入解析径流泥沙自动监测的核心技术原理。',
    summary_en: null, content: null, content_en: null,
    cover_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    author: '技术部', source: null, is_featured: 1, status: 1, sort_order: 0,
    published_at: '2025-06-03', created_at: '', updated_at: '',
  },
];

export default function NewsListPage() {
  const [searchParams] = useSearchParams();
  const initialTab = parseInt(searchParams.get('tab') || '0', 10) || 0;
  const [subcategories, setSubcategories] = useState<NavSubcategory[]>(fallbackSubcategories);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [articles, setArticles] = useState<Article[]>(fallbackNews);
  const [total, setTotal] = useState(fallbackNews.length);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 9;

  // 加载子栏目
  useEffect(() => {
    navCategoryApi.getSubcategories(NEWS_CATEGORY_ID)
      .then((res) => {
        const subs: NavSubcategory[] = res.data?.data || [];
        if (subs.length > 0) setSubcategories(subs);
      })
      .catch(() => {});
  }, []);

  // 加载新闻列表（依赖 subcategories 确保子栏目加载完成后才发请求）
  useEffect(() => {
    if (subcategories.length > 0) loadNews();
  }, [activeTab, page]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      // 始终只拉取新闻动态子栏目下的文章，不显示其他栏目的内容
      if (activeTab > 0) {
        const sub = subcategories[activeTab - 1];
        if (sub) params.subcategory_id = sub.id;
      } else {
        // 全部新闻：传递所有新闻子栏目ID
        params.subcategory_id = subcategories.map(s => s.id).join(',');
      }
      const res = await articleApi.getAll(params);
      const data = res.data?.data;
      const list: Article[] = data?.list || data || [];
      setArticles(Array.isArray(list) ? list : []);
      setTotal(data?.total || (Array.isArray(list) ? list.length : 0));
    } catch (err) {
      console.error('Failed to load news:', err);
    }
    setLoading(false);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(1);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Box>
      <PageBanner
        title="新闻动态"
        subtitle="NEWS & INSIGHTS"
        backgroundImage="/images/banners/news.jpg"
        fallbackImage="https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=1920&q=80"
      />

      {/* Tab 切换 */}
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Box sx={{ borderBottom: '2px solid rgba(0,0,0,0.06)', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                px: 3,
                color: 'rgba(0,0,0,0.5)',
                '&.Mui-selected': {
                  color: V2_COLORS.primary.main,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: V2_COLORS.primary.main,
                height: 3,
                borderRadius: 2,
              },
            }}
          >
            <Tab label="全部新闻" />
            {subcategories.map((sub) => (
              <Tab key={sub.id} label={sub.name} />
            ))}
          </Tabs>
        </Box>
      </Container>

      {/* 新闻列表 */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton height={200} sx={{ borderRadius: 2 }} />
                <Skeleton height={28} sx={{ mt: 1 }} />
                <Skeleton height={20} width="60%" />
              </Grid>
            ))}
          </Grid>
        ) : articles.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, color: 'rgba(0,0,0,0.4)' }}>
            <Typography variant="h6">暂无新闻</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>该栏目下还没有发布任何新闻</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {articles.map((article, idx) => (
              <Grid item xs={12} sm={6} md={4} key={article.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  viewport={{ once: true }}
                  style={{ height: '100%' }}
                >
                  <Card
                    component={Link}
                    to={`/news/${subcategories.find(s => s.id === article.subcategory_id)?.slug || 'company-news'}/${article.id}`}
                    sx={{
                      textDecoration: 'none',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                      transition: 'all 0.35s ease',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 40px rgba(15,43,71,0.12)',
                        borderColor: `${V2_COLORS.primary.main}30`,
                        '& .news-cover': { transform: 'scale(1.06)' },
                        '& .news-arrow': { transform: 'translateX(4px)', opacity: 1 },
                      },
                    }}
                  >
                    {/* 封面图 */}
                    <Box sx={{ position: 'relative', overflow: 'hidden', height: 200 }}>
                      <Box
                        className="news-cover"
                        component="img"
                        src={article.cover_image || 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80'}
                        alt={article.title}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          if (!img.src.includes('unsplash')) {
                            img.src = 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80';
                          }
                        }}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                        }}
                      />
                      {/* 子栏目标签 */}
                      <Chip
                        label={subcategories.find(s => s.id === article.subcategory_id)?.name || '新闻'}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          bgcolor: `${V2_COLORS.primary.main}E0`,
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          backdropFilter: 'blur(8px)',
                        }}
                      />
                      {/* 置顶标记 */}
                      {article.is_featured === 1 && (
                        <Chip
                          label="置顶"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: `${V2_COLORS.accent.main}E0`,
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                    </Box>

                    <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* 日期 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.2, color: 'rgba(0,0,0,0.4)', fontSize: '0.8rem' }}>
                        <CalendarTodayIcon sx={{ fontSize: 14 }} />
                        {formatDate(article.published_at)}
                      </Box>

                      {/* 标题 */}
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: '1.05rem',
                          color: V2_COLORS.primary.dark,
                          mb: 1,
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {article.title}
                      </Typography>

                      {/* 摘要 */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(0,0,0,0.5)',
                          lineHeight: 1.7,
                          flex: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 1.5,
                        }}
                      >
                        {article.summary || ''}
                      </Typography>

                      {/* 查看详情 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', color: V2_COLORS.primary.main, fontWeight: 600, fontSize: '0.85rem' }}>
                        查看详情
                        <ArrowForwardIcon className="news-arrow" sx={{ fontSize: 16, ml: 0.5, opacity: 0.5, transition: 'all 0.3s' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
              shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontWeight: 600,
                },
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
