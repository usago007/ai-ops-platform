# AGENTS.md — AI Coding Agent 项目规则

本文件为 AI coding agent（Claude Code、Cursor、Copilot 等）提供项目级行为约束和开发规则。

---

## 1. 项目架构概览

本项目使用**单层架构**（V1 活跃），Legacy 页面已于 2026-06 清理完成。

| 层级 | 路由 | 源码目录 | 状态 |
|------|------|----------|------|
| **V1 (当前唯一)** | `/overview`, `/cs/workspace`, `/leads/:id`, `/product/list`, `/sys/*` | `src/modules/`, `src/adapters/`, `src/contracts/`, `src/domain/` | 活跃开发中 |
| **Legacy** | 已全部删除 | `src/pages/` 仅剩 `NotFoundPage.tsx` | **已删除** |

- **路由来源**：`src/app/router.tsx` 是唯一路由定义。`src/router/index.tsx` 已被删除。
- **Router 类型**：`BrowserRouter` + `basename='/ai-ops-platform/'`（`src/main.tsx`）
- 所有页面通过 `React.lazy()` 懒加载。

---

## 2. UI / 交互 / 布局风格规则

- **显示文字使用中文**（B2B 平台惯例）
- **Mock 用户/公司名称使用真实感中文企业名称**（非占位符如"Test Company"）
- **品牌主色 `#1d4ed8`，通过 CSS 变量 `var(--brand-primary)` 引用**，禁止在 JSX/TSX 中硬编码 hex
- **高度使用 `100vh` 而非 `100dvh`**（桌面端专用）
- **语义 HTML**：只有 `MainLayout` 使用 ARIA roles，其他页面不添加
- **加载状态**：使用 antd `<Spin>` 组件，带 `description` 属性显示中文提示文字
- **空状态**：使用 antd `<Empty>` 组件，而非纯文本
- **表单布局**：多列表单项使用 `Row gutter={[16, 16]}`；TextArea 通过 CSS `max-height: 180px` 约束高度
- **图表**：recharts 中 Line/Area 图表需配置 `activeDot`；PieChart 的 label 显示百分比而非原始数值

---

## 3. 组件复用规则

- 表单通用样式从 `src/styles/form.module.css` 导入（`.fullWidth`, `.textarea`, `.marginTop`）
- 路由级 ErrorBoundary 使用 `src/components/ErrorBoundary/index.tsx`，在 App.tsx 中以 `<ErrorBoundary key={location.pathname}>` 方式包裹
- **不要重复定义 `.fullWidth` class** — 使用 `formStyles.fullWidth`
- FunnelChart 为自定义图表组件（`src/components/FunnelChart/`），需处理空状态

---

## 4. 数据层规则

### V1 数据层（`src/adapters/`）— 唯一活跃层
- 使用中央 `store`（`src/adapters/mock/store.ts`）+ 各实体 adapter（`mockConversationAdapter` 等）
- adapter 保留模拟延迟，但必须通过统一 `mockDelay(tier)` 按场景分层配置（read / aggregate / mutation / aiAction）；禁止使用无差别的大范围随机延迟导致页面加载体验不稳定
- 新增功能使用 adapter，不要新增 service

### Legacy 数据层（`src/services/` + `src/mock/`）— 已冻结
- 不再使用（对应的 Legacy 页面已删除），保留仅作参考。
- 所有调用通过 `demoApi`（`setTimeout` 封装的 Promise）。
- MSW 已完全移除。

---

## 5. 文件修改边界

### 禁止修改
- `vite.config.ts` 中的 11 个 es-toolkit compat 别名
- `patches/es-toolkit/compat/` 下的 11 个 ESM shim 文件
- 路由结构（BrowserRouter + base `/ai-ops-platform/`）
- `.claude/product-baseline.md`（产品基线，永久规则，不可编辑）

### 修改前需确认
- 目标文件属于 `src/modules/` 或 `src/adapters/` 或 `src/contracts/` 或 `src/domain/`
- 遵循四层分离：contracts 定义类型、domain 处理逻辑、adapters 提供数据、modules 渲染页面

---

## 6. 禁止过度设计

- 不要引入额外状态管理库（zustand 已够用）
- 不要添加真实 HTTP 请求库（项目为纯 Mock）
- 不要添加 PWA、SSR、SSG 能力
- 不要添加用户认证/权限系统（除非明确要求）
- 不要引入 MSW（已移除，不会再使用）
- 不要改造 `src/services/` 或 `src/mock/`（已冻结）
- 不要尝试恢复已删除的 Legacy 页面
- 不要提交 GitHub（除非用户明确要求 push）

---

## 7. 每次修改后的检查要求

- `npm run lint` — 确认无新增 lint 问题
- `npm run dev` — 确认开发服务器可正常启动
- 手动访问修改页面对应的路由确认正常渲染
- 如修改了 `src/app/router.tsx`，确认路由跳转逻辑正常
