import { Router } from 'express';
import { body, param } from 'express-validator';
import { query } from '../models/database.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

// GET /api/v1/hero-slides — 公开获取启用的轮播列表
router.get('/', async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, title, subtitle, description, image_url, fallback_url, link_url, link_text, sort_order FROM hero_slides WHERE status = 1 ORDER BY sort_order ASC'
    );
    res.json({ code: 0, data: rows, message: 'success' });
  } catch (err) {
    console.error('heroSlides GET error:', err);
    res.status(500).json({ code: 500, data: null, message: '服务器内部错误' });
  }
});

// GET /api/v1/hero-slides/all — 后台获取全部（含禁用），需认证
router.get('/all', auth, async (req, res) => {
  try {
    const rows = await query(
      'SELECT * FROM hero_slides ORDER BY sort_order ASC'
    );
    res.json({ code: 0, data: rows, message: 'success' });
  } catch (err) {
    console.error('heroSlides GET /all error:', err);
    res.status(500).json({ code: 500, data: null, message: '服务器内部错误' });
  }
});

// POST /api/v1/hero-slides — 新增
router.post(
  '/',
  auth,
  [
    body('title').notEmpty().withMessage('标题不能为空').isLength({ max: 200 }).withMessage('标题最长200字'),
    body('image_url').notEmpty().withMessage('图片地址不能为空'),
    body('subtitle').optional().isLength({ max: 200 }),
    body('description').optional().isLength({ max: 500 }),
    body('sort_order').optional().isInt({ min: 0 }).withMessage('排序值为非负整数'),
    body('status').optional().isIn([0, 1]).withMessage('状态值无效'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { title, subtitle, description, image_url, fallback_url, link_url, link_text, sort_order, status } = req.body;
      const result = await query(
        'INSERT INTO hero_slides (title, subtitle, description, image_url, fallback_url, link_url, link_text, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [title || '', subtitle || '', description || '', image_url || '', fallback_url || '', link_url || '', link_text || '', sort_order || 0, status !== undefined ? status : 1]
      );
      res.json({ code: 0, data: { id: result.insertId }, message: '创建成功' });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/v1/hero-slides/:id — 更新
router.put(
  '/:id',
  auth,
  [
    param('id').isInt().withMessage('ID必须为整数'),
    body('title').optional().notEmpty().isLength({ max: 200 }),
    body('subtitle').optional().isLength({ max: 200 }),
    body('description').optional().isLength({ max: 500 }),
    body('image_url').optional(),
    body('sort_order').optional().isInt({ min: 0 }),
    body('status').optional().isIn([0, 1]),
  ],
  validate,
  async (req, res, next) => {
    try {
      // 检查记录存在
      const existing = await query('SELECT id FROM hero_slides WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({ code: 404, data: null, message: '轮播不存在' });
      }

      const allowedFields = ['title', 'subtitle', 'description', 'image_url', 'fallback_url', 'link_url', 'link_text', 'sort_order', 'status'];
      const fields = [];
      const values = [];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(req.body[field]);
        }
      }

      if (fields.length === 0) {
        return res.status(400).json({ code: 400, data: null, message: '没有需要更新的字段' });
      }

      values.push(req.params.id);
      await query(`UPDATE hero_slides SET ${fields.join(', ')} WHERE id = ?`, values);
      res.json({ code: 0, data: null, message: '更新成功' });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/v1/hero-slides/:id — 删除
router.delete(
  '/:id',
  auth,
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query('SELECT id FROM hero_slides WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({ code: 404, data: null, message: '轮播不存在' });
      }
      await query('DELETE FROM hero_slides WHERE id = ?', [req.params.id]);
      res.json({ code: 0, data: null, message: '删除成功' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
