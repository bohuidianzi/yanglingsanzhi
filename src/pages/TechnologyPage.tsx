import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Chip,
  Skeleton,
} from '@mui/material';
import { motion } from 'framer-motion';
import ScienceIcon from '@mui/icons-material/Science';
import PageBanner from '../components/PageBanner';
import SectionTitle from '../components/SectionTitle';
import SectionDecorator from '../components/SectionDecorator';
import AnimatedCard from '../components/AnimatedCard';
import LazyImage from '../components/LazyImage';
import { getCertificates } from '../api/certificates';
import type { Certificate } from '../types/api';
import { V2_COLORS } from '../theme/colors';
import { MOTION } from '../theme/motion';

const fallbackCertificates: Certificate[] = [
  { id: 1, title: '径流泥沙自动监测仪专利', type: 'patent', certificate_number: 'ZL202310XXXXX.X', description: '发明专利', image: null, issue_date: '2024-01-15', status: 1, sort_order: 1, created_at: '', updated_at: '' },
  { id: 2, title: '全自动风蚀监测系统专利', type: 'patent', certificate_number: 'ZL202210XXXXX.X', description: '实用新型专利', image: null, issue_date: '2023-06-20', status: 1, sort_order: 2, created_at: '', updated_at: '' },
  { id: 3, title: '土壤水分传感器专利', type: 'patent', certificate_number: 'ZL202110XXXXX.X', description: '发明专利', image: null, issue_date: '2022-03-10', status: 1, sort_order: 3, created_at: '', updated_at: '' },
  { id: 4, title: 'CMA计量认证', type: 'cma', certificate_number: 'CMA-2024-XXXX', description: '中国计量认证', image: null, issue_date: '2024-03-01', status: 1, sort_order: 1, created_at: '', updated_at: '' },
  { id: 5, title: '径流泥沙自动监测仪推广证书', type: 'promotion', certificate_number: 'TG-2023-XXX', description: '水利部推广目录', image: null, issue_date: '2023-09-01', status: 1, sort_order: 1, created_at: '', updated_at: '' },
  { id: 6, title: '高新技术企业证书', type: 'other', certificate_number: 'GR202XXXXXXX', description: '国家高新技术企业认定', image: null, issue_date: '2023-12-01', status: 1, sort_order: 1, created_at: '', updated_at: '' },
];

const tabConfig = [
  { label: '专利', value: 'patent' },
  { label: 'CMA认证', value: 'cma' },
  { label: '推广目录', value: 'promotion' },
  { label: '其他', value: 'other' },
];

const fadeUp = MOTION.FADE_UP;

export default function TechnologyPage() {
  const [certificates, setCertificates] = useState<Certificate[]>(fallbackCertificates);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCertificates({ type: tabConfig[activeTab].value })
      .then((res) => {
        if (res.data?.data?.length) {
          setCertificates(res.data.data);
        } else {
          setCertificates(fallbackCertificates.filter((c) => c.type === tabConfig[activeTab].value));
        }
      })
      .catch(() => {
        setCertificates(fallbackCertificates.filter((c) => c.type === tabConfig[activeTab].value));
      })
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <Box>
      {/* Banner - 科研技术主题 */}
      <PageBanner
        title="核心技术"
        subtitle="专利技术驱动，权威资质保障"
        backgroundImage="/images/banners/technology.jpg"
        fallbackImage="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1920&q=80"
      />

      {/* 实验室合作 - 配实验室场景图 */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fff', position: 'relative' }}>
        <SectionDecorator variant="gradient" opacity={0.04} position="bottom" />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={5}>
              <motion.div {...fadeUp}>
                <Box
                  component="img"
                  src="/images/technology/lab.jpg"
                  alt="全国重点实验室"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.src.includes('unsplash')) {
                      img.src = 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80';
                    }
                  }}
                  sx={{
                    width: '100%',
                    borderRadius: 3,
                    boxShadow: '0 20px 60px rgba(15,43,71,0.15)',
                    border: `4px solid ${V2_COLORS.primary[50]}`,
                  }}
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} md={7}>
              <SectionTitle title="实验室合作" subtitle="携手国家级重点实验室，持续突破技术前沿" align="left" />
              <motion.div {...fadeUp}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: V2_COLORS.primary.main, mb: 2 }}>
                    水土保持与荒漠化整治全国重点实验室
                  </Typography>
                  <Typography variant="body1" sx={{ color: V2_COLORS.text.secondary, lineHeight: 2, mb: 2 }}>
                    杨凌三智与水土保持与荒漠化整治全国重点实验室建立深度产学研合作关系，在土壤侵蚀机理、监测技术研发、数据处理算法等方向开展联合攻关。实验室的原创性基础研究为产品迭代提供持续的技术源头，公司的工程化能力则将科研成果快速转化为可落地的产品与解决方案。
                  </Typography>
                  <Typography variant="body1" sx={{ color: V2_COLORS.text.secondary, lineHeight: 2 }}>
                    双方联合承担多项国家级科研项目，在径流泥沙自动监测、风蚀过程模拟、土壤水分动态预测等领域取得多项突破性进展，相关成果已获国家发明专利授权。
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 资质证书 */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: V2_COLORS.background.default, position: 'relative' }}>
        <SectionDecorator variant="dots" opacity={0.04} position="full" />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <SectionTitle title="资质证书" subtitle="权威认证，品质保障" />

          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            centered
            sx={{
              mb: 4,
              '& .Mui-selected': { color: V2_COLORS.primary.main, fontWeight: 600 },
              '& .MuiTabs-indicator': { bgcolor: V2_COLORS.secondary.main, height: 3 },
            }}
          >
            {tabConfig.map((tab) => (
              <Tab key={tab.value} label={tab.label} />
            ))}
          </Tabs>

          {loading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <AnimatedCard elevation={2}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton />
                      <Skeleton width="60%" />
                    </CardContent>
                  </AnimatedCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {certificates.map((cert, idx) => (
                <Grid item xs={12} sm={6} md={3} key={cert.id}>
                  <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: idx * 0.08 }}>
                    <AnimatedCard elevation={2}>
                      {cert.image ? (
                        <LazyImage
                          src={cert.image}
                          alt={cert.title}
                          height={180}
                          objectFit="cover"
                          sx={{ borderRadius: '12px 12px 0 0' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 180,
                            background: `linear-gradient(135deg, ${V2_COLORS.primary.main} 0%, ${V2_COLORS.secondary.main} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '12px 12px 0 0',
                          }}
                        >
                          <ScienceIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.4)' }} />
                        </Box>
                      )}
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: V2_COLORS.primary.main, mb: 1 }}>
                          {cert.title}
                        </Typography>
                        {cert.certificate_number && (
                          <Typography variant="body2" sx={{ color: '#999', mb: 0.5 }}>
                            编号：{cert.certificate_number}
                          </Typography>
                        )}
                        {cert.issue_date && (
                          <Typography variant="body2" sx={{ color: '#999' }}>
                            颁发日期：{cert.issue_date}
                          </Typography>
                        )}
                        {cert.description && (
                          <Chip label={cert.description} size="small" sx={{ mt: 1, bgcolor: '#FFF3E0', color: V2_COLORS.secondary.main }} />
                        )}
                      </CardContent>
                    </AnimatedCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}

          {!loading && certificates.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography sx={{ color: '#999' }}>暂无该类型证书</Typography>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}
