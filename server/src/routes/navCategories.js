import { Router } from 'express';
import { body, param } from 'express-validator';
import authMiddleware from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { query } from '../models/database.js';

const router = Router();

// GET /nav-categories - 获取所有一级栏目（公开，支持?lang=en）
router.get('/', async (req, res, next) => {
  try {
    const list = await query(
      'SELECT * FROM nav_categories WHERE status = 1 ORDER BY sort_order ASC, id ASC'
    );
    res.json({ code: 0, data: list, message: 'success' });
  } catch (err) { next(err); }
});

// GET /nav-categories/:id - 获取一级栏目详情
router.get('/:id', [param('id').isInt()], validate, async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM nav_categories WHERE id = ? AND status = 1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ code: 404, data: null, message: '栏目不存在' });
    res.json({ code: 0, data: rows[0], message: 'success' });
  } catch (err) { next(err); }
});

// GET /nav-categories/:id/subcategories - 获取一级栏目下的所有二级栏目
router.get('/:id/subcategories', [param('id').isInt()], validate, async (req, res, next) => {
  try {
    const list = await query(
      'SELECT * FROM nav_subcategories WHERE parent_id = ? AND status = 1 ORDER BY sort_order ASC, id ASC',
      [req.params.id]
    );
    res.json({ code: 0, data: list, message: 'success' });
  } catch (err) { next(err); }
});

// POST /nav-categories - 创建一级栏目（需认证）
router.post('/', authMiddleware, [
  body('name').notEmpty().withMessage('名称不能为空'),
  body('slug').notEmpty().withMessage('slug不能为空'),
], validate, async (req, res, next) => {
  try {
    const { name, name_en, slug, icon, sort_order } = req.body;
    const result = await query(
      'INSERT INTO nav_categories (name, name_en, slug, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
      [name, name_en || null, slug, icon || null, sort_order || 0]
    );
    res.status(201).json({ code: 0, data: { id: result.insertId, name, slug }, message: 'success' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ code: 400, data: null, message: 'slug已存在' });
    next(err);
  }
});

// PUT /nav-categories/:id - 更新一级栏目
router.put('/:id', authMiddleware, [param('id').isInt()], validate, async (req, res, next) => {
  try {
    const { name, name_en, slug, icon, sort_order, status } = req.body;
    const existing = await query('SELECT id FROM nav_categories WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ code: 404, data: null, message: '栏目不存在' });
    const fields = [], values = [];
    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (name_en !== undefined) { fields.push('name_en = ?'); values.push(name_en); }
    if (slug !== undefined) { fields.push('slug = ?'); values.push(slug); }
    if (icon !== undefined) { fields.push('icon = ?'); values.push(icon); }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }
    if (fields.length === 0) return res.status(400).json({ code: 400, data: null, message: '没有需要更新的字段' });
    values.push(req.params.id);
    await query(`UPDATE nav_categories SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ code: 0, data: null, message: '更新成功' });
  } catch (err) { next(err); }
});

// DELETE /nav-categories/:id - 删除一级栏目
router.delete('/:id', authMiddleware, [param('id').isInt()], validate, async (req, res, next) => {
  try {
    const existing = await query('SELECT id FROM nav_categories WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ code: 404, data: null, message: '栏目不存在' });
    await query('DELETE FROM nav_categories WHERE id = ?', [req.params.id]);
    res.json({ code: 0, data: null, message: '删除成功' });
  } catch (err) { next(err); }
});

export default router;
