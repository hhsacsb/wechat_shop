# 微信小程序在线商城（全栈）

基于 **Taro 4 + React 18 + TypeScript** 构建的全栈电商项目，包含微信小程序端、NestJS 后端 API、React 管理后台三部分。

## 项目架构

```
app_shop/
├── client/                    # 微信小程序（Taro）
│   ├── src/
│   ├── config/
│   └── ...
├── server/
│   ├── api/                   # 后端 API（NestJS + TypeORM + MySQL）
│   └── admin/                 # 管理后台（Vite + React + Ant Design）
└── ...
```

## 技术栈

### 小程序端 (client)
| 类别 | 选型 |
|------|------|
| 框架 | [Taro 4.1.9](https://taro-docs.jd.com/) (跨端框架) |
| 视图层 | React 18 + JSX |
| 语言 | TypeScript 5 |
| 样式 | Sass (SCSS Modules) |
| 状态管理 | Zustand 4 |
| 构建工具 | Webpack 5 + Babel |
| 目标平台 | 微信小程序 (weapp) |

### 后端 API (server/api)
| 类别 | 选型 |
|------|------|
| 框架 | [NestJS 11](https://nestjs.com/) |
| 语言 | TypeScript 5 |
| ORM | [TypeORM](https://typeorm.io/)（synchronize 自动同步） |
| 数据库 | MySQL 9 + mysql2 |
| 认证 | JWT + Passport |
| 校验 | class-validator + class-transformer |

### 管理后台 (server/admin)
| 类别 | 选型 |
|------|------|
| 框架 | [Vite 6](https://vitejs.dev/) + [React 18](https://react.dev/) |
| UI 库 | [Ant Design 5](https://ant.design/) |
| 路由 | React Router 6 |
| HTTP | 原生 fetch + Vite 代理 |

## 小程序端项目结构

```
client/                     # 小程序源码
├── config/                 # Taro 编译配置
│   ├── index.ts           # 公共配置 (设计稿375, CSS Modules)
│   ├── dev.ts             # 开发环境
│   └── prod.ts            # 生产环境
├── src/
│   ├── components/         # 公共组件
│   │   ├── EmptyState/    # 空状态占位
│   │   └── ProductCard/   # 商品卡片 (grid/list 双模式)
│   ├── pages/              # 16 个页面
│   │   ├── home/          # 首页 — 轮播图 + 分类导航 + 推荐
│   │   ├── category/      # 分类 — 左右双栏
│   │   ├── cart/          # 购物车 — 全选/数量/结算
│   │   ├── mine/          # 我的 — 订单入口 + 功能菜单
│   │   ├── search/        # 搜索
│   │   ├── product-list/  # 商品列表 — 综合/销量/价格排序
│   │   ├── product-detail/# 商品详情 — SKU选择 + 加购
│   │   ├── order-confirm/ # 确认订单 — 地址/优惠券/备注
│   │   ├── order-list/    # 订单列表 — Tab 切换
│   │   ├── order-detail/  # 订单详情
│   │   ├── pay-result/    # 支付结果
│   │   ├── address-list/  # 地址列表
│   │   ├── address-edit/  # 地址编辑
│   │   ├── coupon/        # 优惠券
│   │   ├── after-sale/    # 售后申请
│   │   └── after-sale-list/ # 售后记录
│   ├── services/
│   │   └── request.ts     # HTTP 请求封装
│   ├── store/
│   │   └── cart.ts        # 购物车状态 (Zustand)
│   ├── styles/
│   │   ├── variables.scss # SCSS 变量 + Mixin
│   │   ├── theme.scss     # 主题配色 (品牌色 #FF5A3C)
│   │   └── compat.scss    # 兼容样式
│   ├── types/
│   │   └── index.ts       # 全局类型定义
│   ├── app.config.ts      # 小程序配置文件
│   ├── app.tsx            # 应用入口
│   └── app.scss           # 全局样式
├── dist/                   # 构建产物
├── types/                  # 类型声明
└── project.config.json    # 微信小程序项目配置
```

## 功能特性

### 核心交易链路
- **首页**: 轮播图展示、分类图标导航、热门推荐、新品上市横向滚动
- **分类**: 左侧一级分类 + 右侧子分类及推荐商品，双栏联动
- **商品列表**: grid/list 双模式切换、综合/销量/价格排序筛选
- **商品详情**: 图片轮播、SKU 规格选择、一键加购、商品详情展示
- **购物车**: 勾选/全选、数量加减、删除商品、实时金额汇总、结算入口
- **确认订单**: 收货地址选择、优惠券使用、订单备注、金额明细
- **支付结果**: 支付成功/失败状态展示、跳转订单详情

### 订单管理
- **订单列表**: Tab 切换（全部/待付款/待发货/待收货/待评价/已完成）
- **订单详情**: 订单状态、商品信息、收货地址、支付信息、操作按钮

### 地址管理
- **地址列表**: 默认地址标识、编辑/删除操作
- **地址编辑**: 新增/修改收货地址、表单校验

### 营销与售后
- **优惠券**: 可用/已用/过期状态展示、满减金额显示
- **售后申请**: 退款/退货类型选择、原因选择、凭证上传、金额填写
- **售后记录**: 售后订单列表、状态跟踪

### 个人中心
- **用户信息**: 头像、昵称、手机号展示
- **订单快捷入口**: 全部订单/待付款/待发货/待收货/待评价
- **功能菜单**: 收货地址、我的优惠券、售后记录、联系客服、设置

### 搜索功能
- **搜索页**: 关键词搜索、搜索历史、热门搜索推荐

### 状态管理
- **购物车状态**: 基于 Zustand 实现，支持加购、改价、勾选、删除、金额计算
- **Mock 数据层**: 完整的本地 Mock 数据，覆盖首页、商品、购物车、订单、用户

### 基础设施
- **API 请求封装**: 统一拦截、错误提示、支持 GET/POST/PUT/DELETE
- **全局类型定义**: TypeScript 类型覆盖商品、SKU、订单、地址、优惠券、售后等
- **设计规范**: 375px 基准设计稿、8px 间距网格、品牌色 `#FF5A3C`

## 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) >= 18
- [MySQL](https://dev.mysql.com/) >= 8（后端 API 需要）
- 微信小程序开发者工具（小程序端需要）

---

### 1. 后端 API (server/api)

```bash
# 进入目录
cd server/api

# 安装依赖
npm install

# 配置环境变量
# 复制或编辑 .env 文件，确保数据库连接信息正确
# DB_HOST=localhost
# DB_PORT=3306
# DB_USERNAME=root
# DB_PASSWORD=your_password
# DB_DATABASE=wechat_shop
# DB_SYNC=true   # 开发阶段建议 true，生产环境设为 false

# 开发模式启动（热重载）
npm run start:dev

# 生产模式启动
npm run build          # 编译
npm run start:prod     # 启动（node dist/main）

# 启动后访问 http://localhost:3000
```

> **说明：** TypeORM 的 `synchronize: true` 会在启动时自动同步数据库表结构，通常无需手动创建表。仅需先在 MySQL 中创建好数据库（如 `CREATE DATABASE wechat_shop;`）。

---

### 2. 管理后台 (server/admin)

```bash
# 进入目录
cd server/admin

# 安装依赖
npm install

# 开发模式启动（热重载，需同时启动后端 API）
npm run dev
# 访问 http://localhost:5173
# Vite 会自动将 /api 请求代理到 http://localhost:3000

# 生产构建（生成 dist 文件夹，用于 IIS 部署）
npm run build
```

---

### 3. 微信小程序 (client)

```bash
# 进入目录
cd client

# 安装依赖
npm install

# 开发模式（编译到微信小程序）
npm run dev:weapp

# 生产构建
npm run build:weapp

# 使用微信小程序开发者工具打开 client/dist 目录
```

#### 跨平台构建

```bash
npm run build:swan      # 百度小程序
npm run build:alipay    # 支付宝小程序
npm run build:tt        # 头条小程序
npm run build:h5        # H5
npm run build:rn        # React Native
```

## 设计规范

- **设计稿基准**: 375px (750rpx)
- **品牌色**: `#FF5A3C` (活力橙)
- **间距系统**: 8px 网格
- **CSS Modules**: 仅 `*.module.scss` 文件生效

## API 对接

API 请求封装位于 `src/services/request.ts`，默认 BASE_URL 为占位地址。替换为实际后端地址即可对接。

### 接口响应格式

```typescript
interface ApiResponse<T> {
  code: number    // 0 表示成功
  message: string
  data: T
}
```

## 管理后台

管理后台位于 `server/admin`，基于 Vite + React + Ant Design。由 NestJS 后端在 `server/api` 中统一提供静态文件服务。

### 本地开发

```bash
cd server/admin
npm install
npm run dev          # 访问 http://localhost:5173（Vite 代理 /api 到 localhost:3000）
```

### 生产部署

管理后台无需单独部署，由后端 API 自动托管：

#### 1. 构建前端

```bash
cd server/admin
npm install
npm run build        # 生成 dist 文件夹
```

#### 2. 启动后端 API

后端（[server/api/src/main.ts](file:///e:/webchat_Application/app_shop/server/api/src/main.ts)）会自动 serve `server/admin/dist` 目录的静态文件，并将所有非 `/api` 路由重写到 `index.html`（SPA 支持）。

```bash
cd server/api
npm run start:prod   # 或 npm run start:dev
```

#### 3. 访问

浏览器打开 `http://localhost:3000` 即可同时访问：

- 管理后台页面 → `http://localhost:3000/`（自动跳转到仪表盘）
- 后端 API → `http://localhost:3000/api/...`
- SPA 子路由 → `http://localhost:3000/dashboard` 等

> **注意：** 由于前端和后端在**同一端口（3000）**，`/api/xxx` 请求自动访问到后端，无需额外配置代理或跨域。

---

### 绑定域名到管理后台（IIS + ARR 反向代理）

如果需要用域名（如 `admin.xxx.com`）通过 80/443 端口访问管理后台，使用 IIS + ARR 做反向代理。

#### 1. 安装 ARR 模块

下载并安装 [IIS Application Request Routing (ARR) 3.0](https://www.iis.net/downloads/microsoft/application-request-routing)。

安装后在 IIS 管理器中启用代理：

```
IIS 管理器 → 服务器根节点（顶层的那个）
  → Application Request Routing Cache
    → Server Proxy Settings
      → 勾选 "Enable proxy" → 应用
```

#### 2. 新建 IIS 网站

- 物理路径指向 `server/admin/proxy`（此文件夹仅包含 web.config）
- 绑定你的域名和端口（如 80 或 443）
- 如果要用 HTTPS/SSL，在站点绑定中上传证书

#### 3. web.config 说明

[proxy/web.config](file:///e:/webchat_Application/app_shop/server/admin/proxy/web.config) 会将所有请求转发到后端 NestJS：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Reverse Proxy to NestJS" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:3000/{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

#### 4. 请求链路

```
用户访问 http://admin.xxx.com
    ↓ DNS 解析到服务器 IP
IIS 端口 80/443（已装 ARR）
    ↓ 反向代理 http://localhost:3000/{路径}
NestJS（管理后台页面 + API）
```

> **注意：** 确保服务器上 NestJS 后端（`npm run start:prod`）一直在运行。推荐使用 [PM2](https://pm2.keymetrics.io/) 进程管理，后台自动重启。