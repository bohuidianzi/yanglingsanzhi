import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * 锚点导航hook
 * - 监听URL hash变化，平滑滚动到锚点
 * - 提供 navigateToAnchor(id) 方法
 */
export function useHashNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  // 监听hash变化并滚动
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (!hash) return;

    const el = document.getElementById(hash);
    if (el) {
      // 延迟一点确保DOM渲染完成
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [location.hash]);

  // 导航到锚点
  const navigateToAnchor = useCallback(
    (id: string) => {
      // 如果已在首页，直接更新hash
      if (location.pathname === '/') {
        navigate(`#${id}`, { replace: false });
      } else {
        navigate(`/#${id}`);
      }
    },
    [location.pathname, navigate]
  );

  return { navigateToAnchor };
}
