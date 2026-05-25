import React from 'react'
import { Modal, Form, Input } from 'antd'
import type { FormInstance } from 'antd/es/form'

const { TextArea } = Input

interface PromptCreateModalProps {
  open: boolean
  form: FormInstance
  onOk: () => void
  onCancel: () => void
}

export const PromptCreateModal: React.FC<PromptCreateModalProps> = ({ open, form, onOk, onCancel }) => {
  return (
    <Modal
      title="新建 Prompt"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      width={700}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Prompt 名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
          <Input placeholder="如：询报价分类 Prompt" />
        </Form.Item>
        <Form.Item label="Prompt 内容" name="content" rules={[{ required: true, message: '请输入内容' }]}>
          <TextArea rows={10} placeholder="请输入 Prompt 模板内容..." />
        </Form.Item>
      </Form>
    </Modal>
  )
}
