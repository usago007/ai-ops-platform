/**
 * App Router — V1 主链路路由（单一真相源）
 *
 * 此文件只导出 routerConfig 常量（非组件），Vite react-refresh 已排除。
 */
/* eslint-disable react-refresh/only-export-components */

import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

// ── V1 module pages ──
const ConversationWorkbench = lazy(() => import('@/modules/conversation'))
const LeadDetailPage = lazy(() => import('@/modules/lead'))
const SolutionReviewPage = lazy(() => import('@/modules/solution'))
const ReplyEditPage = lazy(() => import('@/modules/reply'))
const OutcomeRecordPage = lazy(() => import('@/modules/outcome').then(m => ({ default: m.OutcomeRecordPage })))
const OutcomeDetailPage = lazy(() => import('@/modules/outcome').then(m => ({ default: m.OutcomeDetailPage })))
const KnowledgeItemDetailPage = lazy(() => import('@/modules/knowledge'))
const ROIOverviewPage = lazy(() => import('@/modules/overview'))
const ProductAssetListPage = lazy(() => import('@/modules/product').then(m => ({ default: m.ProductAssetListPage })))
const ProductAssetDetailPage = lazy(() => import('@/modules/product').then(m => ({ default: m.ProductAssetDetailPage })))
const LeadListPage = lazy(() => import('@/modules/lead').then(m => ({ default: m.LeadListPage })))
const OutcomeListPage = lazy(() => import('@/modules/outcome').then(m => ({ default: m.OutcomeListPage })))
const KnowledgeListPage = lazy(() => import('@/modules/knowledge').then(m => ({ default: m.KnowledgeListPage })))
const LegacyIndexPage = lazy(() => import('@/modules/legacy').then(m => ({ default: m.LegacyIndexPage })))
const LegacyRoutePage = lazy(() => import('@/modules/legacy').then(m => ({ default: m.LegacyRoutePage })))

// ── V2 System module routes ──
const NewSystemStatusPage = lazy(() => import('@/modules/system/SystemStatusPage').then(m => ({ default: m.SystemStatusPage })))
const NewAuditLogPage = lazy(() => import('@/modules/system/AuditLogPage').then(m => ({ default: m.AuditLogPage })))
const NewModelConfigPage = lazy(() => import('@/modules/system/ModelConfigPage').then(m => ({ default: m.ModelConfigPage })))
const NewAgentOrchestrationPage = lazy(() => import('@/modules/system/AgentOrchestrationPage').then(m => ({ default: m.AgentOrchestrationPage })))
const ModelDetailPage = lazy(() => import('@/modules/system/ModelDetailPage').then(m => ({ default: m.ModelDetailPage })))
const AgentDetailPage = lazy(() => import('@/modules/system/AgentDetailPage').then(m => ({ default: m.AgentDetailPage })))
const AuditEntryDetailPage = lazy(() => import('@/modules/system/AuditEntryDetailPage').then(m => ({ default: m.AuditEntryDetailPage })))
const BusinessMetricsPage = lazy(() => import('@/modules/system/BusinessMetricsPage').then(m => ({ default: m.BusinessMetricsPage })))
const AICostPage = lazy(() => import('@/modules/system/AICostPage').then(m => ({ default: m.AICostPage })))
const ObservabilityPage = lazy(() => import('@/modules/system/ObservabilityPage').then(m => ({ default: m.ObservabilityPage })))

// ── 404 ──
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

export const routerConfig = [
  // ── V1 Main chain routes ──
  { path: '/', element: <Navigate to="/overview" replace /> },
  { path: '/cs/workspace', element: <ConversationWorkbench /> },
  { path: '/leads/:id', element: <LeadDetailPage /> },
  { path: '/leads/:leadId/solution', element: <SolutionReviewPage /> },
  { path: '/leads/:leadId/reply', element: <ReplyEditPage /> },
  { path: '/leads/:leadId/outcome', element: <OutcomeRecordPage /> },
  { path: '/outcome/:id', element: <OutcomeDetailPage /> },
  { path: '/knowledge/:id', element: <KnowledgeItemDetailPage /> },
  { path: '/overview', element: <ROIOverviewPage /> },
  { path: '/product/list', element: <ProductAssetListPage /> },
  { path: '/product/:id', element: <ProductAssetDetailPage /> },
  { path: '/leads/list', element: <LeadListPage /> },
  { path: '/outcome/list', element: <OutcomeListPage /> },
  { path: '/knowledge/list', element: <KnowledgeListPage /> },

  // ── V2 System base routes (AI 融入底座) ──
  { path: '/sys/dashboard', element: <NewSystemStatusPage /> },
  { path: '/sys/audit-log', element: <NewAuditLogPage /> },
  { path: '/sys/model-config', element: <NewModelConfigPage /> },
  { path: '/sys/agent-orchestration', element: <NewAgentOrchestrationPage /> },
  { path: '/sys/model-config/:id', element: <ModelDetailPage /> },
  { path: '/sys/agent-orchestration/:id', element: <AgentDetailPage /> },
  { path: '/sys/audit-log/:id', element: <AuditEntryDetailPage /> },

  // ── LEGACY — 冻结隔离区（只读入口，不可新增） ──
  { path: '/legacy', element: <LegacyIndexPage /> },

  // Legacy: 全部冻结 — 统一用 LegacyRoutePage 承接
  { path: '/legacy/inquiry/list', element: <LegacyRoutePage title="旧询价列表" description="旧询价列表已冻结，请使用新线索列表查看所有业务线索。" replacementLabel="线索列表" replacementPath="/leads/list" /> },
  { path: '/legacy/inquiry/quotation-list', element: <LegacyRoutePage title="旧报价列表" description="旧报价列表已冻结。" replacementLabel="历史页面隔离区" replacementPath="/legacy" /> },
  { path: '/legacy/inquiry/quotation/:id', element: <LegacyRoutePage title="旧报价编辑" description="旧报价编辑已冻结。" replacementLabel="历史页面隔离区" replacementPath="/legacy" /> },
  { path: '/legacy/inquiry/quotation-detail/:id', element: <LegacyRoutePage title="旧报价详情" description="旧报价详情已冻结。" replacementLabel="历史页面隔离区" replacementPath="/legacy" /> },
  { path: '/legacy/inquiry/transform', element: <LegacyRoutePage title="旧询价转化" description="旧询价转化页已冻结。" replacementLabel="客服工作台" replacementPath="/cs/workspace" /> },
  { path: '/legacy/inquiry/manual-entry', element: <LegacyRoutePage title="旧手动录入" description="旧手动录入页已冻结。" replacementLabel="客服工作台" replacementPath="/cs/workspace" /> },
  { path: '/legacy/inquiry/result', element: <LegacyRoutePage title="旧询价结果" description="旧询价结果页已冻结。" replacementLabel="客服工作台" replacementPath="/cs/workspace" /> },
  { path: '/legacy/biz/overview', element: <LegacyRoutePage title="旧业务概览" description="旧业务概览已冻结。" replacementLabel="AI 经营总览" replacementPath="/overview" /> },
  { path: '/legacy/mkt/overview', element: <LegacyRoutePage title="旧营销概览" description="旧营销概览已冻结。" replacementLabel="AI 经营总览" replacementPath="/overview" /> },
  { path: '/legacy/marketing/create', element: <LegacyRoutePage title="旧内容生成" description="旧内容生成页已冻结。" replacementLabel="历史页面隔离区" replacementPath="/legacy" /> },
  { path: '/legacy/selling-point', element: <LegacyRoutePage title="旧卖点提炼" description="旧卖点提炼页已冻结。" replacementLabel="历史页面隔离区" replacementPath="/legacy" /> },
  { path: '/legacy/selling-point/:productId', element: <LegacyRoutePage title="旧卖点提炼" description="旧卖点提炼页已冻结。" replacementLabel="历史页面隔离区" replacementPath="/legacy" /> },
  { path: '/legacy/landing-page/preview', element: <LegacyRoutePage title="旧落地页预览" description="旧落地页预览已冻结。" replacementLabel="历史页面隔离区" replacementPath="/legacy" /> },
  { path: '/legacy/rules', element: <LegacyRoutePage title="旧规则归纳" description="旧规则归纳页已冻结。" replacementLabel="历史页面隔离区" replacementPath="/legacy" /> },
  { path: '/legacy/sys/agent-orchestration', element: <LegacyRoutePage title="旧 Agent 编排" description="旧 Agent 编排页已冻结。" replacementLabel="AI 融入底座 / Agent 编排" replacementPath="/sys/agent-orchestration" /> },
  { path: '/legacy/sys/model-config', element: <LegacyRoutePage title="旧模型配置" description="旧模型配置页已冻结。" replacementLabel="AI 融入底座 / 模型配置" replacementPath="/sys/model-config" /> },
  { path: '/legacy/sys/settings', element: <LegacyRoutePage title="旧系统设置" description="旧系统设置页已冻结。" replacementLabel="AI 融入底座 / 系统底座" replacementPath="/sys/dashboard" /> },
  { path: '/legacy/sys/audit-log', element: <LegacyRoutePage title="旧审计日志" description="旧审计日志页已冻结。" replacementLabel="AI 融入底座 / 审计日志" replacementPath="/sys/audit-log" /> },
  { path: '/legacy/sys/users', element: <LegacyRoutePage title="旧用户管理" description="旧用户管理页已冻结。" replacementLabel="AI 融入底座 / 系统底座" replacementPath="/sys/dashboard" /> },
  { path: '/legacy/sys/dashboard', element: <LegacyRoutePage title="旧系统概览" description="旧系统概览页已冻结。" replacementLabel="AI 融入底座 / 系统底座" replacementPath="/sys/dashboard" /> },
  { path: '/product-legacy/:id', element: <LegacyRoutePage title="旧商品详情" description="旧商品详情已冻结。" replacementLabel="商品资产中心" replacementPath="/product/list" /> },
  { path: '/product-legacy/list', element: <LegacyRoutePage title="旧商品列表" description="旧商品列表已冻结。" replacementLabel="商品资产中心" replacementPath="/product/list" /> },

  // ── Compat aliases — 全部 redirect to /legacy ──
  { path: '/inquiry/list', element: <Navigate to="/legacy" replace /> },
  { path: '/inquiry/quotation-list', element: <Navigate to="/legacy" replace /> },
  { path: '/biz/overview', element: <Navigate to="/legacy" replace /> },
  { path: '/mkt/overview', element: <Navigate to="/legacy" replace /> },
  { path: '/product/new', element: <Navigate to="/legacy" replace /> },
  { path: '/product/categories', element: <Navigate to="/legacy" replace /> },

  // ── Sys compat aliases ──
  { path: '/sys-new/dashboard', element: <Navigate to="/sys/dashboard" replace /> },
  { path: '/sys-new/audit-log', element: <Navigate to="/sys/audit-log" replace /> },
  { path: '/sys-new/model-config', element: <Navigate to="/sys/model-config" replace /> },
  { path: '/sys-new/agent-orchestration', element: <Navigate to="/sys/agent-orchestration" replace /> },
  { path: '/sys/business-metrics', element: <BusinessMetricsPage /> },
  { path: '/sys/ai-cost', element: <AICostPage /> },
  { path: '/sys/observability', element: <ObservabilityPage /> },

  // 404
  { path: '*', element: <NotFoundPage /> },
]
