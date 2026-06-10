import React, { useState } from 'react';
import {
  Box,
  Typography,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { V2_COLORS } from '../theme/colors';

interface CaseItem {
  id: number;
  title: string;
  location?: string;
  summary?: string;
  is_featured?: number;
}

interface ProvinceListProps {
  cases: CaseItem[];
  onCaseClick?: (id: number) => void;
}

/** 省份分组列表 — 移动端替代地图视图 */
const ProvinceList: React.FC<ProvinceListProps> = ({ cases, onCaseClick }) => {
  // 按省份分组
  const grouped = cases.reduce<Record<string, CaseItem[]>>((acc, c) => {
    const prov = (c as any).province || '其他';
    if (!acc[prov]) acc[prov] = [];
    acc[prov].push(c);
    return acc;
  }, {});

  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (prov: string) => {
    setExpanded((prev) => (prev === prov ? null : prov));
  };

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <Typography
        variant="subtitle1"
        sx={{
          px: 2.5,
          py: 1.5,
          fontWeight: 700,
          color: V2_COLORS.primary.main,
          bgcolor: V2_COLORS.background.default,
        }}
      >
        按省份浏览案例
      </Typography>
      <List disablePadding>
        {Object.entries(grouped).map(([province, items]) => (
          <Box key={province}>
            <ListItemButton
              onClick={() => toggle(province)}
              sx={{
                minHeight: 48,
                borderBottom: `1px solid ${V2_COLORS.divider}`,
                '&:hover': { bgcolor: V2_COLORS.primary[50] },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <LocationOnIcon sx={{ fontSize: 20, color: V2_COLORS.secondary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={province}
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
              />
              <Badge
                badgeContent={items.length}
                sx={{
                  mr: 1,
                  '& .MuiBadge-badge': {
                    bgcolor: V2_COLORS.secondary.main,
                    color: '#fff',
                    fontSize: '0.7rem',
                    minWidth: 20,
                    height: 20,
                  },
                }}
              />
              {expanded === province ? (
                <ExpandLessIcon sx={{ color: V2_COLORS.text.secondary }} />
              ) : (
                <ExpandMoreIcon sx={{ color: V2_COLORS.text.secondary }} />
              )}
            </ListItemButton>
            <Collapse in={expanded === province} timeout="auto">
              <List disablePadding>
                {items.map((item) => (
                  <ListItemButton
                    key={item.id}
                    onClick={() => onCaseClick?.(item.id)}
                    sx={{
                      pl: 5,
                      minHeight: 44,
                      borderBottom: `1px solid ${V2_COLORS.divider}`,
                      '&:hover': { bgcolor: V2_COLORS.background.default },
                    }}
                  >
                    <ListItemText
                      primary={item.title}
                      secondary={item.location}
                      primaryTypographyProps={{ fontSize: '0.9rem', color: V2_COLORS.text.primary }}
                      secondaryTypographyProps={{ fontSize: '0.8rem', color: V2_COLORS.text.secondary }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}
      </List>
    </Box>
  );
};

export default ProvinceList;
