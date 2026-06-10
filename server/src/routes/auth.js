import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import authConfig from '../config/auth.js';
import authMiddleware from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { query } from '../models/database.js';

const router = Router();

// POST /auth/login - 管理员登录
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const users = await query(
        'SELECT id, username, password, real_name, avatar FROM admin_users WHERE username = ?',
        [username]
      );

      if (users.length === 0) {
        return res.status(401).json({
          code: 401,
          data: null,
          message: '用户名或密码错误',
        });
      }

      const user = users[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          code: 401,
          data: null,
          message: '用户名或密码错误',
        });
      }

      // 更新最后登录时间
      await query('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?', [user.id]);

      const token = jwt.sign(
        { id: user.id, username: user.username },
        authConfig.secret,
        { expiresIn: authConfig.expiresIn }
      );

      res.json({
        code: 0,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            real_name: user.real_name,
            avatar: user.avatar,
          },
        },
        message: 'success',
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /auth/profile - 获取当前用户信息
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const users = await query(
      'SELECT id, username, real_name, avatar, last_login_at, created_at FROM admin_users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        data: null,
        message: '用户不存在',
      });
    }

    res.json({
      code: 0,
      data: users[0],
      message: 'success',
    });
  } catch (err) {
    next(err);
  }
});

// PUT /auth/password - 修改密码
router.put(
  '/password',
  authMiddleware,
  [
    body('old_password').notEmpty().withMessage('旧密码不能为空'),
    body('new_password').isLength({ min: 6 }).withMessage('新密码长度不能少于6位'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { old_password, new_password } = req.body;

      const users = await query(
        'SELECT password FROM admin_users WHERE id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: '用户不存在',
        });
      }

      const isMatch = await bcrypt.compare(old_password, users[0].password);
      if (!isMatch) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '旧密码错误',
        });
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      await query('UPDATE admin_users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

      res.json({
        code: 0,
        data: null,
        message: '密码修改成功',
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
