import React from 'react'
import { Tabs } from 'antd'
import {
  HeartOutlined,
  DollarOutlined,
  RiseOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { HealthOverviewTab } from './tabs/HealthOverviewTab'
import { AICostTab } from './tabs/AICostTab'
import { BusinessValueTab } from './tabs/BusinessValueTab'
import { ObservabilityTab } from './tabs/ObservabilityTab'
import styles from './SystemStatusPage.module.css'

export const SystemStatusPage: React.FC = () => {
  const items = [
    {
      key: 'health',
      label: (
        <span>
          <HeartOutlined /> 健康总览
        </span>
      ),
      children: <HealthOverviewTab />,
    },
    {
      key: 'cost',
      label: (
        <span>
          <DollarOutlined /> AI 成本
        </span>
      ),
      children: <AICostTab />,
    },
    {
      key: 'business',
      label: (
        <span>
          <RiseOutlined /> 业务价值
        </span>
      ),
      children: <BusinessValueTab />,
    },
    {
      key: 'observability',
      label: (
        <span>
          <EyeOutlined /> 可观测性
        </span>
      ),
      children: <ObservabilityTab />,
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>系统概览</h2>
      </div>
      <Tabs defaultActiveKey="health" items={items} size="large" className={styles.tabs} />
    </div>
  )
}
