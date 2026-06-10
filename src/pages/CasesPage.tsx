import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Badge,
  MenuItem,
  Select,
  FormControl,
  Switch,
  FormControlLabel,
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PageBanner from '../components/PageBanner';
import SectionTitle from '../components/SectionTitle';
import SectionDecorator from '../components/SectionDecorator';
import AnimatedCard from '../components/AnimatedCard';
import LazyImage from '../components/LazyImage';
import ProvinceList from '../components/ProvinceList';
import { getCases } from '../api/cases';
import type { Case } from '../types/api';
import { V2_COLORS } from '../theme/colors';
import { MOTION } from '../theme/motion';

const fallbackCases: Case[] = [
  { id: 1, title: '黄土高原水土保持监测站', slug: 'loess-plateau', summary: '在黄土高原典型侵蚀区建设的综合监测站，涵盖径流、泥沙、气象等多参数实时监测', description: '本项目在陕西延安黄土高原典型侵蚀区建设综合监测站，部署模块化径流小区、径流泥沙自动监测仪、全自动气象站等设备，实现径流量、泥沙含量、降雨量、土壤含水率等12项参数的24小时实时在线监测。数据通过4G网络实时上传云平台，为黄土高原水土流失治理提供科学依据。', cover_image: null, location: '陕西延安', province: '陕西', is_featured: 1, status: 1, sort_order: 1, created_at: '', updated_at: '' },
  { id: 2, title: '黄河流域风蚀监测项目', slug: 'yellow-river-wind', summary: '在黄河沿岸风沙区部署全自动风蚀监测系统，为流域治理提供数据支撑', description: '在内蒙古鄂尔多斯黄河沿岸风沙区部署8套全自动风蚀监测系统，监测风蚀起沙量、输沙率、风速风向等参数，结合气象数据建立风蚀预报模型，为黄河流域风沙治理和生态修复工程提供精准数据支撑和决策依据。', cover_image: null, location: '内蒙古鄂尔多斯', province: '内蒙古', is_featured: 1, status: 1, sort_order: 2, created_at: '', updated_at: '' },
  { id: 3, title: '南方红壤区径流监测', slug: 'red-soil-runoff', summary: '针对南方红壤区特有侵蚀类型，定制径流监测方案', description: '针对南方红壤区降雨强度大、土壤侵蚀类型特殊的特点，定制部署径流小区和自动监测设备，重点监测红壤坡面侵蚀过程、沟蚀发育规律，为南方红壤区水土保持方案编制和治理措施优化提供基础数据。', cover_image: null, location: '江西赣州', province: '江西', is_featured: 0, status: 1, sort_order: 3, created_at: '', updated_at: '' },
  { id: 4, title: '东北黑土区保护性耕作监测', slug: 'black-soil-monitor', summary: '在东北黑土区开展保护性耕作效果监测，数据支撑政策制定', description: '在黑龙江哈尔滨黑土区建设保护性耕作效果监测站，对比传统耕作与保护性耕作条件下的土壤侵蚀量、有机质变化和产量差异。监测数据直接服务于东北黑土地保护政策制定，是国家黑土地保护工程的重要数据来源。', cover_image: null, location: '黑龙江哈尔滨', province: '黑龙江', is_featured: 1, status: 1, sort_order: 4, created_at: '', updated_at: '' },
  { id: 5, title: '西北盐碱地监测治理项目', slug: 'saline-northwest', summary: '在西北干旱区开展盐碱地监测治理，探索生态修复路径', description: '在新疆昌吉州部署盐碱地监测治理集成设备，实时监测土壤电导率、pH值和含水率，根据监测数据自动控制淋洗灌溉，实现盐碱地改良的精准化管理。项目实施后土壤盐分平均降低35%，耕地质量显著提升。', cover_image: null, location: '新疆昌吉', province: '新疆', is_featured: 0, status: 1, sort_order: 5, created_at: '', updated_at: '' },
  { id: 6, title: '三峡库区水土流失监测', slug: 'three-gorges', summary: '为三峡库区提供水土流失实时监测和预警服务', description: '在三峡库区重点消落带和入库支流区域部署水土流失监测网络，实时监测坡面侵蚀、泥沙输移和水位变化，建立库区水土流失预警模型，为三峡工程安全运行和库区生态保护提供数据保障。', cover_image: null, location: '湖北宜昌', province: '湖北', is_featured: 1, status: 1, sort_order: 6, created_at: '', updated_at: '' },
  { id: 7, title: '青海三江源生态监测', slug: 'sanjiangyuan', summary: '在三江源国家级自然保护区建设生态气象监测网络', description: '在三江源国家级自然保护区核心区建设5个生态气象监测站，监测温度、湿度、风速、辐射、降水和土壤水分等参数，为三江源生态保护和退化草地恢复研究提供长期连续的气象和土壤数据。', cover_image: null, location: '青海玉树', province: '青海', is_featured: 0, status: 1, sort_order: 7, created_at: '', updated_at: '' },
  { id: 8, title: '甘肃定西小流域治理监测', slug: 'dingxi-watershed', summary: '在小流域治理项目中部署监测设备，评估治理效果', description: '在甘肃定西典型小流域综合治理项目中，布设径流小区和沟道监测断面，对比治理前后的产流产沙变化，量化梯田、淤地坝、林草等措施的减沙效益，为小流域治理效果评估提供科学依据。', cover_image: null, location: '甘肃定西', province: '甘肃', is_featured: 0, status: 1, sort_order: 8, created_at: '', updated_at: '' },
  { id: 9, title: '云南石漠化监测项目', slug: 'yunnan-rocky', summary: '在云南石漠化区域开展水土流失动态监测', description: '在云南曲靖石漠化区域部署径流监测和生态气象设备，监测石漠化地区特殊的水土流失过程和植被恢复效果，探索石漠化地区水土保持综合治理模式，为西南石漠化治理提供可复制的经验。', cover_image: null, location: '云南曲靖', province: '云南', is_featured: 0, status: 1, sort_order: 9, created_at: '', updated_at: '' },
];

const provinces = ['全部', '陕西', '内蒙古', '江西', '黑龙江', '新疆', '湖北', '青海', '甘肃', '云南', '山西', '四川'];

const provincePositions: Record<string, { left: string; top: string }> = {
  '陕西': { left: '38%', top: '38%' },
  '内蒙古': { left: '48%', top: '18%' },
  '江西': { left: '62%', top: '55%' },
  '黑龙江': { left: '72%', top: '12%' },
  '新疆': { left: '18%', top: '22%' },
  '湖北': { left: '55%', top: '48%' },
  '青海': { left: '30%', top: '38%' },
  '甘肃': { left: '32%', top: '28%' },
  '云南': { left: '40%', top: '68%' },
  '山西': { left: '48%', top: '32%' },
  '四川': { left: '35%', top: '55%' },
};

// ═══════ 全球服务辐射地图 SVG 组件 ═══════
function GlobalServiceMap({ activeProvinces }: { activeProvinces: string[] }) {
  const cx = 530;  // 西安在地图上的x坐标（等距圆柱投影）
  const cy = 155;  // 西安在地图上的y坐标

  // 国内省份 — 基于等距圆柱投影坐标
  const domestic = [
    { name: '陕西', x: 530, y: 155 },
    { name: '内蒙古', x: 545, y: 125 },
    { name: '黑龙江', x: 590, y: 108 },
    { name: '新疆', x: 490, y: 130 },
    { name: '甘肃', x: 510, y: 140 },
    { name: '青海', x: 500, y: 155 },
    { name: '四川', x: 515, y: 175 },
    { name: '云南', x: 505, y: 195 },
    { name: '湖北', x: 545, y: 172 },
    { name: '江西', x: 565, y: 182 },
    { name: '山西', x: 535, y: 145 },
  ];

  // 海外区域 — 带区域标签位置
  const international = [
    { name: '中亚', x: 470, y: 120, label: '中亚地区', desc: '哈萨克斯坦·乌兹别克斯坦' },
    { name: '欧洲', x: 380, y: 95, label: '欧洲地区', desc: '荷兰·德国·瑞士' },
    { name: '东非', x: 420, y: 245, label: '东非地区', desc: '肯尼亚·埃塞俄比亚' },
    { name: '东南亚', x: 600, y: 205, label: '东南亚地区', desc: '泰国·越南·印尼' },
    { name: '南亚', x: 555, y: 195, label: '南亚地区', desc: '印度·巴基斯坦' },
    { name: '澳洲', x: 640, y: 310, label: '澳洲地区', desc: '澳大利亚·新西兰' },
    { name: '北美', x: 155, y: 130, label: '北美地区', desc: '美国·加拿大' },
    { name: '南美', x: 220, y: 285, label: '南美地区', desc: '巴西·智利' },
  ];

  return (
    <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', bgcolor: '#071222', boxShadow: '0 20px 60px rgba(15,43,71,0.25)' }}>
      <svg viewBox="0 0 900 460" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(58,143,92,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(212,134,42,0.5)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4862A" stopOpacity="0.8"/>
            <stop offset="50%" stopColor="#D4862A" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#D4862A" stopOpacity="0.8"/>
          </linearGradient>
        </defs>

        {/* 深色背景 */}
        <rect width="900" height="460" fill="#071222" />

        {/* ═══ 世界地图轮廓 — 更精细的大陆形状 ═══ */}
        {/* 北美洲 */}
        <path d="M60,42 L105,30 L140,28 L180,35 L210,48 L230,70 L240,90 L235,110 L220,130 L200,148 L175,158 L150,162 L130,155 L110,145 L85,125 L65,100 L55,75 Z" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
        {/* 中美洲+加勒比 */}
        <path d="M130,162 L155,165 L170,175 L180,195 L175,210 L160,218 L145,215 L135,200 L125,180 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
        {/* 南美洲 */}
        <path d="M170,225 L205,218 L230,230 L248,260 L255,295 L245,330 L225,355 L200,365 L180,350 L165,320 L155,285 L158,255 Z" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
        {/* 欧洲 */}
        <path d="M340,48 L370,38 L405,35 L430,42 L445,55 L448,72 L440,90 L425,100 L400,108 L378,105 L358,95 L345,78 L338,60 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"/>
        {/* 非洲 */}
        <path d="M378,125 L410,118 L440,125 L460,145 L468,175 L465,215 L455,255 L438,285 L415,300 L392,295 L375,270 L365,235 L360,195 L362,160 Z" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
        {/* 亚洲 — 大块 */}
        <path d="M445,30 L490,22 L540,18 L590,22 L635,32 L670,50 L690,78 L695,110 L685,142 L665,170 L635,192 L600,205 L565,210 L530,205 L500,195 L475,178 L455,155 L445,128 L440,95 L442,60 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"/>
        {/* 中国区域高亮 */}
        <path d="M488,108 L520,100 L555,105 L575,118 L578,140 L570,162 L555,178 L530,185 L508,178 L492,162 L485,140 Z" fill="rgba(58,143,92,0.08)" stroke="rgba(58,143,92,0.15)" strokeWidth="0.8"/>
        {/* 东南亚半岛+群岛 */}
        <path d="M575,195 L600,190 L620,200 L630,218 L625,238 L610,248 L590,242 L578,225 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
        <ellipse cx="650" cy="235" rx="25" ry="12" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
        <ellipse cx="670" cy="255" rx="20" ry="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
        {/* 澳大利亚 */}
        <path d="M618,305 L660,295 L695,300 L715,318 L710,342 L690,355 L655,358 L628,345 L615,325 Z" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
        {/* 日本 */}
        <ellipse cx="640" cy="118" rx="6" ry="18" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" transform="rotate(-20,640,118)"/>
        {/* 英国 */}
        <ellipse cx="355" cy="60" rx="5" ry="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>

        {/* ═══ 经纬线网格 ═══ */}
        {[70, 140, 210, 280, 350, 420].map(y => (
          <line key={`h${y}`} x1="30" y1={y} x2="870" y2={y} stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" strokeDasharray="2,6" />
        ))}
        {[150, 300, 450, 600, 750].map(x => (
          <line key={`v${x}`} x1={x} y1="25" x2={x} y2="430" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" strokeDasharray="2,6" />
        ))}

        {/* ═══ 区域标签 — 大陆/区域名称 ═══ */}
        <text x="155" y="88" fill="rgba(255,255,255,0.12)" fontSize="10" textAnchor="middle" style={{ fontFamily: 'system-ui', letterSpacing: '2px' }}>北美洲</text>
        <text x="200" y="300" fill="rgba(255,255,255,0.12)" fontSize="10" textAnchor="middle" style={{ fontFamily: 'system-ui', letterSpacing: '2px' }}>南美洲</text>
        <text x="395" y="72" fill="rgba(255,255,255,0.12)" fontSize="10" textAnchor="middle" style={{ fontFamily: 'system-ui', letterSpacing: '2px' }}>欧洲</text>
        <text x="415" y="215" fill="rgba(255,255,255,0.12)" fontSize="10" textAnchor="middle" style={{ fontFamily: 'system-ui', letterSpacing: '2px' }}>非洲</text>
        <text x="580" y="55" fill="rgba(255,255,255,0.12)" fontSize="10" textAnchor="middle" style={{ fontFamily: 'system-ui', letterSpacing: '2px' }}>亚洲</text>
        <text x="665" y="332" fill="rgba(255,255,255,0.12)" fontSize="10" textAnchor="middle" style={{ fontFamily: 'system-ui', letterSpacing: '2px' }}>大洋洲</text>

        {/* ═══ 国内连线 — 青色动态虚线 ═══ */}
        {domestic.map(p => {
          const isActive = activeProvinces.includes(p.name);
          return (
            <g key={p.name}>
              <line
                x1={cx} y1={cy} x2={p.x} y2={p.y}
                stroke={isActive ? '#3A8F5C' : 'rgba(58,143,92,0.2)'}
                strokeWidth={isActive ? '1.5' : '0.8'}
                strokeDasharray="3,5"
                opacity={isActive ? '0.65' : '0.3'}
              >
                <animate attributeName="stroke-dashoffset" values="0;16" dur="2s" repeatCount="indefinite" />
              </line>
              <circle cx={p.x} cy={p.y} r={isActive ? '4.5' : '3'} fill={isActive ? '#3A8F5C' : 'rgba(58,143,92,0.45)'} filter={isActive ? 'url(#glow)' : undefined}>
                {isActive && <animate attributeName="r" values="4.5;6.5;4.5" dur="2s" repeatCount="indefinite" />}
              </circle>
              {/* 脉冲圈 */}
              <circle cx={p.x} cy={p.y} r="6" fill="none" stroke="#3A8F5C" strokeWidth="0.8" opacity={isActive ? '0.35' : '0.1'}>
                <animate attributeName="r" values="4;11;4" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
              </circle>
              {/* 省名标签 */}
              <text x={p.x} y={p.y - 8} fill={isActive ? 'rgba(58,143,92,0.9)' : 'rgba(255,255,255,0.25)'} fontSize="8" textAnchor="middle" style={{ fontFamily: 'system-ui' }}>{p.name}</text>
            </g>
          );
        })}

        {/* ═══ 国际连线 — 橙色曲线辐射 ═══ */}
        {international.map((p, i) => {
          // 用二次贝塞尔曲线，让连线有弧度
          const midX = (cx + p.x) / 2;
          const midY = (cy + p.y) / 2 - 20 - Math.abs(cx - p.x) * 0.05;
          const pathD = `M${cx},${cy} Q${midX},${midY} ${p.x},${p.y}`;
          return (
            <g key={p.name}>
              {/* 曲线路径 */}
              <path d={pathD} fill="none" stroke="#D4862A" strokeWidth="1" strokeDasharray="4,4" opacity="0.35">
                <animate attributeName="stroke-dashoffset" values="0;16" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
              </path>
              {/* 飞行光点 */}
              <circle r="2" fill="#D4862A" opacity="0.8" filter="url(#glow)">
                <animateMotion dur={`${3 + i * 0.5}s`} repeatCount="indefinite" path={pathD} />
              </circle>
              {/* 端点圆 */}
              <circle cx={p.x} cy={p.y} r="4.5" fill="#D4862A" filter="url(#glow)" />
              <circle cx={p.x} cy={p.y} r="9" fill="none" stroke="#D4862A" strokeWidth="0.8" opacity="0.25">
                <animate attributeName="r" values="5;12;5" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
              </circle>
              {/* 区域名称标签 */}
              <text x={p.x} y={p.y - 12} fill="#D4862A" fontSize="9" fontWeight="bold" textAnchor="middle" style={{ fontFamily: 'system-ui' }}>{p.label}</text>
              {/* 区域详情 */}
              <text x={p.x} y={p.y + 18} fill="rgba(212,134,42,0.5)" fontSize="7" textAnchor="middle" style={{ fontFamily: 'system-ui' }}>{p.desc}</text>
            </g>
          );
        })}

        {/* ═══ 西安中心 — 多层脉冲辐射 ═══ */}
        {/* 外层大脉冲 */}
        <circle cx={cx} cy={cy} r="30" fill="url(#centerGlow)">
          <animate attributeName="r" values="18;45;18" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0.1;0.7" dur="3s" repeatCount="indefinite" />
        </circle>
        {/* 中层脉冲 */}
        <circle cx={cx} cy={cy} r="18" fill="none" stroke="#D4862A" strokeWidth="1.5" opacity="0.4">
          <animate attributeName="r" values="12;28;12" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2.2s" repeatCount="indefinite" />
        </circle>
        {/* 核心点 */}
        <circle cx={cx} cy={cy} r="7" fill="#D4862A" filter="url(#softGlow)" />
        <circle cx={cx} cy={cy} r="4" fill="#FFB74D" />

        {/* 西安标签 */}
        <text x={cx} y={cy + 22} fill="#FFB74D" fontSize="11" fontWeight="bold" textAnchor="middle" style={{ fontFamily: 'system-ui', textShadow: '0 0 8px rgba(212,134,42,0.6)' }}>西安总部</text>

        {/* ═══ 右上角标语 ═══ */}
        <text x="870" y="32" fill="rgba(212,134,42,0.6)" fontSize="11" textAnchor="end" style={{ fontFamily: 'system-ui', letterSpacing: '3px' }}>从西安 · 走向世界</text>

        {/* ═══ 左下角图例 ═══ */}
        <g transform="translate(40, 435)">
          <circle cx="0" cy="0" r="3.5" fill="#3A8F5C" />
          <text x="10" y="3.5" fill="rgba(255,255,255,0.45)" fontSize="9.5" style={{ fontFamily: 'system-ui' }}>国内部署（20+省份）</text>
          <circle cx="145" cy="0" r="3.5" fill="#D4862A" />
          <text x="155" y="3.5" fill="rgba(255,255,255,0.45)" fontSize="9.5" style={{ fontFamily: 'system-ui' }}>海外辐射（7大区域）</text>
          <circle cx="285" cy="0" r="3.5" fill="#FFB74D" />
          <circle cx="285" cy="0" r="7" fill="none" stroke="#D4862A" strokeWidth="0.8" opacity="0.5" />
          <text x="298" y="3.5" fill="rgba(255,255,255,0.45)" fontSize="9.5" style={{ fontFamily: 'system-ui' }}>总部辐射中心</text>
          {/* 飞行点图例 */}
          <circle cx="415" cy="0" r="2" fill="#D4862A" opacity="0.8" />
          <text x="422" y="3.5" fill="rgba(255,255,255,0.45)" fontSize="9.5" style={{ fontFamily: 'system-ui' }}>技术输出</text>
        </g>
      </svg>
    </Box>
  );
}

const fadeUp = MOTION.FADE_UP;

export default function CasesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>(fallbackCases);
  const [province, setProvince] = useState('全部');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (province !== '全部') params.province = province;
    if (featuredOnly) params.is_featured = 1;

    getCases(params)
      .then((res) => {
        if (res.data?.data?.list?.length) {
          setCases(res.data.data.list);
        } else {
          let filtered = fallbackCases;
          if (province !== '全部') filtered = filtered.filter((c) => c.province === province);
          if (featuredOnly) filtered = filtered.filter((c) => c.is_featured === 1);
          setCases(filtered);
        }
      })
      .catch(() => {
        let filtered = fallbackCases;
        if (province !== '全部') filtered = filtered.filter((c) => c.province === province);
        if (featuredOnly) filtered = filtered.filter((c) => c.is_featured === 1);
        setCases(filtered);
      })
      .finally(() => setLoading(false));
  }, [province, featuredOnly]);

  const activeProvinces = [...new Set(cases.map((c) => c.province).filter(Boolean))];

  return (
    <Box>
      {/* Banner - 生态监测+河流主题背景 */}
      <PageBanner
        title="应用案例"
        subtitle="覆盖全国20+省份，服务水土保持一线"
        backgroundImage="/images/banners/cases.jpg"
        fallbackImage="https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&q=80"
      />

      {/* ═══════ 全球服务版图 — 西安辐射全球 ═══════ */}
      <Box id="service-map" sx={{ py: { xs: 6, md: 10 }, bgcolor: '#F8FAFC', position: 'relative' }}>
        <SectionDecorator variant="gradient" opacity={0.03} position="bottom" />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={5}>
              <SectionTitle title="服务版图" subtitle="GLOBAL SERVICE NETWORK" align="left" />
              <motion.div {...fadeUp}>
                <Typography variant="body1" sx={{ color: V2_COLORS.text.secondary, lineHeight: 2, mb: 2 }}>
                  杨凌三智以西安为总部，监测设备与解决方案覆盖全国20余个省份，
                  并辐射东南亚、中亚、东非等国际市场，为全球水土保持事业提供中国方案。
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
                  {['国内20+省', '东南亚', '中亚', '东非', '澳洲'].map((tag) => (
                    <Box
                      key={tag}
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: '20px',
                        bgcolor: V2_COLORS.primary[50],
                        color: V2_COLORS.primary.main,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: V2_COLORS.primary.main, lineHeight: 1 }}>20+</Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: V2_COLORS.text.secondary, mt: 0.5 }}>覆盖省份</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: V2_COLORS.accent.main, lineHeight: 1 }}>7</Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: V2_COLORS.text.secondary, mt: 0.5 }}>海外地区</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: V2_COLORS.secondary.main, lineHeight: 1 }}>100+</Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: V2_COLORS.text.secondary, mt: 0.5 }}>监测站点</Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={7}>
              {isMobile ? (
                <Box sx={{ mt: 2 }}>
                  <ProvinceList
                    cases={cases.map(c => ({
                      ...c,
                      location: c.location ?? undefined,
                      summary: c.summary ?? undefined,
                    }))}
                    onCaseClick={(id) => navigate(`/cases/${id}`)}
                  />
                </Box>
              ) : (
                <GlobalServiceMap activeProvinces={activeProvinces} />
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 筛选 + 案例卡片 */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: V2_COLORS.background.default, position: 'relative' }}>
        <SectionDecorator variant="dots" opacity={0.03} position="full" />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* 筛选栏 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                sx={{ bgcolor: '#fff', borderRadius: 1 }}
              >
                {provinces.map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  color="warning"
                />
              }
              label="仅看标杆案例"
              sx={{ color: V2_COLORS.text.secondary }}
            />
          </Box>

          {/* 案例卡片 */}
          {loading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card elevation={2}>
                    <Skeleton variant="rectangular" height={180} />
                    <CardContent>
                      <Skeleton />
                      <Skeleton width="60%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {cases.map((c, idx) => (
                <Grid item xs={12} sm={6} md={4} key={c.id}>
                  <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: idx * 0.08 }}>
                    <AnimatedCard
                      elevation={2}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                      }}
                    >
                      {c.is_featured === 1 && (
                        <Badge
                          badgeContent="标杆"
                          color="warning"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            zIndex: 1,
                            '& .MuiBadge-badge': { fontWeight: 600, fontSize: '0.75rem' },
                          }}
                        />
                      )}
                      {c.cover_image ? (
                        <LazyImage
                          src={c.cover_image}
                          alt={c.title}
                          height={180}
                          objectFit="cover"
                          sx={{ borderRadius: '12px 12px 0 0' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 180,
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: '12px 12px 0 0',
                          }}
                        >
                          <Box
                            component="img"
                            src="https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600&q=80"
                            alt={c.title}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              filter: 'brightness(0.5)',
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
                            <LocationOnIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.5)' }} />
                          </Box>
                        </Box>
                      )}
                      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: V2_COLORS.primary.main, mb: 1 }}>
                          {c.title}
                        </Typography>
                        {c.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <LocationOnIcon sx={{ fontSize: 16, color: V2_COLORS.secondary.main }} />
                            <Typography variant="body2" sx={{ color: V2_COLORS.secondary.main }}>{c.location}</Typography>
                          </Box>
                        )}
                        <Typography variant="body2" sx={{ color: V2_COLORS.text.secondary, flex: 1, lineHeight: 1.8, mb: 2 }}>
                          {c.summary}
                        </Typography>
                        <Box
                          component={Link}
                          to={`/cases/${c.id}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: V2_COLORS.secondary.main,
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          查看详情 <ArrowForwardIcon sx={{ fontSize: 16 }} />
                        </Box>
                      </CardContent>
                    </AnimatedCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}

          {!loading && cases.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography sx={{ color: '#999' }}>暂无符合条件的案例</Typography>
            </Box>
          )}
        </Container>
      </Box>

      {/* 底部号召 - 配流域/生态主题背景 */}
      <Box sx={{ py: { xs: 8, md: 12 }, position: 'relative', overflow: 'hidden' }}>
        <Box
          component="img"
          src="/images/cases/river.jpg"
          alt="流域监测"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (!img.src.includes('unsplash')) {
              img.src = 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1920&q=80';
            }
          }}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.3)',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, rgba(15,43,71,0.85) 0%, rgba(30,77,115,0.8) 100%)`,
            zIndex: 1,
          }}
        />
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <motion.div {...fadeUp}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 2 }}>
              您的项目，我们的使命
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 2, mb: 3 }}>
              无论您身处哪个省份，无论面对水蚀、风蚀还是盐碱地，我们都有成熟的监测方案和成功经验，为您提供精准可靠的数据支撑。
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { num: '20+', label: '覆盖省份' },
                { num: '100+', label: '监测站点' },
                { num: '99.5%', label: '数据准确率' },
              ].map((item) => (
                <Box key={item.label} sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: V2_COLORS.secondary.main, fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                    {item.num}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
