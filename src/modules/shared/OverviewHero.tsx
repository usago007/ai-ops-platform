import React from 'react'
import { PrimaryMetric, type PrimaryMetricProps } from './PrimaryMetric'
import styles from './OverviewHero.module.css'

interface OverviewHeroProps {
  title: string
  subtitle?: string
  eyebrow?: string
  primaryAction?: { label: string; onClick: () => void }
  secondaryAction?: { label: string; onClick: () => void }
  signals?: PrimaryMetricProps[]
}

export const OverviewHero: React.FC<OverviewHeroProps> = ({
  title,
  subtitle,
  eyebrow,
  primaryAction,
  secondaryAction,
  signals,
}) => {
  return (
    <div className={styles.hero}>
      <div className={styles.copy}>
        {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {(primaryAction || secondaryAction) && (
          <div className={styles.actions}>
            {primaryAction && (
              <button className={styles.primaryBtn} onClick={primaryAction.onClick}>
                {primaryAction.label}
              </button>
            )}
            {secondaryAction && (
              <button className={styles.secondaryBtn} onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
      {signals && signals.length > 0 && (
        <div className={styles.signals}>
          {signals.map((s, i) => (
            <PrimaryMetric key={i} {...s} size="lg" />
          ))}
        </div>
      )}
    </div>
  )
}

export default OverviewHero
