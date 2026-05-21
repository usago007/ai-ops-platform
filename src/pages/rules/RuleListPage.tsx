import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Space, message, Modal, Input, Upload, Timeline, Spin, Form, Select, Tag as AntTag, Divider, Descriptions, Switch, InputNumber } from 'antd'
import { PlusOutlined, ImportOutlined, SearchOutlined, HistoryOutlined, WarningOutlined, FileTextOutlined, EditOutlined, EyeOutlined, PoweroffOutlined } from '@ant-design/icons'
import { ruleService } from '../../services'
import styles from './RuleListPage.module.css'
import { EmptyState } from '../../components/EmptyState'

const { TextArea } = Input

export const RuleListPage: React.FC = () => {
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [versionsVisible, setVersionsVisible] = useState(false)
  const [versions, setVersions] = useState<any[]>([])
  const [conflictVisible, setConflictVisible] = useState(false)
  const [conflictResult, setConflictResult] = useState<any>(null)
  const [selectedRule, setSelectedRule] = useState<any>(null)
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()

  useEffect(() => { loadRules() }, [])

  const loadRules = async () => {
    setLoading(true)
    try {
      const result = await ruleService.getRuleList()
      if (result.success) setRules(result.data.items)
    } catch (e) {
      message.error('加载失败')
    } finally { setLoading(false) }
  }

  const handleImport = async () => {
    try {
      const result = await ruleService.importRules()
      if (result.success) {
        message.success(`导入完成: ${result.data.imported}条成功, ${result.data.conflicts}条冲突`)
        setImportModalVisible(false)
        if (result.data.conflicts > 0) {
          checkConflicts()
        }
        loadRules()
      }
    } catch (e) { message.error('导入失败') }
  }

  const handleCreateRule = async (values: any) => {
    try {
      const result = await ruleService.createRule({
        ...values,
        status: values.status ? 'active' : 'disabled',
        tags: typeof values.tags === 'string' ? values.tags.split(',').map((t: string) => t.trim()) : values.tags,
      })
      if (result.success) {
        message.success('规则已创建')
        setCreateModalVisible(false)
        createForm.resetFields()
        loadRules()
      }
    } catch (e) { message.error('创建失败') }
  }

  const handleEditRule = async (values: any) => {
    if (!selectedRule) return
    try {
      const result = await ruleService.updateRule(selectedRule.id, {
        ...values,
        tags: typeof values.tags === 'string' ? values.tags.split(',').map((t: string) => t.trim()) : values.tags,
      })
      if (result.success) {
        message.success('规则已更新')
        setEditModalVisible(false)
        editForm.resetFields()
        setSelectedRule(null)
        loadRules()
      }
    } catch (e) { message.error('更新失败') }
  }

  const handleToggleRule = async (rule: any) => {
    try {
      const result = await ruleService.toggleRule(rule.id)
      if (result.success) {
        message.success(`规则已${result.data.status === 'active' ? '启用' : '禁用'}`)
        loadRules()
      }
    } catch (e) { message.error('操作失败') }
  }

  const handleViewDetail = (rule: any) => {
    setSelectedRule(rule)
    setDetailModalVisible(true)
  }

  const handleEdit = (rule: any) => {
    setSelectedRule(rule)
    editForm.setFieldsValue({
      name: rule.name,
      description: rule.description,
      condition: rule.condition,
      action: rule.action,
      priority: rule.priority,
      tags: rule.tags?.join(', '),
      status: rule.status === 'active',
    })
    setEditModalVisible(true)
  }

  const checkConflicts = async () => {
    try {
      const result = await ruleService.checkConflicts('RULE-100')
      if (result.success) {
        setConflictResult(result.data)
        setConflictVisible(true)
      }
    } catch (e) { console.error(e) }
  }

  const showVersions = async (id: string) => {
    try {
      const result = await ruleService.getRuleVersions(id)
      if (result.success) {
        setVersions(result.data.versions)
        setVersionsVisible(true)
      }
    } catch (e) { console.error(e) }
  }

  const columns = [
    { title: '规则ID', dataIndex: 'id', key: 'id', width: 120 },
    { title: '规则名称', dataIndex: 'name', key: 'name' },
    { title: '触发条件', dataIndex: 'condition', key: 'condition', ellipsis: true },
    { title: '执行动作', dataIndex: 'action', key: 'action', ellipsis: true },
    {
      title: '优先级', dataIndex: 'priority', key: 'priority', width: 80,
      render: (p: number) => <Tag color={p >= 80 ? 'red' : p >= 50 ? 'orange' : 'default'}>P{p}</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '启用' : '禁用'}</Tag>,
    },
    { title: '版本', dataIndex: 'version', key: 'version', width: 80 },
    {
      title: '操作', key: 'action', width: 240,
      render: (_: any, r: any) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(r)} title="详情" />
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} title="编辑" />
          <Button type="link" size="small" icon={<HistoryOutlined />} onClick={() => showVersions(r.id)} title="版本" />
          <Button type="link" size="small" icon={r.status === 'active' ? <PoweroffOutlined /> : <PlusOutlined />}
            onClick={() => handleToggleRule(r)}
            danger={r.status === 'active'}
            title={r.status === 'active' ? '禁用' : '启用'}
          />
          {r.conflictWith && <Button type="link" size="small" danger icon={<WarningOutlined />} onClick={checkConflicts} title="冲突检测" />}
        </Space>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>业务规则智能归纳</h2>
        <Space>
          <Input.Search placeholder="搜索规则..." style={{ width: 200 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { createForm.resetFields(); setCreateModalVisible(true) }}>
            新建规则
          </Button>
          <Button icon={<ImportOutlined />} onClick={() => setImportModalVisible(true)}>导入规则</Button>
        </Space>
      </div>

      <Card>
        {rules.length === 0 && !loading ? (
          <EmptyState
            icon={<FileTextOutlined />}
            title="暂无业务规则"
            description="导入规则文件或手动创建规则以开始"
            actionButton={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => { createForm.resetFields(); setCreateModalVisible(true) }}
              >
                新建规则
              </Button>
            }
          />
        ) : (
          <Table columns={columns} dataSource={rules} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
        )}
      </Card>

      {/* 新建规则 Modal */}
      <Modal
        title="新建业务规则"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => createForm.submit()}
        okText="创建"
        cancelText="取消"
        width={700}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateRule} style={{ marginTop: 16 }}>
          <Form.Item label="规则名称" name="name" rules={[{ required: true, message: '请输入规则名称' }]}>
            <Input placeholder="如：高价值订单优先处理规则" />
          </Form.Item>
          <Form.Item label="规则描述" name="description">
            <TextArea rows={2} placeholder="描述规则的用途和适用场景" />
          </Form.Item>
          <Form.Item label="触发条件（IF）" name="condition" rules={[{ required: true, message: '请输入触发条件' }]}>
            <TextArea rows={3} placeholder="如：订单金额 > 10000 且 客户等级 = VIP" />
          </Form.Item>
          <Form.Item label="执行动作（THEN）" name="action" rules={[{ required: true, message: '请输入执行动作' }]}>
            <TextArea rows={3} placeholder="如：标记为高优先级，分配给高级客服" />
          </Form.Item>
          <Form.Item label="优先级" name="priority" initialValue={50}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="适用品类标签" name="tags">
            <Input placeholder="多个标签用逗号分隔，如：PLC,变频器,传感器" />
          </Form.Item>
          <Form.Item label="启用状态" name="status" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑规则 Modal */}
      <Modal
        title="编辑业务规则"
        open={editModalVisible}
        onCancel={() => { setEditModalVisible(false); setSelectedRule(null) }}
        onOk={() => editForm.submit()}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditRule} style={{ marginTop: 16 }}>
          <Form.Item label="规则名称" name="name" rules={[{ required: true, message: '请输入规则名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="规则描述" name="description">
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item label="触发条件（IF）" name="condition" rules={[{ required: true, message: '请输入触发条件' }]}>
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item label="执行动作（THEN）" name="action" rules={[{ required: true, message: '请输入执行动作' }]}>
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item label="优先级" name="priority">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="适用品类标签" name="tags">
            <Input placeholder="多个标签用逗号分隔" />
          </Form.Item>
          <Form.Item label="启用状态" name="status" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 规则详情 Modal */}
      <Modal
        title={`规则详情：${selectedRule?.name || ''}`}
        open={detailModalVisible}
        onCancel={() => { setDetailModalVisible(false); setSelectedRule(null) }}
        footer={[
          <Button key="close" onClick={() => { setDetailModalVisible(false); setSelectedRule(null) }}>关闭</Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => { setDetailModalVisible(false); if (selectedRule) handleEdit(selectedRule) }}>编辑</Button>,
        ]}
        width={700}
      >
        {selectedRule && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="规则ID">{selectedRule.id}</Descriptions.Item>
              <Descriptions.Item label="版本">v{selectedRule.version}</Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={selectedRule.priority >= 80 ? 'red' : selectedRule.priority >= 50 ? 'orange' : 'default'}>
                  P{selectedRule.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedRule.status === 'active' ? 'green' : 'default'}>
                  {selectedRule.status === 'active' ? '已启用' : '已禁用'}
                </Tag>
              </Descriptions.Item>
              {selectedRule.tags && selectedRule.tags.length > 0 && (
                <Descriptions.Item label="适用品类" span={2}>
                  <Space wrap>
                    {selectedRule.tags.map((tag: string, i: number) => (
                      <AntTag key={i} color="blue">{tag}</AntTag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="创建人">{selectedRule.creator || '系统'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedRule.created_at || '-'}</Descriptions.Item>
            </Descriptions>
            <Divider>触发条件（IF）</Divider>
            <div style={{ background: '#fafafa', padding: 12, borderRadius: 4, fontFamily: 'monospace', fontSize: 13 }}>
              {selectedRule.condition}
            </div>
            <Divider>执行动作（THEN）</Divider>
            <div style={{ background: '#fafafa', padding: 12, borderRadius: 4, fontFamily: 'monospace', fontSize: 13 }}>
              {selectedRule.action}
            </div>
            {selectedRule.description && (
              <>
                <Divider>规则描述</Divider>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>{selectedRule.description}</div>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal title="导入规则文件" open={importModalVisible} onCancel={() => setImportModalVisible(false)}
        onOk={handleImport} okText="导入" cancelText="取消">
        <Upload.Dragger>
          <p className="ant-upload-drag-icon"><ImportOutlined /></p>
          <p>点击或拖拽 PDF、Word、Excel 文件到此区域</p>
        </Upload.Dragger>
      </Modal>

      <Modal title="版本历史" open={versionsVisible} onCancel={() => setVersionsVisible(false)} footer={null}>
        <Timeline>
          {versions.map((v: any) => (
            <Timeline.Item key={v.version}>{v.version} - {v.date} - {v.author} - {v.change}</Timeline.Item>
          ))}
        </Timeline>
      </Modal>

      <Modal title="规则冲突检测" open={conflictVisible} onCancel={() => setConflictVisible(false)}
        footer={<Button type="primary" onClick={() => setConflictVisible(false)}>我知道了</Button>}>
        {conflictResult?.hasConflict && conflictResult.conflicts.map((c: any, i: number) => (
          <Card key={i} className={styles.conflictCard}>
            <Tag color="red" className={styles.conflictTag}><WarningOutlined /> 冲突检测</Tag>
            <div className={styles.conflictGrid}>
              <div>
                <h4>{c.ruleA.name}</h4>
                <code>{c.ruleA.condition}</code>
              </div>
              <div>
                <h4>{c.ruleB.name}</h4>
                <code>{c.ruleB.condition}</code>
              </div>
            </div>
            <p className={styles.conflictDesc}>{c.description}</p>
            <Space><Button type="primary">保留规则A</Button><Button>保留规则B</Button><Button>合并</Button></Space>
          </Card>
        ))}
      </Modal>
    </div>
  )
}
