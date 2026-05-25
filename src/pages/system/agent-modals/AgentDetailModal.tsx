import React from 'react'
import { Modal, Descriptions, Tag } from 'antd'
import type { AgentNode } from '../AgentOrchestrationPage.types'
import { businessModuleColors } from '../AgentOrchestrationPage.types'
import styles from '../AgentOrchestrationPage.module.css'

interface AgentDetailModalProps {
  open: boolean
  selectedAgent: AgentNode | null
  onClose: () => void
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({ open, selectedAgent, onClose }) => {
  return (
    <Modal
      title="Agent 详细信息"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      {selectedAgent && (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Agent ID" span={2}>{selectedAgent.id}</Descriptions.Item>
          <Descriptions.Item label="Agent 名称" span={2}>{selectedAgent.name}</Descriptions.Item>
          <Descriptions.Item label="使用模型">{selectedAgent.modelName}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={selectedAgent.status === 'online' ? 'success' : 'error'}>
              {selectedAgent.status === 'online' ? '在线' : '离线'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="权重">{selectedAgent.weight}</Descriptions.Item>
          <Descriptions.Item label="类型">{selectedAgent.type === 'master' ? 'Master' : 'Worker'}</Descriptions.Item>
          <Descriptions.Item label="负责模块" span={2}>
            {selectedAgent.businessModules?.map((module, idx) => (
              <Tag key={idx} color={businessModuleColors[module]}>
                {module}
              </Tag>
            ))}
          </Descriptions.Item>
          <Descriptions.Item label="页面映射" span={2}>
            {selectedAgent.routeMapping?.map((route, idx) => (
              <div key={idx} className={styles.routeItemMargin}>
                <a href={route.path}>{route.label}</a> <code>{route.path}</code>
              </div>
            ))}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  )
}
