import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box, Container, Typography, Breadcrumbs, Button, Skeleton, Grid, Paper, Chip, Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import { getCase } from '../api/cases';
import type { Case } from '../types/api';
import { V2_COLORS } from '../theme/colors';
import { MOTION } from '../theme/motion';

// 完整的fallback案例数据 — 与CasesPage一致
const fallbackCasesMap: Record<number, Case> = {
  1: {
    id: 1, title: '黄土高原水土保持监测站', slug: 'loess-plateau',
    summary: '在黄土高原典型侵蚀区建设的综合监测站，涵盖径流、泥沙、气象等多参数实时监测',
    description: '本项目位于陕西省延安市，在黄土高原典型侵蚀区建设了综合性水土保持监测站。监测站采用杨凌三智全套监测设备，包括模块化径流小区、径流泥沙自动监测仪、全自动气象站等。\n\n项目特点：\n1. 多参数同步监测：径流量、泥沙含量、降雨量、风速风向等12项参数\n2. 全自动运行：设备24小时无人值守运行\n3. 远程数据传输：4G网络实时数据上传至云平台\n4. 数据分析服务：提供专业的水土流失分析报告\n\n项目成果：\n监测站运行以来，已累计获取超过2年连续监测数据，为当地水土保持规划提供了科学依据，相关成果已在核心期刊发表论文3篇。',
    cover_image: null, location: '陕西延安', province: '陕西', is_featured: 1, status: 1, sort_order: 1, created_at: '2024-01-15', updated_at: '', images: [],
  },
  2: {
    id: 2, title: '黄河流域风蚀监测项目', slug: 'yellow-river-wind',
    summary: '在黄河沿岸风沙区部署全自动风蚀监测系统，为流域治理提供数据支撑',
    description: '在内蒙古鄂尔多斯黄河沿岸风沙区部署8套全自动风蚀监测系统，监测风蚀起沙量、输沙率、风速风向等参数，结合气象数据建立风蚀预报模型，为黄河流域风沙治理和生态修复工程提供精准数据支撑和决策依据。\n\n项目亮点：\n1. 8套设备组网监测，覆盖30公里风沙带\n2. 太阳能供电+4G传输，零运维成本\n3. 实时风蚀预警，提前2小时发布沙尘预报\n4. 数据支撑黄河流域生态修复工程规划',
    cover_image: null, location: '内蒙古鄂尔多斯', province: '内蒙古', is_featured: 1, status: 1, sort_order: 2, created_at: '2023-09-01', updated_at: '', images: [],
  },
  3: {
    id: 3, title: '南方红壤区径流监测', slug: 'red-soil-runoff',
    summary: '针对南方红壤区特有侵蚀类型，定制径流监测方案',
    description: '针对南方红壤区降雨强度大、土壤侵蚀类型特殊的特点，定制部署径流小区和自动监测设备，重点监测红壤坡面侵蚀过程、沟蚀发育规律，为南方红壤区水土保持方案编制和治理措施优化提供基础数据。\n\n项目特色：\n1. 适配南方强降雨条件，设备防护等级IP67\n2. 针对红壤酸性特征，传感器采用防腐材料\n3. 多级径流小区设计，覆盖5°-25°不同坡度\n4. 建立红壤区侵蚀预测模型',
    cover_image: null, location: '江西赣州', province: '江西', is_featured: 0, status: 1, sort_order: 3, created_at: '2023-11-20', updated_at: '', images: [],
  },
  4: {
    id: 4, title: '东北黑土区保护性耕作监测', slug: 'black-soil-monitor',
    summary: '在东北黑土区开展保护性耕作效果监测，数据支撑政策制定',
    description: '在黑龙江哈尔滨黑土区建设保护性耕作效果监测站，对比传统耕作与保护性耕作条件下的土壤侵蚀量、有机质变化和产量差异。监测数据直接服务于东北黑土地保护政策制定，是国家黑土地保护工程的重要数据来源。\n\n项目价值：\n1. 填补黑土区保护性耕作长期监测数据空白\n2. 量化免耕/少耕/秸秆覆盖的减沙效益\n3. 数据直接服务于国家黑土地保护政策\n4. 3年连续监测，积累可靠对比数据',
    cover_image: null, location: '黑龙江哈尔滨', province: '黑龙江', is_featured: 1, status: 1, sort_order: 4, created_at: '2022-06-01', updated_at: '', images: [],
  },
  5: {
    id: 5, title: '西北盐碱地监测治理项目', slug: 'saline-northwest',
    summary: '在西北干旱区开展盐碱地监测治理，探索生态修复路径',
    description: '在新疆昌吉州部署盐碱地监测治理集成设备，实时监测土壤电导率、pH值和含水率，根据监测数据自动控制淋洗灌溉，实现盐碱地改良的精准化管理。项目实施后土壤盐分平均降低35%，耕地质量显著提升。\n\n治理成效：\n1. 土壤EC值平均降低35%\n2. 耕地质量等级提升1-2级\n3. 作物出苗率提高40%\n4. 灌溉用水节约25%',
    cover_image: null, location: '新疆昌吉', province: '新疆', is_featured: 0, status: 1, sort_order: 5, created_at: '2023-03-15', updated_at: '', images: [],
  },
  6: {
    id: 6, title: '三峡库区水土流失监测', slug: 'three-gorges',
    summary: '为三峡库区提供水土流失实时监测和预警服务',
    description: '在三峡库区重点消落带和入库支流区域部署水土流失监测网络，实时监测坡面侵蚀、泥沙输移和水位变化，建立库区水土流失预警模型，为三峡工程安全运行和库区生态保护提供数据保障。\n\n项目创新：\n1. 消落带专项监测技术\n2. 多级泥沙输移实时追踪\n3. 库区水土流失预警模型\n4. 数据支撑三峡库区生态调度',
    cover_image: null, location: '湖北宜昌', province: '湖北', is_featured: 1, status: 1, sort_order: 6, created_at: '2024-02-10', updated_at: '', images: [],
  },
  7: {
    id: 7, title: '青海三江源生态监测', slug: 'sanjiangyuan',
    summary: '在三江源国家级自然保护区建设生态气象监测网络',
    description: '在三江源国家级自然保护区核心区建设5个生态气象监测站，监测温度、湿度、风速、辐射、降水和土壤水分等参数，为三江源生态保护和退化草地恢复研究提供长期连续的气象和土壤数据。\n\n项目意义：\n1. 海拔4000m以上极端环境设备稳定性验证\n2. 5站组网覆盖三江源核心保护区\n3. 数据支撑退化草地恢复研究\n4. 积累高原生态气象长期观测数据',
    cover_image: null, location: '青海玉树', province: '青海', is_featured: 0, status: 1, sort_order: 7, created_at: '2023-08-01', updated_at: '', images: [],
  },
  8: {
    id: 8, title: '甘肃定西小流域治理监测', slug: 'dingxi-watershed',
    summary: '在小流域治理项目中部署监测设备，评估治理效果',
    description: '在甘肃定西典型小流域综合治理项目中，布设径流小区和沟道监测断面，对比治理前后的产流产沙变化，量化梯田、淤地坝、林草等措施的减沙效益，为小流域治理效果评估提供科学依据。\n\n监测内容：\n1. 坡面径流小区产流产沙监测\n2. 沟道断面泥沙输移监测\n3. 治理前后减沙效益对比分析\n4. 淤地坝蓄水拦沙效果评估',
    cover_image: null, location: '甘肃定西', province: '甘肃', is_featured: 0, status: 1, sort_order: 8, created_at: '2022-11-01', updated_at: '', images: [],
  },
  9: {
    id: 9, title: '云南石漠化监测项目', slug: 'yunnan-rocky',
    summary: '在云南石漠化区域开展水土流失动态监测',
    description: '在云南曲靖石漠化区域部署径流监测和生态气象设备，监测石漠化地区特殊的水土流失过程和植被恢复效果，探索石漠化地区水土保持综合治理模式，为西南石漠化治理提供可复制的经验。\n\n项目目标：\n1. 石漠化地区水土流失规律研究\n2. 植被恢复效果定量评估\n3. 探索石漠化综合治理模式\n4. 为西南石漠化治理提供技术方案',
    cover_image: null, location: '云南曲靖', province: '云南', is_featured: 0, status: 1, sort_order: 9, created_at: '2023-05-20', updated_at: '', images: [],
  },
};

const fadeUp = { ...MOTION.FADE_UP };

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const numId = Number(id);
    if (numId) {
      getCase(numId)
        .then((res) => {
          if (res.data?.data) {
            setCaseData(res.data.data);
          } else {
            // API返回空数据，使用fallback
            setCaseData(fallbackCasesMap[numId] || fallbackCasesMap[1] || null);
          }
        })
        .catch(() => {
          // API失败，使用fallback
          setCaseData(fallbackCasesMap[numId] || fallbackCasesMap[1] || null);
        })
        .finally(() => setLoading(false));
    } else {
      setCaseData(fallbackCasesMap[1] || null);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Skeleton height={40} width={300} sx={{ mb: 2 }} />
        <Skeleton height={24} width={180} sx={{ mb: 4 }} />
        <Skeleton variant="rectangular" height={300} sx={{ mb: 4, borderRadius: 2 }} />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </Container>
    );
  }

  if (!caseData) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: V2_COLORS.text.secondary, mb: 3 }}>
          案例未找到
        </Typography>
        <Button component={Link} to="/cases" startIcon={<ArrowBackIcon />} variant="outlined">
          返回案例列表
        </Button>
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
            <Link to="/cases" style={{ color: V2_COLORS.text.secondary, textDecoration: 'none' }}>应用案例</Link>
            <Typography color="text.primary" fontSize="0.9rem">{caseData.title}</Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <motion.div {...fadeUp}>
          {/* 标题 + 地点 + 标签 */}
          <Typography variant="h4" sx={{ fontWeight: 700, color: V2_COLORS.primary.main, mb: 1.5 }}>
            {caseData.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            {caseData.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 18, color: V2_COLORS.accent.main }} />
                <Typography variant="body2" sx={{ color: V2_COLORS.accent.main, fontWeight: 600 }}>
                  {caseData.location}
                </Typography>
              </Box>
            )}
            {caseData.province && (
              <Chip
                icon={<CategoryIcon sx={{ fontSize: '16px !important' }} />}
                label={caseData.province}
                size="small"
                sx={{ bgcolor: V2_COLORS.primary[50], color: V2_COLORS.primary.main, fontWeight: 600 }}
              />
            )}
            {caseData.is_featured === 1 && (
              <Chip
                label="标杆案例"
                size="small"
                sx={{ bgcolor: 'rgba(212,134,42,0.1)', color: V2_COLORS.accent.main, fontWeight: 600 }}
              />
            )}
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* 案例概要 */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              mb: 4,
              borderRadius: 2,
              bgcolor: V2_COLORS.primary[50],
              borderLeft: `4px solid ${V2_COLORS.primary.main}`,
            }}
          >
            <Typography sx={{ fontWeight: 700, color: V2_COLORS.primary.main, mb: 1, fontSize: '0.9rem' }}>
              项目概要
            </Typography>
            <Typography variant="body1" sx={{ color: V2_COLORS.text.primary, lineHeight: 1.9 }}>
              {caseData.summary}
            </Typography>
          </Paper>

          {/* 图片画廊 */}
          {caseData.images && caseData.images.length > 0 ? (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {caseData.images.map((img) => (
                <Grid item xs={12} sm={6} md={4} key={img.id}>
                  <Box
                    component="img"
                    src={img.image_url}
                    alt={img.title || ''}
                    loading="lazy"
                    sx={{
                      width: '100%',
                      height: 200,
                      borderRadius: 2,
                      bgcolor: V2_COLORS.background.paper,
                      objectFit: 'cover',
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              sx={{
                width: '100%',
                height: 240,
                borderRadius: 3,
                overflow: 'hidden',
                mb: 4,
                position: 'relative',
              }}
            >
              <Box
                component="img"
                src="/images/cases/river.jpg"
                alt="项目现场"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.src.includes('unsplash')) {
                    img.src = 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&q=80';
                  }
                }}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <Box sx={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(15,43,71,0.6))',
                p: 3, pt: 6,
              }}>
                <Typography sx={{ color: '#fff', fontSize: '0.85rem', opacity: 0.8 }}>
                  项目现场照片（后台上传后显示）
                </Typography>
              </Box>
            </Box>
          )}

          {/* 详细描述 */}
          <Box
            sx={{
              bgcolor: V2_COLORS.background.default,
              borderRadius: 3,
              p: { xs: 3, md: 4 },
              mb: 4,
              borderLeft: `4px solid ${V2_COLORS.secondary.main}`,
            }}
          >
            <Typography sx={{ fontWeight: 700, color: V2_COLORS.secondary.main, mb: 2, fontSize: '0.9rem' }}>
              详细介绍
            </Typography>
            <Box
              className="case-description-content"
              sx={{
                color: V2_COLORS.text.primary,
                lineHeight: 2,
                '& img': { maxWidth: '100%', borderRadius: 1, my: 1 },
                '& p': { mb: 1.5 },
              }}
              dangerouslySetInnerHTML={{ __html: caseData.description || caseData.summary || '暂无详细描述' }}
            />
          </Box>

          {/* 底部操作 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Button
              component={Link}
              to="/cases"
              startIcon={<ArrowBackIcon />}
              sx={{
                color: V2_COLORS.primary.main,
                fontWeight: 600,
                '&:hover': { bgcolor: `rgba(15,43,71,0.04)` },
              }}
            >
              返回案例列表
            </Button>
            {caseData.created_at && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarTodayIcon sx={{ fontSize: 16, color: V2_COLORS.text.disabled }} />
                <Typography sx={{ fontSize: '0.8rem', color: V2_COLORS.text.disabled }}>
                  发布于 {caseData.created_at.split('T')[0]}
                </Typography>
              </Box>
            )}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
