/**
 * MainLayout — V2 主链接管版
 *
 * 改动：
 * - 侧栏只保留 3 组正式产品入口
 * - legacy 从主导航和头部移除，仅保留 /legacy 隔离区
 * - breadcrumb 覆盖全部主链节点
 * - legacy 路由自动显示 LegacyBanner
 */
import React from 'react'
import { Layout, Menu, Avatar, Badge, Breadcrumb, Alert, Button } from 'antd'
import {
  UserOutlined,
  InboxOutlined,
  CustomerServiceOutlined,
  TagsOutlined,
  ApiOutlined,
  FileSearchOutlined,
  DashboardOutlined,
  BellOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from '@/iconMap'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './MainLayout.module.css'

const { Header, Content, Sider } = Layout

// ── Breadcrumb map: covers all V1 main chain + legacy routes ──
const breadcrumbRouteMap: Record<string, string[]> = {
  // NEW PRODUCT
  '/overview':                       ['AI 经营总览'],
  '/cs/workspace':                   ['主业务链路', '客服工作台'],
  '/leads/list':                     ['主业务链路', '线索列表'],
  '/leads':                          ['主业务链路', '线索详情'],
  '/product/list':                   ['主业务链路', '商品资产中心'],
  '/product':                        ['主业务链路', '商品资产中心', '商品详情'],
  '/outcome/list':                   ['主业务链路', '结果列表'],
  '/outcome':                        ['主业务链路', '结果详情'],
  '/knowledge/list':                 ['主业务链路', '知识库'],
  '/knowledge':                      ['主业务链路', '知识条目'],
  '/sys/dashboard':                  ['AI 融入底座', '系统底座'],
  '/sys/business-metrics':           ['AI 融入底座', '业务指标'],
  '/sys/ai-cost':                    ['AI 融入底座', 'AI 成本'],
  '/sys/observability':              ['AI 融入底座', '可观测性'],
  '/sys/audit-log':                  ['AI 融入底座', '审计日志'],
  '/sys/model-config':               ['AI 融入底座', '模型配置'],
  '/sys/agent-orchestration':        ['AI 融入底座', 'Agent 编排'],

  // LEGACY (frozen)
  '/legacy/inquiry/list':            ['历史页面', '询价线索池'],
  '/legacy/inquiry/quotation-list':  ['历史页面', '报价管理'],
  '/legacy/sys/dashboard':           ['历史页面', '系统概览(旧)'],
  '/legacy/sys/settings':            ['历史页面', '系统参数(旧)'],
  '/legacy/sys/users':               ['历史页面', '用户与权限(旧)'],
  '/legacy/sys/model-config':        ['历史页面', '模型配置(旧)'],
  '/legacy/sys/audit-log':           ['历史页面', '审计日志(旧)'],
  '/legacy/sys/agent-orchestration': ['历史页面', 'Agent 编排(旧)'],
}

function buildBreadcrumb(pathname: string): string[] {
  if (breadcrumbRouteMap[pathname]) return breadcrumbRouteMap[pathname]
  const match = Object.keys(breadcrumbRouteMap)
    .filter(prefix => prefix !== '/' && pathname.startsWith(prefix))
    .sort((a, b) => b.length - a.length)[0]
  if (match) return breadcrumbRouteMap[match]
  return ['AI Ops Platform']
}

/** 判断当前路径是否属于 legacy 页面 */
function isLegacyPath(pathname: string): boolean {
  return pathname.startsWith('/legacy/')
    || pathname.startsWith('/product-legacy')
}

interface MainLayoutProps {
  children: React.ReactNode
}

function getLegacyGuidance(pathname: string): { targetLabel: string; targetPath: string; description: string } {
  if (pathname.startsWith('/legacy/sys/')) {
    return {
      targetLabel: 'AI 融入底座',
      targetPath: '/sys/dashboard',
      description: '旧 system 页面已冻结，请使用新版 AI 融入底座查看模型、审计和系统底座能力。',
    }
  }
  return {
    targetLabel: '客服工作台',
    targetPath: '/cs/workspace',
    description: '该历史页面已冻结，请使用客服工作台从会话入口继续主业务流程。',
  }
}

// ── Menu items — 侧栏只保留正式产品入口 ──
const menuItems = [
  {
    key: 'overview',
    label: 'AI 经营总览',
    icon: <BarChartOutlined />,
    type: 'group' as const,
    children: [
      { key: '/overview', label: '经营总览', icon: <BarChartOutlined /> },
    ],
  },
  {
    key: 'main-chain',
    label: '主业务链路',
    icon: <ThunderboltOutlined />,
    type: 'group' as const,
    children: [
      { key: '/cs/workspace', label: '客服工作台', icon: <CustomerServiceOutlined /> },
      { key: '/product/list', label: '商品资产中心', icon: <TagsOutlined /> },
      { key: '/leads/list', label: '线索列表', icon: <ThunderboltOutlined /> },
      { key: '/outcome/list', label: '结果列表', icon: <CheckCircleOutlined /> },
      { key: '/knowledge/list', label: '知识库', icon: <InboxOutlined /> },
    ],
  },
  {
    key: 'ai-base',
    label: 'AI 融入底座',
    icon: <ApiOutlined />,
    type: 'group' as const,
    children: [
      { key: '/sys/dashboard', label: '系统底座', icon: <DashboardOutlined /> },
      { key: '/sys/business-metrics', label: '业务指标', icon: <BarChartOutlined /> },
      { key: '/sys/ai-cost', label: 'AI 成本', icon: <ThunderboltOutlined /> },
      { key: '/sys/observability', label: '可观测性', icon: <DashboardOutlined /> },
      { key: '/sys/audit-log', label: '审计日志', icon: <FileSearchOutlined /> },
      { key: '/sys/model-config', label: '模型配置', icon: <InboxOutlined /> },
      { key: '/sys/agent-orchestration', label: 'Agent 编排', icon: <ApiOutlined /> },
    ],
  },
]

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const legacy = isLegacyPath(location.pathname)

  // Collect all valid menu keys
  const allMenuKeys = new Set<string>()
  for (const item of menuItems) {
    if (item.type !== 'group') {
      allMenuKeys.add(item.key)
    }
    if (item.children) {
      for (const child of item.children) {
        allMenuKeys.add(child.key)
      }
    }
  }

  const selectedKey = location.pathname === '/leads/list'
    ? '/leads/list'
    : location.pathname.startsWith('/leads/')
    ? '/cs/workspace'
    : location.pathname.startsWith('/product/')
    ? '/product/list'
    : location.pathname.startsWith('/sys/')
    ? location.pathname
    : location.pathname.startsWith('/legacy/')
    ? ''
    : (allMenuKeys.has(location.pathname) ? location.pathname : '/cs/workspace')

  return (
    <Layout className={styles.layout}>
      <a href="#main-content" className={styles.skipLink}>Skip to content</a>
      <Sider collapsible breakpoint="lg" className={styles.sider} role="navigation" aria-label="Main navigation">
        <div className={styles.logo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span className={styles.logoText}>AI Ops Platform</span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKey ? [selectedKey] : []}
          defaultOpenKeys={['overview', 'main-chain', 'ai-base']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className={styles.menu}
        />
      </Sider>

      <Layout className={styles.innerLayout}>
        <Header className={styles.header} role="banner">
          <div className={styles.headerLeft}>
            <Breadcrumb items={buildBreadcrumb(location.pathname).map(name => ({ title: name }))} aria-label="Breadcrumb" />
          </div>
          <div className={styles.headerRight}>
            <Badge count={3} dot className={styles.badge}>
              <BellOutlined className={styles.iconBtn} aria-label="Notifications" />
            </Badge>
            <Avatar icon={<UserOutlined />} className={styles.avatar} aria-label="User menu" />
          </div>
        </Header>

        {/* Legacy page banner */}
        {legacy && (
          <Alert
            type="warning"
            showIcon
            title="此页面为旧版（legacy）"
            description={getLegacyGuidance(location.pathname).description}
            action={(
              <Button type="primary" size="small" onClick={() => navigate(getLegacyGuidance(location.pathname).targetPath)}>
                去 {getLegacyGuidance(location.pathname).targetLabel}
              </Button>
            )}
            style={{ margin: '12px 16px 0', borderRadius: 6 }}
            closable
          />
        )}

        <Content className={styles.content} role="main" id="main-content">{children}</Content>
      </Layout>
    </Layout>
  )
}
