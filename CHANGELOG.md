# CHANGELOG.md — 变更记录

---

## [Unreleased] — 2026-06 Session

### Added
- `patches/es-toolkit/compat/` — 11 个 ESM shim 文件（修复 es-toolkit CJS 兼容问题）
- `src/styles/form.module.css` — 共享表单样式（`.fullWidth`, `.textarea`, `.marginTop`）
- `src/components/ErrorBoundary/index.tsx` — 路由级错误边界组件
- ESLint 配置添加 `globalIgnores(['dist'])`
- `AGENTS.md` — AI agent 行为约束文档
- `DECISIONS.md` — 关键决策记录文档
- `TASKS.md` — 待办任务清单文档
- `CHANGELOG.md` — 本文件

### Changed
- `vite.config.ts` — 添加 11 个 es-toolkit compat Vite aliases
- `src/App.tsx` — ErrorBoundary 包裹路由，`key={location.pathname}`
- `src/main.tsx` — 移除 MSW 导入，恢复为直接 render
- `src/layouts/MainLayout.tsx` — `defaultOpenKeys` 包含所有 3 个分组
- `src/styles/global.css` — 配置调整
- `src/iconMap.ts` — 图标导入调整
- `README.md` — 精简至 ~50 行
- `CLAUDE.md` — 添加 AGENTS.md 前置阅读引用

### Removed
- `src/pages/biz/` — BizOverviewPage（.tsx + .module.css）
- `src/pages/conversion/` — LandingPagePreviewPage（.tsx + .module.css）
- `src/pages/cs/` — CSWorkspacePage（.tsx + .module.css + index.ts）
- `src/pages/inquiry/` — 全部 7 个页面（List, ManualEntry, Result, Transform, QuotationEdit, QuotationDetail, QuotationList）
- `src/pages/marketing/` — ContentCreatePage（.tsx + .module.css + index.ts）
- `src/pages/mkt/` — MktOverviewPage + tabs（ConversionTab, OverviewTab）
- `src/pages/product/` — 全部 5 个页面（List, Detail, New, CategoryDict + index.ts）
- `src/pages/rules/` — RuleListPage（.tsx + .module.css + index.ts）
- `src/pages/selling-point/` — SellingPointPage（.tsx + .module.css + index.ts）
- `src/pages/system/` — AgentOrchestrationPage, ModelConfigPage, SystemSettingsPage, SystemStatusPage, UserManagementPage, AuditLogPage + 全部 9 个 Tab（AICostTab, ArchitectureTab, BusinessValueTab, HealthOverviewTab, LLMGatewayTab, ObservabilityTab, PromptManagementTab, RAGServiceTab, WorkflowEngineTab）+ agent-modals（10 个）+ CSS + types
- `src/pages/system/` — 全部 .module.css + .types.ts
- `src/router/index.tsx` — Legacy 路由文件（已由 `src/app/router.tsx` 替代）
- `public/mockServiceWorker.js` — MSW service worker
- `src/mock/browser.ts`, `src/mock/handlers/`（7 文件）, `src/mock/utils.ts`, `src/mock/ai-log.ts`
- GitHub Pages 部署历史中的 14 个旧记录（保留最新 1 个）

**总计**: 删除 72+ 文件，减少 ~14,500 行代码。

### Fixed
- `require_isUnsafeProperty` 运行时崩溃（es-toolkit CJS 兼容问题）
- PromptCreateModal TextArea rows=10→8、PromptEditModal rows=12→8
- ProductDetailPage 空白 → Empty + 返回按钮
- FunnelChart 空白 → placeholder
- SVG gradient 硬编码 hex → `var(--brand-primary)`（BusinessValueTab, ObservabilityTab — 该文件后随 Legacy 页面删除）
- SellingPointPage 缺失 Typography/useParams/useNavigate/RocketOutlined 导入
- InquiryListPage 缺失 Typography 导入
- AgentOrchestrationPage 缺失 RocketOutlined 导入
- 各 Legacy 页面 catch(e) → catch {}、未使用 import 清理
