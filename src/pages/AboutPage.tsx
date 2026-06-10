import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import { motion, useInView } from 'framer-motion';
import ScienceIcon from '@mui/icons-material/Science';
import FactoryIcon from '@mui/icons-material/Factory';
import NatureIcon from '@mui/icons-material/Nature';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import PublicIcon from '@mui/icons-material/Public';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getTeamMembers } from '../api/team';
import { getSettings } from '../api/settings';
import type { TeamMember } from '../types/api';
import { V2_COLORS } from '../theme/colors';
import PageBanner from '../components/PageBanner';

/* ── fallback 数据 ── */
const fallbackTeam: TeamMember[] = [
  { id: 1, name: '赵向辉', title: '总经理', bio: '高级工程师，30年机械设计及自动化经验', avatar: null, is_featured: 1, status: 1, sort_order: 1, created_at: '', updated_at: '' },
  { id: 2, name: '郭明航', title: '技术总监', bio: '研究员，35年水保工作经验', avatar: null, is_featured: 1, status: 1, sort_order: 2, created_at: '', updated_at: '' },
  { id: 3, name: '展小云', title: '科技副总经理', bio: '生态学博士，12年水保监测经验', avatar: null, is_featured: 1, status: 1, sort_order: 3, created_at: '', updated_at: '' },
];

const fallbackIntro = [
  '杨凌三智科技有限公司，坐落于中国唯一的农业高新技术产业示范区——杨凌，是一家专注于水土保持智能监测领域的高科技企业。公司依托水土保持与荒漠化整治全国重点实验室的科研力量，将前沿科技成果转化为可落地的监测产品与解决方案。',
  '公司拥有完整的研发、生产、销售和服务体系，产品涵盖土壤水蚀监测、土壤风蚀监测、生态气象监测、盐碱地监测治理和智慧水保云平台五大系列，已在全国20余个省份成功应用。',
  '凭借"国家级科研力量 + 行业深耕制造 + 政策赋能转化"的三方协同优势，杨凌三智致力于成为水土保持智能监测领域的领军企业。',
];

const milestones = [
  { year: '2010', title: '创始起步', desc: '西安三智科技成立，专注水土保持监测设备研发' },
  { year: '2016', title: '技术突破', desc: '首套径流泥沙自动监测仪通过国家水利部认证' },
  { year: '2020', title: '科研联合', desc: '与水土保持与荒漠化整治全国重点实验室深度合作' },
  { year: '2023', title: '杨凌落户', desc: '杨凌三智科技有限公司正式入驻杨凌农创汇' },
  { year: '2025', title: '全国布局', desc: '产品覆盖全国20余省份，服务超过200个监测站点' },
];

/* ── 数字动画 Hook ── */
function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  useEffect(() => {
    if (!startOnView || !inView) return;
    let frame: number;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [end, duration, startOnView, inView]);
  return { count, ref };
}

/* ── 滚动显示 Hook ── */
function useAnimateIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── 滚动触发动画包装器 ── */
function AnimateOnView({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useAnimateIn(0.15);
  return (
    <Box ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </Box>
  );
}

/* ── 数字动画展示组件 ── */
function CountUpDisplay({ end, duration = 2000 }: { end: number; duration?: number }) {
  const { count, ref } = useCountUp(end, duration);
  return <span ref={ref}>{count.toLocaleString()}</span>;
}

/* ── 三方资源卡片 ── */
interface EndorseCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tag: string;
  desc: string;
  accent: string;
  accentBg: string;
  index: number;
}
function EndorseCard({ icon, title, subtitle, tag, desc, accent, accentBg, index }: EndorseCardProps) {
  const { ref, visible } = useAnimateIn(0.2);
  return (
    <Box ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ height: '100%' }}
      >
        <Box
          sx={{
            position: 'relative',
            p: { xs: 3.5, lg: 4.5 },
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.04)',
            boxShadow: '0 2px 24px rgba(0,0,0,0.03)',
            transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            minHeight: 340,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.01)',
              boxShadow: `0 24px 64px ${accent}18`,
              borderColor: `${accent}30`,
              '& .endorse-icon': { transform: 'scale(1.12) rotate(-4deg)', bgcolor: accentBg },
              '& .endorse-arrow': { opacity: 1, transform: 'translateX(0)' },
              '& .endorse-glow': { opacity: 1 },
            },
          }}
        >
          {/* 光晕装饰 */}
          <Box
            className="endorse-glow"
            sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${accent}12 0%, transparent 70%)`,
              opacity: 0.4,
              transition: 'opacity 0.5s',
              pointerEvents: 'none',
            }}
          />

          {/* 图标 */}
          <Box
            className="endorse-icon"
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              bgcolor: accentBg,
              color: accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {icon}
          </Box>

          {/* 英文标签 */}
          <Typography
            sx={{
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              color: accent,
              mb: 1,
              opacity: 0.7,
            }}
          >
            {subtitle}
          </Typography>

          {/* 标题 */}
          <Typography
            sx={{
              fontWeight: 800,
              color: '#1A1A2E',
              fontSize: { xs: '1.05rem', lg: '1.15rem' },
              lineHeight: 1.45,
              letterSpacing: -0.2,
              mb: 2,
            }}
          >
            {title}
          </Typography>

          {/* 描述 */}
          <Typography
            variant="body2"
            sx={{
              color: '#64748B',
              lineHeight: 1.9,
              fontSize: { xs: '0.84rem', lg: '0.87rem' },
              flex: 1,
              mb: 3,
            }}
          >
            {desc}
          </Typography>

          {/* 底部标签 + 箭头 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignSelf: 'flex-start',
                px: 2,
                py: 0.5,
                borderRadius: '8px',
                bgcolor: accent,
                color: '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: 1,
                boxShadow: `0 2px 12px ${accent}40`,
              }}
            >
              {tag}
            </Box>
            <ArrowForwardIcon
              className="endorse-arrow"
              sx={{
                color: accent,
                opacity: 0,
                transform: 'translateX(-8px)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fontSize: '1.3rem',
              }}
            />
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}

/* ═════════════════════════════════════════
   主组件
   ═════════════════════════════════════════ */
export default function AboutPage() {
  const [team, setTeam] = useState<TeamMember[]>(fallbackTeam);
  const [settings, setSettings] = useState<Record<string, string>>({});

  const stats = [
    { num: 14, label: '深耕年限', icon: <WorkspacePremiumIcon fontSize="small" /> },
    { num: 20, label: '覆盖省份', icon: <PublicIcon fontSize="small" /> },
    { num: 200, label: '监测站点', icon: <LocationOnIcon fontSize="small" /> },
    { num: 5, label: '产品系列', icon: <FactoryIcon fontSize="small" /> },
  ];

  const { ref: statsRef, visible: statsVisible } = useAnimateIn(0.3);

  useEffect(() => {
    getTeamMembers({ is_featured: 1 }).then(res => {
      if (res.data?.data?.length) setTeam(res.data.data);
    }).catch(() => {});
    getSettings().then(res => {
      if (res.data?.data) setSettings(res.data.data);
    }).catch(() => {});
  }, []);

  const getIntro = (): string[] => {
    const introText = settings['company_intro'] || settings['about_company_intro'];
    if (introText) {
      const paragraphs = introText.split('\n').filter((p: string) => p.trim());
      if (paragraphs.length > 0) return paragraphs;
    }
    return fallbackIntro;
  };
  const introParagraphs = getIntro();

  return (
    <Box sx={{ overflowX: 'hidden' }}>

      {/* ═══════════════ ① HERO — 统一 PageBanner ═══════════════ */}
      <PageBanner
        title="关于我们"
        subtitle="国家级科研力量 × 行业深耕制造 × 政策赋能转化"
        backgroundImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80"
      />

      {/* ═══════════════ ② 数字统计动画 ═══════════════ */}
      <Box
        ref={statsRef}
        sx={{
          py: { xs: 6, md: 8 },
          background: `linear-gradient(135deg, ${V2_COLORS.primary.dark} 0%, #0D2137 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 背景装饰圆圈 */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            {stats.map((s, i) => (
              <Grid item xs={6} md={3} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={statsVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: i * 0.12 }}
                >
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Box sx={{ color: V2_COLORS.success.main, mb: 1.5, opacity: 0.8 }}>
                      {s.icon}
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        color: '#FFFFFF',
                        fontSize: { xs: '2.2rem', md: '3rem' },
                        letterSpacing: -1,
                        lineHeight: 1,
                        mb: 1,
                      }}
                    >
                      {statsVisible ? (
                        <CountUpDisplay end={s.num} duration={2200 + i * 200} />
                      ) : (
                        <>0</>
                      )}
                      <Box component="span" sx={{ color: V2_COLORS.success.main, fontSize: '0.5em', ml: 0.3 }}>+</Box>
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 500, letterSpacing: 1 }}>
                      {s.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ ③ 公司介绍 — 杂志级排版 ═══════════════ */}
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: '#fff', position: 'relative' }}>
        {/* 左上装饰 */}
        <Box sx={{ position: 'absolute', top: 60, left: 60, opacity: 0.03, pointerEvents: 'none' }}>
          <Typography sx={{ fontSize: '180px', fontWeight: 900, color: V2_COLORS.primary.main, lineHeight: 1 }}>ABOUT</Typography>
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">
            {/* 左：图片 + 浮动徽章 */}
            <Grid item xs={12} md={5}>
              <AnimateOnView delay={0}>
                <Box sx={{ position: 'relative' }}>
                  {/* 主图 */}
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80"
                    alt="科研实验室"
                    sx={{
                      width: '100%',
                      height: { xs: 280, md: 420 },
                      objectFit: 'cover',
                      borderRadius: '24px',
                      boxShadow: '0 32px 80px rgba(15,43,71,0.12)',
                      display: 'block',
                    }}
                  />
                  {/* 浮动认证徽章 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    style={{
                      position: 'absolute',
                      bottom: -28,
                      left: -28,
                      background: '#fff',
                      borderRadius: 20,
                      padding: '20px 24px',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: `${V2_COLORS.primary.main}0D`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: V2_COLORS.primary.main }}>
                      <WorkspacePremiumIcon fontSize="medium" />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1.1rem', lineHeight: 1.2 }}>国家级认证</Typography>
                      <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>水利部技术认证</Typography>
                    </Box>
                  </motion.div>

                  {/* 绿块装饰 */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -24,
                      right: -24,
                      width: 100,
                      height: 100,
                      borderRadius: '20px',
                      background: `linear-gradient(135deg, ${V2_COLORS.primary.main}, ${V2_COLORS.success.main})`,
                      opacity: 0.85,
                      zIndex: -1,
                    }}
                  />
                </Box>
              </AnimateOnView>
            </Grid>

            {/* 右：文字 */}
            <Grid item xs={12} md={7}>
              <AnimateOnView delay={0.15}>
                {/* 小标签 */}
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Box sx={{ width: 32, height: 2, bgcolor: V2_COLORS.primary.main, borderRadius: 1 }} />
                  <Typography sx={{ color: V2_COLORS.primary.main, fontSize: '0.75rem', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
                    公司介绍
                  </Typography>
                </Box>

                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 900,
                    color: '#1A1A2E',
                    fontSize: { xs: '1.8rem', md: '2.6rem' },
                    letterSpacing: -0.8,
                    lineHeight: 1.2,
                    mb: 4,
                  }}
                >
                  用科技守护
                  <Box component="span" sx={{ color: V2_COLORS.primary.main, display: 'inline' }}>绿水青山</Box>
                </Typography>

                {introParagraphs.map((text, idx) => (
                  <Typography
                    key={idx}
                    variant="body1"
                    sx={{
                      color: '#475569',
                      lineHeight: 2,
                      mb: idx < introParagraphs.length - 1 ? 3 : 0,
                      fontSize: '1rem',
                      position: 'relative',
                      pl: idx === 0 ? 3 : 0,
                      ...(idx === 0 ? { borderLeft: `3px solid ${V2_COLORS.success.main}`, ml: 0 } : {}),
                    }}
                  >
                    {text}
                  </Typography>
                ))}

                {/* 分割线 */}
                <Divider sx={{ my: 4, borderColor: 'rgba(0,0,0,0.04)' }} />

                {/* 亮点行 */}
                <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
                  {['国家级科研力量', '14年行业深耕', '全国20+省份'].map((t, i) => (
                    <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: [V2_COLORS.primary.main, V2_COLORS.success.main, V2_COLORS.accent.main][i] }} />
                      <Typography sx={{ color: '#334155', fontWeight: 600, fontSize: '0.9rem' }}>{t}</Typography>
                    </Box>
                  ))}
                </Stack>
              </AnimateOnView>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ ④ 三方资源协同 — 3D 浮动卡片 ═══════════════ */}
      <Box
        sx={{
          py: { xs: 10, md: 16 },
          background: '#F8FAFB',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 背景装饰 */}
        <Box sx={{ position: 'absolute', top: '10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${V2_COLORS.primary.main}06 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* 标题区 */}
          <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
            <AnimateOnView>
              <Typography
                sx={{
                  color: V2_COLORS.text.secondary,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: 5,
                  textTransform: 'uppercase',
                  mb: 2.5,
                }}
              >
                TRUSTED PARTNERS
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: '#1A1A2E',
                  fontSize: { xs: '2rem', md: '3rem' },
                  mb: 2,
                  letterSpacing: -0.5,
                  lineHeight: 1.15,
                }}
              >
                三方资源协同
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ height: 1, width: 40, bgcolor: V2_COLORS.primary.main, borderRadius: 1, opacity: 0.3 }} />
                <Typography sx={{ color: V2_COLORS.text.secondary, fontSize: '1rem', fontWeight: 500 }}>
                  国家级科研力量 × 行业深耕制造 × 政策赋能转化
                </Typography>
                <Box sx={{ height: 1, width: 40, bgcolor: V2_COLORS.primary.main, borderRadius: 1, opacity: 0.3 }} />
              </Box>
            </AnimateOnView>
          </Box>

          {/* 三张卡片 */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <EndorseCard
                icon={<ScienceIcon sx={{ fontSize: 28 }} />}
                title="水土保持与荒漠化整治全国重点实验室"
                subtitle="TECHNICAL SOURCE"
                tag="国家智库"
                desc="依托国家级重点实验室，汇聚顶尖科研力量，引领水土保持学科前沿方向。实验室承担国家重大科研项目，产出一系列具有国际影响力的原创性成果，为我国生态文明建设提供核心科技支撑。"
                accent={V2_COLORS.primary.main}
                accentBg={`${V2_COLORS.primary.main}0F`}
                index={0}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <EndorseCard
                icon={<FactoryIcon sx={{ fontSize: 28 }} />}
                title="西安三智科技"
                subtitle="14 YEARS DEEP CULTIVATION"
                tag="14年深耕"
                desc="14年专注水土保持监测设备研发制造，拥有完整的研发、生产、质控体系。产品覆盖全国20余个省份，在水蚀、风蚀、气象、盐碱地等领域均拥有成熟解决方案。"
                accent={V2_COLORS.accent.main}
                accentBg={`${V2_COLORS.accent.main}0F`}
                index={1}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <EndorseCard
                icon={<NatureIcon sx={{ fontSize: 28 }} />}
                title="杨凌农创汇 × 水务局"
                subtitle="POLICY EMPOWERMENT"
                tag="政策赋能"
                desc="依托杨凌农业高新技术产业示范区的政策优势，与水务局深度合作，推动科技成果从实验室走向田间地头，实现产学研用一体化，加速科技成果的产业化落地。"
                accent={V2_COLORS.success.main}
                accentBg={`${V2_COLORS.success.main}0F`}
                index={2}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ ⑤ 里程碑时间轴 ═══════════════ */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          bgcolor: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
            <AnimateOnView>
              <Typography
                sx={{
                  color: V2_COLORS.primary.main,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                  mb: 2,
                }}
              >
                发展历程
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: '#1A1A2E',
                  fontSize: { xs: '2rem', md: '2.8rem' },
                  letterSpacing: -0.5,
                  lineHeight: 1.15,
                }}
              >
                每一步都值得铭记
              </Typography>
            </AnimateOnView>
          </Box>

          {/* 时间轴 */}
          <Box sx={{ position: 'relative', maxWidth: 800, mx: 'auto' }}>
            {/* 中线 */}
            <Box
              sx={{
                position: 'absolute',
                left: { xs: 20, md: '50%' },
                top: 0,
                bottom: 0,
                width: 2,
                bgcolor: `${V2_COLORS.primary.main}18`,
                transform: { md: 'translateX(-50%)' },
                zIndex: 0,
              }}
            />

            {milestones.map((m, i) => {
              const isLeft = i % 2 === 0;
              return (
                <AnimateOnView key={m.year} delay={i * 0.1}>
                  <Box
                    sx={{
                      position: 'relative',
                      mb: 6,
                      display: 'flex',
                      alignItems: 'flex-start',
                      flexDirection: { xs: 'row', md: isLeft ? 'row' : 'row-reverse' },
                    }}
                  >
                    {/* 内容卡片 */}
                    <Box
                      sx={{
                        width: { xs: 'calc(100% - 60px)', md: 'calc(50% - 40px)' },
                        ml: { xs: 0, md: isLeft ? 0 : 'auto' },
                        mr: { xs: 0, md: isLeft ? 'auto' : 0 },
                        textAlign: { md: isLeft ? 'right' : 'left' },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 3,
                          py: 2.5,
                          borderRadius: '16px',
                          bgcolor: '#fff',
                          border: '1px solid rgba(0,0,0,0.04)',
                          boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
                          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          '&:hover': {
                            boxShadow: `0 12px 40px ${V2_COLORS.primary.main}10`,
                            borderColor: `${V2_COLORS.primary.main}25`,
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 900,
                            color: V2_COLORS.primary.main,
                            fontSize: { xs: '1.8rem', md: '2.2rem' },
                            lineHeight: 1,
                            mb: 1,
                            letterSpacing: -1,
                          }}
                        >
                          {m.year}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '1.05rem', mb: 0.8 }}>{m.title}</Typography>
                        <Typography sx={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.7 }}>{m.desc}</Typography>
                      </Box>
                    </Box>

                    {/* 圆点 */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: { xs: 20, md: '50%' },
                        top: 18,
                        transform: { xs: 'translateX(-50%)', md: 'translateX(-50%)' },
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: V2_COLORS.primary.main,
                        border: '3px solid #fff',
                        boxShadow: `0 0 0 3px ${V2_COLORS.primary.main}30, 0 4px 16px rgba(0,0,0,0.1)`,
                        zIndex: 1,
                      }}
                    />
                  </Box>
                </AnimateOnView>
              );
            })}
          </Box>
        </Container>
      </Box>

      {/* ═══════════════ ⑥ 核心团队 — 玻璃态卡片 ═══════════════ */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          background: `linear-gradient(160deg, ${V2_COLORS.primary.dark}F2 0%, #0D2137 50%, ${V2_COLORS.primary.dark} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 背景装饰 */}
        <Box sx={{ position: 'absolute', top: '20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${V2_COLORS.success.main}08 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
            <AnimateOnView>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 64,
                  height: 64,
                  borderRadius: '20px',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  mb: 3,
                  mx: 'auto',
                  color: V2_COLORS.success.main,
                }}
              >
                <GroupsIcon fontSize="large" />
              </Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: '#FFFFFF',
                  fontSize: { xs: '2rem', md: '2.8rem' },
                  mb: 2,
                  letterSpacing: -0.5,
                }}
              >
                核心团队
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', maxWidth: 440, mx: 'auto' }}>
                资深专家领衔，深耕行业数十年
              </Typography>
            </AnimateOnView>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {team.map((member, idx) => (
              <Grid item xs={12} sm={6} md={4} key={member.id} sx={{ maxWidth: 380 }}>
                <AnimateOnView delay={idx * 0.12}>
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: '24px',
                      background: 'rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      textAlign: 'center',
                      transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.1)',
                        borderColor: 'rgba(255,255,255,0.15)',
                        transform: 'translateY(-8px)',
                        '& .team-avatar': { transform: 'scale(1.06)', boxShadow: `0 12px 40px ${V2_COLORS.success.main}30` },
                      },
                    }}
                  >
                    <Avatar
                      src={member.avatar || undefined}
                      className="team-avatar"
                      sx={{
                        width: 110,
                        height: 110,
                        mx: 'auto',
                        mb: 3,
                        bgcolor: `linear-gradient(135deg, ${V2_COLORS.primary.main}, ${V2_COLORS.success.main})`,
                        background: `linear-gradient(135deg, ${V2_COLORS.primary.main}, ${V2_COLORS.success.main})`,
                        fontSize: '2.4rem',
                        fontWeight: 700,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      }}
                    >
                      {member.name.charAt(0)}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
                      {member.name}
                    </Typography>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 2,
                        py: 0.5,
                        borderRadius: '999px',
                        bgcolor: 'rgba(255,255,255,0.08)',
                        mb: 2,
                      }}
                    >
                      <Typography sx={{ color: V2_COLORS.success.main, fontSize: '0.82rem', fontWeight: 600 }}>
                        {member.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.85, fontSize: '0.88rem' }}>
                      {member.bio}
                    </Typography>
                  </Box>
                </AnimateOnView>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════════ ⑦ 农创汇 CTA ═══════════════ */}
      <Box sx={{ py: { xs: 10, md: 14 }, position: 'relative', overflow: 'hidden' }}>
        {/* 背景图 */}
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
          alt="杨凌农创汇"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.25)',
            zIndex: 0,
          }}
        />
        {/* 渐变遮罩 */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${V2_COLORS.primary.dark}E6 0%, ${V2_COLORS.primary.main}CC 60%, ${V2_COLORS.success.main}B3 100%)`,
            zIndex: 1,
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <AnimateOnView>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.15)',
                borderTopColor: V2_COLORS.success.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 28px',
                color: '#fff',
              }}
            >
              <NatureIcon sx={{ fontSize: 32, position: 'absolute' }} />
            </motion.div>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#fff',
                mb: 3,
                fontSize: { xs: '1.6rem', md: '2.2rem' },
                letterSpacing: -0.3,
              }}
            >
              杨凌农创汇入驻企业
            </Typography>

            <Typography
              sx={{
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 2,
                mb: 4,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              杨凌三智科技有限公司作为杨凌农创汇重点入驻企业，享有示范区在税收、人才、科研经费等方面的一系列扶持政策。依托农创汇的产业集聚效应，公司得以与上下游企业深度协同，加速技术创新与成果转化。
            </Typography>

            {/* 地点 */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'rgba(255,255,255,0.6)' }}>
              <LocationOnIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">陕西省杨凌农业高新技术产业示范区</Typography>
            </Box>
          </AnimateOnView>
        </Container>
      </Box>
    </Box>
  );
}
