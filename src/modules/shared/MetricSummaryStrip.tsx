/**
 * MetricSummaryStrip — 紧凑水平指标条
 *
 * 替换内联 `Text type="secondary"` + `Text strong` 指标对。
 */
import React from 'react'
import { Typography } from 'antd'
import styles from './SharedUI.module.css'

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
  const valueClass = size === 'compact' ? styles.metricStripValueCompact : styles.metricStripValue

  return (
    <div className={styles.metricStripGrid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {items.map((item, i) => (
        <div key={i}>
          <Text type="secondary" className={styles.metricStripLabel}>{item.label}</Text>
          <br />
          <Text strong className={valueClass} style={item.color ? { color: item.color } : undefined}>
            {item.value}
          </Text>
        </div>
      ))}
    </div>
  )
}

export default MetricSummaryStrip
