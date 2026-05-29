# CLAUDE.md - AI 记账助手

## 项目概述
手机端 AI 记账助手 PWA（React + TypeScript + Vite），自然语言输入记账，IndexedDB 本地存储，按月生成消费报表。

## 文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 需求规格 | [docs/requirements.md](docs/requirements.md) | 功能需求、用户场景、非功能需求 |
| 技术方案 | [docs/tech-stack.md](docs/tech-stack.md) | 技术选型、架构分层、数据流 |
| 设计规范 | [docs/design-spec.md](docs/design-spec.md) | 色板、字体、间距、触控热区 |
| 执行计划 | [docs/implementation.md](docs/implementation.md) | 分阶段步骤（勾选进度） |
| 分类体系 | [docs/category-system.md](docs/category-system.md) | 支出/收入分类及关键词映射 |
| 解析引擎 | [docs/nlp-engine.md](docs/nlp-engine.md) | NLP 解析规则、正则、优先级 |
| 开发日志 | [DEVLOG.md](DEVLOG.md) | 每日完成事项与待办 |

## 工作约定

1. **逐步推进**：按 `docs/implementation.md` 的阶段顺序执行，每步验证后再进入下一步
2. **开发日志**：每次完成一个功能模块后，更新 `DEVLOG.md` 记录完成事项
3. **参考规范**：修改 UI 前查阅 `docs/design-spec.md`；修改分类前查阅 `docs/category-system.md`
4. **不引入非必要依赖**：保持轻量，能用 CSS Module 就不用 UI 库
5. **优先移动端**：所有 UI 以 375-414px 宽度为基准设计，触控热区 ≥ 44px
6. **纯本地运行**：不引入任何后端服务或云 API
7. **提交前验证**：`npm run dev` 确认功能正常后再进入下一步

## 常用命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 生产构建
npm run preview    # 预览生产构建
```
