import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ensureUploadDir } from '../models/database.js';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const subDir = req.uploadSubDir || 'docs';
    const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', subDir);
    // 确保目录存在
    ensureUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型，仅允许图片和PDF文件'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export default upload;
