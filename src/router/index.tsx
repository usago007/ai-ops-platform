import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

const BizOverviewPage = lazy(() => import('@/pages/biz/BizOverviewPage').then(m => ({ default: m.BizOverviewPage })))
const MktOverviewPage = lazy(() => import('@/pages/mkt/MktOverviewPage').then(m => ({ default: m.MktOverviewPage })))
const InquiryListPage = lazy(() => import('@/pages/inquiry/InquiryListPage').then(m => ({ default: m.InquiryListPage })))
const InquiryTransformPage = lazy(() => import('@/pages/inquiry/InquiryTransformPage').then(m => ({ default: m.InquiryTransformPage })))
const InquiryManualEntryPage = lazy(() => import('@/pages/inquiry/InquiryManualEntryPage').then(m => ({ default: m.InquiryManualEntryPage })))
const InquiryResultPage = lazy(() => import('@/pages/inquiry/InquiryResultPage').then(m => ({ default: m.InquiryResultPage })))
const QuotationListPage = lazy(() => import('@/pages/inquiry/QuotationListPage').then(m => ({ default: m.QuotationListPage })))
const QuotationEditPage = lazy(() => import('@/pages/inquiry/QuotationEditPage').then(m => ({ default: m.QuotationEditPage })))
const QuotationDetailPage = lazy(() => import('@/pages/inquiry/QuotationDetailPage').then(m => ({ default: m.QuotationDetailPage })))
const ProductListPage = lazy(() => import('@/pages/product/ProductListPage').then(m => ({ default: m.ProductListPage })))
const ProductDetailPage = lazy(() => import('@/pages/product/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })))
const ProductNewPage = lazy(() => import('@/pages/product/ProductNewPage').then(m => ({ default: m.ProductNewPage })))
const CategoryDictPage = lazy(() => import('@/pages/product/CategoryDictPage').then(m => ({ default: m.CategoryDictPage })))
const RuleListPage = lazy(() => import('@/pages/rules/RuleListPage').then(m => ({ default: m.RuleListPage })))
const CSWorkspacePage = lazy(() => import('@/pages/cs/CSWorkspacePage').then(m => ({ default: m.CSWorkspacePage })))
const ContentCreatePage = lazy(() => import('@/pages/marketing/ContentCreatePage').then(m => ({ default: m.ContentCreatePage })))
const SellingPointPage = lazy(() => import('@/pages/selling-point/SellingPointPage').then(m => ({ default: m.SellingPointPage })))
const LandingPagePreviewPage = lazy(() => import('@/pages/conversion/LandingPagePreviewPage').then(m => ({ default: m.LandingPagePreviewPage })))
const AgentOrchestrationPage = lazy(() => import('@/pages/system/AgentOrchestrationPage').then(m => ({ default: m.AgentOrchestrationPage })))
const ModelConfigPage = lazy(() => import('@/pages/system/ModelConfigPage').then(m => ({ default: m.ModelConfigPage })))
const SystemSettingsPage = lazy(() => import('@/pages/system/SystemSettingsPage').then(m => ({ default: m.SystemSettingsPage })))
const AuditLogPage = lazy(() => import('@/pages/system/AuditLogPage').then(m => ({ default: m.AuditLogPage })))
const UserManagementPage = lazy(() => import('@/pages/system/UserManagementPage').then(m => ({ default: m.UserManagementPage })))
const SystemStatusPage = lazy(() => import('@/pages/system/SystemStatusPage').then(m => ({ default: m.SystemStatusPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

export const routerConfig = [
  { path: '/', element: <Navigate to="/biz/overview" replace /> },
  { path: '/biz/overview', element: <BizOverviewPage /> },
  { path: '/mkt/overview', element: <MktOverviewPage /> },
  { path: '/inquiry/list', element: <InquiryListPage /> },
  { path: '/inquiry/transform', element: <InquiryTransformPage /> },
  { path: '/inquiry/manual-entry', element: <InquiryManualEntryPage /> },
  { path: '/inquiry/result', element: <InquiryResultPage /> },
  { path: '/inquiry/quotation-list', element: <QuotationListPage /> },
  { path: '/inquiry/quotation/:id', element: <QuotationEditPage /> },
  { path: '/inquiry/quotation-detail/:id', element: <QuotationDetailPage /> },
  { path: '/product/list', element: <ProductListPage /> },
  { path: '/product/new', element: <ProductNewPage /> },
  { path: '/product/categories', element: <CategoryDictPage /> },
  { path: '/product/:id', element: <ProductDetailPage /> },
  { path: '/rules', element: <RuleListPage /> },
  { path: '/cs/workspace', element: <CSWorkspacePage /> },
  { path: '/marketing/create', element: <ContentCreatePage /> },
  { path: '/selling-point', element: <SellingPointPage /> },
  { path: '/selling-point/:productId', element: <SellingPointPage /> },
  { path: '/cs/marketing', element: <Navigate to="/cs/workspace?scene=marketing" replace /> },
  { path: '/conversion/dashboard', element: <Navigate to="/mkt/overview" replace /> },
  { path: '/conversion/agents', element: <AgentOrchestrationPage /> },
  { path: '/landing-page/preview', element: <LandingPagePreviewPage /> },
  { path: '/sys/agent-orchestration', element: <AgentOrchestrationPage /> },
  { path: '/sys/model-config', element: <ModelConfigPage /> },
  { path: '/sys/settings', element: <SystemSettingsPage /> },
  { path: '/sys/audit-log', element: <AuditLogPage /> },
  { path: '/sys/users', element: <UserManagementPage /> },
  { path: '/sys/dashboard', element: <SystemStatusPage /> },
  { path: '/sys/business-metrics', element: <Navigate to="/sys/dashboard" replace /> },
  { path: '/sys/ai-cost', element: <Navigate to="/sys/dashboard" replace /> },
  { path: '/sys/observability', element: <Navigate to="/sys/dashboard" replace /> },
  { path: '*', element: <NotFoundPage /> },
]
