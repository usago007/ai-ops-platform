import React from 'react'
import { Modal, Tag, Alert, Button } from 'antd'
import type { PromptVersion } from '../AgentOrchestrationPage.types'
import styles from '../AgentOrchestrationPage.module.css'

interface VersionCompareModalProps {
  open: boolean
  compareVersions: { left: PromptVersion | null; right: PromptVersion | null }
  onClose: () => void
}

export const VersionCompareModal: React.FC<VersionCompareModalProps> = ({ open, compareVersions, onClose }) => {
  return (
    <Modal
      title="Prompt 版本对比"
      open={open}
      onCancel={onClose}
      footer={<Button onClick={onClose}>关闭</Button>}
      width={1200}
    >
      {compareVersions.left && compareVersions.right && (
        <div className={styles.versionDiffContainer}>
          <div className={styles.versionPanel}>
            <div className={styles.versionPanelHeader}>
              <span className={styles.versionPanelTitle}>{compareVersions.left.name} ({compareVersions.left.version})</span>
              <Tag color="blue">旧版本</Tag>
            </div>
            <div className={styles.versionContent}>
              {compareVersions.left.content}
            </div>
          </div>
          <div className={styles.versionPanel}>
            <div className={styles.versionPanelHeader}>
              <span className={styles.versionPanelTitle}>{compareVersions.right.name} ({compareVersions.right.version})</span>
              <Tag color="green">新版本</Tag>
            </div>
            <div className={styles.versionContent}>
              {compareVersions.right.content}
            </div>
          </div>
        </div>
      )}
      <Alert
        message="差异说明"
        description="绿色背景表示新增内容，红色背景表示删除内容。实际diff功能需要后端支持。"
        type="info"
        showIcon
        className={styles.alertMarginTop}
      />
    </Modal>
  )
}
