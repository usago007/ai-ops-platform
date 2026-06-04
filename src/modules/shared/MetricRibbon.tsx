import React from 'react'
import { PrimaryMetric, type PrimaryMetricProps } from './PrimaryMetric'
import styles from './MetricRibbon.module.css'

interface MetricRibbonProps {
  items: PrimaryMetricProps[]
}

export const MetricRibbon: React.FC<MetricRibbonProps> = ({ items }) => {
  return (
    <div className={styles.ribbon}>
      {items.map((item, i) => (
        <div key={i} className={styles.item}>
          <PrimaryMetric {...item} />
        </div>
      ))}
    </div>
  )
}

export default MetricRibbon
