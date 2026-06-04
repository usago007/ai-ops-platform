/**
 * InsightPanel — 统一 Card + SectionHeader 信息区块
 *
 * 替换 29 处内联 `Card variant="borderless"` + `SectionHeader` 配对。
 */
import React from 'react'
import { Card } from 'antd'
import { SectionHeader } from './SharedUI'

interface InsightPanelProps {
  title: string
  icon?: React.ReactNode
  extra?: React.ReactNode
  children: React.ReactNode
  /** Use 'compact' for tighter padding; avoids collision with antd Card `variant` prop */
  displayVariant?: 'default' | 'compact'
}

export const InsightPanel: React.FC<InsightPanelProps> = ({
  title,
  icon,
  extra,
  children,
  displayVariant = 'default',
}) => {
  return (
    <Card
      variant={displayVariant === 'compact' ? undefined : 'borderless'}
      size={displayVariant === 'compact' ? 'small' : undefined}
    >
      <SectionHeader icon={icon} title={title} extra={extra} />
      {children}
    </Card>
  )
}

export default InsightPanel
