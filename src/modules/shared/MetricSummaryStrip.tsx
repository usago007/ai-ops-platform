/**
 * MetricSummaryStrip — 紧凑水平指标条
 *
 * 替换内联 `Text type="secondary"` + `Text strong` 指标对。
 */
import React from 'react'
import { Typography } from 'antd'

const { Text } = Typography

export interface MetricItem {
  label: string
  value: string | number
  color?: string
}

interface MetricSummaryStripProps {
  items: MetricItem[]
  columns?: 2 | 3 | 4
  size?: 'default' | 'compact'
}

export const MetricSummaryStrip: React.FC<MetricSummaryStripProps> = ({
  items,
  columns = 4,
  size = 'default',
}) => {
  const fontSize = size === 'compact' ? 'var(--font-size-lg)' : 'var(--font-size-xl)'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 12,
      }}
    >
      {items.map((item, i) => (
        <div key={i}>
          <Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>{item.label}</Text>
          <br />
          <Text strong style={{ fontSize: fontSize, color: item.color }}>
            {item.value}
          </Text>
        </div>
      ))}
    </div>
  )
}

export default MetricSummaryStrip
