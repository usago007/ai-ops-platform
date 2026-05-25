import { Navigate } from 'react-router-dom'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { InquiryListPage } from '@/pages/inquiry/InquiryListPage'
import { InquiryTransformPage } from '@/pages/inquiry/InquiryTransformPage'
import { InquiryManualEntryPage } from '@/pages/inquiry/InquiryManualEntryPage'
import { InquiryResultPage } from '@/pages/inquiry/InquiryResultPage'
import { QuotationListPage } from '@/pages/inquiry/QuotationListPage'
import { QuotationEditPage } from '@/pages/inquiry/QuotationEditPage'
import { QuotationDetailPage } from '@/pages/inquiry/QuotationDetailPage'
import { ProductListPage } from '@/pages/product/ProductListPage'
import { ProductDetailPage } from '@/pages/product/ProductDetailPage'
import { ProductNewPage } from '@/pages/product/ProductNewPage'
import { CategoryDictPage } from '@/pages/product/CategoryDictPage'
import { RuleListPage } from '@/pages/rules/RuleListPage'
import { CSWorkspacePage } from '@/pages/cs/CSWorkspacePage'
import { ContentCreatePage } from '@/pages/marketing/ContentCreatePage'
import { SellingPointPage } from '@/pages/selling-point/SellingPointPage'
import { ConversionDashboard } from '@/pages/conversion/ConversionDashboard'
import { LandingPagePreviewPage } from '@/pages/conversion/LandingPagePreviewPage'
import { AgentOrchestrationPage } from '@/pages/system/AgentOrchestrationPage'
import { ModelConfigPage } from '@/pages/system/ModelConfigPage'
import { SystemSettingsPage } from '@/pages/system/SystemSettingsPage'
import { AuditLogPage } from '@/pages/system/AuditLogPage'
import { UserManagementPage } from '@/pages/system/UserManagementPage'
import { SystemDashboardPage } from '@/pages/system/SystemDashboardPage'
import { BusinessMetricsPage } from '@/pages/system/BusinessMetricsPage'
import { AICostDashboardPage } from '@/pages/system/AICostDashboardPage'
import { SystemObservabilityPage } from '@/pages/system/SystemObservabilityPage'
import { BizOverviewPage } from '@/pages/biz/BizOverviewPage'
import { MktOverviewPage } from '@/pages/mkt/MktOverviewPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

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
  { path: '/conversion/dashboard', element: <ConversionDashboard /> },
  { path: '/conversion/agents', element: <AgentOrchestrationPage /> },
  { path: '/landing-page/preview', element: <LandingPagePreviewPage /> },
  { path: '/sys/agent-orchestration', element: <AgentOrchestrationPage /> },
  { path: '/sys/model-config', element: <ModelConfigPage /> },
  { path: '/sys/settings', element: <SystemSettingsPage /> },
  { path: '/sys/audit-log', element: <AuditLogPage /> },
  { path: '/sys/users', element: <UserManagementPage /> },
  { path: '/sys/dashboard', element: <SystemDashboardPage /> },
  { path: '/sys/business-metrics', element: <BusinessMetricsPage /> },
  { path: '/sys/ai-cost', element: <AICostDashboardPage /> },
  { path: '/sys/observability', element: <SystemObservabilityPage /> },
  { path: '*', element: <NotFoundPage /> },
]
