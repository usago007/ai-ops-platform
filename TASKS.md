# TASKS.md — 待办任务清单

---

### T-001 修剪重复 UI 库（基础架构）

- **Scope**: `package.json`, V1 模块组件
- **Goal**: 去掉 Radix UI 或 echarts 之一，统一图表库和 UI 组件体系
- **Files / Modules**: 全局（`package.json` + 涉及组件，分布在 `src/modules/` 各目录）
- **Status**: Pending
- **Priority**: Medium
- **Acceptance**: `npm ls @radix-ui/*` 不返回任何包，或 `npm ls echarts` 不返回；所有使用方迁移到保留的库
- **Note**: 需先核实 Radix UI 和 echarts 在 `src/modules/` 中的实际使用分布

---

### T-002 统一表单方案

- **Scope**: V1 模块中含表单的页面（`src/modules/`）
- **Goal**: 统一使用 antd Form 或 react-hook-form 之一，消除混用
- **Files / Modules**: 需核实当前分别使用了哪些方案
- **Status**: Pending
- **Priority**: Low
- **Acceptance**: 所有表单使用同一套方案

---

### T-003 降低或关闭 no-explicit-any 规则

- **Scope**: `eslint.config.js`
- **Goal**: 将 `@typescript-eslint/no-explicit-any` 降为 `warn`，消除 ~90 个 lint error
- **Files / Modules**: `eslint.config.js`
- **Status**: Pending
- **Priority**: High
- **Acceptance**: lint error 数量大幅下降（预期从 ~169 降至 ~80）

---

### T-004 清理未使用的 import 和变量（V1 页面）

- **Scope**: `src/modules/` 下所有页面文件
- **Goal**: 删除 `@typescript-eslint/no-unused-vars` 报错的 import 和变量
- **Files / Modules**: 需核实 V1 页面中的未使用变量
- **Status**: Pending
- **Priority**: Medium
- **Acceptance**: lint 中不再有 `no-unused-vars`

---

### T-005 处理 Math.random 调用导致的 react-hooks/purity 问题

- **Scope**: `src/modules/system/ObservabilityPage.tsx`（需核实）
- **Goal**: 将 `Math.random()` 调用从组件函数体移至 `useMemo` 或自定义 hook 中
- **Files / Modules**: `ObservabilityPage.tsx`
- **Status**: Pending
- **Priority**: Low
- **Acceptance**: `react-hooks/purity` 不再报错

---

### T-006 将 autoprefixer 和 postcss 移至 devDependencies

- **Scope**: `package.json`
- **Goal**: `autoprefixer` 和 `postcss` 当前在 `dependencies`，应为 `devDependencies`
- **Files / Modules**: `package.json`
- **Status**: Pending
- **Priority**: Low
- **Acceptance**: `npm ls autoprefixer postcss` 显示 dev 而非生产依赖

---

### T-007 确认 GitHub Pages SPA 回退配置是否生效

- **Scope**: GitHub Pages 部署
- **Goal**: 确认 BrowserRouter 在 GitHub Pages 上正确工作（当前 `public/` 无 `404.html`）
- **Files / Modules**: `public/` + GitHub Actions workflow
- **Status**: Pending
- **Priority**: Medium
- **Acceptance**: 直接访问非根路径（如 `/ai-ops-platform/overview`）返回正确页面而非 404
