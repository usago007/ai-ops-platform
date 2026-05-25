import React from 'react'
import { Modal, Alert, Table, Tag } from 'antd'
import type { Workflow } from '../AgentOrchestrationPage.types'
import styles from '../AgentOrchestrationPage.module.css'

interface WorkflowVisualModalProps {
  open: boolean
  selectedWorkflow: Workflow | null
  onClose: () => void
}

export const WorkflowVisualModal: React.FC<WorkflowVisualModalProps> = ({ open, selectedWorkflow, onClose }) => {
  return (
    <Modal
      title={`Workflow 流程: ${selectedWorkflow?.name || ''}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      {selectedWorkflow && (
        <div>
          <Alert
            message={`负责 Agent: ${selectedWorkflow.agent}`}
            type="info"
            showIcon
            className={styles.alertMargin}
          />
          <Table
            dataSource={selectedWorkflow.nodes}
            rowKey="id"
            columns={[
              { title: '节点', dataIndex: 'label', key: 'label' },
              {
                title: '类型',
                dataIndex: 'type',
                key: 'type',
                render: (type: string) => (
                  <Tag color={type === 'ai' ? 'purple' : type === 'rule' ? 'blue' : 'green'}>
                    {type === 'ai' ? 'AI' : type === 'rule' ? '规则' : '数据'}
                  </Tag>
                )
              },
              { title: '模型', dataIndex: ['ai', 'model'], key: 'model' },
              { title: '输入', dataIndex: 'input', key: 'input' },
              { title: '输出', dataIndex: 'output', key: 'output' },
            ]}
            pagination={false}
          />
        </div>
      )}
    </Modal>
  )
}
