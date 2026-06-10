import { Router } from 'express';
import { body, param } from 'express-validator';
import authMiddleware from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import validate from '../middleware/validate.js';
import { query } from '../models/database.js';

const router = Router();

// GET /cases - 案例列表
router.get(
  '/',
  async (req, res, next) => {
    try {
      const { province, is_featured, page = 1, pageSize = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(pageSize);

      let whereClause = 'WHERE c.status = 1';
      const params = [];

      if (province) {
        whereClause += ' AND c.province = ?';
        params.push(province);
      }

      if (is_featured !== undefined) {
        whereClause += ' AND c.is_featured = ?';
        params.push(parseInt(is_featured));
      }

      const countResult = await query(
        `SELECT COUNT(*) as total FROM cases c ${whereClause}`,
        params
      );
      const total = countResult[0].total;

      const list = await query(
        `SELECT * FROM cases c ${whereClause}
         ORDER BY c.sort_order ASC, c.id DESC
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

// GET /cases/:id - 案例详情
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const cases = await query('SELECT * FROM cases WHERE id = ?', [req.params.id]);

      if (cases.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '案例不存在',
        });
      }

      const caseItem = cases[0];
      caseItem.images = await query(
        'SELECT * FROM case_images WHERE case_id = ? ORDER BY sort_order ASC',
        [req.params.id]
      );

      res.json({
        code: 0,
        data: caseItem,
        message: 'success',
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /cases - 创建案例
router.post(
  '/',
  authMiddleware,
  [
    body('title').notEmpty().withMessage('案例标题不能为空'),
    body('slug').notEmpty().withMessage('slug不能为空'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const {
        title, slug, summary, description, cover_image,
        location, province, is_featured, sort_order,
      } = req.body;

      const result = await query(
        `INSERT INTO cases (title, slug, summary, description, cover_image, location, province, is_featured, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, slug, summary || null, description || null, cover_image || null,
         location || null, province || null, is_featured || 0, sort_order || 0]
      );

      res.status(201).json({
        code: 0,
        data: { id: result.insertId, title, slug },
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

// PUT /cases/:id - 更新案例
router.put(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query('SELECT id FROM cases WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '案例不存在',
        });
      }

      const {
        title, slug, summary, description, cover_image,
        location, province, is_featured, sort_order, status,
      } = req.body;

      const fields = [];
      const values = [];

      if (title !== undefined) { fields.push('title = ?'); values.push(title); }
      if (slug !== undefined) { fields.push('slug = ?'); values.push(slug); }
      if (summary !== undefined) { fields.push('summary = ?'); values.push(summary); }
      if (description !== undefined) { fields.push('description = ?'); values.push(description); }
      if (cover_image !== undefined) { fields.push('cover_image = ?'); values.push(cover_image); }
      if (location !== undefined) { fields.push('location = ?'); values.push(location); }
      if (province !== undefined) { fields.push('province = ?'); values.push(province); }
      if (is_featured !== undefined) { fields.push('is_featured = ?'); values.push(is_featured); }
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
      await query(`UPDATE cases SET ${fields.join(', ')} WHERE id = ?`, values);

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

// DELETE /cases/:id - 删除案例
router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query('SELECT id FROM cases WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '案例不存在',
        });
      }

      await query('DELETE FROM cases WHERE id = ?', [req.params.id]);

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

// POST /cases/:id/images - 上传案例图片
router.post(
  '/:id/images',
  authMiddleware,
  (req, res, next) => { req.uploadSubDir = 'cases'; next(); },
  upload.single('image'),
  [param('id').isInt().withMessage('案例ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '请上传图片文件',
        });
      }

      const existing = await query('SELECT id FROM cases WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '案例不存在',
        });
      }

      const imageUrl = `/uploads/cases/${req.file.filename}`;
      const { title, sort_order } = req.body;

      const result = await query(
        'INSERT INTO case_images (case_id, image_url, title, sort_order) VALUES (?, ?, ?, ?)',
        [req.params.id, imageUrl, title || null, sort_order || 0]
      );

      res.status(201).json({
        code: 0,
        data: { id: result.insertId, image_url: imageUrl },
        message: 'success',
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /cases/:id/images/:imageId - 删除案例图片
router.delete(
  '/:id/images/:imageId',
  authMiddleware,
  [
    param('id').isInt().withMessage('案例ID必须为整数'),
    param('imageId').isInt().withMessage('图片ID必须为整数'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query(
        'SELECT id FROM case_images WHERE id = ? AND case_id = ?',
        [req.params.imageId, req.params.id]
      );
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '图片不存在',
        });
      }

      await query('DELETE FROM case_images WHERE id = ?', [req.params.imageId]);

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
