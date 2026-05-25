import React from 'react'
import { Modal, Descriptions, Badge, Divider, Input, Button } from 'antd'
import { EditOutlined } from '@/iconMap'
import type { PromptVersion } from '../AgentOrchestrationPage.types'
import { getStatusColor, getStatusText } from '../AgentOrchestrationPage.types'
import styles from '../AgentOrchestrationPage.module.css'

const { TextArea } = Input

interface PromptDetailModalProps {
  open: boolean
  selectedPrompt: PromptVersion | null
  onClose: () => void
  onEdit: (prompt: PromptVersion) => void
}

export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({ open, selectedPrompt, onClose, onEdit }) => {
  return (
    <Modal
      title={`Prompt 详情: ${selectedPrompt?.name || ''}`}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>关闭</Button>,
        <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => { if (selectedPrompt) { onClose(); onEdit(selectedPrompt) } }}>编辑</Button>,
      ]}
      width={700}
    >
      {selectedPrompt && (
        <div>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Prompt ID">{selectedPrompt.id}</Descriptions.Item>
            <Descriptions.Item label="版本">{selectedPrompt.version}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Badge status={getStatusColor(selectedPrompt.status) as any} text={getStatusText(selectedPrompt.status)} />
            </Descriptions.Item>
            <Descriptions.Item label="创建人">{selectedPrompt.creator}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{selectedPrompt.updatedAt}</Descriptions.Item>
            <Descriptions.Item label="使用次数">{selectedPrompt.usageCount}</Descriptions.Item>
            <Descriptions.Item label="成功率">
              {selectedPrompt.successRate}%
            </Descriptions.Item>
          </Descriptions>
          <Divider>Prompt 内容</Divider>
          <TextArea
            rows={8}
            value={selectedPrompt.content}
            readOnly
            className={styles.promptContent}
          />
        </div>
      )}
    </Modal>
  )
}
