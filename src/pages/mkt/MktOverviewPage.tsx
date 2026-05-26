import React from 'react'
import { Tabs, Typography } from 'antd'
import {
  BarChartOutlined,
  NodeIndexOutlined,
} from '@/iconMap'
import { OverviewTab } from './tabs/OverviewTab'
import { ConversionTab } from './tabs/ConversionTab'
import styles from './MktOverviewPage.module.css'

const { Title } = Typography

export const MktOverviewPage: React.FC = () => {
  const items = [
    {
      key: 'overview',
      label: (
        <span>
          <BarChartOutlined /> 营销概览
        </span>
      ),
      children: <OverviewTab />,
    },
    {
      key: 'conversion',
      label: (
        <span>
          <NodeIndexOutlined /> 转化增强
        </span>
      ),
      children: <ConversionTab />,
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <Title level={3} className={styles.pageTitle}>营销概览</Title>
      </div>
      <Tabs defaultActiveKey="overview" items={items} size="large" className={styles.tabs} />
    </div>
  )
}
