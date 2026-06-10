import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { navCategoryApi, articleApi } from '../api/navigation';
import type { NavSubcategory, Article } from '../api/navigation';
import { getCases, getCase } from '../api/cases';
import type { Case } from '../types/api';

// ============================================================================
// 成果转化独立模板 — 完全仿 skl.iswc.cas.cn 原站
// 策略：加载原站CSS + 使用原站HTML结构/class名 + 图片从原站调用
// 只有左侧栏菜单项和内容区文章调自己后台API
// ============================================================================

// 原站CSS文件地址
const ORIG_CSS_FILES = [
  '//skl.iswc.cas.cn/images/bootstrap.min.css',
  '//skl.iswc.cas.cn/images/swiper.min.css',
  '//skl.iswc.cas.cn/images/common.css',
  '//skl.iswc.cas.cn/images/style.css',
];

// 原站基础地址
const ORIG_BASE = 'http://skl.iswc.cas.cn';

// 注入原站CSS到head
function injectOriginalCSS() {
  const links: HTMLLinkElement[] = [];
  ORIG_CSS_FILES.forEach((href, i) => {
    const id = `orig-css-${i}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    links.push(link);
  });
  return links;
}

// 移除注入的CSS
function removeOriginalCSS() {
  ORIG_CSS_FILES.forEach((_, i) => {
    const el = document.getElementById(`orig-css-${i}`);
    if (el) el.remove();
  });
}

// 主导航数据（完全复制原站，带下拉子菜单）
const MAIN_NAV = [
  { label: '首页', href: `${ORIG_BASE}/`, children: [] },
  {
    label: '关于我们', href: `${ORIG_BASE}/gywm/`,
    children: [
      { label: '实验室简介', href: `${ORIG_BASE}/gywm/sysjj/` },
      { label: '历史沿革', href: `${ORIG_BASE}/gywm/lsyg/` },
      { label: '现任领导', href: `${ORIG_BASE}/gywm/xrld/` },
      { label: '历任领导', href: `${ORIG_BASE}/gywm/lrld/` },
      { label: '现任学术委员会', href: `${ORIG_BASE}/gywm/xrxswyh/` },
      { label: '历任学术委员会', href: `${ORIG_BASE}/gywm/lrxswyh/` },
      { label: '组织结构', href: `${ORIG_BASE}/gywm/zzjg/` },
      { label: '联系我们', href: `${ORIG_BASE}/gywm/lxwm/` },
    ],
  },
  {
    label: '人才队伍', href: `${ORIG_BASE}/rcdw/`,
    children: [
      { label: '院士', href: `${ORIG_BASE}/rcdw/ys/` },
      { label: '领军人才', href: `${ORIG_BASE}/rcdw/zjrc/` },
      { label: '固定人员', href: `${ORIG_BASE}/rcdw/gdry/` },
      { label: '科研团队', href: `${ORIG_BASE}/rcdw/kytd/` },
      { label: '人才引进', href: `${ORIG_BASE}/rcdw/rcyj/` },
    ],
  },
  {
    label: '科学研究', href: `${ORIG_BASE}/kxyj/`,
    children: [
      { label: '研究方向', href: `${ORIG_BASE}/kxyj/yjfx/` },
      { label: '科研项目', href: `${ORIG_BASE}/kxyj/kyxm/` },
      { label: '开放基金', href: `${ORIG_BASE}/kxyj/kfjj/` },
      { label: '成果奖励', href: `${ORIG_BASE}/kxyj/cgjl/` },
      { label: '学术论文', href: `${ORIG_BASE}/kxyj/xslw/` },
    ],
  },
  {
    label: '党建与创新文化', href: `${ORIG_BASE}/djycxwh/`,
    children: [
      { label: '支部建设', href: `${ORIG_BASE}/djycxwh/zbjs/` },
      { label: '党小组', href: `${ORIG_BASE}/djycxwh/dxz/` },
      { label: '创新文化', href: `${ORIG_BASE}/djycxwh/cxwh/` },
    ],
  },
  {
    label: '实验平台', href: `${ORIG_BASE}/sypt/`,
    children: [
      { label: '研究设施', href: `${ORIG_BASE}/sypt/yjss/` },
      { label: '仪器设备', href: `${ORIG_BASE}/sypt/dxyqsb/` },
      { label: '野外台站', href: `${ORIG_BASE}/sypt/ywtz/` },
      { label: '数据中心', href: 'https://loess.geodata.cn/' },
    ],
  },
  { label: '管理制度', href: `${ORIG_BASE}/glzd/`, children: [] },
];

// 案例详情fallback数据
const fallbackCasesMap: Record<number, Case> = {
  1: { id: 1, title: '黄土高原水土保持监测站', slug: 'loess-plateau', summary: '在黄土高原典型侵蚀区建设的综合监测站，涵盖径流、泥沙、气象等多参数实时监测', description: '<p>本项目位于陕西省延安市，在黄土高原典型侵蚀区建设了综合性水土保持监测站。监测站采用杨凌三智全套监测设备，包括模块化径流小区、径流泥沙自动监测仪、全自动气象站等。</p><p><strong>项目特点：</strong></p><ul><li>多参数同步监测：径流量、泥沙含量、降雨量、风速风向等12项参数</li><li>全自动运行：设备24小时无人值守运行</li><li>远程数据传输：4G网络实时数据上传至云平台</li><li>数据分析服务：提供专业的水土流失分析报告</li></ul>', cover_image: null, location: '陕西延安', province: '陕西', is_featured: 1, status: 1, sort_order: 1, created_at: '2024-01-15', updated_at: '', images: [] },
  2: { id: 2, title: '黄河流域风蚀监测项目', slug: 'yellow-river-wind', summary: '在黄河沿岸风沙区部署全自动风蚀监测系统，为流域治理提供数据支撑', description: '<p>在内蒙古鄂尔多斯黄河沿岸风沙区部署8套全自动风蚀监测系统，监测风蚀起沙量、输沙率、风速风向等参数，结合气象数据建立风蚀预报模型，为黄河流域风沙治理和生态修复工程提供精准数据支撑和决策依据。</p>', cover_image: null, location: '内蒙古鄂尔多斯', province: '内蒙古', is_featured: 1, status: 1, sort_order: 2, created_at: '2023-09-01', updated_at: '', images: [] },
  3: { id: 3, title: '南方红壤区径流监测', slug: 'red-soil-runoff', summary: '针对南方红壤区特有侵蚀类型，定制径流监测方案', description: '<p>针对南方红壤区降雨强度大、土壤侵蚀类型特殊的特点，定制部署径流小区和自动监测设备，重点监测红壤坡面侵蚀过程、沟蚀发育规律，为南方红壤区水土保持方案编制和治理措施优化提供基础数据。</p>', cover_image: null, location: '江西赣州', province: '江西', is_featured: 0, status: 1, sort_order: 3, created_at: '2023-11-20', updated_at: '', images: [] },
  4: { id: 4, title: '东北黑土区保护性耕作监测', slug: 'black-soil-monitor', summary: '在东北黑土区开展保护性耕作效果监测，数据支撑政策制定', description: '<p>在黑龙江哈尔滨黑土区建设保护性耕作效果监测站，对比传统耕作与保护性耕作条件下的土壤侵蚀量、有机质变化和产量差异。</p>', cover_image: null, location: '黑龙江哈尔滨', province: '黑龙江', is_featured: 1, status: 1, sort_order: 4, created_at: '2022-06-01', updated_at: '', images: [] },
  5: { id: 5, title: '西北盐碱地监测治理项目', slug: 'saline-northwest', summary: '在西北干旱区开展盐碱地监测治理，探索生态修复路径', description: '<p>在新疆昌吉州部署盐碱地监测治理集成设备，实时监测土壤电导率、pH值和含水率，根据监测数据自动控制淋洗灌溉，实现盐碱地改良的精准化管理。</p>', cover_image: null, location: '新疆昌吉', province: '新疆', is_featured: 0, status: 1, sort_order: 5, created_at: '2023-03-15', updated_at: '', images: [] },
  6: { id: 6, title: '三峡库区水土流失监测', slug: 'three-gorges', summary: '为三峡库区提供水土流失实时监测和预警服务', description: '<p>在三峡库区重点消落带和入库支流区域部署水土流失监测网络，实时监测坡面侵蚀、泥沙输移和水位变化，建立库区水土流失预警模型。</p>', cover_image: null, location: '湖北宜昌', province: '湖北', is_featured: 1, status: 1, sort_order: 6, created_at: '2024-02-10', updated_at: '', images: [] },
};

// Footer友情链接
const FOOTER_LINKS = [
  { label: '西北农林科技大学', href: 'https://www.nwsuaf.edu.cn/' },
  { label: '中华人民共和国教育部', href: 'http://www.moe.gov.cn/index.html' },
  { label: '中华人民共和国水利部', href: 'http://mwr.gov.cn/?language=zh-CN' },
  { label: '中国科学院', href: 'https://www.cas.cn/' },
  { label: '中国水土保持学会', href: 'https://www.sbxh.org.cn/' },
  { label: '国家自然科学基金委员会', href: 'https://www.nsfc.gov.cn/' },
];

// 成果转化页面fallback子栏目和文章数据
const fallbackSubcategories: NavSubcategory[] = [
  { id: 51, parent_id: 5, name: '技术成果', slug: 'tech-achievements', description: '核心专利技术与产品化成果', display_mode: 'list', sort_order: 1, status: 1, created_at: '', updated_at: '' },
  { id: 52, parent_id: 5, name: '技术推广', slug: 'tech-promotion', description: '水利部推广目录及行业应用', display_mode: 'list', sort_order: 2, status: 1, created_at: '', updated_at: '' },
  { id: 53, parent_id: 5, name: '产学研合作', slug: 'industry-academy', description: '与高校和科研机构的合作成果', display_mode: 'list', sort_order: 3, status: 1, created_at: '', updated_at: '' },
];

const fallbackArticles: Record<number, Article[]> = {
  51: [
    { id: 501, subcategory_id: 51, title: '径流泥沙自动监测仪获国家发明专利', summary: '我司自主研发的径流泥沙自动监测仪荣获国家发明专利授权', content: '<p>径流泥沙自动监测仪是我司核心产品，采用光学传感与称重双重测量原理，可实时在线监测径流量、泥沙含量、输沙率等关键参数。该技术突破了传统人工采样的局限，实现了水土流失关键参数的自动化、连续化监测，精度可达毫米级。</p><p>该专利技术已成功应用于全国20余个省份的水土保持监测项目，数据可靠性得到水利部、流域机构及科研院校的广泛认可。</p>', cover_image: null, author: '杨凌三智', published_at: '2024-01-15', status: 1, sort_order: 1, created_at: '', updated_at: '' },
    { id: 502, subcategory_id: 51, title: '全自动风蚀监测系统获实用新型专利', summary: '针对风蚀监测难题，开发集成化自动监测解决方案', content: '<p>全自动风蚀监测系统集成了风速风向传感器、集沙仪、温湿度传感器和数据处理单元，可实时监测风蚀起沙量、输沙率和气象条件。系统采用太阳能供电、4G无线传输，适用于荒漠化地区和风沙区的长期无人值守监测。</p>', cover_image: null, author: '杨凌三智', published_at: '2023-06-20', status: 1, sort_order: 2, created_at: '', updated_at: '' },
    { id: 503, subcategory_id: 51, title: '土壤水分传感器专利技术突破', summary: '高精度土壤水分传感技术，支撑壤中流监测产品研发', content: '<p>我司自主研发的高精度土壤水分传感器采用频域反射法（FDR）原理，测量精度达±2%，响应时间小于1秒。传感器采用防腐防蚀设计，适用于长期埋设监测，为壤中流监测仪和土壤水分动态监测提供了核心技术支撑。</p>', cover_image: null, author: '杨凌三智', published_at: '2022-03-10', status: 1, sort_order: 3, created_at: '', updated_at: '' },
  ],
  52: [
    { id: 504, subcategory_id: 52, title: '径流泥沙自动监测仪入选水利部推广目录', summary: '产品通过水利部科技推广中心评审，正式纳入推广目录', content: '<p>经水利部科技推广中心组织的专家评审，我司径流泥沙自动监测仪凭借优异的技术指标和广泛的工程应用验证，正式入选水利部先进实用技术推广目录。这是对我司产品技术水平和工程实用性的权威认可，也为产品在全国水利系统的推广应用提供了政策支撑。</p>', cover_image: null, author: '杨凌三智', published_at: '2023-09-01', status: 1, sort_order: 1, created_at: '', updated_at: '' },
    { id: 505, subcategory_id: 52, title: '产品通过CMA计量认证', summary: '核心产品通过中国计量认证，数据质量获权威保障', content: '<p>我司核心产品径流泥沙自动监测仪和全自动气象站顺利通过CMA（中国计量认证），标志着产品测量数据具有法律效力，可在环境监测、水利工程验收等法定场景中使用。CMA认证的通过，进一步提升了产品的市场竞争力和客户信任度。</p>', cover_image: null, author: '杨凌三智', published_at: '2024-03-01', status: 1, sort_order: 2, created_at: '', updated_at: '' },
  ],
  53: [
    { id: 506, subcategory_id: 53, title: '与水土保持与荒漠化整治全国重点实验室签署战略合作协议', summary: '深化产学研合作，加速科技成果转化', content: '<p>杨凌三智与水土保持与荒漠化整治全国重点实验室签署战略合作协议，双方将在土壤侵蚀机理研究、监测技术研发、数据处理算法等方向开展深度合作。实验室的原创性基础研究为产品迭代提供技术源头，公司的工程化能力则将科研成果快速转化为可落地的产品与解决方案。</p>', cover_image: null, author: '杨凌三智', published_at: '2024-06-15', status: 1, sort_order: 1, created_at: '', updated_at: '' },
    { id: 507, subcategory_id: 53, title: '联合承担国家重点研发计划项目', summary: '与中科院水保所联合攻关土壤侵蚀监测关键技术', content: '<p>杨凌三智与中国科学院水利部水土保持研究所联合承担国家重点研发计划项目"土壤侵蚀过程智能监测关键技术与装备"，项目聚焦径流泥沙实时在线监测、风蚀过程模拟和土壤水分动态预测三大方向，旨在突破现有监测技术瓶颈，研制新一代智能监测装备。</p>', cover_image: null, author: '杨凌三智', published_at: '2024-09-20', status: 1, sort_order: 2, created_at: '', updated_at: '' },
  ],
};

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // 注入原站CSS
  useEffect(() => {
    injectOriginalCSS();
    return () => removeOriginalCSS();
  }, []);

  // 加载数据
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
        // API返回空数据时使用fallback
        setSubcategories(fallbackSubcategories);
      }

      const targetSubs = subs.length > 0 ? subs : fallbackSubcategories;

      if (articleId) {
        // 典型案例详情 → 从 cases API 加载
        if (subSlug === 'typical-cases') {
          const typicalSub = targetSubs.find(s => s.slug === 'typical-cases');
          if (typicalSub) setActiveSub(typicalSub);
          try {
            const caseRes = await getCase(Number(articleId));
            const c = caseRes.data?.data;
            if (c) {
              setCurrentCase(c);
            } else {
              // API无数据，尝试fallback
              const fbCase = fallbackCasesMap[Number(articleId)];
              if (fbCase) setCurrentCase(fbCase);
            }
          } catch {
            const fbCase = fallbackCasesMap[Number(articleId)];
            if (fbCase) setCurrentCase(fbCase);
          }
        } else {
        // 普通文章详情
        try {
          const artRes = await articleApi.getById(Number(articleId));
          const art = artRes.data?.data;
          if (art) {
            setCurrentArticle(art);
            const found = targetSubs.find(s => s.id === art.subcategory_id);
            if (found) setActiveSub(found);
          } else {
            // API无数据，从fallback查找
            for (const subId of Object.keys(fallbackArticles)) {
              const found = fallbackArticles[Number(subId)]?.find(a => a.id === Number(articleId));
              if (found) {
                setCurrentArticle(found);
                const sub = fallbackSubcategories.find(s => s.id === found.subcategory_id);
                if (sub) setActiveSub(sub);
                break;
              }
            }
          }
        } catch {
          // API失败，从fallback查找
          for (const subId of Object.keys(fallbackArticles)) {
            const found = fallbackArticles[Number(subId)]?.find(a => a.id === Number(articleId));
            if (found) {
              setCurrentArticle(found);
              const sub = fallbackSubcategories.find(s => s.id === found.subcategory_id);
              if (sub) setActiveSub(sub);
              break;
            }
          }
        }
        }
      } else if (subSlug) {
        const found = targetSubs.find(s => s.slug === subSlug);
        if (found) {
          setActiveSub(found);
          // 典型案例从 cases 表加载
          if (found.slug === 'typical-cases') {
            try {
              const caseRes = await getCases({ pageSize: 50 });
              const list = caseRes.data?.data?.list || [];
              setCaseList(list);
            } catch {
              setCaseList([]);
            }
          } else {
            try {
              const artRes = await articleApi.getAll({ subcategory_id: found.id, pageSize: 50 });
              const list = artRes.data?.data?.list || [];
              if (list.length > 0) {
                setArticles(list);
              } else {
                setArticles(fallbackArticles[found.id] || []);
              }
            } catch {
              setArticles(fallbackArticles[found.id] || []);
            }
          }
        } else {
          // subSlug在API数据中没找到，尝试fallback
          const fallbackSub = fallbackSubcategories.find(s => s.slug === subSlug);
          if (fallbackSub) {
            setActiveSub(fallbackSub);
            if (fallbackSub.slug === 'typical-cases') {
              setCaseList([]);
            } else {
              setArticles(fallbackArticles[fallbackSub.id] || []);
            }
          }
        }
      } else if (targetSubs.length > 0) {
        setActiveSub(targetSubs[0]);
        // 默认第一项如果是典型案例也从 cases 表加载
        if (targetSubs[0].slug === 'typical-cases') {
          console.log('[AchievementsPage] loading cases for default tab');
          try {
            const caseRes = await getCases({ pageSize: 50 });
            const list = caseRes.data?.data?.list || [];
            console.log('[AchievementsPage] cases loaded:', list.length);
            setCaseList(list);
          } catch (err) {
            console.error('[AchievementsPage] cases load error:', err);
            setCaseList([]);
          }
        } else {
          try {
            const artRes = await articleApi.getAll({ subcategory_id: targetSubs[0].id, pageSize: 50 });
            const list = artRes.data?.data?.list || [];
            if (list.length > 0) {
              setArticles(list);
            } else {
              setArticles(fallbackArticles[targetSubs[0].id] || []);
            }
          } catch {
            setArticles(fallbackArticles[targetSubs[0].id] || []);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load, using fallback:', err);
      // 完全失败时使用fallback
      setSubcategories(fallbackSubcategories);
      if (fallbackSubcategories.length > 0) {
        setActiveSub(fallbackSubcategories[0]);
        setArticles(fallbackArticles[fallbackSubcategories[0].id] || []);
      }
    }
    setLoading(false);
  }, [subSlug, articleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 搜索提交 → 跳原站搜索
  const handleSearch = (keyword: string) => {
    if (keyword.trim()) {
      window.open(
        `http://irssub.cas.cn/irs-c-web/search.shtml?code=197a4c03632&codes=&configCode=&searchWord=${encodeURIComponent(keyword)}&dataTypeId=4473`,
        '_blank'
      );
    }
  };

  return (
    <div style={{ fontFamily: 'Microsoft YaHei, 微软雅黑, SimSun, Arial, sans-serif' }}>
      {/* 覆盖原站CSS中的相对路径背景图，改为绝对路径 */}
      <style>{`
        .banner { background: #fff url(//skl.iswc.cas.cn/images/header-bg.png) no-repeat center !important; background-size: cover !important; }
        .left-title { background: #BF823E url(//skl.iswc.cas.cn/images/left-bg.png) no-repeat right !important; background-size: cover !important; }
        .left-menu ul li.left-active { background: url(//skl.iswc.cas.cn/images/left-active.png) no-repeat right 21px !important; }
        .search-btn { background: #DFDFDF url(//skl.iswc.cas.cn/images/search-btn.png) no-repeat center !important; }
        .menu-xs { background: url(//skl.iswc.cas.cn/images/menu.png) no-repeat center !important; }
        .drop-ifm { background: #F6F9FF url(//skl.iswc.cas.cn/images/nav-bg.png) no-repeat bottom !important; }
        .drop-title { background: url(//skl.iswc.cas.cn/images/drop-title.png) no-repeat left !important; }
        .title h3 { background: url(//skl.iswc.cas.cn/images/title-icon.png) no-repeat bottom left !important; }
        .chnl-left .left-menu { box-shadow: 0px 0px 6px 1px rgba(93,119,130,0.16) !important; }
        /* 确保导航下拉菜单正常显示 */
        .navigation > li { position: relative; }
        .navigation > li:hover .dropdown-m { display: block; }
        /* 左侧栏菜单hover效果 */
        .left-menu ul li:hover { background: url(//skl.iswc.cas.cn/images/left-active.png) no-repeat right 21px !important; }
        .left-menu ul li:hover a { font-weight: bold; }
      `}</style>

      {/* ====== Header: 顶部logo区 + 绿色导航 ====== */}
      <div className="header">
        <div className="banner">
          <div className="container">
            <a href={ORIG_BASE} className="head-logo" target="_blank" rel="noopener noreferrer">
              <img src="//skl.iswc.cas.cn/images/header-logo.png" alt="实验室Logo" />
            </a>
            <div className="banner-left">
              <div className="head-link">
                <a href="https://www.nwafu.edu.cn/" target="_blank" rel="noopener noreferrer">西北农林科技大学</a>
                <a href={ORIG_BASE} target="_blank" rel="noopener noreferrer">值班安排</a>
              </div>
              <div className="search-box">
                <input
                  type="text"
                  className="search-txt"
                  placeholder="请输入关键字"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch((e.target as HTMLInputElement).value);
                    }
                  }}
                />
                <input
                  type="submit"
                  className="search-btn"
                  value=""
                  onClick={(e) => {
                    e.preventDefault();
                    const input = (e.currentTarget as HTMLElement).previousElementSibling as HTMLInputElement;
                    handleSearch(input?.value || '');
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="head-nav">
          <div className="container">
            <div className="menu-xs hidden-lg hidden-md" onClick={() => setMobileNavOpen(!mobileNavOpen)} style={{ cursor: 'pointer' }} />
            <ul className="navigation hidden-sm hidden-xs">
              {MAIN_NAV.map((nav) => (
                <li key={nav.label}>
                  <a href={nav.href} target="_blank" rel="noopener noreferrer">{nav.label}</a>
                  {nav.children.length > 0 && (
                    <ul className="dropdown-m">
                      {nav.children.map((sub) => (
                        <li key={sub.label}>
                          <a href={sub.href} target="_blank" rel="noopener noreferrer">{sub.label}</a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            {/* 移动端导航 */}
            {mobileNavOpen && (
              <ul className="navigation-xs">
                <li style={{ backgroundColor: '#B3722B' }}>
                  <span className="m_menu_title" style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>导航菜单</span>
                </li>
                {MAIN_NAV.map((nav) => (
                  <li key={nav.label}>
                    <a href={nav.href} target="_blank" rel="noopener noreferrer">{nav.label}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ====== 主体：左侧栏 + 右侧内容 ====== */}
      <div className="container">
        <div className="row2nd">
          {/* 左侧栏 — 使用原站 left-menu 结构 */}
          <div className="chnl-left">
            <div className="left-menu">
              <div className="left-title">
                <h2>成果转化</h2>
              </div>
              <ul>
                {subcategories.map((sub) => (
                  <li
                    key={sub.id}
                    className={activeSub?.id === sub.id ? 'left-active' : ''}
                    onClick={() => navigate(`/achievements/${sub.slug}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <a onClick={(e) => e.preventDefault()}>{sub.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 右侧内容区 */}
          <div className="chnl-right">
            <div className="main-chnl">
              {/* 面包屑 — 使用原站 location 样式 */}
              <div className="location" style={{ marginBottom: '20px' }}>
                <a href={ORIG_BASE} target="_blank" rel="noopener noreferrer">首页</a>
                {' > '}
                <a href={`${ORIG_BASE}/kxyj/`} target="_blank" rel="noopener noreferrer">科学研究</a>
                {' > '}
                <span>{activeSub?.name || '成果转化'}</span>
              </div>

              {/* 主内容标题 */}
              <div className="main-title" style={{ borderBottom: '2px solid #017434', paddingBottom: '10px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', color: '#333', fontWeight: 'bold', margin: 0 }}>
                  {currentArticle ? currentArticle.title : (currentCase ? currentCase.title : (activeSub?.name || '成果转化'))}
                </h2>
              </div>

              {/* 内容区 */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>加载中...</div>
              ) : currentArticle && articleId ? (
                /* 文章详情 — 使用原站 article 样式 */
                <div className="article">
                  <div className="article-ifm">
                    <span className="ifm-left">
                      发布时间：{currentArticle.published_at ? new Date(currentArticle.published_at).toLocaleDateString('zh-CN') : ''}
                    </span>
                  </div>
                  <div
                    className="article-content"
                    style={{
                      fontSize: '18px',
                      lineHeight: '2',
                      color: '#444',
                      wordBreak: 'break-word',
                    }}
                    dangerouslySetInnerHTML={{ __html: currentArticle.content || '' }}
                  />
                </div>
              ) : currentCase && articleId ? (
                /* 案例详情 — 独立模板风格，仿 skl.iswc.cas.cn */
                <div>
                  {/* 返回按钮 + 面包屑 */}
                  <div style={{ marginBottom: '16px' }}>
                    <a
                      onClick={(e) => { e.preventDefault(); navigate('/achievements/typical-cases'); }}
                      style={{ cursor: 'pointer', color: '#017434', fontSize: '14px', textDecoration: 'none' }}
                    >
                      &lt;&lt; 返回典型案例列表
                    </a>
                  </div>

                  {/* 案例概要 */}
                  <div className="article">
                    <div className="article-ifm">
                      <span className="ifm-left">
                        发布时间：{currentCase.created_at ? new Date(currentCase.created_at).toLocaleDateString('zh-CN') : '—'}
                      </span>
                      <span className="ifm-right">
                        {currentCase.location && <span>&nbsp;&nbsp;|&nbsp;&nbsp;地点：{currentCase.location}</span>}
                      </span>
                    </div>

                    {/* 案例概要卡片 */}
                    {currentCase.summary && (
                      <div style={{
                        background: '#fffbf0',
                        border: '1px solid #e8d5a3',
                        borderRadius: '4px',
                        padding: '16px 20px',
                        marginBottom: '20px',
                      }}>
                        <strong style={{ color: '#BF823E', fontSize: '15px' }}>项目概要：</strong>
                        <span style={{ fontSize: '15px', color: '#555', lineHeight: '1.8' }}>
                          {currentCase.summary}
                        </span>
                      </div>
                    )}

                    {/* 案例图片画廊 */}
                    {currentCase.images && currentCase.images.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                        {currentCase.images.map((img, idx) => (
                          <img
                            key={img.id || idx}
                            src={img.image_url}
                            alt={currentCase.title}
                            style={{
                              width: '200px',
                              height: '140px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                              border: '1px solid #e0e0e0',
                            }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ))}
                      </div>
                    ) : null}

                    {/* 详细描述 */}
                    {currentCase.description && (
                      <div
                        className="article-content"
                        style={{
                          fontSize: '16px',
                          lineHeight: '2',
                          color: '#444',
                          wordBreak: 'break-word',
                        }}
                        dangerouslySetInnerHTML={{ __html: currentCase.description }}
                      />
                    )}
                  </div>

                  {/* 底部返回 */}
                  <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed #ddd' }}>
                    <a
                      onClick={(e) => { e.preventDefault(); navigate('/achievements/typical-cases'); }}
                      style={{ cursor: 'pointer', color: '#017434', fontSize: '14px', textDecoration: 'none' }}
                    >
                      &lt;&lt; 返回典型案例列表
                    </a>
                  </div>
                </div>
              ) : activeSub?.slug === 'typical-cases' ? (
                /* 典型案例 — 从 cases 表加载（后台案例管理） */
                <div className="right-txtlist">
                  {caseList.length === 0 ? (
                    <ul className="txtlist">
                      <li style={{ textAlign: 'center', padding: '40px 0', color: '#999', border: 'none' }}>
                        暂无案例，请在后台"案例管理"中添加
                      </li>
                    </ul>
                  ) : (
                    <ul className="txtlist">
                      {caseList.map((c) => (
                        <li
                          key={c.id}
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                            padding: '12px 0',
                            borderBottom: '1px dashed #e0e0e0',
                          }}
                          onClick={() => navigate(`/achievements/typical-cases/${c.id}`)}
                        >
                          {c.cover_image && (
                            <img
                              src={c.cover_image}
                              alt={c.title}
                              style={{
                                width: '120px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                flexShrink: 0,
                              }}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <a style={{ color: '#333', fontWeight: 'bold', fontSize: '15px', textDecoration: 'none' }}>
                              {c.title}
                            </a>
                            {c.location && (
                              <span style={{ fontSize: '12px', color: '#BF823E', marginLeft: '12px' }}>
                                [{c.location}]
                              </span>
                            )}
                            {c.summary && (
                              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#888', lineHeight: '1.6' }}>
                                {c.summary}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                /* 文章列表 — 使用原站 right-txtlist 样式 */
                <div className="right-txtlist">
                  <ul className="txtlist">
                    {articles.length === 0 ? (
                      <li style={{ textAlign: 'center', padding: '60px 0', color: '#999', border: 'none' }}>
                        暂无内容，请登录后台添加文章
                      </li>
                    ) : (
                      articles.map((article) => (
                        <li key={article.id} style={{ cursor: 'pointer' }}>
                          <a onClick={(e) => {
                            e.preventDefault();
                            navigate(`/achievements/${activeSub?.slug}/${article.id}`);
                          }}>
                            {article.title}
                          </a>
                          <span className="txtdate">
                            {article.published_at ? new Date(article.published_at).toLocaleDateString('zh-CN') : ''}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====== Footer: 完全复制原站 ====== */}
      <div className="footer">
        <div className="container">
          <ul className="links">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
              </li>
            ))}
          </ul>
          <p>
            CopyRight2025 水土保持与荒漠化整治全国重点实验室 地址：陕西杨凌西农路26号 邮编：712100，（中国科学院水利部水土保持研究所）
            <br />
            联系电话: +86-029-87012884 传真: +86-029-87016082
          </p>
          <div className="qrcode">
            <img src="//skl.iswc.cas.cn/images/qrcode.png" alt="微信公众号" />
            <h5>微信公众号</h5>
          </div>
        </div>
      </div>
    </div>
  );
}
