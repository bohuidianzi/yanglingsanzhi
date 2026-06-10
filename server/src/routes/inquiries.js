import { Router } from 'express';
import { body, param } from 'express-validator';
import authMiddleware from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { query } from '../models/database.js';

const router = Router();

// POST /inquiries - 提交留言（公开）
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('姓名不能为空').isLength({ max: 50 }).withMessage('姓名最长50字'),
    body('message').notEmpty().withMessage('留言内容不能为空').isLength({ max: 2000 }).withMessage('留言内容最长2000字'),
    body('phone').optional().matches(/^[\d\-+() ]{7,20}$/).withMessage('手机号格式不正确'),
    body('email').optional().isEmail().withMessage('邮箱格式不正确'),
    body('company').optional().isLength({ max: 200 }).withMessage('公司名称最长200字'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, phone, email, company, message, source } = req.body;

      // 基础频率限制：相同来源1分钟内最多3条
      const clientIp = req.ip || req.connection.remoteAddress;
      const recentCount = await query(
        'SELECT COUNT(*) as cnt FROM inquiries WHERE source = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)',
        [clientIp]
      );
      if (recentCount[0].cnt >= 3) {
        return res.status(429).json({
          code: 429,
          data: null,
          message: '提交过于频繁，请稍后再试',
        });
      }

      const actualSource = source || clientIp;
      const result = await query(
        'INSERT INTO inquiries (name, phone, email, company, message, source) VALUES (?, ?, ?, ?, ?, ?)',
        [name, phone || null, email || null, company || null, message, actualSource]
      );

      res.status(201).json({
        code: 0,
        data: { id: result.insertId },
        message: '留言提交成功',
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /inquiries - 留言列表（需认证）
router.get(
  '/',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { status, page = 1, pageSize = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(pageSize);

      let whereClause = '';
      const params = [];

      if (status) {
        whereClause = 'WHERE status = ?';
        params.push(status);
      }

      const countResult = await query(
        `SELECT COUNT(*) as total FROM inquiries ${whereClause}`,
        params
      );
      const total = countResult[0].total;

      const list = await query(
        `SELECT * FROM inquiries ${whereClause}
         ORDER BY id DESC
         LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), offset]
      );

      res.json({
        code: 0,
        data: {
          list,
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
        },
        message: 'success',
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /inquiries/:id - 留言详情（需认证）
router.get(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const rows = await query('SELECT * FROM inquiries WHERE id = ?', [req.params.id]);

      if (rows.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '留言不存在',
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

// PUT /inquiries/:id - 更新留言状态/备注（需认证）
router.put(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query('SELECT id FROM inquiries WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '留言不存在',
        });
      }

      const { status, remark } = req.body;
      const fields = [];
      const values = [];

      if (status !== undefined) { fields.push('status = ?'); values.push(status); }
      if (remark !== undefined) { fields.push('remark = ?'); values.push(remark); }

      if (fields.length === 0) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '没有需要更新的字段',
        });
      }

      values.push(req.params.id);
      await query(`UPDATE inquiries SET ${fields.join(', ')} WHERE id = ?`, values);

      res.json({
        code: 0,
        data: null,
        message: '更新成功',
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /inquiries/:id - 删除留言（需认证）
router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query('SELECT id FROM inquiries WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '留言不存在',
        });
      }

      await query('DELETE FROM inquiries WHERE id = ?', [req.params.id]);

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
