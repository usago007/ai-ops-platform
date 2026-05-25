import React from 'react'
import { Modal, Table, Tag, Button } from 'antd'
import type { WorkflowEngine } from '../AgentOrchestrationPage.types'

interface WorkflowLogsModalProps {
  open: boolean
  selectedEngineForLogs: WorkflowEngine | null
  onClose: () => void
}

export const WorkflowLogsModal: React.FC<WorkflowLogsModalProps> = ({ open, selectedEngineForLogs, onClose }) => {
  return (
    <Modal
      title={`工作流日志 - ${selectedEngineForLogs?.name || ''}`}
      open={open}
      onCancel={onClose}
      footer={<Button onClick={onClose}>关闭</Button>}
      width={800}
    >
      <Table
        dataSource={[
          { id: 1, time: '2026-04-19 22:01:15', level: 'INFO', message: '工作流启动成功', node: '初始化' },
          { id: 2, time: '2026-04-19 22:01:18', level: 'INFO', message: '数据拉取完成，共 156 条记录', node: '数据节点' },
          { id: 3, time: '2026-04-19 22:01:22', level: 'WARN', message: 'AI 响应延迟 3.2s', node: 'AI 推理' },
          { id: 4, time: '2026-04-19 22:01:25', level: 'INFO', message: '规则校验通过', node: '规则引擎' },
          { id: 5, time: '2026-04-19 22:01:30', level: 'INFO', message: '工作流执行完成', node: '完成' },
        ]}
        rowKey="id"
        columns={[
          { title: '时间', dataIndex: 'time', key: 'time', width: 180 },
          { title: '级别', dataIndex: 'level', key: 'level', width: 70, render: (l: string) => <Tag color={l === 'INFO' ? 'blue' : l === 'WARN' ? 'orange' : 'red'}>{l}</Tag> },
          { title: '节点', dataIndex: 'node', key: 'node', width: 100 },
          { title: '消息', dataIndex: 'message', key: 'message' },
        ]}
        pagination={false}
        size="small"
        scroll={{ y: 300 }}
      />
    </Modal>
  )
}
