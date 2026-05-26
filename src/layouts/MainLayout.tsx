import React from 'react'
import { Layout, Menu, Avatar, Badge, Breadcrumb } from 'antd'
import {
  UserOutlined,
  InboxOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  TagsOutlined,
  ShopOutlined,
  LineChartOutlined,
  ApiOutlined,
  SettingOutlined,
  FileSearchOutlined,
  TeamOutlined,
  DashboardOutlined,
  BellOutlined,
  BarChartOutlined,
  RocketOutlined,
  PlusOutlined,
  DollarOutlined,
  AppstoreOutlined,
} from '@/iconMap'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './MainLayout.module.css'

const { Header, Content, Sider } = Layout

const breadcrumbRouteMap: Record<string, string[]> = {
  '/biz/overview':            ['业务提效', '业务概览'],
  '/inquiry/list':            ['业务提效', '询价线索池'],
  '/inquiry/manual-entry':    ['业务提效', '手动录入'],
  '/inquiry/quotation-list':  ['业务提效', '报价管理'],
  '/inquiry/transform':       ['业务提效', '询价线索池', 'AI 转化'],
  '/inquiry/result':          ['业务提效', '询价线索池', '转化结果'],
  '/inquiry/quotation':       ['业务提效', '报价管理', '编辑报价'],
  '/inquiry/quotation-detail':['业务提效', '报价管理', '报价详情'],
  '/product/list':            ['业务提效', '商品结构化', '商品库'],
  '/product/new':             ['业务提效', '商品结构化', '新增商品'],
  '/product/categories':      ['业务提效', '商品结构化', '品类字典'],
  '/product':                 ['业务提效', '商品结构化', '商品详情'],
  '/rules':                   ['业务提效', '规则归纳'],
  '/cs/workspace':            ['营销提效', '客服工作台'],
  '/mkt/overview':            ['营销提效', '营销概览'],
  '/marketing/create':        ['营销提效', '内容生成'],
  '/selling-point':           ['营销提效', '卖点提炼'],
  '/conversion/dashboard':    ['营销提效', '营销概览'],
  '/conversion/agents':       ['营销提效', '营销概览', 'Agent 配置'],
  '/landing-page/preview':    ['营销提效', '营销概览', '落地页预览'],
  '/sys/agent-orchestration': ['系统管理', 'Agent 编排'],
  '/sys/model-config':        ['系统管理', 'AI 模型配置'],
  '/sys/settings':            ['系统管理', '系统参数'],
  '/sys/audit-log':           ['系统管理', '操作日志'],
  '/sys/users':               ['系统管理', '用户与权限'],
  '/sys/dashboard':           ['系统管理', '系统概览'],
}

function buildBreadcrumb(pathname: string): string[] {
  if (breadcrumbRouteMap[pathname]) return breadcrumbRouteMap[pathname]
  const match = Object.keys(breadcrumbRouteMap)
    .filter(prefix => prefix !== '/' && pathname.startsWith(prefix))
    .sort((a, b) => b.length - a.length)[0]
  if (match) return breadcrumbRouteMap[match]
  return ['AI Ops Platform']
}

interface MainLayoutProps {
  children: React.ReactNode
}

const menuItems = [
  {
    key: 'business',
    label: '业务提效',
    icon: <ShoppingOutlined />,
    type: 'group',
    children: [
      { key: '/biz/overview', label: '业务概览', icon: <DashboardOutlined /> },
      { key: '/inquiry/list', label: '询价线索池', icon: <InboxOutlined /> },
      { key: '/inquiry/manual-entry', label: '手动录入', icon: <PlusOutlined /> },
      { key: '/inquiry/quotation-list', label: '报价管理', icon: <DollarOutlined /> },
      {
        key: 'product-group',
        label: '商品结构化',
        icon: <TagsOutlined />,
        type: 'group',
        children: [
          { key: '/product/list', label: '商品库', icon: <TagsOutlined /> },
          { key: '/product/new', label: '新增商品', icon: <PlusOutlined /> },
          { key: '/product/categories', label: '品类字典', icon: <AppstoreOutlined /> },
        ],
      },
      { key: '/rules', label: '规则归纳', icon: <FileTextOutlined /> },
    ],
  },
  {
    key: 'marketing',
    label: '营销提效',
    icon: <LineChartOutlined />,
    type: 'group',
    children: [
      { key: '/mkt/overview', label: '营销概览', icon: <BarChartOutlined /> },
      { key: '/cs/workspace', label: '客服工作台', icon: <CustomerServiceOutlined /> },
      { key: '/marketing/create', label: '内容生成', icon: <RocketOutlined /> },
      { key: '/selling-point', label: '卖点提炼', icon: <ShopOutlined /> },
    ],
  },
  {
    key: 'system',
    label: '系统管理',
    icon: <SettingOutlined />,
    type: 'group',
    children: [
      { key: '/sys/dashboard', label: '系统概览', icon: <DashboardOutlined /> },
      { key: '/sys/agent-orchestration', label: 'Agent 编排', icon: <ApiOutlined /> },
      { key: '/sys/model-config', label: 'AI 模型配置', icon: <InboxOutlined /> },
      { key: '/sys/settings', label: '系统参数', icon: <SettingOutlined /> },
      { key: '/sys/audit-log', label: '操作日志', icon: <FileSearchOutlined /> },
      { key: '/sys/users', label: '用户与权限', icon: <TeamOutlined /> },
    ],
  },
]

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()

  // Collect all valid menu keys (including nested children in groups)
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

  const selectedKey = location.pathname.startsWith('/cs/')
    ? '/cs/workspace'
    : (allMenuKeys.has(location.pathname) ? location.pathname : '/')

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
          AI Ops Platform
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['business', 'marketing', 'system']}
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

        <Content className={styles.content} role="main" id="main-content">{children}</Content>
      </Layout>
    </Layout>
  )
}
