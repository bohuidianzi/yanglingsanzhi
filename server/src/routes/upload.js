import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { query } from '../models/database.js';

const router = Router();

// POST /upload/image - 上传图片（需认证）
router.post(
  '/image',
  authMiddleware,
  (req, res, next) => { req.uploadSubDir = 'images'; next(); },
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '请上传图片文件',
        });
      }

      const imageUrl = `/uploads/images/${req.file.filename}`;

      res.json({
        code: 0,
        data: {
          url: imageUrl,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
        message: 'success',
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /upload/file - 上传文件（需认证）
router.post(
  '/file',
  authMiddleware,
  (req, res, next) => { req.uploadSubDir = 'files'; next(); },
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '请上传文件',
        });
      }

      const fileUrl = `/uploads/files/${req.file.filename}`;

      res.json({
        code: 0,
        data: {
          url: fileUrl,
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
        message: 'success',
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
