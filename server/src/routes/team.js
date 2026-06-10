import { Router } from 'express';
import { body, param } from 'express-validator';
import authMiddleware from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import validate from '../middleware/validate.js';
import { query } from '../models/database.js';

const router = Router();

// GET /team - 团队列表（公开）
router.get(
  '/',
  async (req, res, next) => {
    try {
      const { is_featured } = req.query;

      let whereClause = 'WHERE status = 1';
      const params = [];

      if (is_featured !== undefined) {
        whereClause += ' AND is_featured = ?';
        params.push(parseInt(is_featured));
      }

      const list = await query(
        `SELECT * FROM team_members ${whereClause} ORDER BY sort_order ASC, id ASC`,
        params
      );

      res.json({
        code: 0,
        data: list,
        message: 'success',
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /team/:id - 成员详情（公开）
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const rows = await query('SELECT * FROM team_members WHERE id = ? AND status = 1', [req.params.id]);

      if (rows.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '成员不存在',
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

// POST /team - 创建成员（需认证, multipart头像上传）
router.post(
  '/',
  authMiddleware,
  (req, res, next) => { req.uploadSubDir = 'avatars'; next(); },
  upload.single('avatar'),
  [
    body('name').notEmpty().withMessage('成员姓名不能为空'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, title, bio, is_featured, sort_order } = req.body;
      const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : null;

      const result = await query(
        'INSERT INTO team_members (name, title, bio, avatar, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [name, title || null, bio || null, avatar, is_featured || 0, sort_order || 0]
      );

      res.status(201).json({
        code: 0,
        data: { id: result.insertId, name, avatar },
        message: 'success',
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /team/:id - 更新成员（需认证, multipart头像上传）
router.put(
  '/:id',
  authMiddleware,
  (req, res, next) => { req.uploadSubDir = 'avatars'; next(); },
  upload.single('avatar'),
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query('SELECT id FROM team_members WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '成员不存在',
        });
      }

      const { name, title, bio, is_featured, sort_order, status } = req.body;
      const fields = [];
      const values = [];

      if (name !== undefined) { fields.push('name = ?'); values.push(name); }
      if (title !== undefined) { fields.push('title = ?'); values.push(title); }
      if (bio !== undefined) { fields.push('bio = ?'); values.push(bio); }
      if (is_featured !== undefined) { fields.push('is_featured = ?'); values.push(is_featured); }
      if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }
      if (status !== undefined) { fields.push('status = ?'); values.push(status); }
      if (req.file) { fields.push('avatar = ?'); values.push(`/uploads/avatars/${req.file.filename}`); }

      if (fields.length === 0) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '没有需要更新的字段',
        });
      }

      values.push(req.params.id);
      await query(`UPDATE team_members SET ${fields.join(', ')} WHERE id = ?`, values);

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

// DELETE /team/:id - 删除成员（需认证）
router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query('SELECT id FROM team_members WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '成员不存在',
        });
      }

      await query('DELETE FROM team_members WHERE id = ?', [req.params.id]);

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
