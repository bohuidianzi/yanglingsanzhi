import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.js';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      data: null,
      message: '未提供认证令牌',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, authConfig.secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      code: 401,
      data: null,
      message: '令牌无效或已过期',
    });
  }
}

export default authMiddleware;
