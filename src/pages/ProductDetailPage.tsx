import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Chip,
  Skeleton,
  MobileStepper,
} from '@mui/material';
import { motion } from 'framer-motion';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import DownloadIcon from '@mui/icons-material/Download';
import PhoneIcon from '@mui/icons-material/Phone';
import InquiryDialog from '../components/InquiryDialog';
import { getProduct } from '../api/products';
import type { Product } from '../types/api';
import { V2_COLORS } from '../theme/colors';
import { MOTION } from '../theme/motion';

const fallbackProduct: Product = {
  id: 0,
  category_id: 1,
  name: '径流泥沙自动监测仪',
  slug: 'auto-sediment',
  model: 'YL-SD-01',
  summary: '全自动径流泥沙在线监测设备，适用于水土保持监测站、科研实验等场景。',
  description:
    '径流泥沙自动监测仪采用先进的传感技术和数据处理算法，可实现径流量和泥沙含量的实时、连续、自动监测。设备集成数据采集、无线传输、远程控制等功能，支持多参数同步监测，数据自动上传至云平台。\n\n主要特点：\n1. 全自动运行，无人值守\n2. 高精度传感器，数据准确可靠\n3. 无线传输，远程监控\n4. 适应各种恶劣环境\n5. 低功耗设计，太阳能供电可选',
  cover_image: null,
  application_scenes:
    '适用于水土保持监测站、科研实验小区、流域水文监测、水利工程施工监测等场景。可广泛应用于黄土高原、南方红壤区、东北黑土区等不同侵蚀类型区。',
  status: 1,
  sort_order: 1,
  created_at: '',
  updated_at: '',
  params: [
    { id: 1, product_id: 0, param_name: '测量范围', param_value: '0~5000 ml/s', sort_order: 1, created_at: '' },
    { id: 2, product_id: 0, param_name: '测量精度', param_value: '±1.5%', sort_order: 2, created_at: '' },
    { id: 3, product_id: 0, param_name: '供电方式', param_value: 'AC220V / 太阳能', sort_order: 3, created_at: '' },
    { id: 4, product_id: 0, param_name: '通信方式', param_value: '4G/5G/WiFi', sort_order: 4, created_at: '' },
    { id: 5, product_id: 0, param_name: '工作温度', param_value: '-20℃~60℃', sort_order: 5, created_at: '' },
    { id: 6, product_id: 0, param_name: '防护等级', param_value: 'IP65', sort_order: 6, created_at: '' },
  ],
  docs: [
    { id: 1, product_id: 0, title: '产品使用说明书', file_url: '/uploads/docs/manual.pdf', file_type: 'pdf', file_size: 2048000, sort_order: 1, created_at: '' },
    { id: 2, product_id: 0, title: '检测报告', file_url: '/uploads/docs/report.pdf', file_type: 'pdf', file_size: 5120000, sort_order: 2, created_at: '' },
  ],
};

const fadeUp = { ...MOTION.FADE_UP };

function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product>(fallbackProduct);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (id) {
      getProduct(Number(id))
        .then((res) => {
          if (res.data?.data) setProduct(res.data.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  // 封面图始终排第一，产品图片紧随其后
  const images = [
    ...(product.cover_image ? [product.cover_image] : []),
    ...(product.images?.map((img) => img.image_url) || []),
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton height={40} width={300} sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Skeleton variant="rectangular" width="50%" height={400} />
          <Box sx={{ flex: 1 }}>
            <Skeleton height={40} />
            <Skeleton height={30} width="60%" />
            <Skeleton />
            <Skeleton />
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Box>
      {/* 面包屑 */}
      <Box sx={{ bgcolor: V2_COLORS.background.paper, py: 2, borderBottom: `1px solid ${V2_COLORS.divider}` }}>
        <Container maxWidth="lg">
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link to="/" style={{ color: V2_COLORS.text.secondary, textDecoration: 'none' }}>首页</Link>
            <Link to="/products" style={{ color: V2_COLORS.text.secondary, textDecoration: 'none' }}>产品中心</Link>
            <Typography color="text.primary" fontSize="0.9rem">{product.name}</Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      {/* 产品信息 */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <motion.div {...fadeUp}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* 左侧图片 */}
            <Box sx={{ flex: 1, maxWidth: { md: '50%' } }}>
              {images.length > 0 ? (
                <>
                  <Box
                    component="img"
                    src={images[activeImage]}
                    alt={product.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80';
                    }}
                    sx={{
                      width: '100%',
                      height: { xs: 280, md: 400 },
                      objectFit: 'cover',
                      borderRadius: 2,
                      bgcolor: V2_COLORS.background.paper,
                    }}
                  />
                  {images.length > 1 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                      <IconButton onClick={() => setActiveImage(Math.max(0, activeImage - 1))} disabled={activeImage === 0}>
                        <KeyboardArrowLeftIcon />
                      </IconButton>
                      <MobileStepper
                        variant="dots"
                        steps={images.length}
                        position="static"
                        activeStep={activeImage}
                        sx={{ flex: 1, justifyContent: 'center' }}
                        backButton={undefined as any}
                        nextButton={undefined as any}
                      />
                      <IconButton onClick={() => setActiveImage(Math.min(images.length - 1, activeImage + 1))} disabled={activeImage === images.length - 1}>
                        <KeyboardArrowRightIcon />
                      </IconButton>
                    </Box>
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: { xs: 280, md: 400 },
                    bgcolor: V2_COLORS.background.paper,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ color: V2_COLORS.text.disabled }}>暂无图片</Typography>
                </Box>
              )}
            </Box>

            {/* 右侧信息 */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: V2_COLORS.primary.main, mb: 1 }}>
                {product.name}
              </Typography>
              {product.model && (
                <Chip
                  label={`型号：${product.model}`}
                  size="small"
                  sx={{ bgcolor: 'rgba(212,134,42,0.1)', color: V2_COLORS.accent.main, fontWeight: 600, mb: 2 }}
                />
              )}
              <Typography variant="body1" sx={{ color: V2_COLORS.text.secondary, lineHeight: 2, mb: 3 }}>
                {product.summary}
              </Typography>
              <Button
                component={motion.button}
                whileHover={{ scale: MOTION.BTN_HOVER_SCALE }}
                variant="contained"
                startIcon={<PhoneIcon />}
                onClick={() => setInquiryOpen(true)}
                sx={{
                  bgcolor: V2_COLORS.accent.main,
                  color: '#fff',
                  borderRadius: 24,
                  px: 4,
                  fontWeight: 600,
                  '&:hover': { bgcolor: V2_COLORS.accent.dark },
                }}
              >
                立即咨询
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Container>

      {/* Tab面板 */}
      <Box sx={{ bgcolor: V2_COLORS.background.default, py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              mb: 3,
              '& .Mui-selected': { color: V2_COLORS.primary.main, fontWeight: 600 },
              '& .MuiTabs-indicator': { bgcolor: V2_COLORS.accent.main, height: 3 },
            }}
          >
            <Tab label="详细描述" />
            <Tab label="技术参数" />
            <Tab label="应用场景" />
            <Tab label="检测报告" />
          </Tabs>

          {/* 详细描述 */}
          {activeTab === 0 && (
            <motion.div {...fadeUp}>
              <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: 4, boxShadow: '0 2px 12px rgba(15,43,71,0.06)' }}>
                {product.description ? (
                  <Box
                    className="product-description-content"
                    sx={{
                      color: V2_COLORS.text.primary,
                      lineHeight: 2,
                      '& img': { maxWidth: '100%', borderRadius: 1, my: 1 },
                      '& p': { mb: 1.5 },
                      '& h1, & h2, & h3, & h4, & h5, & h6': { color: V2_COLORS.primary.main, mt: 3, mb: 1 },
                      '& ul, & ol': { pl: 2.5 },
                    }}
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <Typography sx={{ color: V2_COLORS.text.disabled, textAlign: 'center', py: 4 }}>暂无详细描述</Typography>
                )}
              </Box>
            </motion.div>
          )}

          {/* 技术参数 */}
          {activeTab === 1 && (
            <motion.div {...fadeUp}>
              {product.params?.length ? (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: V2_COLORS.primary.main }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>参数名称</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>参数值</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {product.params.map((param, idx) => (
                        <TableRow key={param.id} sx={{ bgcolor: idx % 2 === 0 ? '#fff' : V2_COLORS.background.default }}>
                          <TableCell sx={{ fontWeight: 500, color: V2_COLORS.primary.main }}>{param.param_name}</TableCell>
                          <TableCell sx={{ color: V2_COLORS.text.primary }}>{param.param_value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography sx={{ color: V2_COLORS.text.disabled, textAlign: 'center', py: 4 }}>暂无参数信息</Typography>
              )}
            </motion.div>
          )}

          {/* 应用场景 */}
          {activeTab === 2 && (
            <motion.div {...fadeUp}>
              <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: 4, boxShadow: '0 2px 12px rgba(15,43,71,0.06)' }}>
                {product.application_scenes ? (
                  <Box
                    className="product-app-scenes-content"
                    sx={{
                      color: V2_COLORS.text.primary,
                      lineHeight: 2,
                      '& img': { maxWidth: '100%', borderRadius: 1, my: 1 },
                      '& p': { mb: 1.5 },
                    }}
                    dangerouslySetInnerHTML={{ __html: product.application_scenes }}
                  />
                ) : (
                  <Typography sx={{ color: V2_COLORS.text.disabled, textAlign: 'center', py: 4 }}>暂无应用场景信息</Typography>
                )}
              </Box>
            </motion.div>
          )}

          {/* 检测报告 */}
          {activeTab === 3 && (
            <motion.div {...fadeUp}>
              {product.docs?.length ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {product.docs.map((doc) => (
                    <Paper
                      key={doc.id}
                      elevation={0}
                      sx={{
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: 2,
                        border: `1px solid ${V2_COLORS.divider}`,
                        '&:hover': { boxShadow: '0 4px 16px rgba(15,43,71,0.1)' },
                        transition: 'box-shadow 0.2s',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: V2_COLORS.primary.main, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, textTransform: 'uppercase' }}>
                            {doc.file_type || 'file'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: V2_COLORS.text.primary }}>{doc.title}</Typography>
                          {doc.file_size && (
                            <Typography variant="caption" sx={{ color: V2_COLORS.text.disabled }}>{formatFileSize(doc.file_size)}</Typography>
                          )}
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        href={doc.file_url}
                        target="_blank"
                        sx={{ borderColor: V2_COLORS.primary.main, color: V2_COLORS.primary.main, '&:hover': { borderColor: V2_COLORS.primary.light, bgcolor: 'rgba(15,43,71,0.04)' } }}
                      >
                        下载
                      </Button>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ color: V2_COLORS.text.disabled, textAlign: 'center', py: 4 }}>暂无检测报告</Typography>
              )}
            </motion.div>
          )}
        </Container>
      </Box>

      {/* 右下角固定咨询按钮 */}
      <Button
        component={motion.button}
        whileHover={{ scale: MOTION.BTN_HOVER_SCALE }}
        variant="contained"
        startIcon={<PhoneIcon />}
        onClick={() => setInquiryOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          bgcolor: V2_COLORS.accent.main,
          color: '#fff',
          borderRadius: 24,
          px: 3,
          py: 1,
          fontWeight: 600,
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(212,134,42,0.4)',
          '&:hover': { bgcolor: V2_COLORS.accent.dark },
        }}
      >
        立即咨询
      </Button>

      <InquiryDialog open={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </Box>
  );
}
