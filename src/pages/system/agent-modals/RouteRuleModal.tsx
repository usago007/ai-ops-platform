import React from 'react'
import { Modal, Form, Input, Select } from 'antd'
import type { FormInstance } from 'antd/es/form'

interface RouteRuleModalProps {
  open: boolean
  editingRouteRuleIndex: number | null
  form: FormInstance
  onOk: () => void
  onCancel: () => void
}

export const RouteRuleModal: React.FC<RouteRuleModalProps> = ({ open, editingRouteRuleIndex, form, onOk, onCancel }) => {
  return (
    <Modal
      title={editingRouteRuleIndex !== null ? '编辑路由规则' : '添加路由规则'}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="匹配模式" name="pattern" rules={[{ required: true, message: '请输入匹配模式' }]}>
          <Input placeholder="如：classification、generation、embedding" />
        </Form.Item>
        <Form.Item label="目标模型" name="model" rules={[{ required: true, message: '请选择模型' }]}>
          <Select>
            <Select.Option value="gpt-4-turbo">GPT-4 Turbo</Select.Option>
            <Select.Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Select.Option>
            <Select.Option value="claude-3-sonnet">Claude 3 Sonnet</Select.Option>
            <Select.Option value="claude-3-haiku">Claude 3 Haiku</Select.Option>
            <Select.Option value="text-embedding-3-large">text-embedding-3-large</Select.Option>
            <Select.Option value="qwen-turbo">通义千问 Turbo</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}
