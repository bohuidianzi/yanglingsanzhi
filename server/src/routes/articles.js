import { Router } from 'express';
import { body, param, query as queryValidator } from 'express-validator';
import authMiddleware from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { query } from '../models/database.js';

const router = Router();

// GET /articles - 获取文章列表（支持?subcategory_id=&lang=分页）
router.get('/', async (req, res, next) => {
  try {
    const { subcategory_id, page = 1, pageSize = 20, is_featured } = req.query;
    let sql = 'SELECT * FROM articles WHERE status = 1';
    const params = [];
    if (subcategory_id) {
      // 支持逗号分隔的多个ID（如 "11,12,13"）
      const ids = String(subcategory_id).split(',').map(Number).filter(Boolean);
      if (ids.length === 1) {
        sql += ' AND subcategory_id = ?'; params.push(ids[0]);
      } else if (ids.length > 1) {
        sql += ` AND subcategory_id IN (${ids.map(() => '?').join(',')})`;
        params.push(...ids);
      }
    }
    if (is_featured !== undefined) { sql += ' AND is_featured = ?'; params.push(is_featured); }
    // count
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [{ total }] = await query(countSql, params);
    // pagination
    const offset = (Number(page) - 1) * Number(pageSize);
    sql += ' ORDER BY sort_order ASC, published_at DESC, id DESC LIMIT ? OFFSET ?';
    params.push(Number(pageSize), offset);
    const list = await query(sql, params);
    res.json({
      code: 0,
      data: { list, total, page: Number(page), pageSize: Number(pageSize) },
      message: 'success',
    });
  } catch (err) { next(err); }
});

// GET /articles/:id - 获取文章详情
router.get('/:id', [param('id').isInt()], validate, async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM articles WHERE id = ? AND status = 1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ code: 404, data: null, message: '文章不存在' });
    // 获取图片
    const images = await query('SELECT * FROM article_images WHERE article_id = ? ORDER BY sort_order ASC', [req.params.id]);
    res.json({ code: 0, data: { ...rows[0], images }, message: 'success' });
  } catch (err) { next(err); }
});

// POST /articles - 创建文章
router.post('/', authMiddleware, [
  body('subcategory_id').isInt().withMessage('二级栏目ID必须为整数'),
  body('title').notEmpty().withMessage('标题不能为空'),
], validate, async (req, res, next) => {
  try {
    const { subcategory_id, title, title_en, summary, summary_en, content, content_en,
      cover_image, author, source, is_featured, sort_order, published_at } = req.body;
    const result = await query(
      `INSERT INTO articles (subcategory_id, title, title_en, summary, summary_en, content, content_en,
        cover_image, author, source, is_featured, sort_order, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [subcategory_id, title, title_en || null, summary || null, summary_en || null,
        content || null, content_en || null, cover_image || null, author || null,
        source || null, is_featured || 0, sort_order || 0, published_at || null]
    );
    res.status(201).json({ code: 0, data: { id: result.insertId, title }, message: 'success' });
  } catch (err) { next(err); }
});

// PUT /articles/:id - 更新文章
router.put('/:id', authMiddleware, [param('id').isInt()], validate, async (req, res, next) => {
  try {
    const fields = [], values = [];
    const allowed = ['subcategory_id','title','title_en','summary','summary_en','content','content_en',
      'cover_image','author','source','is_featured','status','sort_order','published_at'];
    for (const f of allowed) {
      if (req.body[f] !== undefined) { fields.push(`${f} = ?`); values.push(req.body[f]); }
    }
    if (fields.length === 0) return res.status(400).json({ code: 400, data: null, message: '没有需要更新的字段' });
    values.push(req.params.id);
    await query(`UPDATE articles SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ code: 0, data: null, message: '更新成功' });
  } catch (err) { next(err); }
});

// DELETE /articles/:id - 删除文章
router.delete('/:id', authMiddleware, [param('id').isInt()], validate, async (req, res, next) => {
  try {
    await query('DELETE FROM articles WHERE id = ?', [req.params.id]);
    res.json({ code: 0, data: null, message: '删除成功' });
  } catch (err) { next(err); }
});

export default router;
