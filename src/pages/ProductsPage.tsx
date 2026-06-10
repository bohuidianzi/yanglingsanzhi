import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Skeleton,
} from '@mui/material';
import { motion } from 'framer-motion';
import WaterIcon from '@mui/icons-material/Water';
import AirIcon from '@mui/icons-material/Air';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import BiotechIcon from '@mui/icons-material/Biotech';
import CloudIcon from '@mui/icons-material/CloudQueue';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PageBanner from '../components/PageBanner';
import AnimatedCard from '../components/AnimatedCard';
import LazyImage from '../components/LazyImage';
import SectionDecorator from '../components/SectionDecorator';
import { getCategories, getProducts } from '../api/products';
import type { Category, Product } from '../types/api';
import { V2_COLORS } from '../theme/colors';
import { MOTION } from '../theme/motion';

const categoryIcons: Record<string, React.ReactNode> = {
  '🌊': <WaterIcon sx={{ fontSize: 20 }} />,
  '💨': <AirIcon sx={{ fontSize: 20 }} />,
  '🌤️': <WbSunnyIcon sx={{ fontSize: 20 }} />,
  '🧪': <BiotechIcon sx={{ fontSize: 20 }} />,
  '☁️': <CloudIcon sx={{ fontSize: 20 }} />,
};

const categoryBgImages: Record<string, string> = {
  '🌊': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&q=80',
  '💨': 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=600&q=80',
  '🌤️': 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&q=80',
  '🧪': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80',
  '☁️': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
};

const fallbackCategories: (Category & { icon: string })[] = [
  { id: 1, name: '土壤水蚀监测', slug: 'soil-water-erosion', description: null, icon: '🌊', sort_order: 1, status: 1, created_at: '', updated_at: '' },
  { id: 2, name: '土壤风蚀监测', slug: 'soil-wind-erosion', description: null, icon: '💨', sort_order: 2, status: 1, created_at: '', updated_at: '' },
  { id: 3, name: '生态气象监测', slug: 'eco-meteorology', description: null, icon: '🌤️', sort_order: 3, status: 1, created_at: '', updated_at: '' },
  { id: 4, name: '盐碱地监测治理', slug: 'saline-alkali', description: null, icon: '🧪', sort_order: 4, status: 1, created_at: '', updated_at: '' },
  { id: 5, name: '智慧水保云平台', slug: 'smart-platform', description: null, icon: '☁️', sort_order: 5, status: 1, created_at: '', updated_at: '' },
];

const fallbackProducts: Product[] = [
  { id: 1, category_id: 1, name: '模块化径流小区', slug: 'modular-runoff', model: 'YL-SR-01', summary: '标准化径流监测设备，支持多规格组合', description: '模块化径流小区是土壤水蚀监测的核心设备，采用标准化设计，可根据不同坡度、坡长需求灵活组合。设备包括集流槽、分流箱、自动采样器等关键部件，能够精确测量地表径流量和泥沙含量，为水土流失规律研究和治理效果评估提供可靠数据支撑。', cover_image: null, application_scenes: '坡面径流观测站、小流域综合治理监测、水土保持方案效果评估', status: 1, sort_order: 1, created_at: '', updated_at: '' },
  { id: 2, category_id: 1, name: '径流泥沙自动监测仪', slug: 'auto-sediment', model: 'YL-SD-01', summary: '全自动径流泥沙在线监测', description: '径流泥沙自动监测仪是我司核心产品，荣获国家发明专利。设备采用光学传感与称重双重测量原理，可实时在线监测径流量、泥沙含量、输沙率等关键参数，数据自动上传云平台。无需人工值守，实现24小时不间断监测，精度可达毫米级，已通过水利部推广目录认证。', cover_image: null, application_scenes: '水土保持监测站、河道泥沙监测、水库淤积监测', status: 1, sort_order: 2, created_at: '', updated_at: '' },
  { id: 3, category_id: 1, name: '便携式泥沙测量仪', slug: 'portable-sediment', model: 'YL-PS-01', summary: '便携设计，适合野外快速测量', description: '便携式泥沙测量仪专为野外快速检测设计，体积小、重量轻，单人即可操作。采用近红外光谱法，3秒内即可获得泥沙含量数据，支持GPS定位和数据存储，便于后续分析。适用于应急监测、巡检排查及科研采样等场景。', cover_image: null, application_scenes: '野外巡检、应急监测、科研采样、教学实验', status: 1, sort_order: 3, created_at: '', updated_at: '' },
  { id: 4, category_id: 1, name: '壤中流监测仪', slug: 'subsurface-flow', model: 'YL-SF-01', summary: '精准监测壤中流动态变化', description: '壤中流监测仪专注于土壤剖面内部水流动态的监测，采用多层传感阵列设计，可同时监测不同深度土壤水分运移和壤中流流量。设备支持长期连续运行，数据无线传输，为壤中流形成机理研究和地下径流估算提供精准数据。', cover_image: null, application_scenes: '土壤水分运移研究、壤中流观测、地下径流监测', status: 1, sort_order: 4, created_at: '', updated_at: '' },
  { id: 5, category_id: 2, name: '全自动风蚀监测系统', slug: 'wind-erosion', model: 'YL-WE-01', summary: '集成风速、集沙、数据分析的全自动系统', description: '全自动风蚀监测系统集成了风速风向传感器、集沙仪、温湿度传感器和数据处理单元，可实时监测风蚀起沙量、输沙率和气象条件。系统采用太阳能供电、4G无线传输，适用于荒漠化地区和风沙区的长期无人值守监测，已获国家实用新型专利。', cover_image: null, application_scenes: '风蚀观测站、荒漠化监测、沙尘暴预警', status: 1, sort_order: 1, created_at: '', updated_at: '' },
  { id: 6, category_id: 3, name: '全自动气象站', slug: 'weather-station', model: 'YL-MT-01', summary: '多参数气象数据自动采集', description: '全自动气象站可同时监测温度、湿度、风速、风向、气压、太阳辐射等10余项气象参数，数据采集频率最高可达1分钟/次。设备采用工业级传感器，防护等级IP65，支持太阳能供电和多种通信方式（4G/LoRa/有线），适用于偏远地区和恶劣环境下的长期运行。', cover_image: null, application_scenes: '生态气象观测站、小气候监测、农业气象服务', status: 1, sort_order: 1, created_at: '', updated_at: '' },
  { id: 7, category_id: 3, name: '称重式全自动雨量计', slug: 'rain-gauge', model: 'YL-RG-01', summary: '高精度称重式雨量测量', description: '称重式全自动雨量计采用高精度称重传感器，测量精度达0.1mm，可精确测量降雨量、降雨强度和降雨历时。与翻斗式雨量计相比，称重式不受降雨强度影响，可同时测量固态降水（雪、冰雹），特别适合北方和高海拔地区的降水监测。', cover_image: null, application_scenes: '降水监测、水文预报、融雪径流研究', status: 1, sort_order: 2, created_at: '', updated_at: '' },
  { id: 8, category_id: 4, name: '盐碱地监测治理集成设备', slug: 'saline-monitor', model: 'YL-SA-01', summary: '监测与治理一体化解决方案', description: '盐碱地监测治理集成设备将土壤盐分传感器、地下水位监测、灌溉控制阀和数据处理平台融为一体，实现"监测—诊断—治理"闭环。系统可实时监测土壤电导率（EC值）、pH值和含水率，根据阈值自动触发淋洗灌溉，有效降低土壤盐碱化程度。', cover_image: null, application_scenes: '盐碱地改良、灌区盐渍化防治、耕地质量监测', status: 1, sort_order: 1, created_at: '', updated_at: '' },
  { id: 9, category_id: 5, name: '水土保持云数据平台', slug: 'cloud-platform', model: 'YL-CP-01', summary: '水土保持数据云平台，支持多终端访问', description: '水土保持云数据平台是我司自主研发的数据管理与可视化平台，支持PC端、手机端和大屏端多终端访问。平台具备数据采集、存储、分析、预警和报表自动生成等功能，可将分散在各监测站的数据统一汇聚，实现区域水土保持动态一张图管理。', cover_image: null, application_scenes: '水土保持信息化管理、区域监测网络、流域综合监管', status: 1, sort_order: 1, created_at: '', updated_at: '' },
];

const fadeUp = MOTION.FADE_UP;

/** 产品子栏目slug → categories表 category_id 映射 */
const catSlugToId: Record<string, number> = {
  'soil-water-erosion-series': 1,
  'wind-erosion-series': 2,
  'eco-meteorology-series': 3,
  'saline-alkali-series': 4,
  'smart-cloud-platform': 5,
  'hydraulic-erosion-series': 1,
};

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const categoryIdFromParam = categoryParam ? (catSlugToId[categoryParam] || 0) : 0;
  const [categories, setCategories] = useState(fallbackCategories);
  const [products, setProducts] = useState<Product[]>(
    categoryIdFromParam > 0
      ? fallbackProducts.filter((p) => p.category_id === categoryIdFromParam)
      : fallbackProducts
  );
  const [activeTab, setActiveTab] = useState(categoryIdFromParam);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getCategories().catch(() => null),
      getProducts(activeTab ? { category_id: activeTab } : undefined).catch(() => null),
    ]).then(([catRes, prodRes]) => {
      if (catRes?.data?.data?.length) {
        const merged = catRes.data.data.map((c, i) => ({
          ...c,
          icon: fallbackCategories[i]?.icon || '☁️',
        }));
        setCategories(merged);
      }
      if (prodRes?.data?.data?.list?.length) {
        setProducts(prodRes.data.data.list);
      } else if (!prodRes) {
        setProducts(
          activeTab
            ? fallbackProducts.filter((p) => p.category_id === activeTab)
            : fallbackProducts
        );
      }
      setLoading(false);
    });
  }, [activeTab]);

  const handleTabChange = (_: React.SyntheticEvent, val: number) => {
    setActiveTab(val);
    if (val) {
      setSearchParams({ category: String(val) });
    } else {
      setSearchParams({});
    }
  };

  const filteredProducts = activeTab
    ? products.filter((p) => p.category_id === activeTab)
    : products;

  const getCategoryName = (id: number) => categories.find((c) => c.id === id)?.name || '';
  const getCategoryIcon = (id: number) => categories.find((c) => c.id === id)?.icon || '☁️';

  return (
    <Box>
      {/* Banner - 科技产品主题 */}
      <PageBanner
        title="产品中心"
        subtitle="五大产品系列，覆盖水土保持监测全场景"
        backgroundImage="/images/banners/products.jpg"
        fallbackImage="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80"
      />

      {/* Tabs + Products */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fff', position: 'relative' }}>
        <SectionDecorator variant="lines" opacity={0.03} position="bottom" />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 4,
              borderBottom: `2px solid ${V2_COLORS.divider}`,
              '& .MuiTab-root': { fontWeight: 600, fontSize: '1rem' },
              '& .Mui-selected': { color: V2_COLORS.primary.main },
              '& .MuiTabs-indicator': { bgcolor: V2_COLORS.secondary.main, height: 3 },
            }}
          >
            <Tab label="全部" value={0} />
            {categories.map((cat) => (
              <Tab
                key={cat.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {categoryIcons[cat.icon] || <CloudIcon sx={{ fontSize: 20 }} />}
                    <span>{cat.name}</span>
                  </Box>
                }
                value={cat.id}
              />
            ))}
          </Tabs>

          {loading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <AnimatedCard elevation={2}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton width="60%" />
                      <Skeleton width="40%" />
                      <Skeleton />
                    </CardContent>
                  </AnimatedCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {filteredProducts.map((product, idx) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: idx * 0.08 }}>
                    <AnimatedCard
                      elevation={2}
                      component={Link}
                      to={`/products/${product.id}`}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        textDecoration: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {product.cover_image ? (
                        <LazyImage
                          src={product.cover_image}
                          alt={product.name}
                          height={200}
                          objectFit="cover"
                          sx={{ borderRadius: '12px 12px 0 0' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 200,
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: '12px 12px 0 0',
                          }}
                        >
                          <Box
                            component="img"
                            src={categoryBgImages[getCategoryIcon(product.category_id)] || categoryBgImages['☁️']}
                            alt={product.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = categoryBgImages['☁️'];
                            }}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              filter: 'brightness(0.6)',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              background: `linear-gradient(180deg, rgba(15,43,71,0.1) 0%, rgba(15,43,71,0.5) 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {categoryIcons[getCategoryIcon(product.category_id)] || <CloudIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.7)' }} />}
                          </Box>
                        </Box>
                      )}
                      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: V2_COLORS.primary.main, mb: 0.5 }}>
                          {product.name}
                        </Typography>
                        {product.model && (
                          <Typography variant="body2" sx={{ color: V2_COLORS.secondary.main, mb: 1 }}>
                            型号：{product.model}
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ color: V2_COLORS.text.secondary, mb: 2, flex: 1, lineHeight: 1.8 }}>
                          {product.summary || getCategoryName(product.category_id)}
                        </Typography>
                        <Box
                          component="span"
                          sx={{
                            color: V2_COLORS.secondary.main,
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            alignSelf: 'flex-start',
                          }}
                        >
                          查看详情
                          <ArrowForwardIcon sx={{ fontSize: 18 }} />
                        </Box>
                      </CardContent>
                    </AnimatedCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}

          {!loading && filteredProducts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: '#999' }}>
                暂无该分类下的产品
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}
