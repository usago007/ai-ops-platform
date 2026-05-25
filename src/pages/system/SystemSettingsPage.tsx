import React, { useEffect, useState } from 'react'
import { Card, Form, InputNumber, Input, Select, Button, message, Spin, Row, Col, Divider, Tabs, Table, Tag, Switch, Space, Popconfirm, Modal } from 'antd'
import { SaveOutlined, DeleteOutlined, PlusOutlined } from '@/iconMap'
import type { ColumnsType } from 'antd/es/table'
import { systemService } from '../../services'
import styles from './SystemSettingsPage.module.css'

interface SystemSettings {
  performance: {
    aiTimeout: number
    maxConcurrent: number
    apiRateLimit: number
  }
  security: {
    dataMasking: boolean
    keyRotationDays: number
    ipWhitelist: string[]
  }
  business: {
    classificationThreshold: number
    productQualityThreshold: number
  }
  environment: string
  language: string
}

interface ComplianceWordsData {
  forbidden: string[]
  extreme: string[]
  sensitive: string[]
  total: number
}

interface NotificationTemplate {
  id: string
  type: string
  name: string
  enabled: boolean
  recipients?: string[]
  url?: string
}

export const SystemSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [complianceWords, setComplianceWords] = useState<ComplianceWordsData | null>(null)
  const [notifications, setNotifications] = useState<NotificationTemplate[]>([])
  const [form] = Form.useForm()
  const [complianceModalVisible, setComplianceModalVisible] = useState(false)
  const [notificationModalVisible, setNotificationModalVisible] = useState(false)
  const [complianceForm] = Form.useForm()
  const [notificationForm] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [form])

  const loadData = async () => {
    setLoading(true)
    try {
      const [settingsRes, complianceRes, notifyRes] = await Promise.all([
        systemService.getSettings(),
        systemService.getComplianceWords(),
        systemService.getNotifications(),
      ])
      const nextSettings = settingsRes.success ? settingsRes.data : null
      setSettings(nextSettings)
      form.setFieldsValue(nextSettings ? {
        ...nextSettings,
        security: {
          ...nextSettings.security,
          ipWhitelist: (nextSettings.security?.ipWhitelist || []).join(', '),
        },
      } : {})
      setComplianceWords(complianceRes.success ? complianceRes.data : { forbidden: [], extreme: [], sensitive: [], total: 0 })
      setNotifications(notifyRes.success ? notifyRes.data.templates || [] : [])
    } catch (error) {
      console.error(error)
      message.error('系统配置加载失败，已使用空数据兜底')
      setSettings(null)
      setComplianceWords({ forbidden: [], extreme: [], sensitive: [], total: 0 })
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    form.validateFields().then(values => {
      const normalizedValues = {
        ...values,
        security: {
          ...values.security,
          ipWhitelist: String(values.security?.ipWhitelist || '')
            .split(',')
            .map((item: string) => item.trim())
            .filter(Boolean),
        },
      }
      systemService.updateSettings(normalizedValues)
        .then(() => {
          message.success('系统参数已保存，立即生效')
          setSettings(normalizedValues)
          form.setFieldsValue({
            ...normalizedValues,
            security: {
              ...normalizedValues.security,
              ipWhitelist: normalizedValues.security.ipWhitelist.join(', '),
            },
          })
        })
    })
  }

  const handleDeleteWord = (category: string, word: string) => {
    const categoryKey = category === '违禁' ? 'forbidden' : category === '极限' ? 'extreme' : 'sensitive'
    systemService.removeComplianceWord(categoryKey, word).then((res) => {
      if (res.success) {
        setComplianceWords(res.data)
        message.success(`已从 ${category} 词库中移除: ${word}`)
      }
    })
  }

  const handleToggleNotification = (id: string, enabled: boolean) => {
    systemService.toggleNotification(id, enabled).then((res) => {
      if (res.success) {
        setNotifications(res.data.templates || [])
        message.success(`通知模板已${enabled ? '启用' : '禁用'}`)
      }
    })
  }

  const handleAddComplianceWord = () => {
    complianceForm.validateFields().then(values => {
      const { category, word } = values
      systemService.addComplianceWord(category, word).then((res) => {
        if (res.success) {
          setComplianceWords(res.data)
          message.success(`已添加合规词: ${word} 到 ${category === 'forbidden' ? '违禁词' : category === 'extreme' ? '极限词' : '敏感词'} 库`)
          setComplianceModalVisible(false)
          complianceForm.resetFields()
        }
      })
    })
  }

  const handleAddNotification = () => {
    notificationForm.validateFields().then(values => {
      const payload: Omit<NotificationTemplate, 'id'> = {
        type: values.type,
        name: values.name,
        enabled: true,
        recipients: values.recipients ? values.recipients.split(',').map((s: string) => s.trim()) : undefined,
        url: values.url,
      }
      systemService.addNotification(payload).then((res) => {
        if (res.success) {
          setNotifications(res.data.templates || [])
          message.success(`通知模板已添加: ${values.name}`)
          setNotificationModalVisible(false)
          notificationForm.resetFields()
        }
      })
    })
  }

  const complianceColumns: ColumnsType<string> = [
    {
      title: '词汇',
      dataIndex: 'word',
      key: 'word',
      render: (text: string) => <Tag color="red">{text}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: string) => (
        <Popconfirm title="确认移除此词？" onConfirm={() => handleDeleteWord('违禁', record)}>
          <Button size="small" danger icon={<DeleteOutlined />}>移除</Button>
        </Popconfirm>
      ),
    },
  ]

  const notificationColumns: ColumnsType<NotificationTemplate> = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => {
        const colorMap: Record<string, string> = { email: 'blue', sms: 'green', webhook: 'purple' }
        return <Tag color={colorMap[type] || 'default'}>{type.toUpperCase()}</Tag>
      },
    },
    {
      title: '接收方',
      dataIndex: 'recipients',
      key: 'recipients',
      width: 200,
      render: (recipients: string[] | undefined, record: NotificationTemplate) => (
        <span>{recipients?.join(', ') || record.url}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean, record: NotificationTemplate) => (
        <Switch checked={enabled} onChange={(checked) => handleToggleNotification(record.id, checked)} size="small" />
      ),
    },
  ]

  if (loading) {
    return <Spin size="large" className={styles.loading} />
  }

  const tabItems = [
    {
      key: 'settings',
      label: '系统参数',
      children: (
        <Form form={form} layout="vertical">
          <Divider>性能参数</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="AI 推理超时时间 (ms)" name={['performance', 'aiTimeout']}>
                <InputNumber min={1000} max={10000} step={500} className={styles.fullWidth} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="批量处理并发数" name={['performance', 'maxConcurrent']}>
                <InputNumber min={10} max={200} step={10} className={styles.fullWidth} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="API 限流阈值 (QPS)" name={['performance', 'apiRateLimit']}>
                <InputNumber min={100} max={5000} step={100} className={styles.fullWidth} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>安全策略</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="API 密钥轮换周期 (天)" name={['security', 'keyRotationDays']}>
                <InputNumber min={30} max={365} step={30} className={styles.fullWidth} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item label="IP 白名单" name={['security', 'ipWhitelist']}>
                <Input.TextArea rows={3} placeholder="多个 IP 用逗号分隔" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>业务默认值</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="归类准确率阈值" name={['business', 'classificationThreshold']}>
                <InputNumber min={0.8} max={0.99} step={0.01} className={styles.fullWidth} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="商品完整度阈值 (分)" name={['business', 'productQualityThreshold']}>
                <InputNumber min={40} max={80} step={5} className={styles.fullWidth} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>全局设置</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="运行环境" name="environment">
                <Select>
                  <Select.Option value="development">Development</Select.Option>
                  <Select.Option value="staging">Staging</Select.Option>
                  <Select.Option value="production">Production</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="系统语言" name="language">
                <Select>
                  <Select.Option value="zh-CN">简体中文</Select.Option>
                  <Select.Option value="en-US">English</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ),
    },
    {
      key: 'compliance',
      label: '合规词库',
      children: (
        <div>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card title="违禁词" size="small" className={styles.wordCard}>
                <Tag color="red">{complianceWords?.forbidden.length || 0} 个</Tag>
                <Table<string>
                  dataSource={complianceWords?.forbidden || []}
                  columns={complianceColumns}
                  rowKey={(record) => record}
                  size="small"
                  pagination={false}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="极限词" size="small" className={styles.wordCard}>
                <Tag color="orange">{complianceWords?.extreme.length || 0} 个</Tag>
                <Table<string>
                  dataSource={complianceWords?.extreme || []}
                  columns={complianceColumns}
                  rowKey={(record) => record}
                  size="small"
                  pagination={false}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="敏感词" size="small" className={styles.wordCard}>
                <Tag color="gold">{complianceWords?.sensitive.length || 0} 个</Tag>
                <Table<string>
                  dataSource={complianceWords?.sensitive || []}
                  columns={complianceColumns}
                  rowKey={(record) => record}
                  size="small"
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>
          <div className={styles.addWordActions}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setComplianceModalVisible(true)}>添加新词</Button>
          </div>
        </div>
      ),
    },
    {
      key: 'notifications',
      label: '通知配置',
      children: (
        <Card
          title="告警通知模板"
          extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setNotificationModalVisible(true)}>新增模板</Button>}
        >
          <Table<NotificationTemplate>
            dataSource={notifications}
            columns={notificationColumns}
            rowKey="id"
            pagination={false}
          />
          <Divider>通知渠道说明</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small">
                <Tag color="blue">EMAIL</Tag>
                <p className={styles.channelDescription}>邮件通知，适用于日常操作日志和合规告警</p>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Tag color="green">SMS</Tag>
                <p className={styles.channelDescription}>短信通知，适用于紧急系统故障和性能告警</p>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Tag color="purple">WEBHOOK</Tag>
                <p className={styles.channelDescription}>Webhook 通知，适用于第三方系统集成（钉钉、企微等）</p>
              </Card>
            </Col>
          </Row>
        </Card>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <Card
        title="系统参数设置"
        extra={
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            保存配置
          </Button>
        }
      >
        <Tabs items={tabItems} defaultActiveKey="settings" />
      </Card>

      {/* 添加合规词 Modal */}
      <Modal
        title="添加合规词"
        open={complianceModalVisible}
        onOk={handleAddComplianceWord}
        onCancel={() => setComplianceModalVisible(false)}
      >
        <Form form={complianceForm} layout="vertical">
          <Form.Item label="词库分类" name="category" rules={[{ required: true, message: '请选择分类' }]}>
            <Select>
              <Select.Option value="forbidden">违禁词</Select.Option>
              <Select.Option value="extreme">极限词</Select.Option>
              <Select.Option value="sensitive">敏感词</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="词汇内容" name="word" rules={[{ required: true, message: '请输入词汇' }]}>
            <Input placeholder="请输入要添加的词汇" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增通知模板 Modal */}
      <Modal
        title="新增通知模板"
        open={notificationModalVisible}
        onOk={handleAddNotification}
        onCancel={() => setNotificationModalVisible(false)}
      >
        <Form form={notificationForm} layout="vertical">
          <Form.Item label="模板名称" name="name" rules={[{ required: true, message: '请输入模板名称' }]}>
            <Input placeholder="如：系统故障告警" />
          </Form.Item>
          <Form.Item label="通知类型" name="type" rules={[{ required: true, message: '请选择类型' }]}>
            <Select>
              <Select.Option value="email">Email</Select.Option>
              <Select.Option value="sms">SMS</Select.Option>
              <Select.Option value="webhook">Webhook</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="接收方邮箱" name="recipients">
            <Input.TextArea rows={2} placeholder="多个邮箱用逗号分隔" />
          </Form.Item>
          <Form.Item label="Webhook URL" name="url">
            <Input placeholder="https://hooks.example.com/notify" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
