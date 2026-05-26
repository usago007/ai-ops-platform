import React from 'react'
import { Modal, Form, Input } from 'antd'
import type { FormInstance } from 'antd/es/form'
import formStyles from '../../../styles/form.module.css'

const { TextArea } = Input

interface PromptEditModalProps {
  open: boolean
  form: FormInstance
  onOk: () => void
  onCancel: () => void
}

export const PromptEditModal: React.FC<PromptEditModalProps> = ({ open, form, onOk, onCancel }) => {
  return (
    <Modal
      title="编辑 Prompt"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      width={700}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Prompt 名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
          <Input placeholder="Prompt 名称" />
        </Form.Item>
        <Form.Item label="版本号" name="version" rules={[{ required: true, message: '请输入版本号' }]}>
          <Input placeholder="如：v1.0.1" />
        </Form.Item>
        <Form.Item label="Prompt 内容" name="content" rules={[{ required: true, message: '请输入内容' }]}>
          <TextArea rows={8} className={formStyles.textarea} placeholder="请输入 Prompt 模板内容..." />
        </Form.Item>
      </Form>
    </Modal>
  )
}
