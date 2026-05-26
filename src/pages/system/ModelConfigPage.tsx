import React, { useEffect, useState } from 'react'
import { Card, Table, Button, Modal, Form, Input, InputNumber, Switch, Tag, Spin, message, Select } from 'antd'
import { EditOutlined, StopOutlined, ThunderboltOutlined, PlusOutlined, InboxOutlined } from '@/iconMap'
import { modelService } from '../../services'
import styles from './ModelConfigPage.module.css'
import formStyles from '../../styles/form.module.css'

interface ModelConfig {
  id: string
  name: string
  provider: string
  status: 'active' | 'inactive'
  apiKey: string
  endpoint: string
  temperature: number
  topP: number
  maxTokens: number
  latency: number
  costPerCall: number
}

export const ModelConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [models, setModels] = useState<ModelConfig[]>([])
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [currentModel, setCurrentModel] = useState<ModelConfig | null>(null)
  const [form] = Form.useForm()
  const [createForm] = Form.useForm()

  useEffect(() => {
    modelService.getModels()
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : res.data.models || []
        setModels(list)
      })
      .catch((error) => {
        console.error(error)
        message.error('模型列表加载失败')
        setModels([])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleEdit = (record: ModelConfig) => {
    setCurrentModel(record)
    form.setFieldsValue({
      name: record.name,
      temperature: record.temperature,
      topP: record.topP,
      maxTokens: record.maxTokens,
    })
    setEditModalVisible(true)
  }

  const handleSave = () => {
    form.validateFields().then(values => {
      modelService.updateModel(currentModel?.id || '', values)
        .then(() => {
          message.success('模型配置已更新')
          setEditModalVisible(false)
          setModels(prev =>
            prev.map(m =>
              m.id === currentModel?.id ? { ...m, ...values } : m
            )
          )
        })
    })
  }

  const handleToggleStatus = (record: ModelConfig) => {
    const newStatus = record.status === 'active' ? 'inactive' : 'active'
    modelService.toggleModelStatus(record.id).then(() => {
      setModels(prev =>
        prev.map(m =>
          m.id === record.id ? { ...m, status: newStatus } : m
        )
      )
      message.success(`模型 ${record.name} 已${newStatus === 'active' ? '启用' : '停用'}`)
    })
  }

  const handleTest = (record: ModelConfig) => {
    message.loading({ content: '正在测试连接...', key: 'test' })
    modelService.testModel(record.id)
      .then(res => {
        message.success({
          content: `连接成功！延迟: ${res.data.latency}ms`,
          key: 'test',
        })
      })
  }

  const handleCreate = () => {
    createForm.validateFields().then(values => {
      const newModel: Omit<ModelConfig, 'id' | 'latency' | 'costPerCall'> = {
        name: values.name,
        provider: values.provider,
        status: 'active',
        apiKey: values.apiKey,
        endpoint: values.endpoint,
        temperature: values.temperature || 0.7,
        topP: values.topP || 0.9,
        maxTokens: values.maxTokens || 2048,
      }
      
      modelService.createModel(newModel)
        .then((res) => {
          message.success('模型添加成功')
          setCreateModalVisible(false)
          createForm.resetFields()
          if (res.success && res.data.model) {
            setModels(prev => [...prev, res.data.model])
          }
        })
    })
  }

  const columns = [
    {
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '供应商',
      dataIndex: 'provider',
      key: 'provider',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '已启用' : '已停用'}
        </Tag>
      ),
    },
    {
      title: 'API Key',
      dataIndex: 'apiKey',
      key: 'apiKey',
      width: 180,
    },
    {
      title: 'Temperature',
      dataIndex: 'temperature',
      key: 'temperature',
    },
    {
      title: '延迟 (ms)',
      dataIndex: 'latency',
      key: 'latency',
    },
    {
      title: '成本/次 ($)',
      dataIndex: 'costPerCall',
      key: 'costPerCall',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ModelConfig) => (
        <div className={styles.actionButtons}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            size="small"
            icon={<ThunderboltOutlined />}
            onClick={() => handleTest(record)}
          >
            测试
          </Button>
          <Button
            size="small"
            icon={<StopOutlined />}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 'active' ? '停用' : '启用'}
          </Button>
        </div>
      ),
    },
  ]

  if (loading) {
    return <Spin size="large" className={styles.loading} tip="加载模型配置..." />
  }

  return (
    <div className={styles.container}>
      <Card
        title="AI 模型配置管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
            添加模型
          </Button>
        }
      >
        {models.length === 0 ? (
          <div className={styles.emptyState}>
            <InboxOutlined className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>暂无模型配置</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>添加您的第一个模型</Button>
          </div>
        ) : (
          <Table
            dataSource={models}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        )}
      </Card>

      <Modal
        title="编辑模型参数"
        open={editModalVisible}
        onOk={handleSave}
        onCancel={() => setEditModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="模型名称" name="name">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Temperature" name="temperature" rules={[{ type: 'number', min: 0, max: 2, message: '温度范围 0-2' }]}>
            <InputNumber min={0} max={1} step={0.1} className={formStyles.fullWidth} />
          </Form.Item>
          <Form.Item label="Top P" name="topP" rules={[{ type: 'number', min: 0, max: 1, message: 'Top P 范围 0-1' }]}>
            <InputNumber min={0} max={1} step={0.05} className={formStyles.fullWidth} />
          </Form.Item>
          <Form.Item label="Max Tokens" name="maxTokens" rules={[{ type: 'number', min: 1, max: 128000, message: 'Max Tokens 范围 1-128000' }]}>
            <InputNumber min={256} max={8192} step={256} className={formStyles.fullWidth} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加新模型"
        open={createModalVisible}
        onOk={handleCreate}
        onCancel={() => setCreateModalVisible(false)}
        width={600}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item label="模型名称" name="name" rules={[{ required: true, message: '请输入模型名称' }]}>
            <Input placeholder="例如：gpt-4-turbo" />
          </Form.Item>
          <Form.Item label="供应商" name="provider" rules={[{ required: true, message: '请选择供应商' }]}>
            <Select placeholder="选择模型供应商">
              <Select.Option value="OpenAI">OpenAI</Select.Option>
              <Select.Option value="Anthropic">Anthropic</Select.Option>
              <Select.Option value="Alibaba">Alibaba (通义千问)</Select.Option>
              <Select.Option value="Google">Google (Gemini)</Select.Option>
              <Select.Option value="其他">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="API Key" name="apiKey" rules={[{ required: true, message: '请输入API Key' }]}>
            <Input.Password placeholder="输入API Key" />
          </Form.Item>
          <Form.Item label="API Endpoint" name="endpoint" rules={[{ required: true, message: '请输入API端点' }]}>
            <Input placeholder="例如：https://api.openai.com/v1" />
          </Form.Item>
          <Form.Item label="Temperature" name="temperature" initialValue={0.7}>
            <InputNumber min={0} max={1} step={0.1} className={formStyles.fullWidth} />
          </Form.Item>
          <Form.Item label="Top P" name="topP" initialValue={0.9}>
            <InputNumber min={0} max={1} step={0.05} className={formStyles.fullWidth} />
          </Form.Item>
          <Form.Item label="Max Tokens" name="maxTokens" initialValue={2048}>
            <InputNumber min={256} max={8192} step={256} className={formStyles.fullWidth} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
