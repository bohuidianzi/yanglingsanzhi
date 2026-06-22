import { Router } from 'express';
import { body, param } from 'express-validator';
import authMiddleware from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { query } from '../models/database.js';

const router = Router();

// GET /categories - 获取所有分类（公开）
router.get('/', async (req, res, next) => {
  try {
    const list = await query(
      'SELECT * FROM categories WHERE status = 1 ORDER BY sort_order ASC, id ASC'
    );

    res.json({
      code: 0,
      data: list,
      message: 'success',
    });
  } catch (err) {
    next(err);
  }
});

// GET /categories/:id - 获取分类详情（公开）
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const rows = await query('SELECT * FROM categories WHERE id = ? AND status = 1', [req.params.id]);

      if (rows.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '分类不存在',
        });
      }

      res.json({
        code: 0,
        data: rows[0],
        message: 'success',
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /categories - 创建分类（需认证）
router.post(
  '/',
  authMiddleware,
  [
    body('name').notEmpty().withMessage('分类名称不能为空'),
    body('slug').notEmpty().withMessage('slug不能为空'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, slug, description, icon, cover_image, sort_order } = req.body;

      const result = await query(
        'INSERT INTO categories (name, slug, description, icon, cover_image, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [name, slug, description || null, icon || null, cover_image || null, sort_order || 0]
      );

      res.status(201).json({
        code: 0,
        data: { id: result.insertId, name, slug },
        message: 'success',
      });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          code: 400,
          data: null,
          message: 'slug已存在',
        });
      }
      next(err);
    }
  }
);

// PUT /categories/:id - 更新分类（需认证）
router.put(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const { name, slug, description, icon, cover_image, sort_order, status } = req.body;

      const existing = await query('SELECT id FROM categories WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '分类不存在',
        });
      }

      const fields = [];
      const values = [];

      if (name !== undefined) { fields.push('name = ?'); values.push(name); }
      if (slug !== undefined) { fields.push('slug = ?'); values.push(slug); }
      if (description !== undefined) { fields.push('description = ?'); values.push(description); }
      if (icon !== undefined) { fields.push('icon = ?'); values.push(icon); }
      if (cover_image !== undefined) { fields.push('cover_image = ?'); values.push(cover_image); }
      if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }
      if (status !== undefined) { fields.push('status = ?'); values.push(status); }

      if (fields.length === 0) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '没有需要更新的字段',
        });
      }

      values.push(req.params.id);
      await query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values);

      res.json({
        code: 0,
        data: null,
        message: '更新成功',
      });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          code: 400,
          data: null,
          message: 'slug已存在',
        });
      }
      next(err);
    }
  }
);

// DELETE /categories/:id - 删除分类（需认证）
router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query('SELECT id FROM categories WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '分类不存在',
        });
      }

      // 检查是否有产品使用此分类
      const products = await query('SELECT id FROM products WHERE category_id = ?', [req.params.id]);
      if (products.length > 0) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '该分类下还有产品，无法删除',
        });
      }

      await query('DELETE FROM categories WHERE id = ?', [req.params.id]);

      res.json({
        code: 0,
        data: null,
        message: '删除成功',
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
