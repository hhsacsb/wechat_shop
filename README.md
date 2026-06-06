# 微信小程序在线商城

基于 **Taro 4 + React 18 + TypeScript** 构建的跨端微信小程序电商项目。

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | [Taro 4.1.9](https://taro-docs.jd.com/) (跨端框架) |
| 视图层 | React 18 + JSX |
| 语言 | TypeScript 5 |
| 样式 | Sass (SCSS Modules) |
| 状态管理 | Zustand 4 |
| 工具库 | classnames、dayjs |
| 构建工具 | Webpack 5 + Babel |
| 目标平台 | 微信小程序 (weapp) |

## 项目结构

```
app_shop/
├── config/                    # Taro 编译配置
│   ├── index.ts              # 公共配置 (设计稿375, CSS Modules)
│   ├── dev.ts                # 开发环境
│   └── prod.ts               # 生产环境
├── src/
│   ├── components/            # 公共组件
│   │   ├── EmptyState/       # 空状态占位
│   │   └── ProductCard/      # 商品卡片 (grid/list 双模式)
│   ├── data/                  # Mock 数据层
│   │   ├── home.ts           # 首页数据
│   │   ├── product.ts        # 商品数据
│   │   ├── cart.ts           # 购物车数据
│   │   ├── order.ts          # 订单数据
│   │   └── user.ts           # 用户数据
│   ├── pages/                 # 16 个页面
│   │   ├── home/             # 首页 — 轮播图 + 分类导航 + 推荐
│   │   ├── category/         # 分类 — 左右双栏
│   │   ├── cart/             # 购物车 — 全选/数量/结算
│   │   ├── mine/             # 我的 — 订单入口 + 功能菜单
│   │   ├── search/           # 搜索
│   │   ├── product-list/     # 商品列表 — 综合/销量/价格排序
│   │   ├── product-detail/   # 商品详情 — SKU选择 + 加购
│   │   ├── order-confirm/    # 确认订单 — 地址/优惠券/备注
│   │   ├── order-list/       # 订单列表 — Tab 切换
│   │   ├── order-detail/     # 订单详情
│   │   ├── pay-result/       # 支付结果
│   │   ├── address-list/     # 地址列表
│   │   ├── address-edit/     # 地址编辑
│   │   ├── coupon/           # 优惠券
│   │   ├── after-sale/       # 售后申请
│   │   └── after-sale-list/  # 售后记录
│   ├── services/
│   │   └── request.ts        # HTTP 请求封装
│   ├── store/
│   │   └── cart.ts           # 购物车状态 (Zustand)
│   ├── styles/
│   │   ├── variables.scss    # SCSS 变量 + Mixin
│   │   ├── theme.scss        # 主题配色 (品牌色 #FF5A3C)
│   │   └── compat.scss       # 兼容样式
│   ├── types/
│   │   └── index.ts          # 全局类型定义
│   ├── app.config.ts         # 小程序配置文件
│   ├── app.tsx               # 应用入口
│   └── app.scss              # 全局样式
├── dist/                      # 构建产物
├── types/                     # 类型声明
└── project.config.json       # 微信小程序项目配置
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

```bash
# 安装依赖
npm install

# 开发模式（微信小程序）
npm run dev:weapp

# 生产构建
npm run build:weapp
```

### 跨平台构建

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