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

// 成果转化页面fallback子栏目和文章数据（与数据库yanglingsanzhi同步）
const fallbackSubcategories: NavSubcategory[] = [
  { id: 20, parent_id: 5, name: '合作单位', slug: 'partner-institutions', description: '科研院所及企事业单位合作网络', display_mode: 'list', sort_order: 1, status: 1, created_at: '', updated_at: '' },
  { id: 21, parent_id: 5, name: '总体应用情况', slug: 'overall-application', description: '产品在全国的推广应用概况', display_mode: 'list', sort_order: 2, status: 1, created_at: '', updated_at: '' },
  { id: 22, parent_id: 5, name: '典型案例', slug: 'typical-cases', description: '标杆项目案例展示', display_mode: 'list', sort_order: 3, status: 1, created_at: '', updated_at: '' },
  { id: 23, parent_id: 5, name: '未来发展', slug: 'future-development', description: '智慧水保技术演进路线', display_mode: 'list', sort_order: 4, status: 1, created_at: '', updated_at: '' },
];

const fallbackArticles: Record<number, Article[]> = {
  20: [
    { id: 23, subcategory_id: 20, title: '科研院所合作单位', summary: '与多家科研院所建立长期稳定的合作关系。', content: '<p>公司与西北农林科技大学、中科院水利部水土保持研究所等单位建立了深度合作关系。</p>', cover_image: null, author: '杨凌三智', published_at: '2026-06-04T06:30:22.000Z', status: 1, sort_order: 1, created_at: '', updated_at: '' },
  ],
  21: [
    { id: 24, subcategory_id: 21, title: '全国推广应用情况', summary: '产品已在全国多个省份推广应用，覆盖主要水土流失区。', content: '<p>截至目前，公司产品已在全国20余个省份的水土保持项目中得到广泛应用。</p>', cover_image: null, author: '杨凌三智', published_at: '2026-06-04T06:30:22.000Z', status: 1, sort_order: 1, created_at: '', updated_at: '' },
  ],
  22: [], // 典型案例从cases表加载，fallback见下方fallbackCasesMap
  23: [
    { id: 26, subcategory_id: 23, title: '智慧水保未来发展方向', summary: '人工智能、物联网驱动的新一代水土保持监测体系。', content: '<p>公司正积极推进AI+水保战略，将深度学习、边缘计算等前沿技术融入监测设备，打造智慧水保新生态。</p>', cover_image: null, author: '杨凌三智', published_at: '2026-06-04T06:30:22.000Z', status: 1, sort_order: 1, created_at: '', updated_at: '' },
  ],
};

export default function AchievementsLabPage() {
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
