import { Router } from 'express';
import crypto from 'crypto';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';

const router = Router();

// 百度翻译API配置（从环境变量读取）
const BAIDU_APPID = process.env.BAIDU_TRANSLATE_APPID || '';
const BAIDU_SECRET = process.env.BAIDU_TRANSLATE_SECRET || '';
const BAIDU_API = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

// 简单内存缓存（减少重复翻译请求）
const cache = new Map();
const CACHE_MAX = 2000;

/**
 * POST /api/v1/translate
 * Body: { texts: string[], from: 'zh', to: 'en' }
 * 批量翻译文本
 */
router.post(
  '/',
  [
    body('texts').isArray({ min: 1, max: 50 }).withMessage('texts必须为数组(1-50项)'),
    body('from').optional().isString(),
    body('to').optional().isString(),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!BAIDU_APPID || !BAIDU_SECRET) {
        return res.status(503).json({
          code: 503,
          data: null,
          message: '翻译服务未配置（请设置 BAIDU_TRANSLATE_APPID 和 BAIDU_TRANSLATE_SECRET 环境变量）',
        });
      }

      const { texts, from = 'zh', to = 'en' } = req.body;

      // 检查缓存
      const results = [];
      const uncached = [];
      const uncachedIndices = [];

      for (let i = 0; i < texts.length; i++) {
        const t = texts[i];
        if (!t || !t.trim()) {
          results[i] = t;
          continue;
        }
        const cacheKey = `${from}:${to}:${t}`;
        if (cache.has(cacheKey)) {
          results[i] = cache.get(cacheKey);
        } else {
          uncached.push(t);
          uncachedIndices.push(i);
        }
      }

      if (uncached.length === 0) {
        return res.json({ code: 0, data: results, message: 'success (cached)' });
      }

      // 调用百度翻译API
      const q = uncached.join('\n');
      const salt = Date.now().toString();
      const signStr = BAIDU_APPID + q + salt + BAIDU_SECRET;
      const sign = crypto.createHash('md5').update(signStr).digest('hex');

      const params = new URLSearchParams({
        q,
        from,
        to,
        appid: BAIDU_APPID,
        salt,
        sign,
      });

      const response = await fetch(BAIDU_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const data = await response.json();

      if (data.error_code) {
        console.error('Baidu Translate error:', data);
        return res.status(502).json({
          code: 502,
          data: null,
          message: `翻译服务错误: ${data.error_msg || data.error_code}`,
        });
      }

      // 解析翻译结果
      const translated = data.trans_result || [];
      for (let i = 0; i < translated.length; i++) {
        const idx = uncachedIndices[i];
        const dst = translated[i].dst;
        results[idx] = dst;

        // 写入缓存
        if (cache.size >= CACHE_MAX) {
          // 清理最老的50条
          const keys = Array.from(cache.keys()).slice(0, 50);
          keys.forEach(k => cache.delete(k));
        }
        const cacheKey = `${from}:${to}:${uncached[i]}`;
        cache.set(cacheKey, dst);
      }

      // 确保所有位置都有值
      for (let i = 0; i < texts.length; i++) {
        if (results[i] === undefined) results[i] = texts[i];
      }

      res.json({ code: 0, data: results, message: 'success' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
