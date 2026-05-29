# 技术方案

## 技术选型

| 层面 | 技术 | 选型理由 |
|------|------|----------|
| 构建工具 | Vite 6 | 开发热更新快，PWA 插件成熟 |
| UI 框架 | React 18 + TypeScript | 生态丰富，类型安全 |
| 路由 | React Router v7 | SPA 页面切换 |
| 状态管理 | Zustand 5 | 轻量无模板，适合中小应用 |
| 数据库 | Dexie.js 4 | IndexedDB 封装，Promise API |
| 图表 | ECharts 5 | 移动端渲染性能好，中文友好 |
| PWA | vite-plugin-pwa | Vite 原生集成，配置简洁 |
| 样式 | CSS Module | 零运行时，天然隔离 |

## 架构分层

```
src/
├── components/        # 通用组件（TabBar, Button, Input...）
├── pages/             # 页面（Home, AddRecord, Records, Report）
├── engine/            # NLP 解析引擎
├── db/                # Dexie 数据库定义 & CRUD
├── store/             # Zustand stores
├── hooks/             # 自定义 hooks
├── styles/            # 全局样式 & CSS 变量
└── utils/             # 工具函数
```

## 数据流

```
用户输入 → NLP引擎解析 → 展示确认 → Zustand Store → Dexie CRUD → IndexedDB
                                                          ↓
报表/列表 ← Zustand Store ← Dexie Query ← IndexedDB
```
