import React from 'react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  actionButton?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionButton }) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actionButton && <div className={styles.action}>{actionButton}</div>}
    </div>
  )
}
