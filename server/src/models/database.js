import mysql from 'mysql2/promise';
import dbConfig from '../config/database.js';
import fs from 'fs';
import path from 'path';

const pool = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * 执行SQL查询
 * 注意：使用 query() 而非 execute()，因为 execute() (prepared statement)
 * 在MySQL 8.4中对 LIMIT/OFFSET 占位符支持不佳，会报 ER_WRONG_ARGUMENTS
 */
async function query(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * 确保上传目录存在
 */
function ensureUploadDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export { pool, query, ensureUploadDir };
