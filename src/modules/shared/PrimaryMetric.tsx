import React from 'react'
import styles from './PrimaryMetric.module.css'

interface PrimaryMetricProps {
  label: string
  value: string | number
  prefix?: React.ReactNode
  color?: string
  size?: 'lg' | 'default'
}

export const PrimaryMetric: React.FC<PrimaryMetricProps> = ({
  label,
  value,
  prefix,
  color,
  size = 'default',
}) => {
  const cls = size === 'lg' ? `${styles.metric} ${styles.metricLg}` : styles.metric

  return (
    <div className={cls}>
      {prefix && <div className={styles.prefix}>{prefix}</div>}
      <div className={styles.label}>{label}</div>
      <div className={styles.value} style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  )
}

export type { PrimaryMetricProps }
export default PrimaryMetric
