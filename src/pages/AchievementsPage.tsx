import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, Breadcrumbs, Link, List, ListItemButton, ListItemText,
  Divider, Chip, Skeleton, Paper, Card, CardContent, CircularProgress,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PageBanner from '../components/PageBanner';
import AnimatedCard from '../components/AnimatedCard';
import SectionDecorator from '../components/SectionDecorator';
import { navCategoryApi, articleApi } from '../api/navigation';
import type { NavSubcategory, Article } from '../api/navigation';
import { getCases, getCase } from '../api/cases';
import type { Case } from '../types/api';
import { V2_COLORS as colors } from '../theme/colors';

// ─── Fallback 数据（与数据库同步）─────────────────────────
const fallbackSubcategories: NavSubcategory[] = [
  { id: 20, parent_id: 5, name: '合作单位', slug: 'partner-institutions', description: '科研院所及企事业单位合作网络', display_mode: 'list', sort_order: 1, status: 1, created_at: '', updated_at: '' },
  { id: 21, parent_id: 5, name: '总体应用情况', slug: 'overall-application', description: '产品在全国的推广应用概况', display_mode: 'list', sort_order: 2, status: 1, created_at: '', updated_at: '' },
  { id: 22, parent_id: 5, name: '典型案例', slug: 'typical-cases', description: '标杆项目案例展示', display_mode: 'list', sort_order: 3, status: 1, created_at: '', updated_at: '' },
  { id: 23, parent_id: 5, name: '未来发展', slug: 'future-development', description: '智慧水保技术演进路线', display_mode: 'list', sort_order: 4, status: 1, created_at: '', updated_at: '' },
];

const fallbackArticles: Record<number, Article[]> = {
  20: [{ id: 23, subcategory_id: 20, title: '科研院所合作单位', summary: '与多家科研院所建立长期稳定的合作关系。', content: '<p>公司与西北农林科技大学、中科院水利部水土保持研究所等单位建立了深度合作关系。</p>', cover_image: null, author: '杨凌三智', published_at: '2026-06-04T06:30:22.000Z', status: 1, sort_order: 1, created_at: '', updated_at: '' }],
  21: [{ id: 24, subcategory_id: 21, title: '全国推广应用情况', summary: '产品已在全国多个省份推广应用，覆盖主要水土流失区。', content: '<p>截至目前，公司产品已在全国20余个省份的水土保持项目中得到广泛应用。</p>', cover_image: null, author: '杨凌三智', published_at: '2026-06-04T06:30:22.000Z', status: 1, sort_order: 1, created_at: '', updated_at: '' }],
  22: [],
  23: [{ id: 26, subcategory_id: 23, title: '智慧水保未来发展方向', summary: '人工智能、物联网驱动的新一代水土保持监测体系。', content: '<p>公司正积极推进AI+水保战略，将深度学习、边缘计算等前沿技术融入监测设备，打造智慧水保新生态。</p>', cover_image: null, author: '杨凌三智', published_at: '2026-06-04T06:30:22.000Z', status: 1, sort_order: 1, created_at: '', updated_at: '' }],
};

const fallbackCasesMap: Record<number, Case> = {
  1: { id: 1, title: '黄土高原水土保持监测站', slug: 'loess-plateau', summary: '在黄土高原典型侵蚀区建设的综合监测站，涵盖径流、泥沙、气象等多参数实时监测', description: '<p>本项目位于陕西省延安市，建设了综合性水土保持监测站，采用全套监测设备。</p>', cover_image: null, location: '陕西延安', province: '陕西', is_featured: 1, status: 1, sort_order: 1, created_at: '2024-01-15', updated_at: '', images: [] },
  2: { id: 2, title: '黄河流域风蚀监测项目', slug: 'yellow-river-wind', summary: '在黄河沿岸风沙区部署全自动风蚀监测系统', description: '<p>在内蒙古鄂尔多斯黄河沿岸风沙区部署8套全自动风蚀监测系统。</p>', cover_image: null, location: '内蒙古鄂尔多斯', province: '内蒙古', is_featured: 1, status: 1, sort_order: 2, created_at: '2023-09-01', updated_at: '', images: [] },
  3: { id: 3, title: '南方红壤区径流监测', slug: 'red-soil-runoff', summary: '针对南方红壤区特有侵蚀类型，定制径流监测方案', description: '<p>针对南方红壤区定制部署径流小区和自动监测设备。</p>', cover_image: null, location: '江西赣州', province: '江西', is_featured: 0, status: 1, sort_order: 3, created_at: '2023-11-20', updated_at: '', images: [] },
  4: { id: 4, title: '东北黑土区保护性耕作监测', slug: 'black-soil-monitor', summary: '在东北黑土区开展保护性耕作效果监测', description: '<p>在黑龙江哈尔滨黑土区建设保护性耕作效果监测站。</p>', cover_image: null, location: '黑龙江哈尔滨', province: '黑龙江', is_featured: 1, status: 1, sort_order: 4, created_at: '2022-06-01', updated_at: '', images: [] },
  5: { id: 5, title: '西北盐碱地监测治理项目', slug: 'saline-northwest', summary: '在西北干旱区开展盐碱地监测治理', description: '<p>在新疆昌吉州部署盐碱地监测治理集成设备。</p>', cover_image: null, location: '新疆昌吉', province: '新疆', is_featured: 0, status: 1, sort_order: 5, created_at: '2023-03-15', updated_at: '', images: [] },
  6: { id: 6, title: '三峡库区水土流失监测', slug: 'three-gorges', summary: '为三峡库区提供水土流失实时监测和预警服务', description: '<p>在三峡库区重点消落带和入库支流区域部署水土流失监测网络。</p>', cover_image: null, location: '湖北宜昌', province: '湖北', is_featured: 1, status: 1, sort_order: 6, created_at: '2024-02-10', updated_at: '', images: [] },
};

// ─── 组件 ────────────────────────────────────────
export default function AchievementsPage() {
  const { subSlug, articleId } = useParams<{ subSlug?: string; articleId?: string }>();
  const navigate = useNavigate();

  const [subcategories, setSubcategories] = useState<NavSubcategory[]>([]);
  const [activeSub, setActiveSub] = useState<NavSubcategory | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [caseList, setCaseList] = useState<Case[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setCurrentArticle(null);
    setCurrentCase(null);
    try {
      const subRes = await navCategoryApi.getSubcategories(5);
      const subs: NavSubcategory[] = subRes.data?.data || [];
      if (subs.length > 0) {
        setSubcategories(subs);
      } else {
        setSubcategories(fallbackSubcategories);
      }

      const targetSubs = subs.length > 0 ? subs : fallbackSubcategories;

      if (articleId) {
        if (subSlug === 'typical-cases') {
          const typicalSub = targetSubs.find(s => s.slug === 'typical-cases');
          if (typicalSub) setActiveSub(typicalSub);
          try {
            const caseRes = await getCase(Number(articleId));
            const c = caseRes.data?.data;
            if (c) setCurrentCase(c);
            else { const fb = fallbackCasesMap[Number(articleId)]; if (fb) setCurrentCase(fb); }
          } catch {
            const fb = fallbackCasesMap[Number(articleId)];
            if (fb) setCurrentCase(fb);
          }
        } else {
          try {
            const artRes = await articleApi.getById(Number(articleId));
            const art = artRes.data?.data;
            if (art) { setCurrentArticle(art); const found = targetSubs.find(s => s.id === art.subcategory_id); if (found) setActiveSub(found); }
            else { for (const k of Object.keys(fallbackArticles)) { const f = fallbackArticles[+k]?.find(a => a.id === +articleId); if (f) { setCurrentArticle(f); const s = fallbackSubcategories.find(x => x.id === f.subcategory_id); if (s) setActiveSub(s); break; } } }
          } catch {
            for (const k of Object.keys(fallbackArticles)) { const f = fallbackArticles[+k]?.find(a => a.id === +articleId); if (f) { setCurrentArticle(f); const s = fallbackSubcategories.find(x => x.id === f.subcategory_id); if (s) setActiveSub(s); break; } }
          }
        }
      } else if (subSlug) {
        const found = targetSubs.find(s => s.slug === subSlug);
        if (found) {
          setActiveSub(found);
          if (found.slug === 'typical-cases') {
            try { const caseRes = await getCases({ pageSize: 50 }); setCaseList(caseRes.data?.data?.list || []); } catch { setCaseList([]); }
          } else {
            try { const artRes = await articleApi.getAll({ subcategory_id: found.id, pageSize: 50 }); const list = artRes.data?.data?.list || []; setArticles(list.length > 0 ? list : fallbackArticles[found.id] || []); } catch { setArticles(fallbackArticles[found.id] || []); }
          }
        } else {
          const fbSub = fallbackSubcategories.find(s => s.slug === subSlug);
          if (fbSub) {
            setActiveSub(fbSub);
            if (fbSub.slug === 'typical-cases') setCaseList([]);
            else setArticles(fallbackArticles[fbSub.id] || []);
          }
        }
      } else if (targetSubs.length > 0) {
        setActiveSub(targetSubs[0]);
        if (targetSubs[0].slug === 'typical-cases') {
          try { const caseRes = await getCases({ pageSize: 50 }); setCaseList(caseRes.data?.data?.list || []); } catch { setCaseList([]); }
        } else {
          try { const artRes = await articleApi.getAll({ subcategory_id: targetSubs[0].id, pageSize: 50 }); const list = artRes.data?.data?.list || []; setArticles(list.length > 0 ? list : fallbackArticles[targetSubs[0].id] || []); } catch { setArticles(fallbackArticles[targetSubs[0].id] || []); }
        }
      }
    } catch {
      setSubcategories(fallbackSubcategories);
      if (fallbackSubcategories.length > 0) {
        setActiveSub(fallbackSubcategories[0]);
        setArticles(fallbackArticles[fallbackSubcategories[0].id] || []);
      }
    }
    setLoading(false);
  }, [subSlug, articleId]);

  useEffect(() => { loadData(); }, [loadData]);

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('zh-CN') : '';

  return (
    <Box>
      {/* Banner */}
      <PageBanner
        title="成果转化"
        subtitle="从实验室到田间，让科技守护绿水青山"
        fallbackImage="https://images.unsplash.com/photo-1508514177221-188b1cf12e9d?w=1920&q=80"
      />

      {/* 内容区 */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: colors.background.default, position: 'relative' }}>
        <SectionDecorator variant="gradient" opacity={0.04} position="top" />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4}>
            {/* 左侧栏 */}
            <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{ border: `1px solid ${colors.divider}`, borderRadius: 3, overflow: 'hidden', position: 'sticky', top: 88 }}>
                <Box sx={{ bgcolor: colors.primary.main, color: '#fff', px: 2.5, py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEventsIcon fontSize="small" />
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>成果转化</Typography>
                  </Box>
                </Box>
                <List disablePadding>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <Box key={i} sx={{ px: 2, py: 1.5 }}><Skeleton variant="text" width="80%" /></Box>
                    ))
                  ) : subcategories.map((sub) => (
                    <ListItemButton
                      key={sub.id}
                      selected={activeSub?.id === sub.id}
                      onClick={() => navigate(`/achievements/${sub.slug}`)}
                      sx={{
                        borderLeft: activeSub?.id === sub.id ? `3px solid ${colors.accent.main}` : '3px solid transparent',
                        bgcolor: activeSub?.id === sub.id ? 'rgba(212,134,42,0.06)' : 'transparent',
                        '&:hover': { bgcolor: 'rgba(15,43,71,0.04)' },
                        transition: 'all 0.2s',
                      }}
                    >
                      <ListItemText
                        primary={sub.name}
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                          fontWeight: activeSub?.id === sub.id ? 600 : 400,
                          color: activeSub?.id === sub.id ? colors.accent.dark : colors.text.primary,
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* 右侧内容 */}
            <Grid item xs={12} md={9}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
              ) : currentArticle && articleId ? (
                /* 文章详情 */
                <Paper elevation={0} sx={{ border: `1px solid ${colors.divider}`, borderRadius: 3, p: { xs: 3, md: 5 } }}>
                  <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
                    <Link underline="hover" color="inherit" onClick={() => navigate('/achievements')} sx={{ cursor: 'pointer' }}>成果转化</Link>
                    <Link underline="hover" color="inherit" onClick={() => navigate(`/achievements/${activeSub?.slug}`)} sx={{ cursor: 'pointer' }}>{activeSub?.name}</Link>
                    <Typography color="text.primary">{currentArticle.title}</Typography>
                  </Breadcrumbs>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{currentArticle.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    发布时间：{fmtDate(currentArticle.published_at)}
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Box
                    sx={{
                      fontSize: '1rem', lineHeight: 2, color: colors.text.secondary,
                      '& p': { mb: 1.5 }, '& ul, & ol': { pl: 3, mb: 1.5 }, '& li': { mb: 0.5 },
                    }}
                    dangerouslySetInnerHTML={{ __html: currentArticle.content || '' }}
                  />
                </Paper>
              ) : currentCase && articleId ? (
                /* 案例详情 */
                <Box>
                  <Link onClick={() => navigate('/achievements/typical-cases')} sx={{ cursor: 'pointer', color: colors.accent.main, mb: 2, display: 'inline-block' }}>&lt;&lt; 返回典型案例</Link>
                  <Paper elevation={0} sx={{ border: `1px solid ${colors.divider}`, borderRadius: 3, p: { xs: 3, md: 5 } }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{currentCase.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                      <Chip label={fmtDate(currentCase.created_at)} size="small" variant="outlined" />
                      {currentCase.location && <Chip label={currentCase.location} size="small" color="primary" variant="outlined" />}
                    </Box>
                    {currentCase.summary && (
                      <Box sx={{ bgcolor: 'rgba(212,134,42,0.06)', border: `1px solid rgba(212,134,42,0.2)`, borderRadius: 2, p: 2.5, mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: colors.accent.dark, mb: 0.5 }}>项目概要</Typography>
                        <Typography variant="body2" color="text.secondary">{currentCase.summary}</Typography>
                      </Box>
                    )}
                    {currentCase.description && (
                      <Box sx={{ fontSize: '1rem', lineHeight: 2, color: colors.text.secondary }} dangerouslySetInnerHTML={{ __html: currentCase.description }} />
                    )}
                  </Paper>
                </Box>
              ) : activeSub?.slug === 'typical-cases' ? (
                /* 典型案例列表 */
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{activeSub.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>标杆项目案例展示</Typography>
                  {caseList.length === 0 ? (
                    <Paper elevation={0} sx={{ border: `1px solid ${colors.divider}`, borderRadius: 3, p: 6, textAlign: 'center' }}>
                      <Typography color="text.secondary">暂无案例，请在后台"案例管理"中添加</Typography>
                    </Paper>
                  ) : (
                    <Grid container spacing={3}>
                      {caseList.map((c) => (
                        <Grid item xs={12} sm={6} key={c.id}>
                          <AnimatedCard onClick={() => navigate(`/achievements/typical-cases/${c.id}`)}>
                            <CardContent sx={{ cursor: 'pointer' }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>{c.title}</Typography>
                              {c.location && <Chip label={c.location} size="small" sx={{ mb: 1, bgcolor: 'rgba(212,134,42,0.1)', color: colors.accent.dark }} />}
                              {c.summary && <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{c.summary}</Typography>}
                            </CardContent>
                          </AnimatedCard>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              ) : (
                /* 文章列表 */
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{activeSub?.name || '成果转化'}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>{activeSub?.description || ''}</Typography>
                  <Paper elevation={0} sx={{ border: `1px solid ${colors.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                    {articles.length === 0 ? (
                      <Box sx={{ p: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">暂无内容，请登录后台添加文章</Typography>
                      </Box>
                    ) : (
                      articles.map((article, idx) => (
                        <Box key={article.id}>
                          <Box
                            onClick={() => navigate(`/achievements/${activeSub?.slug}/${article.id}`)}
                            sx={{
                              px: { xs: 2.5, md: 4 }, py: 2.5, cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': { bgcolor: 'rgba(15,43,71,0.03)' },
                            }}
                          >
                            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5, color: colors.primary.main }}>
                              {article.title}
                            </Typography>
                            {article.summary && (
                              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 0.5 }}>
                                {article.summary}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.disabled">
                              {fmtDate(article.published_at)}
                            </Typography>
                          </Box>
                          {idx < articles.length - 1 && <Divider />}
                        </Box>
                      ))
                    )}
                  </Paper>
                </Box>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
