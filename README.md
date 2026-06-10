# 杨凌三智科技有限公司 - 企业门户网站

> 水土保持智能监测领域高科技企业官方网站，前后端分离架构，含完整后台管理系统。

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 前端 | React 18 + Vite + TypeScript + MUI v5 + Tailwind CSS + framer-motion |
| 后端 | Node.js + Express (ES Modules) |
| 数据库 | MySQL 8.0 |
| 认证 | JWT (jsonwebtoken + bcryptjs) |
| 文件上传 | multer（本地存储） |

---

## 项目结构

```
yanglingsanzhi/
├── src/                    # 前端源码
│   ├── pages/              # 页面组件
│   │   ├── admin/          # 后台管理页面
│   │   ├── HomePage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── TechnologyPage.tsx
│   │   ├── CasesPage.tsx
│   │   ├── CaseDetailPage.tsx
│   │   └── CooperationPage.tsx
│   ├── components/         # 通用组件
│   ├── api/                # API 调用封装
│   ├── contexts/           # React Context（Auth）
│   ├── types/              # TypeScript 类型定义
│   └── theme/              # MUI 主题配置
├── server/                 # 后端源码
│   ├── src/
│   │   ├── routes/         # API 路由（9个模块）
│   │   ├── middleware/     # 中间件（auth/upload/validate/errorHandler）
│   │   ├── models/         # 数据库连接池
│   │   └── config/         # 配置文件
│   ├── scripts/
│   │   ├── init-db.js      # 初始化数据库（建表 + 默认管理员）
│   │   └── seed.js         # 填充示例数据
│   └── uploads/            # 上传文件存储目录（自动创建）
├── public/                 # 静态资源
│   └── china-map.svg
├── nginx.conf              # 生产环境 Nginx 配置
└── ecosystem.config.js     # PM2 进程管理配置
```

---

## 环境要求

- Node.js >= 18
- MySQL >= 8.0
- npm >= 9

---

## 快速启动（开发环境）

### 1. 安装前端依赖

```bash
# 在项目根目录
npm install
```

### 2. 安装后端依赖

```bash
cd server
npm install
```

### 3. 配置数据库

确保 MySQL 8.0 正在运行，并创建用于连接的用户。

编辑 `server/.env`：

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=yanglingsanzhi
JWT_SECRET=your_jwt_secret_change_this_in_production
UPLOAD_DIR=uploads
```

### 4. 初始化数据库

```bash
# 在 server/ 目录下
node scripts/init-db.js
```

> 该脚本会：
> - 创建 `yanglingsanzhi` 数据库
> - 建立12张数据表
> - 创建默认管理员账号（admin / admin123）
> - 写入默认站点设置

### 5. 填充示例数据（可选）

```bash
node scripts/seed.js
```

> 填充5大产品分类、示例产品、3位核心团队成员、示例案例和证书。

### 6. 启动后端服务

```bash
# 在 server/ 目录下
node src/index.js
```

后端运行在 `http://localhost:3000`

### 7. 启动前端开发服务

```bash
# 回到项目根目录
npm run dev
```

前端运行在 `http://localhost:5173`

> 开发环境通过 Vite 代理将 `/api` 请求转发到 `http://localhost:3000`

---

## 访问地址

| 地址 | 说明 |
|------|------|
| http://localhost:5173 | 前台网站首页 |
| http://localhost:5173/admin | 后台管理登录页 |
| http://localhost:3000/api/v1 | 后端 API |

### 默认管理员账号

| 字段 | 值 |
|------|----|
| 用户名 | admin |
| 密码 | admin123 |

**⚠️ 生产环境请务必修改默认密码！**

---

## 后台管理功能

| 模块 | 功能 |
|------|------|
| 控制台 | 数据统计 + 最新留言 + 快捷操作 |
| 产品管理 | 产品 CRUD + 图片/参数/文档管理 |
| 案例管理 | 案例 CRUD + 标杆案例标记 |
| 团队管理 | 成员 CRUD + 首页展示控制 |
| 证书管理 | 证书 CRUD（专利/CMA/推广目录/其他） |
| 留言管理 | 留言查看 + 状态更新（待处理/已处理/已忽略）|
| 站点设置 | 网站名称/标语/联系方式/版权信息 |

---

## 生产环境部署

### 1. 构建前端

```bash
npm run build
# 产物输出到 dist/ 目录
```

### 2. 使用 PM2 管理后端进程

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Nginx 配置

参考项目根目录的 `nginx.conf`，将前端静态文件和后端 API 配置到同一域名下：

```nginx
# 前端静态文件
location / {
    root /path/to/yanglingsanzhi/dist;
    try_files $uri $uri/ /index.html;
}

# 后端 API 反向代理
location /api/ {
    proxy_pass http://localhost:3000;
}

# 上传文件访问
location /uploads/ {
    alias /path/to/yanglingsanzhi/server/uploads/;
}
```

### 4. 环境变量（生产）

```env
NODE_ENV=production
JWT_SECRET=生产环境使用强随机密钥（至少64位）
```

---

## API 接口文档（摘要）

所有接口统一前缀 `/api/v1/`，响应格式：
```json
{
  "code": 200,
  "data": {},
  "message": "success"
}
```

| 模块 | 接口 | 说明 |
|------|------|------|
| 认证 | POST /auth/login | 管理员登录 |
| 分类 | GET /categories | 获取产品分类列表 |
| 产品 | GET /products | 产品列表（支持分页/分类筛选）|
| 产品 | GET /products/:id | 产品详情 |
| 案例 | GET /cases | 案例列表（支持省份/标杆筛选）|
| 团队 | GET /team | 团队成员列表 |
| 证书 | GET /certificates | 证书列表（支持类型筛选）|
| 留言 | POST /inquiries | 提交咨询留言 |
| 设置 | GET /settings | 获取站点设置 |
| 上传 | POST /upload/image | 上传图片 |

---

## V2 色彩规范

| 颜色 | 色值 | 用途 |
|------|------|------|
| 深蓝（主色） | #0F2B47 | 导航/标题/主按钮 |
| 辅助蓝 | #1E4D73 | 卡片边框/次级背景 |
| 浅蓝 | #2A5A8A | hover状态/装饰 |
| 橙色（点缀） | #D4862A | 强调色/CTA按钮 |
| 科技绿 | #3A8F5C | 成功状态/标签 |
| 背景灰 | #F8F9FC | 页面背景 |

---

## 常见问题

**Q: 前端启动报 `Cannot find module` 错误？**  
A: 确保已执行 `npm install`，所有依赖已安装。

**Q: 后端连接数据库失败？**  
A: 检查 `server/.env` 中的数据库配置，确认 MySQL 服务已启动，且数据库用户有创建数据库权限。

**Q: 图片上传后无法显示？**  
A: 确认 `server/uploads/` 目录存在且有写权限（初始化脚本会自动创建）。开发环境下需通过后端服务访问 `http://localhost:3000/uploads/filename`。

**Q: 后台登录提示 401？**  
A: 确认已运行 `init-db.js` 初始化了默认管理员账号。

---

## 开发团队

本项目由杨凌三智科技有限公司 × AI 辅助开发团队协同完成。
