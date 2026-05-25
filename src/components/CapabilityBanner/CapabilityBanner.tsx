import React, { useState } from 'react'
import { Alert, Button, Collapse, Typography } from 'antd'
import styles from './CapabilityBanner.module.css'

const { Text } = Typography

interface CapabilityBannerProps {
  title: string
  icon?: React.ReactNode
  capabilities: string[]
  limits?: string[]
  storageKey: string
  onLearnMore?: () => void
}

export const CapabilityBanner: React.FC<CapabilityBannerProps> = ({ title, icon, capabilities, limits, storageKey, onLearnMore }) => {
  const [visible, setVisible] = useState(() => !localStorage.getItem(storageKey))

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <Alert
      className={styles.banner}
      message={
        <div className={styles.header}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <Text strong>{title}</Text>
        </div>
      }
      description={
        <div>
          <Collapse
            ghost
            items={[
              {
                key: 'capabilities',
                label: '能力说明',
                children: (
                  <ul className={styles.list}>
                    {capabilities.map((cap, i) => (
                      <li key={i}>{cap}</li>
                    ))}
                  </ul>
                ),
              },
              ...(limits ? [{
                key: 'limits',
                label: '限制说明',
                children: (
                  <ul className={styles.list}>
                    {limits.map((lim, i) => (
                      <li key={i}>{lim}</li>
                    ))}
                  </ul>
                ),
              }] : []),
            ]}
          />
          <div className={styles.actions}>
            {onLearnMore && <Button type="link" size="small" onClick={onLearnMore}>了解更多</Button>}
            <Button type="link" size="small" onClick={handleDismiss}>不再提示</Button>
          </div>
        </div>
      }
      type="info"
      showIcon={false}
      closable
      onClose={handleDismiss}
    />
  )
}
