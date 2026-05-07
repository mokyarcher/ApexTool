# ApexTool Nginx 迁移配置参考

本文档用于迁移 `apex.sharex.my` 到新服务器时快速参考。

## 当前项目路径

当前服务器项目路径：

```text
/opt/projects/ApexTool
```

前端构建产物路径：

```text
/opt/projects/ApexTool/client/dist
```

后端服务端口：

```text
4000
```

后端入口：

```text
/opt/projects/ApexTool/server/index.js
```

## 当前 Nginx 生效配置

当前生效站点文件：

```text
/etc/nginx/sites-enabled/apex-tool
```

完整配置参考：

```nginx
server {
    server_name apex.sharex.my;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml model/gltf-binary model/gltf+json application/octet-stream;
    gzip_min_length 256;
    gzip_comp_level 6;

    # 前端静态文件
    location / {
        root /opt/projects/ApexTool/client/dist;
        try_files $uri /index.html;
    }

    # 3D 模型和图片资源 - 长期缓存
    location /mythic/ {
        root /opt/projects/ApexTool/client/dist;
        expires 30d;
        add_header Cache-Control "public";
        add_header Access-Control-Allow-Origin *;
    }

    # 静态资源长期缓存
    location /assets/ {
        root /opt/projects/ApexTool/client/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 后端 API 代理 - 端口 4000
    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    access_log /var/log/nginx/apex-tool.access.log;
    error_log /var/log/nginx/apex-tool.error.log;

    listen [::]:443 ssl;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/apex.sharex.my/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/apex.sharex.my/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = apex.sharex.my) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    listen [::]:80;
    server_name apex.sharex.my;
    return 404;
}
```

## 新服务器推荐部署步骤

### 1. 安装基础环境

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx git nodejs npm
sudo npm install -g pm2
```

建议 Node.js 使用当前项目兼容的现代 LTS 版本，至少 Node 18+。

### 2. 拉取项目

```bash
sudo mkdir -p /opt/projects
sudo chown -R $USER:$USER /opt/projects
git clone git@github.com:mokyarcher/ApexTool.git /opt/projects/ApexTool
```

如果新服务器没有 SSH Key，也可以临时使用 HTTPS 仓库地址。

### 3. 安装依赖并构建前端

```bash
cd /opt/projects/ApexTool
npm install
npm --prefix server install
npm --prefix client install
npm --prefix client run build
```

构建后应生成：

```text
/opt/projects/ApexTool/client/dist
```

### 4. 配置环境变量

后端会读取：

```text
/opt/projects/ApexTool/server/.env
```

常用变量：

```env
PORT=4000
CORS_ORIGIN=https://apex.sharex.my
```

如项目内还有第三方 API Key，需要同步旧服务器的 `.env`，不要提交到 Git。

### 5. 使用 PM2 启动后端

当前项目已有 PM2 配置：

```text
/opt/projects/ApexTool/ecosystem.config.cjs
```

当前包含：

```js
module.exports = {
  apps: [
    {
      name: 'apex-server',
      cwd: './server',
      script: 'index.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'apex-client',
      cwd: './client',
      script: 'node_modules/.bin/vite',
      args: '--host',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
```

生产环境实际只需要后端服务即可，因为前端由 Nginx 静态托管：

```bash
cd /opt/projects/ApexTool
pm2 start ecosystem.config.cjs --only apex-server
pm2 save
pm2 startup
```

验证后端：

```bash
curl http://localhost:4000/api/health
```

### 6. 写入 Nginx 配置

在新服务器创建：

```text
/etc/nginx/sites-available/apex-tool
```

填入上方 Nginx 配置。

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/apex-tool /etc/nginx/sites-enabled/apex-tool
sudo nginx -t
sudo systemctl reload nginx
```

如果新服务器默认站点冲突，可视情况移除：

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 7. 配置 HTTPS 证书

DNS 解析到新服务器后执行：

```bash
sudo certbot --nginx -d apex.sharex.my
```

Certbot 会自动补齐：

```nginx
listen 443 ssl;
ssl_certificate ...;
ssl_certificate_key ...;
```

如果证书还没签发，Nginx 配置可以先只保留 80 端口，等域名解析生效后再运行 Certbot。

### 8. 迁移后验证

```bash
curl -I https://apex.sharex.my
curl https://apex.sharex.my/api/health
pm2 status
sudo nginx -t
sudo tail -n 50 /var/log/nginx/apex-tool.error.log
```

网页验证重点：

- 首页是否正常加载
- `/api/health` 是否返回正常
- 通行证图片是否显示
- 神话级 3D 模型是否能加载
- 更新公告页面是否能读取补丁数据
- 登录 / 用户相关接口是否正常

## 当前关键路由说明

Nginx 路由分工：

- `/`：前端 SPA，读取 `client/dist/index.html`
- `/assets/`：Vite 构建静态资源，缓存 1 年
- `/mythic/`：3D 模型和图片资源，缓存 30 天，并允许跨域
- `/api/`：反向代理到 Node 后端 `http://localhost:4000/api/`

后端 Express 挂载的主要接口：

```text
/api/maps
/api/battlepass
/api/coins
/api/crafting
/api/shop
/api/player
/api/encyclopedia
/api/patch-notes
/api/auth
/api/health
```

## 常见问题

### 页面刷新 404

确保根路由使用：

```nginx
try_files $uri /index.html;
```

### API 404 或无法连接

检查：

```bash
pm2 status
curl http://localhost:4000/api/health
```

确认 Nginx 中：

```nginx
proxy_pass http://localhost:4000/api/;
```

### 静态图或 3D 模型不显示

确认前端已构建：

```bash
npm --prefix client run build
```

确认资源存在于：

```text
/opt/projects/ApexTool/client/dist
```

### 新服务器路径不同

如果项目不放在 `/opt/projects/ApexTool`，需要同步修改 Nginx 中所有 `root` 路径，以及 PM2 的启动目录。
