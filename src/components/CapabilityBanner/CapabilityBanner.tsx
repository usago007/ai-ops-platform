import React, { useState, useEffect } from 'react'
import { Alert, Button, Space, Collapse, Typography } from 'antd'
import { CloseOutlined, InfoCircleOutlined } from '@ant-design/icons'
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

export const CapabilityBanner: React.FC<CapabilityBannerProps> = ({
  title,
  icon,
  capabilities,
  limits = [],
  storageKey,
  onLearnMore,
}) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey)
    if (!dismissed) {
      setVisible(true)
    }
  }, [storageKey])

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
        <div className={styles.content}>
          <div className={styles.section}>
            <Text type="secondary" className={styles.sectionTitle}>支持能力：</Text>
            <ul className={styles.list}>
              {capabilities.map((cap, i) => (
                <li key={i}>{cap}</li>
              ))}
            </ul>
          </div>
          {limits.length > 0 && (
            <Collapse
              ghost
              className={styles.collapse}
              items={[{
                key: 'limits',
                label: <Text type="secondary">使用说明与限制</Text>,
                children: (
                  <ul className={styles.list}>
                    {limits.map((limit, i) => (
                      <li key={i}>{limit}</li>
                    ))}
                  </ul>
                ),
              }]}
            />
          )}
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
