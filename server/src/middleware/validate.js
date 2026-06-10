import { validationResult } from 'express-validator';

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 400,
      data: null,
      message: '参数验证失败',
      errors: errors.array(),
    });
  }
  next();
}

export default validate;
