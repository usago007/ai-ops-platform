/**
 * DetailHeader — 标准化详情页头部（两行布局）
 *
 * Row 1: 返回按钮
 * Row 2: 标题 + 状态 tag + 操作区
 * 长标题自动省略，不与状态/操作重叠。
 */
import React from 'react'
import { Button, Tag, Typography } from 'antd'
import { ArrowLeftOutlined } from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import styles from './DetailHeader.module.css'
import sharedStyles from './SharedUI.module.css'

const { Text } = Typography

interface DetailHeaderProps {
  backTo: { label: string; path: string }
  icon?: React.ReactNode
  title: React.ReactNode
  status?: { label: string; color?: string }
  actions?: React.ReactNode
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({
  backTo,
  icon,
  title,
  status,
  actions,
}) => {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <div className={styles.backRow}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(backTo.path)}
          size="small"
        >
          {backTo.label}
        </Button>
      </div>
      <div className={styles.titleRow}>
        <Text strong className={styles.titleText}>
          {icon && <span className={sharedStyles.pageTitleIcon}>{icon}</span>}
          <span className={styles.titleLabel}>{title}</span>
        </Text>
        {status && <Tag color={status.color || 'blue'}>{status.label}</Tag>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  )
}

export default DetailHeader
