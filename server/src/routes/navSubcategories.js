import { Router } from 'express';
import { body, param, query as queryValidator } from 'express-validator';
import authMiddleware from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { query } from '../models/database.js';

const router = Router();

// GET /nav-subcategories - 获取二级栏目列表（支持?parent_id=过滤）
router.get('/', async (req, res, next) => {
  try {
    const { parent_id } = req.query;
    let sql = 'SELECT * FROM nav_subcategories WHERE status = 1';
    const params = [];
    if (parent_id) { sql += ' AND parent_id = ?'; params.push(parent_id); }
    sql += ' ORDER BY sort_order ASC, id ASC';
    const list = await query(sql, params);
    res.json({ code: 0, data: list, message: 'success' });
  } catch (err) { next(err); }
});

// GET /nav-subcategories/:id - 获取二级栏目详情
router.get('/:id', [param('id').isInt()], validate, async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM nav_subcategories WHERE id = ? AND status = 1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ code: 404, data: null, message: '栏目不存在' });
    res.json({ code: 0, data: rows[0], message: 'success' });
  } catch (err) { next(err); }
});

// POST /nav-subcategories - 创建二级栏目
router.post('/', authMiddleware, [
  body('parent_id').isInt().withMessage('一级栏目ID必须为整数'),
  body('name').notEmpty().withMessage('名称不能为空'),
  body('slug').notEmpty().withMessage('slug不能为空'),
], validate, async (req, res, next) => {
  try {
    const { parent_id, name, name_en, slug, description, description_en, icon, content_type, display_mode, sort_order } = req.body;
    const result = await query(
      'INSERT INTO nav_subcategories (parent_id, name, name_en, slug, description, description_en, icon, content_type, display_mode, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [parent_id, name, name_en || null, slug, description || null, description_en || null, icon || null, content_type || 'article', display_mode || 'single', sort_order || 0]
    );
    res.status(201).json({ code: 0, data: { id: result.insertId, name, slug }, message: 'success' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ code: 400, data: null, message: 'slug已存在' });
    next(err);
  }
});

// PUT /nav-subcategories/:id - 更新二级栏目
router.put('/:id', authMiddleware, [param('id').isInt()], validate, async (req, res, next) => {
  try {
    const { parent_id, name, name_en, slug, description, description_en, icon, content_type, display_mode, sort_order, status } = req.body;
    const existing = await query('SELECT id FROM nav_subcategories WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ code: 404, data: null, message: '栏目不存在' });
    const fields = [], values = [];
    if (parent_id !== undefined) { fields.push('parent_id = ?'); values.push(parent_id); }
    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (name_en !== undefined) { fields.push('name_en = ?'); values.push(name_en); }
    if (slug !== undefined) { fields.push('slug = ?'); values.push(slug); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (description_en !== undefined) { fields.push('description_en = ?'); values.push(description_en); }
    if (icon !== undefined) { fields.push('icon = ?'); values.push(icon); }
    if (content_type !== undefined) { fields.push('content_type = ?'); values.push(content_type); }
    if (display_mode !== undefined) { fields.push('display_mode = ?'); values.push(display_mode); }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }
    if (fields.length === 0) return res.status(400).json({ code: 400, data: null, message: '没有需要更新的字段' });
    values.push(req.params.id);
    await query(`UPDATE nav_subcategories SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ code: 0, data: null, message: '更新成功' });
  } catch (err) { next(err); }
});

// DELETE /nav-subcategories/:id - 删除二级栏目
router.delete('/:id', authMiddleware, [param('id').isInt()], validate, async (req, res, next) => {
  try {
    const existing = await query('SELECT id FROM nav_subcategories WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ code: 404, data: null, message: '栏目不存在' });
    await query('DELETE FROM nav_subcategories WHERE id = ?', [req.params.id]);
    res.json({ code: 0, data: null, message: '删除成功' });
  } catch (err) { next(err); }
});

export default router;
