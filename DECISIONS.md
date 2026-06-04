# DECISIONS.md — 关键决策记录 (ADRs)

---

### ADR-001 使用 demoApi 替代 MSW 进行 Mock 数据

- **Decision**: 移除 MSW，所有数据层使用 `demoApi`（`setTimeout` 封装）模拟异步
- **Reason**: MSW v2 的 CJS→ESM 预打包与 Vite/rolldown 存在兼容冲突，增加维护负担；项目为纯前端原型，无需真实 HTTP 层
- **Rejected Alternatives**: 保留 MSW v2、升级到 MSW v3、使用 json-server
- **Consequence**: 无 MSW 依赖；未来对接后端时需将 `demoApi` 替换为真实 HTTP 调用
- **Status**: Accepted

---

### ADR-002 使用 patches/es-toolkit/compat + Vite aliases 修复 es-toolkit CJS 兼容问题

- **Decision**: 在 `patches/es-toolkit/compat/` 中创建 11 个纯 ESM shim 文件，通过 Vite `resolve.alias` 映射
- **Reason**: recharts 依赖 es-toolkit/compat，但 es-toolkit 的 CJS compat 模块在 Vite/rolldown 预打包中触发 `require_isUnsafeProperty` 异常导致页面白屏
- **Rejected Alternatives**: 使用 Vite 插件 patch es-toolkit 的 `exports` 字段（会破坏 rolldown 生产构建）
- **Consequence**: `vite.config.ts` 中有 11 个别名条目；`patches/es-toolkit/compat/` 有 11 个 shim 文件需要维护
- **Status**: Accepted

---

### ADR-003 ErrorBoundary 使用 `key={location.pathname}` 实现路由级错误重置

- **Decision**: 在 `App.tsx` 中用 `<ErrorBoundary key={location.pathname}>` 包裹 `<Routes>`
- **Reason**: React Router 导航时 ErrorBoundary 默认不会重置错误状态；key 变化强制卸载/重挂 ErrorBoundary 以清除错误
- **Rejected Alternatives**: 在 ErrorBoundary 内部监听 `useLocation` 手动重置状态
- **Consequence**: 每次导航重新挂载 ErrorBoundary，开销可忽略
- **Status**: Accepted

---

### ADR-004 共享表单样式统一到 form.module.css

- **Decision**: 创建 `src/styles/form.module.css` 包含 `.fullWidth`、`.textarea`（max-height: 180px）、`.marginTop`，所有页面引用 `formStyles.*`
- **Reason**: 之前 11 个文件各自定义同名 `.fullWidth` class，重复且不一致
- **Rejected Alternatives**: 使用 Tailwind `w-full`（但项目已同时使用 CSS Modules）
- **Consequence**: 表单样式统一管理，新增页面直接导入 `formStyles`
- **Status**: Accepted

---

### ADR-005 UI 使用中文 + 真实中文企业 Mock 名称

- **Decision**: 页面文字使用中文，Mock 数据中的人名/公司名使用真实感中文名称
- **Reason**: B2B 运维平台在国内使用，中文界面和中文示例数据更符合使用场景
- **Rejected Alternatives**: 英文 UI、通用占位符（"Test Company"）
- **Consequence**: 所有显示文字为中文；Mock 数据随业务需要扩展中文名称
- **Status**: Accepted

---

### ADR-006 Legacy 页面清理删除

- **Decision**: 删除 `src/pages/` 下所有 Legacy 页面（72+ 文件），仅保留 `NotFoundPage`
- **Reason**: Legacy 路由已在 `src/app/router.tsx` 中由 `LegacyRoutePage` / `Navigate` 替代，代码不再被使用；删除减少维护负担
- **Rejected Alternatives**: 保留 frozen 代码、逐渐重写每个 Legacy 页面
- **Consequence**: 代码库减少 ~14,500 行；`src/services/` 和 `src/mock/` 保留但不再被任何活跃路由引用
- **Status**: Accepted

---

### ADR-007 使用 BrowserRouter 替代 HashRouter

- **Decision**: 使用 `BrowserRouter` + `basename='/ai-ops-platform/'`（`src/main.tsx`）
- **Reason**: 配合 Vite 部署配置，URL 路径更语义化；GitHub Pages 通过 SPA 重定向支持
- **Rejected Alternatives**: HashRouter（URL 含 `#`，不美观）
- **Consequence**: 生产部署需确保 GitHub Pages 正确处理 SPA 回退（当前 `public/` 无 `404.html`，需核实是否生效）
- **Status**: Accepted（决策时间需核实 — 代码已使用 BrowserRouter，但日期不详）
