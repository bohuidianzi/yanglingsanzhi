import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { query } from '../models/database.js';

const router = Router();

// GET /settings - 获取所有设置（公开）
router.get('/', async (req, res, next) => {
  try {
    const list = await query('SELECT setting_key, setting_value FROM site_settings');

    const data = {};
    for (const row of list) {
      data[row.setting_key] = row.setting_value;
    }

    res.json({
      code: 0,
      data,
      message: 'success',
    });
  } catch (err) {
    next(err);
  }
});

// GET /settings/:key - 获取单个设置（公开）
router.get('/:key', async (req, res, next) => {
  try {
    const rows = await query(
      'SELECT setting_key, setting_value FROM site_settings WHERE setting_key = ?',
      [req.params.key]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        code: 404,
        data: null,
        message: '设置项不存在',
      });
    }

    res.json({
      code: 0,
      data: { key: rows[0].setting_key, value: rows[0].setting_value },
      message: 'success',
    });
  } catch (err) {
    next(err);
  }
});

// PUT /settings - 批量更新设置（需认证）
router.put('/', authMiddleware, async (req, res, next) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings) || settings.length === 0) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: 'settings必须是非空数组',
      });
    }

    for (const item of settings) {
      if (!item.key || item.value === undefined) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '每项必须包含key和value',
        });
      }

      await query(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [item.key, item.value, item.value]
      );
    }

    res.json({
      code: 0,
      data: null,
      message: '更新成功',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
