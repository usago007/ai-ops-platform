import React from 'react'
import { CheckCircleFilled, LoadingOutlined } from '@/iconMap'
import styles from './ProcessingSteps.module.css'

interface Step {
  label: string
  status: 'done' | 'processing' | 'pending'
}

interface ProcessingStepsProps {
  steps: Step[]
}

export const ProcessingSteps: React.FC<ProcessingStepsProps> = ({ steps }) => {
  return (
    <div className={styles.container}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={`${styles.step} ${styles[`status-${step.status}`]}`}
        >
          <div className={styles.iconWrapper}>
            {step.status === 'done' && (
              <CheckCircleFilled className={styles.icon} />
            )}
            {step.status === 'processing' && (
              <LoadingOutlined className={`${styles.icon} ${styles.spin}`} />
            )}
            {step.status === 'pending' && (
              <div className={styles.pendingIcon} />
            )}
          </div>
          <span className={styles.label}>{step.label}</span>
          {index < steps.length - 1 && <div className={styles.connector} />}
        </div>
      ))}
    </div>
  )
}
