import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

async function initDb() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server');

    // Create database
    await connection.query(
      'CREATE DATABASE IF NOT EXISTS yanglingsanzhi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
    );
    console.log('Database "yanglingsanzhi" created or already exists');

    await connection.query('USE yanglingsanzhi');

    // Create tables
    const ddlStatements = [
      `CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        real_name VARCHAR(50),
        avatar VARCHAR(255),
        last_login_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(255),
        sort_order INT DEFAULT 0,
        status TINYINT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) NOT NULL UNIQUE,
        model VARCHAR(100),
        summary VARCHAR(500),
        description TEXT,
        cover_image VARCHAR(255),
        application_scenes TEXT,
        status TINYINT DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )`,

      `CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        title VARCHAR(200),
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS product_params (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        param_name VARCHAR(100) NOT NULL,
        param_value VARCHAR(500) NOT NULL,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS product_docs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        file_type VARCHAR(50),
        file_size INT,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS cases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        slug VARCHAR(200) NOT NULL UNIQUE,
        summary VARCHAR(500),
        description TEXT,
        cover_image VARCHAR(255),
        location VARCHAR(200),
        province VARCHAR(50),
        is_featured TINYINT DEFAULT 0,
        status TINYINT DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS case_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        case_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        title VARCHAR(200),
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        title VARCHAR(100),
        bio TEXT,
        avatar VARCHAR(255),
        is_featured TINYINT DEFAULT 0,
        status TINYINT DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        type ENUM('patent', 'cma', 'promotion', 'other') NOT NULL,
        certificate_number VARCHAR(100),
        description TEXT,
        image VARCHAR(255),
        issue_date DATE,
        status TINYINT DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        company VARCHAR(200),
        message TEXT NOT NULL,
        source VARCHAR(50),
        status ENUM('pending', 'processed', 'ignored') DEFAULT 'pending',
        remark TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
    ];

    for (const ddl of ddlStatements) {
      await connection.query(ddl);
    }
    console.log('All tables created successfully');

    // Insert default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.query(
      'INSERT IGNORE INTO admin_users (username, password, real_name) VALUES (?, ?, ?)',
      ['admin', hashedPassword, '系统管理员']
    );
    console.log('Default admin user created (admin/admin123)');

    // Insert default site settings
    const defaultSettings = [
      ['site_name', '杨凌三智科技有限公司'],
      ['site_description', '专注于水土保持监测与生态治理的高科技企业'],
      ['site_keywords', '水土保持,生态监测,盐碱地治理,智慧水保'],
      ['contact_phone', '029-87012345'],
      ['contact_email', 'info@sanzhi-tech.com'],
      ['contact_address', '陕西省杨凌示范区'],
      ['company_intro', '杨凌三智科技有限公司是一家专注于水土保持监测与生态治理领域的高科技企业，致力于为用户提供先进的监测设备和解决方案。'],
    ];

    for (const [key, value] of defaultSettings) {
      await connection.query(
        'INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES (?, ?)',
        [key, value]
      );
    }
    console.log('Default site settings inserted');

    console.log('\nDatabase initialization completed!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initDb();
