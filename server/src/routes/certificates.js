import { Router } from 'express';
import { body, param } from 'express-validator';
import authMiddleware from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import validate from '../middleware/validate.js';
import { query } from '../models/database.js';

const router = Router();

// GET /certificates - 证书列表
router.get(
  '/',
  async (req, res, next) => {
    try {
      const { type } = req.query;

      let whereClause = 'WHERE status = 1';
      const params = [];

      if (type) {
        whereClause += ' AND type = ?';
        params.push(type);
      }

      const list = await query(
        `SELECT * FROM certificates ${whereClause} ORDER BY sort_order ASC, id ASC`,
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

// GET /certificates/:id - 证书详情
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const rows = await query('SELECT * FROM certificates WHERE id = ? AND status = 1', [req.params.id]);

      if (rows.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '证书不存在',
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

// POST /certificates - 创建证书（需认证, multipart图片上传）
router.post(
  '/',
  authMiddleware,
  (req, res, next) => { req.uploadSubDir = 'certificates'; next(); },
  upload.single('image'),
  [
    body('title').notEmpty().withMessage('证书标题不能为空'),
    body('type').isIn(['patent', 'cma', 'promotion', 'other']).withMessage('证书类型无效'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const {
        title, type, certificate_number, description,
        issue_date, sort_order,
      } = req.body;
      const image = req.file ? `/uploads/certificates/${req.file.filename}` : null;

      const result = await query(
        `INSERT INTO certificates (title, type, certificate_number, description, image, issue_date, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, type, certificate_number || null, description || null,
         image, issue_date || null, sort_order || 0]
      );

      res.status(201).json({
        code: 0,
        data: { id: result.insertId, title, type },
        message: 'success',
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /certificates/:id - 更新证书（需认证, multipart图片上传）
router.put(
  '/:id',
  authMiddleware,
  (req, res, next) => { req.uploadSubDir = 'certificates'; next(); },
  upload.single('image'),
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query('SELECT id FROM certificates WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '证书不存在',
        });
      }

      const {
        title, type, certificate_number, description,
        issue_date, sort_order, status,
      } = req.body;
      const fields = [];
      const values = [];

      if (title !== undefined) { fields.push('title = ?'); values.push(title); }
      if (type !== undefined) { fields.push('type = ?'); values.push(type); }
      if (certificate_number !== undefined) { fields.push('certificate_number = ?'); values.push(certificate_number); }
      if (description !== undefined) { fields.push('description = ?'); values.push(description); }
      if (issue_date !== undefined) { fields.push('issue_date = ?'); values.push(issue_date); }
      if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }
      if (status !== undefined) { fields.push('status = ?'); values.push(status); }
      if (req.file) { fields.push('image = ?'); values.push(`/uploads/certificates/${req.file.filename}`); }

      if (fields.length === 0) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '没有需要更新的字段',
        });
      }

      values.push(req.params.id);
      await query(`UPDATE certificates SET ${fields.join(', ')} WHERE id = ?`, values);

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

// DELETE /certificates/:id - 删除证书（需认证）
router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query('SELECT id FROM certificates WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '证书不存在',
        });
      }

      await query('DELETE FROM certificates WHERE id = ?', [req.params.id]);

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
