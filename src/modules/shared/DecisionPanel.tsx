import React from 'react'
import styles from './DecisionPanel.module.css'

interface DecisionPanelProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  action?: { label: string; onClick: () => void }
  variant?: 'info' | 'warning' | 'success'
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  title,
  icon,
  children,
  action,
  variant = 'info',
}) => {
  const variantClass = styles[variant] || styles.info

  return (
    <div className={`${styles.panel} ${variantClass}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          {icon}
          {title}
        </div>
        {action && (
          <button className={styles.actionBtn} onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  )
}

export default DecisionPanel
