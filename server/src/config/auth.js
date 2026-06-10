export default {
  secret: process.env.JWT_SECRET || 'sanzhi_jwt_secret_2026',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
};
