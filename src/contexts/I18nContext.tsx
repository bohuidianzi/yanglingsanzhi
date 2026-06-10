import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';

type Lang = 'zh' | 'en';

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (zh: string, en: string) => string;
  isZh: boolean;
  isEn: boolean;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'zh',
  setLang: () => {},
  t: (_zh: string, _en: string) => _zh,
  isZh: true,
  isEn: false,
});

// ====== 翻译引擎：调用后端百度翻译API ======
const translationCache = new Map<string, string>();
let pendingTexts: string[] = [];
let translateTimer: ReturnType<typeof setTimeout> | null = null;

/** 批量发送文本到后端翻译API */
async function translateBatch(texts: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const uncached = texts.filter(t => {
    if (translationCache.has(t)) {
      result.set(t, translationCache.get(t)!);
      return false;
    }
    return true;
  });

  if (uncached.length === 0) return result;

  try {
    const res = await fetch('/api/v1/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: uncached, from: 'zh', to: 'en' }),
    });

    if (!res.ok) return result;
    const data = await res.json();
    if (data.code === 0 && Array.isArray(data.data)) {
      for (let i = 0; i < uncached.length; i++) {
        const translated = data.data[i] || uncached[i];
        translationCache.set(uncached[i], translated);
        result.set(uncached[i], translated);
      }
    }
  } catch {
    // API 不可用时保持原文
  }

  return result;
}

/** 收集页面中需要翻译的中文文本节点 */
function collectChineseTexts(root: Element): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const text = node.textContent?.trim();
      if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName.toLowerCase();
      if (['script', 'style', 'noscript', 'svg', 'iframe', 'textarea', 'input', 'select'].includes(tag)) return NodeFilter.FILTER_REJECT;
      if (parent.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
      // 跳过纯数字、纯符号
      if (/^[\d\s.,!?;:'"()\-+*/=<>@#$%^&[\]{}|\\~`]+$/.test(text)) return NodeFilter.FILTER_REJECT;
      // 跳过纯英文（已经是英文了）
      if (/^[a-zA-Z0-9\s.,!?;:'"()\-+*/&%@#$]+$/.test(text) && !/[\u4e00-\u9fff]/.test(text)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    nodes.push(node);
  }
  return nodes;
}

/** 翻译页面中所有中文文本节点 */
async function translateDOM(root: Element = document.body): Promise<void> {
  const nodes = collectChineseTexts(root);
  if (nodes.length === 0) return;

  // 去重文本
  const uniqueTexts = [...new Set(nodes.map(n => n.textContent!.trim()))];
  
  // 批量翻译（每批最多50条）
  const BATCH = 50;
  const allTranslated = new Map<string, string>();
  
  for (let i = 0; i < uniqueTexts.length; i += BATCH) {
    const batch = uniqueTexts.slice(i, i + BATCH);
    const results = await translateBatch(batch);
    results.forEach((v, k) => allTranslated.set(k, v));
  }

  // 替换DOM文本
  for (const node of nodes) {
    const original = node.textContent!.trim();
    const translated = allTranslated.get(original);
    if (translated && translated !== original) {
      node.textContent = translated;
    }
  }
}

// ====== MutationObserver: 监听SPA页面切换 ======
let observer: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function startObserving() {
  if (observer) observer.disconnect();
  observer = new MutationObserver(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      await translateDOM(document.body);
    }, 300);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function stopObserving() {
  if (observer) { observer.disconnect(); observer = null; }
  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
}

// ====== I18n Provider ======
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('lang');
    return (saved === 'en' ? 'en' : 'zh') as Lang;
  });
  const translating = useRef(false);

  const setLang = useCallback(async (newLang: Lang) => {
    if (newLang === lang) return;
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.classList.remove('lang-zh', 'lang-en');
    document.documentElement.classList.add(`lang-${newLang}`);

    if (newLang === 'en') {
      if (translating.current) return;
      translating.current = true;
      await translateDOM();
      startObserving();
      translating.current = false;
    } else {
      stopObserving();
      // 切换回中文需要刷新恢复原始文本
      window.location.reload();
    }
  }, [lang]);

  // 初始加载时如果是英文，自动翻译
  useEffect(() => {
    if (lang === 'en' && !translating.current) {
      translating.current = true;
      translateDOM().then(() => {
        startObserving();
        translating.current = false;
      });
    }
    return () => stopObserving();
  }, []);

  const t = (zh: string, enStr: string) => (lang === 'en' && enStr ? enStr : zh);
  const isZh = lang === 'zh';
  const isEn = lang === 'en';

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isZh, isEn }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() { return useContext(I18nContext); }

export function localized<T extends Record<string, unknown>>(obj: T | null, field: string): string {
  if (!obj) return '';
  const lang = localStorage.getItem('lang') === 'en' ? 'en' : 'zh';
  if (lang === 'en') {
    const enField = `${field}_en`;
    const val = obj[enField] as string | null;
    if (val) return val;
  }
  return (obj[field] as string) || '';
}
