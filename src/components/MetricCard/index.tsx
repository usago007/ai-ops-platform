import React from 'react'
import { Card } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@/iconMap'
import styles from './MetricCard.module.css'

interface MetricCardProps {
  title: string
  value: string | number
  suffix?: string
  prefix?: React.ReactNode
  trend?: 'up' | 'down'
  trendLabel?: string
  color?: string
  comparison?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  suffix,
  prefix,
  trend,
  trendLabel,
  color,
  comparison,
}) => (
  <Card className={styles.metricCard} style={color ? { borderLeft: `3px solid ${color}` } : undefined}>
    <div className={styles.metricContent}>
      <div className={styles.metricHeader}>
        <span className={styles.metricIcon}>{prefix}</span>
        <span className={styles.metricTitle}>{title}</span>
      </div>
      <div className={styles.metricValue} style={color ? { color } : undefined}>
        {value}
        {suffix && <span className={styles.metricSuffix}>{suffix}</span>}
      </div>
      {trend && (
        <div className={styles.metricTrend}>
          {trend === 'up' ? (
            <ArrowUpOutlined className={styles.trendUp} />
          ) : (
            <ArrowDownOutlined className={styles.trendDown} />
          )}
          <span>{trendLabel}</span>
        </div>
      )}
      {comparison && <div className={styles.metricComparison}>{comparison}</div>}
    </div>
  </Card>
)
