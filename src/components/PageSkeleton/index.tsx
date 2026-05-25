import styles from './index.module.css'

interface PageSkeletonProps {
  variant?: 'dashboard' | 'list' | 'detail' | 'form'
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ variant = 'dashboard' }) => {
  if (variant === 'dashboard') {
    return (
      <div className={styles.dashboardLayout}>
        <div className={styles.dashboardMetrics}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`skeleton ${styles.metricSkeleton}`} />
          ))}
        </div>
        <div className={`skeleton ${styles.chartSkeleton}`} />
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className={styles.listLayout}>
        <div className={`skeleton ${styles.listTitle}`} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`skeleton ${styles.listItem}`} />
        ))}
      </div>
    )
  }

  if (variant === 'detail') {
    return (
      <div className={styles.detailLayout}>
        <div className={`skeleton ${styles.detailTitle}`} />
        <div className={`skeleton ${styles.detailHero}`} />
        <div className={styles.detailGrid}>
          <div className={`skeleton ${styles.detailCard}`} />
          <div className={`skeleton ${styles.detailCard}`} />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.formLayout}>
      <div className={`skeleton ${styles.formTitle}`} />
      {[1, 2, 3].map(i => (
        <div key={i} className={`skeleton ${styles.formItem}`} />
      ))}
    </div>
  )
}
