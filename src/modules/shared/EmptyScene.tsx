/**
 * EmptyScene — 统一空状态
 */
import React from 'react'
import styles from './SharedUI.module.css'

interface EmptySceneProps {
  title?: string
  description?: string
  action?: React.ReactNode
}

export const EmptyScene: React.FC<EmptySceneProps> = ({
  title = '暂无数据',
  description,
  action,
}) => {
  return (
    <div className={styles.emptyScene}>
      <div className={styles.emptySceneIcon}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M13 2L3 7l10 5 10-5-10-5zM3 17l10 5 10-5M3 12l10 5 10-5" />
        </svg>
      </div>
      <div className={styles.emptySceneTitle}>{title}</div>
      {description && <div className={styles.emptySceneDesc}>{description}</div>}
      {action && <div className={styles.emptySceneAction}>{action}</div>}
    </div>
  )
}

export default EmptyScene
