# 杨凌三智官网 - 后端云端部署指南（Render.com）

## 第一步：准备部署包

server 目录下需要的文件：
- `server-static.js` ← 主程序
- `db_export.json` ← 数据文件
- `package.json` ← 依赖配置

## 第二步：注册/登录 Render.com

1. 打开 https://render.com
2. 用 GitHub 账号授权登录

## 第三步：新建 Web Service

1. 点击 **New → Web Service**
2. 选择 **Deploy an existing image** 或 **Deploy from Git**
3. 若已推送到 GitHub，选择仓库和分支
4. 配置如下：
   - **Name**: `yanglingsanzhi-api`
   - **Root Directory**: `server`（如果整个项目在Git根目录）
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server-static.js`
   - **Instance Type**: Free（$0/month）

## 第四步：获取 API URL

部署完成后，Render 会给出一个地址，格式类似：
`https://yanglingsanzhi-api.onrender.com`

## 第五步：更新前端 API 地址

将前端 `.env.production` 中的 `VITE_API_BASE_URL` 改为：
`VITE_API_BASE_URL=https://yanglingsanzhi-api.onrender.com/api/v1`

然后重新构建：`npm run build`

---

## 注意事项

- Render 免费套餐 15 分钟无请求会休眠，首次访问约 30 秒冷启动
- 数据仅为快照，后台管理修改不会同步（在线版为只读展示）
