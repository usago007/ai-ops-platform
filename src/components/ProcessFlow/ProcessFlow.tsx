import React from 'react'
import { Steps } from 'antd'
import { useNavigate } from 'react-router-dom'
import styles from './ProcessFlow.module.css'

interface ProcessStep {
  key: string
  label: string
  icon?: React.ReactNode
  description?: string
  route?: string
  status?: 'completed' | 'active' | 'pending'
}

interface ProcessFlowProps {
  steps: ProcessStep[]
  mode?: 'horizontal' | 'vertical'
}

export const ProcessFlow: React.FC<ProcessFlowProps> = ({
  steps,
  mode = 'horizontal',
}) => {
  const navigate = useNavigate()

  const items = steps.map(step => ({
    title: step.route ? (
      <span
        className={styles.stepTitle}
        onClick={() => step.route && navigate(step.route!)}
      >
        {step.label}
      </span>
    ) : (
      step.label
    ),
    description: step.description && (
      <span className={styles.stepDesc}>{step.description}</span>
    ),
    status: step.status || 'pending',
    icon: step.icon,
  }))

  return (
    <div className={`${styles.container} ${styles[mode]}`}>
      <Steps
        orientation={mode}
        current={steps.findIndex(s => s.status === 'active')}
        items={items}
        className={styles.steps}
      />
    </div>
  )
}
