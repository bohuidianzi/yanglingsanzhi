import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Container, Typography, Breadcrumbs, Divider, Skeleton } from '@mui/material';
import { articleApi, navCategoryApi } from '../api/navigation';
import type { Article, NavCategory, NavSubcategory } from '../api/navigation';
import { useI18n } from '../contexts/I18nContext';
import { V2_COLORS } from '../theme/colors';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

/** fallback 文章数据 — API 失败时兜底 */
const fallbackArticles: Record<number, Article> = {
  3: {
    id: 3, subcategory_id: 11, title: '杨凌三智科技获评国家级高新技术企业', title_en: null,
    summary: '2025年度高新技术企业认定结果公布，杨凌三智科技成功入选。',
    summary_en: null,
    content: '<p>2025年度高新技术企业认定结果公布，杨凌三智科技有限公司凭借在水土保持智能监测领域的持续创新和技术积累，成功获评国家级高新技术企业。</p><p>这一荣誉标志着公司在核心自主知识产权、科技成果转化能力、研究开发组织管理水平等方面得到了国家层面的认可。</p><p>未来，杨凌三智科技将继续加大研发投入，推动水土保持监测技术的创新发展，为生态文明建设贡献更多科技力量。</p>',
    content_en: null,
    cover_image: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80',
    author: '编辑部', source: null, is_featured: 1, status: 1, sort_order: 0,
    published_at: '2025-06-01', created_at: '', updated_at: '',
  },
  4: {
    id: 4, subcategory_id: 11, title: '公司与西北农林科技大学签订产学研合作协议', title_en: null,
    summary: '校企合作再升级，共推水土保持监测技术发展。',
    summary_en: null,
    content: '<p>杨凌三智科技有限公司与西北农林科技大学正式签署产学研合作协议，双方将在水土保持监测技术、智能传感器研发、数据平台建设等领域展开深度合作。</p><p>此次合作将充分发挥高校科研优势和企业的产业化能力，加速科技成果转化，推动行业技术进步。</p>',
    content_en: null,
    cover_image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
    author: '编辑部', source: null, is_featured: 1, status: 1, sort_order: 0,
    published_at: '2025-05-15', created_at: '', updated_at: '',
  },
  11: {
    id: 11, subcategory_id: 12, title: '2025年水土保持监测技术发展报告', title_en: null,
    summary: '行业最新技术趋势和发展方向分析。',
    summary_en: null,
    content: '<p>随着国家对生态文明建设的持续投入，水土保持监测技术在2025年呈现出多维度创新的发展态势。</p><p>物联网传感、遥感监测、人工智能分析等技术的深度融合，正在重塑水土保持监测的技术体系和应用模式。</p>',
    content_en: null,
    cover_image: 'https://images.unsplash.com/photo-1457369804613-9c61ecfca15d?w=800&q=80',
    author: '研究部', source: null, is_featured: 1, status: 1, sort_order: 0,
    published_at: '2025-06-04', created_at: '', updated_at: '',
  },
};

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string; slug: string }>();
  const { t, isZh } = useI18n();
  const [article, setArticle] = useState<Article | null>(null);
  const [category, setCategory] = useState<NavCategory | null>(null);
  const [subcategory, setSubcategory] = useState<NavSubcategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      const res = await articleApi.getById(Number(id));
      const art: Article = res.data?.data;
      if (!art) { setLoading(false); return; }
      setArticle(art);

      // 找到对应的栏目信息
      const catRes = await navCategoryApi.getAll();
      const cats: NavCategory[] = catRes.data?.data || [];
      for (const cat of cats) {
        const subRes = await navCategoryApi.getSubcategories(cat.id);
        const subs: NavSubcategory[] = subRes.data?.data || [];
        const found = subs.find(s => s.id === art.subcategory_id);
        if (found) {
          setCategory(cat);
          setSubcategory(found);
          break;
        }
      }
    } catch (err) {
      console.error('Failed to load article:', err);
      // 尝试使用 fallback 数据
      const fallback = fallbackArticles[Number(id)];
      if (fallback) {
        setArticle(fallback);
      }
    }
    setLoading(false);
  };

  const getTitle = () => article ? (isZh ? article.title : (article.title_en || article.title)) : '';
  const getContent = () => article ? (isZh ? article.content : (article.content_en || article.content)) : '';
  const getName = (obj: any) => obj ? (isZh ? obj.name : (obj.name_en || obj.name)) : '';

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Skeleton height={40} width={300} sx={{ mb: 3 }} />
        <Skeleton height={20} sx={{ mb: 1 }} />
        <Skeleton height={20} sx={{ mb: 1 }} />
        <Skeleton height={20} sx={{ mb: 4 }} />
        <Skeleton height={300} />
      </Container>
    );
  }

  if (!article) return (
    <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
      <WarningAmberIcon sx={{ fontSize: 64, color: 'rgba(0,0,0,0.2)', mb: 2 }} />
      <Typography variant="h5" sx={{ color: 'rgba(0,0,0,0.5)', mb: 1 }}>文章未找到</Typography>
      <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.35)' }}>
        该文章可能已被删除或暂时无法访问
      </Typography>
    </Container>
  );

  return (
    <Box>
      {/* Banner */}
      <Box sx={{
        background: `linear-gradient(135deg, ${V2_COLORS.primary.dark}, ${V2_COLORS.secondary.dark})`,
        py: { xs: 4, md: 6 }, color: '#fff',
      }}>
        <Container maxWidth="md">
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2, '& .MuiBreadcrumbs-li': { color: 'rgba(255,255,255,0.6)' } }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
              <HomeIcon sx={{ fontSize: 16 }} /> {t('首页', 'Home')}
            </Link>
            {category && (
              <Link to={`/${category.slug}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                {getName(category)}
              </Link>
            )}
            {subcategory && category && (
              <Link to={`/${category.slug}/${subcategory.slug}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                {getName(subcategory)}
              </Link>
            )}
          </Breadcrumbs>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: V2_COLORS.primary.dark, lineHeight: 1.4 }}>
          {getTitle()}
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          {article.published_at && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'rgba(0,0,0,0.45)', fontSize: '0.875rem' }}>
              <CalendarTodayIcon sx={{ fontSize: 16 }} />
              {new Date(article.published_at).toLocaleDateString(isZh ? 'zh-CN' : 'en-US')}
            </Box>
          )}
          {article.author && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'rgba(0,0,0,0.45)', fontSize: '0.875rem' }}>
              <PersonIcon sx={{ fontSize: 16 }} />
              {article.author}
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* 文章内容 */}
        <Box
          sx={{
            '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2, my: 2 },
            '& h1, & h2, & h3': { color: V2_COLORS.primary.dark, fontWeight: 700, mt: 3, mb: 1.5 },
            '& p': { lineHeight: 1.8, mb: 2, color: 'rgba(0,0,0,0.75)' },
            '& ul, & ol': { pl: 3, mb: 2 },
            '& li': { mb: 0.5, lineHeight: 1.8 },
            '& a': { color: V2_COLORS.secondary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
            '& table': { width: '100%', borderCollapse: 'collapse', mb: 2 },
            '& th, & td': { border: '1px solid rgba(0,0,0,0.12)', p: 1.5, textAlign: 'left' },
            '& th': { bgcolor: 'rgba(0,0,0,0.04)', fontWeight: 600 },
          }}
          dangerouslySetInnerHTML={{ __html: getContent() || '' }}
        />
      </Container>
    </Box>
  );
}
