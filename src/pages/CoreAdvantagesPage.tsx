import { Box, Container, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Biotech, PrecisionManufacturing, BarChart, Handshake, Public, VerifiedUser,
} from '@mui/icons-material';
import PageBanner from '../components/PageBanner';
import { V2_COLORS } from '../theme/colors';
import { MOTION } from '../theme/motion';

// ─── 优势卡片数据 ───────────────────────────────────
const ADVANTAGES = [
  {
    Icon: Biotech,
    title: '国家级科研平台',
    subtitle: 'National Research Platform',
    description:
      '依托中国科学院水土保持研究所、黄土高原土壤侵蚀与旱地农业国家重点实验室等国家级科研力量，在土壤侵蚀监测、生态修复技术领域具有深厚的理论积累和原始创新，确保核心技术始终处于行业前沿。',
    gradient: 'linear-gradient(135deg, #0F2B47 0%, #1a4a78 100%)',
    accent: '#4A90D9',
    glow: 'rgba(74,144,217,0.3)',
  },
  {
    Icon: PrecisionManufacturing,
    title: '自主知识产权设备',
    subtitle: 'Proprietary Equipment',
    description:
      '从径流泥沙自动监测仪、全自动气象站到智慧水保云平台，全套监测设备均拥有自主知识产权，核心传感器精度达到国际领先水平，已获得多项国家发明专利和软件著作权。',
    gradient: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
    accent: '#52B788',
    glow: 'rgba(82,183,136,0.3)',
  },
  {
    Icon: BarChart,
    title: '数据驱动决策',
    subtitle: 'Data-Driven Decisions',
    description:
      '智慧水保云平台汇聚全国200+监测站点实时数据，通过AI算法实现侵蚀趋势预测、灾害风险评估和治理方案智能推荐，让数据真正成为水土保持科学决策的\"眼睛\"。',
    gradient: 'linear-gradient(135deg, #3A1C71 0%, #6C5CE7 100%)',
    accent: '#A29BFE',
    glow: 'rgba(162,155,254,0.3)',
  },
  {
    Icon: Handshake,
    title: '产学研深度融合',
    subtitle: 'Industry-Academia Integration',
    description:
      '打通\"实验室发明→工程化量产→田间部署验证\"全链条，与西北农林科技大学、中国农业大学等建立研究生联合培养基地，科技成果转化率行业领先。',
    gradient: 'linear-gradient(135deg, #7B3F00 0%, #D4862A 100%)',
    accent: '#F0A04B',
    glow: 'rgba(240,160,75,0.3)',
  },
  {
    Icon: Public,
    title: '全国部署验证',
    subtitle: 'Nationwide Deployment',
    description:
      '产品已覆盖黄土高原、东北黑土区、南方红壤区、西北风沙区等全国主要侵蚀类型区，累计部署站点超200个，系统在大风、暴雨、严寒等极端环境下稳定运行超50,000小时。',
    gradient: 'linear-gradient(135deg, #023E8A 0%, #0077B6 100%)',
    accent: '#48CAE4',
    glow: 'rgba(72,202,228,0.3)',
  },
  {
    Icon: VerifiedUser,
    title: '全生命周期服务',
    subtitle: 'Full Lifecycle Service',
    description:
      '从前期勘察选点、设备安装调试、数据对接培训到后期运维升级，提供7×24小时技术支撑。每位客户配备专属技术顾问，确保系统长期稳定运行。',
    gradient: 'linear-gradient(135deg, #800F2F 0%, #C9184A 100%)',
    accent: '#FF758F',
    glow: 'rgba(255,117,143,0.3)',
  },
];

// ─── 技术支柱数据 ───────────────────────────────────
const TECH_PILLARS = [
  {
    number: '01',
    title: '多参数同步采集技术',
    detail:
      '单站同时监测径流量、泥沙含量、降雨量、土壤含水量、风速风向等12+参数，采样频率可调（1min-24h），数据自动校准与异常值剔除。',
    tags: ['高精度传感器', '边缘计算', '自动校准'],
  },
  {
    number: '02',
    title: '低功耗远程传输',
    detail:
      '基于4G/北斗双模通信，太阳能+锂电池混合供电，在无市电的偏远山区实现全年不间断运行，功耗仅为同类产品的60%。',
    tags: ['双模通信', '太阳能供电', '超低功耗'],
  },
  {
    number: '03',
    title: 'AI智能分析引擎',
    detail:
      '基于深度学习的侵蚀沟发育识别、植被覆盖度语义分割、降雨侵蚀力时空预测等10+AI模型，分析精度较传统方法提升35%以上。',
    tags: ['深度学习', '语义分割', '时空预测'],
  },
  {
    number: '04',
    title: '模块化积木架构',
    detail:
      '所有监测设备采用统一接口标准，支持即插即用扩展。从单参数迷你站到全要素综合站，可根据预算和需求灵活组合，后期升级无需更换主机。',
    tags: ['即插即用', '灵活扩展', '标准化接口'],
  },
];

// ─── 方案流程数据 ───────────────────────────────────
const PROCESS = [
  { step: '需求分析', desc: '现场勘察 → 确定监测指标体系 → 出具定制方案', icon: '📋' },
  { step: '设备部署', desc: '设备生产 → 现场安装 → 系统联调 → 数据接入', icon: '🔧' },
  { step: '平台上线', desc: '云平台配置 → 数据校准 → 操作培训 → 正式运行', icon: '🚀' },
  { step: '持续服务', desc: '远程运维 → 数据分析报告 → 定期巡检 → 迭代升级', icon: '🔄' },
];

// ─── 复用动画 variant ───────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' },
  }),
};

export default function CoreAdvantagesPage() {
  return (
    <Box sx={{ overflowX: 'hidden' }}>
      {/* ═══════════════ ① Banner ═══════════════ */}
      <PageBanner
        title="核心优势"
        subtitle="以科技创新为引擎 · 以数据智能为驱动 · 守护绿水青山"
        backgroundImage="https://images.unsplash.com/photo-1581093458791-9f3c3902bdf9?w=1920&q=80"
      />

      {/* ═══════════════ ② 6大核心优势卡片 ═══════════════ */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          position: 'relative',
          background: `linear-gradient(180deg, #FAFBFC 0%, #F0F4F8 50%, #FAFBFC 100%)`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)',
          },
        }}
      >
        {/* 背景装饰 */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.4,
            pointerEvents: 'none',
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(74,144,217,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(82,183,136,0.06) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(108,92,231,0.04) 0%, transparent 50%)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* 标题 */}
          <motion.div {...MOTION.FADE_UP}>
            <Box sx={{ textAlign: 'center', mb: 1.5 }}>
              <Box
                sx={{
                  display: 'inline-block',
                  px: 2.5,
                  py: 0.6,
                  borderRadius: '999px',
                  bgcolor: 'rgba(15,43,71,0.06)',
                  color: V2_COLORS.primary.main,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  mb: 2,
                }}
              >
                Core Competencies
              </Box>
            </Box>
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                fontWeight: 800,
                fontSize: { xs: '1.5rem', md: '2.1rem' },
                color: V2_COLORS.text.primary,
                mb: 1.5,
                letterSpacing: 1,
              }}
            >
              六大维度铸就
              <Box component="span" sx={{ color: V2_COLORS.accent.main, ml: 1 }}>
                行业标杆
              </Box>
            </Typography>
            <Typography
              sx={{
                textAlign: 'center',
                color: V2_COLORS.text.secondary,
                fontSize: '1rem',
                maxWidth: 560,
                mx: 'auto',
                mb: 7,
                lineHeight: 1.7,
              }}
            >
              从科研底蕴到全生命周期服务，构建水土保持监测领域全方位的竞争壁垒
            </Typography>
          </motion.div>

          {/* 卡片 Grid */}
          <Grid container spacing={3.5}>
            {ADVANTAGES.map((item, idx) => {
              const IconComponent = item.Icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <motion.div
                    custom={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    variants={fadeUp}
                    style={{ height: '100%' }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        height: '100%',
                        borderRadius: '20px',
                        bgcolor: '#fff',
                        overflow: 'visible',
                        boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                        transition: 'all 0.45s cubic-bezier(0.22, 0.61, 0.36, 1)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        '&:hover': {
                          transform: 'translateY(-10px)',
                          boxShadow: `0 24px 56px rgba(0,0,0,0.10), 0 0 0 1px ${item.accent}20`,
                          '& .adv-glow': { opacity: 1 },
                          '& .adv-icon-ring': {
                            transform: 'scale(1.08)',
                            boxShadow: `0 0 32px ${item.glow}`,
                          },
                          '& .adv-num': {
                            color: item.accent,
                            transform: 'translateY(-2px)',
                          },
                        },
                      }}
                    >
                      {/* 光晕效果 */}
                      <Box
                        className="adv-glow"
                        sx={{
                          position: 'absolute',
                          top: -30,
                          right: -30,
                          width: 160,
                          height: 160,
                          borderRadius: '50%',
                          background: `radial-gradient(circle, ${item.glow} 0%, transparent 70%)`,
                          opacity: 0,
                          transition: 'opacity 0.5s ease',
                          pointerEvents: 'none',
                          zIndex: 0,
                        }}
                      />

                      {/* 内容区 */}
                      <Box sx={{ p: { xs: 3, md: 3.5 }, position: 'relative', zIndex: 1 }}>
                        {/* 顶部：编号 + 图标 */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            mb: 2.5,
                          }}
                        >
                          <Typography
                            className="adv-num"
                            sx={{
                              fontSize: '3rem',
                              fontWeight: 900,
                              lineHeight: 1,
                              color: 'rgba(0,0,0,0.06)',
                              transition: 'all 0.4s ease',
                              mt: -1,
                            }}
                          >
                            {String(idx + 1).padStart(2, '0')}
                          </Typography>

                          <Box
                            className="adv-icon-ring"
                            sx={{
                              width: 52,
                              height: 52,
                              borderRadius: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.35s cubic-bezier(0.22, 0.61, 0.36, 1)',
                              background: item.gradient,
                              boxShadow: `0 8px 20px ${item.glow}`,
                              position: 'relative',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                inset: 3,
                                borderRadius: '13px',
                                border: '1px solid rgba(255,255,255,0.2)',
                              },
                            }}
                          >
                            <IconComponent sx={{ color: '#fff', fontSize: '1.5rem' }} />
                          </Box>
                        </Box>

                        {/* 标题 */}
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            color: V2_COLORS.text.primary,
                            mb: 0.5,
                            lineHeight: 1.3,
                          }}
                        >
                          {item.title}
                        </Typography>

                        {/* 英文副标题 */}
                        <Typography
                          sx={{
                            fontSize: '0.7rem',
                            color: V2_COLORS.text.disabled,
                            textTransform: 'uppercase',
                            letterSpacing: 1.8,
                            fontWeight: 600,
                            mb: 1.8,
                          }}
                        >
                          {item.subtitle}
                        </Typography>

                        {/* 分割线 */}
                        <Box
                          sx={{
                            width: 32,
                            height: 3,
                            borderRadius: 2,
                            background: item.gradient,
                            mb: 1.8,
                          }}
                        />

                        {/* 描述 */}
                        <Typography
                          sx={{
                            fontSize: '0.88rem',
                            color: V2_COLORS.text.secondary,
                            lineHeight: 1.85,
                          }}
                        >
                          {item.description}
                        </Typography>
                      </Box>

                      {/* 底部装饰线 */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 20,
                          right: 20,
                          height: 1,
                          background: `linear-gradient(90deg, transparent, ${item.accent}30, transparent)`,
                        }}
                      />
                    </Box>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ ③ 技术支柱 ═══════════════ */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          background: `linear-gradient(175deg, ${V2_COLORS.primary.dark} 0%, ${V2_COLORS.primary.main} 40%, ${V2_COLORS.secondary.main} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 背景装饰 */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)',
            backgroundSize: '60px 60px',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${V2_COLORS.accent.main}15 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div {...MOTION.FADE_UP}>
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                fontWeight: 800,
                fontSize: { xs: '1.6rem', md: '2.2rem' },
                color: '#fff',
                mb: 1.5,
              }}
            >
              四大核心技术支柱
            </Typography>
            <Typography
              sx={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '1.05rem',
                maxWidth: 600,
                mx: 'auto',
                mb: 6,
              }}
            >
              从数据采集到智能分析，构建完整的技术闭环
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {TECH_PILLARS.map((pillar, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <motion.div
                  custom={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                >
                  <Box
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(16px)',
                      borderRadius: 3,
                      p: { xs: 3, md: 4 },
                      border: '1px solid rgba(255,255,255,0.08)',
                      height: '100%',
                      transition: 'all 0.35s ease',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
                      },
                    }}
                  >
                    {/* 编号 */}
                    <Typography
                      sx={{
                        fontSize: '3.5rem',
                        fontWeight: 900,
                        color: 'rgba(255,255,255,0.08)',
                        lineHeight: 1,
                        mb: -3,
                        ml: -1,
                      }}
                    >
                      {pillar.number}
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: '#fff',
                        fontSize: '1.25rem',
                        mb: 1.5,
                        position: 'relative',
                      }}
                    >
                      {pillar.title}
                    </Typography>

                    <Typography
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.95rem',
                        lineHeight: 1.8,
                        mb: 2.5,
                      }}
                    >
                      {pillar.detail}
                    </Typography>

                    {/* 标签 */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {pillar.tags.map((tag, tIdx) => (
                        <Box
                          key={tIdx}
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '999px',
                            bgcolor: 'rgba(212,134,42,0.2)',
                            border: '1px solid rgba(212,134,42,0.3)',
                            color: V2_COLORS.accent.light,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}
                        >
                          {tag}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ ④ 方案流程 ═══════════════ */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: V2_COLORS.background.default }}>
        <Container maxWidth="lg">
          <motion.div {...MOTION.FADE_UP}>
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                fontWeight: 800,
                fontSize: { xs: '1.6rem', md: '2.2rem' },
                color: V2_COLORS.text.primary,
                mb: 1.5,
              }}
            >
              一站式解决方案流程
            </Typography>
            <Typography
              sx={{
                textAlign: 'center',
                color: V2_COLORS.text.secondary,
                fontSize: '1.05rem',
                maxWidth: 560,
                mx: 'auto',
                mb: 6,
              }}
            >
              标准化的交付流程，确保每套系统从方案到运维无缝衔接
            </Typography>
          </motion.div>

          <Grid container spacing={3}>
            {PROCESS.map((item, idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <motion.div
                  custom={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={scaleIn}
                >
                  <Box
                    sx={{
                      textAlign: 'center',
                      position: 'relative',
                      '&:not(:last-child)::after': {
                        content: '""',
                        position: 'absolute',
                        top: 36,
                        right: { xs: -12, md: -24 },
                        width: { xs: 24, md: 48 },
                        height: 2,
                        bgcolor: V2_COLORS.divider,
                        display: { xs: 'block', md: 'block' },
                      },
                    }}
                  >
                    {/* 步骤图标 */}
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        mx: 'auto',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                        background: `linear-gradient(135deg, ${V2_COLORS.primary.main}, ${V2_COLORS.success.main})`,
                        boxShadow: `0 8px 24px ${V2_COLORS.success.main}30`,
                        transition: 'transform 0.35s ease',
                        '&:hover': { transform: 'scale(1.08)' },
                      }}
                    >
                      {item.icon}
                    </Box>

                    {/* 步骤编号 */}
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1.5,
                        py: 0.3,
                        borderRadius: '999px',
                        bgcolor: V2_COLORS.primary[50],
                        color: V2_COLORS.primary.main,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: 1,
                        mb: 1,
                      }}
                    >
                      STEP {idx + 1}
                    </Box>

                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        color: V2_COLORS.text.primary,
                        mb: 0.75,
                      }}
                    >
                      {item.step}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: '0.85rem',
                        color: V2_COLORS.text.secondary,
                        lineHeight: 1.6,
                      }}
                    >
                      {item.desc}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ ⑤ CTA ═══════════════ */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          background: `linear-gradient(135deg, ${V2_COLORS.success.dark} 0%, ${V2_COLORS.primary.dark} 100%)`,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.06,
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 50%, #fff 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.5rem', md: '2rem' },
                color: '#fff',
                mb: 2,
              }}
            >
              准备好为您的项目赋能了吗？
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: '1.05rem',
                mb: 4,
                lineHeight: 1.8,
              }}
            >
              无论是科研合作、设备采购还是定制化方案，我们的技术团队随时为您提供专业咨询
            </Typography>

            {/* CTA 按钮 */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Box
                component="a"
                href="/contact"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 5,
                  py: 1.8,
                  borderRadius: '999px',
                  bgcolor: V2_COLORS.accent.main,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  boxShadow: `0 8px 32px ${V2_COLORS.accent.main}50`,
                  transition: 'box-shadow 0.3s ease',
                  '&:hover': {
                    boxShadow: `0 12px 40px ${V2_COLORS.accent.main}70`,
                  },
                }}
              >
                立即咨询 <span style={{ fontSize: '1.1rem' }}>→</span>
              </Box>
            </motion.div>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
