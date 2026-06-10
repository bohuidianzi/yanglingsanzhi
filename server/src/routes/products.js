import { Router } from 'express';
import { body, param, query as queryValidator } from 'express-validator';
import authMiddleware from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import validate from '../middleware/validate.js';
import { query } from '../models/database.js';

const router = Router();

// GET /products - 产品列表
router.get(
  '/',
  async (req, res, next) => {
    try {
      const { category_id, keyword, page = 1, pageSize = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(pageSize);

      let whereClause = 'WHERE p.status = 1';
      const params = [];

      if (category_id) {
        whereClause += ' AND p.category_id = ?';
        params.push(category_id);
      }

      if (keyword) {
        whereClause += ' AND (p.name LIKE ? OR p.model LIKE ? OR p.summary LIKE ?)';
        const likeKeyword = `%${keyword}%`;
        params.push(likeKeyword, likeKeyword, likeKeyword);
      }

      const countResult = await query(
        `SELECT COUNT(*) as total FROM products p ${whereClause}`,
        params
      );
      const total = countResult[0].total;

      const list = await query(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         ${whereClause}
         ORDER BY p.sort_order ASC, p.id DESC
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

// GET /products/:id - 产品详情
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const products = await query(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = ?`,
        [req.params.id]
      );

      if (products.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '产品不存在',
        });
      }

      const product = products[0];

      // 获取关联数据
      const [images, params, docs] = await Promise.all([
        query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [req.params.id]),
        query('SELECT * FROM product_params WHERE product_id = ? ORDER BY sort_order ASC', [req.params.id]),
        query('SELECT * FROM product_docs WHERE product_id = ? ORDER BY sort_order ASC', [req.params.id]),
      ]);

      product.images = images;
      product.params = params;
      product.docs = docs;

      res.json({
        code: 0,
        data: product,
        message: 'success',
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /products - 创建产品
router.post(
  '/',
  authMiddleware,
  [
    body('category_id').isInt().withMessage('分类ID必须为整数'),
    body('name').notEmpty().withMessage('产品名称不能为空'),
    body('slug').notEmpty().withMessage('slug不能为空'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const {
        category_id, name, slug, model, summary, description,
        cover_image, application_scenes, sort_order,
      } = req.body;

      const result = await query(
        `INSERT INTO products (category_id, name, slug, model, summary, description, cover_image, application_scenes, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [category_id, name, slug, model || null, summary || null, description || null,
         cover_image || null, application_scenes || null, sort_order || 0]
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

// PUT /products/:id - 更新产品
router.put(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query('SELECT id FROM products WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '产品不存在',
        });
      }

      const {
        category_id, name, slug, model, summary, description,
        cover_image, application_scenes, sort_order, status,
      } = req.body;

      const fields = [];
      const values = [];

      if (category_id !== undefined) { fields.push('category_id = ?'); values.push(category_id); }
      if (name !== undefined) { fields.push('name = ?'); values.push(name); }
      if (slug !== undefined) { fields.push('slug = ?'); values.push(slug); }
      if (model !== undefined) { fields.push('model = ?'); values.push(model); }
      if (summary !== undefined) { fields.push('summary = ?'); values.push(summary); }
      if (description !== undefined) { fields.push('description = ?'); values.push(description); }
      if (cover_image !== undefined) { fields.push('cover_image = ?'); values.push(cover_image); }
      if (application_scenes !== undefined) { fields.push('application_scenes = ?'); values.push(application_scenes); }
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
      await query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);

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

// DELETE /products/:id - 删除产品（级联删除关联数据）
router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query('SELECT id FROM products WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '产品不存在',
        });
      }

      // 关联数据由外键ON DELETE CASCADE自动删除
      await query('DELETE FROM products WHERE id = ?', [req.params.id]);

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

// POST /products/:id/images - 上传产品图片
router.post(
  '/:id/images',
  authMiddleware,
  (req, res, next) => { req.uploadSubDir = 'products'; next(); },
  upload.single('image'),
  [param('id').isInt().withMessage('产品ID必须为整数')],
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

      const existing = await query('SELECT id FROM products WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '产品不存在',
        });
      }

      const imageUrl = `/uploads/products/${req.file.filename}`;
      const { title, sort_order } = req.body;

      const result = await query(
        'INSERT INTO product_images (product_id, image_url, title, sort_order) VALUES (?, ?, ?, ?)',
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

// DELETE /products/:id/images/:imageId - 删除产品图片
router.delete(
  '/:id/images/:imageId',
  authMiddleware,
  [
    param('id').isInt().withMessage('产品ID必须为整数'),
    param('imageId').isInt().withMessage('图片ID必须为整数'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query(
        'SELECT id FROM product_images WHERE id = ? AND product_id = ?',
        [req.params.imageId, req.params.id]
      );
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '图片不存在',
        });
      }

      await query('DELETE FROM product_images WHERE id = ?', [req.params.imageId]);

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

// POST /products/:id/params - 添加产品参数
router.post(
  '/:id/params',
  authMiddleware,
  [
    param('id').isInt().withMessage('产品ID必须为整数'),
    body('param_name').notEmpty().withMessage('参数名不能为空'),
    body('param_value').notEmpty().withMessage('参数值不能为空'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query('SELECT id FROM products WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '产品不存在',
        });
      }

      const { param_name, param_value, sort_order } = req.body;

      const result = await query(
        'INSERT INTO product_params (product_id, param_name, param_value, sort_order) VALUES (?, ?, ?, ?)',
        [req.params.id, param_name, param_value, sort_order || 0]
      );

      res.status(201).json({
        code: 0,
        data: { id: result.insertId, param_name, param_value },
        message: 'success',
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /products/:id/params/:paramId - 更新产品参数
router.put(
  '/:id/params/:paramId',
  authMiddleware,
  [
    param('id').isInt().withMessage('产品ID必须为整数'),
    param('paramId').isInt().withMessage('参数ID必须为整数'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query(
        'SELECT id FROM product_params WHERE id = ? AND product_id = ?',
        [req.params.paramId, req.params.id]
      );
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '参数不存在',
        });
      }

      const { param_name, param_value, sort_order } = req.body;
      const fields = [];
      const values = [];

      if (param_name !== undefined) { fields.push('param_name = ?'); values.push(param_name); }
      if (param_value !== undefined) { fields.push('param_value = ?'); values.push(param_value); }
      if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }

      if (fields.length === 0) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '没有需要更新的字段',
        });
      }

      values.push(req.params.paramId);
      await query(`UPDATE product_params SET ${fields.join(', ')} WHERE id = ?`, values);

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

// DELETE /products/:id/params/:paramId - 删除产品参数
router.delete(
  '/:id/params/:paramId',
  authMiddleware,
  [
    param('id').isInt().withMessage('产品ID必须为整数'),
    param('paramId').isInt().withMessage('参数ID必须为整数'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query(
        'SELECT id FROM product_params WHERE id = ? AND product_id = ?',
        [req.params.paramId, req.params.id]
      );
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '参数不存在',
        });
      }

      await query('DELETE FROM product_params WHERE id = ?', [req.params.paramId]);

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

// POST /products/:id/docs - 上传产品文档
router.post(
  '/:id/docs',
  authMiddleware,
  (req, res, next) => { req.uploadSubDir = 'docs'; next(); },
  upload.single('file'),
  [param('id').isInt().withMessage('产品ID必须为整数')],
  validate,
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '请上传文件',
        });
      }

      const existing = await query('SELECT id FROM products WHERE id = ?', [req.params.id]);
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '产品不存在',
        });
      }

      const fileUrl = `/uploads/docs/${req.file.filename}`;
      const { title, sort_order } = req.body;
      const fileType = req.file.mimetype;
      const fileSize = req.file.size;

      const result = await query(
        'INSERT INTO product_docs (product_id, title, file_url, file_type, file_size, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [req.params.id, title || req.file.originalname, fileUrl, fileType, fileSize, sort_order || 0]
      );

      res.status(201).json({
        code: 0,
        data: { id: result.insertId, file_url: fileUrl },
        message: 'success',
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /products/:id/docs/:docId - 删除产品文档
router.delete(
  '/:id/docs/:docId',
  authMiddleware,
  [
    param('id').isInt().withMessage('产品ID必须为整数'),
    param('docId').isInt().withMessage('文档ID必须为整数'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const existing = await query(
        'SELECT id FROM product_docs WHERE id = ? AND product_id = ?',
        [req.params.docId, req.params.id]
      );
      if (existing.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '文档不存在',
        });
      }

      await query('DELETE FROM product_docs WHERE id = ?', [req.params.docId]);

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
