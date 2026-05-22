import React from 'react'
import { Layout, Menu, Avatar, Badge, Breadcrumb } from 'antd'
import {
  UserOutlined,
  InboxOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  EditOutlined,
  TagsOutlined,
  ShopOutlined,
  LineChartOutlined,
  NodeIndexOutlined,
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
  ExperimentOutlined,
  MonitorOutlined,
  PieChartOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './MainLayout.module.css'

const { Header, Content, Sider } = Layout

function buildBreadcrumb(pathname: string): string[] {
  function find(items: any[], ancestors: string[] = []): string[] | null {
    for (const item of items) {
      if (item.key === pathname) {
        return [...ancestors, item.label]
      }
      if (item.children) {
        const next = item.type === 'group' ? [...ancestors, item.label] : ancestors
        const result = find(item.children, next)
        if (result) return result
      }
    }
    return null
  }
  return find(menuItems) || ['AI Ops Platform']
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
      { key: '/cs/workspace', label: '客服工作台', icon: <CustomerServiceOutlined /> },
    ],
  },
  {
    key: 'marketing',
    label: '营销提效',
    icon: <LineChartOutlined />,
    type: 'group',
    children: [
      { key: '/mkt/overview', label: '营销概览', icon: <BarChartOutlined /> },
      { key: '/marketing/create', label: '内容生成', icon: <RocketOutlined /> },
      { key: '/selling-point', label: '卖点提炼', icon: <ShopOutlined /> },
      { key: '/conversion/dashboard', label: '转化增强', icon: <NodeIndexOutlined /> },
    ],
  },
  {
    key: 'system',
    label: '系统管理',
    icon: <SettingOutlined />,
    type: 'group',
    children: [
      { key: '/sys/agent-orchestration', label: 'Agent 编排', icon: <ApiOutlined /> },
      { key: '/sys/model-config', label: 'AI 模型配置', icon: <InboxOutlined /> },
      { key: '/sys/settings', label: '系统参数', icon: <SettingOutlined /> },
      { key: '/sys/audit-log', label: '操作日志', icon: <FileSearchOutlined /> },
      { key: '/sys/users', label: '用户与权限', icon: <TeamOutlined /> },
      { key: '/sys/dashboard', label: '系统状态', icon: <DashboardOutlined /> },
      { key: '/sys/business-metrics', label: '业务指标', icon: <PieChartOutlined /> },
      { key: '/sys/ai-cost', label: 'AI 成本', icon: <ExperimentOutlined /> },
      { key: '/sys/observability', label: '系统可观测性', icon: <MonitorOutlined /> },
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
      <Sider collapsible breakpoint="lg" className={styles.sider}>
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

      <Layout>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            <Breadcrumb items={buildBreadcrumb(location.pathname).map(name => ({ title: name }))} />
          </div>
          <div className={styles.headerRight}>
            <Badge count={3} dot className={styles.badge}>
              <BellOutlined className={styles.iconBtn} />
            </Badge>
            <Avatar icon={<UserOutlined />} className={styles.avatar} />
          </div>
        </Header>

        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  )
}
