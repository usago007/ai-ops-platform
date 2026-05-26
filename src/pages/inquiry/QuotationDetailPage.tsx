import React, { useState, useEffect } from 'react'
import { Card, Descriptions, Timeline, Form, Input, Button, Space, Typography, Tag, Row, Col, message, Spin, Modal, Divider, Table } from 'antd'
import { ArrowLeftOutlined, ClockCircleOutlined, PlusOutlined, TrophyOutlined, FrownOutlined, FileTextOutlined, EditOutlined, HistoryOutlined, SendOutlined } from '@/iconMap'
import { useParams, useNavigate } from 'react-router-dom'
import { inquiryService } from '../../services'
import styles from './QuotationDetailPage.module.css'
import formStyles from '../../styles/form.module.css'

const { Title, Text } = Typography

interface QuotationProduct {
  name: string
  quantity: number
  unit: string
  unitPrice: number
  subtotal: number
}

interface InquiryLead {
  id: string
  source: string
  customer: string
  company: string
  contact: string
  full_text: string
  status: string
  created_at: string
  quotation?: {
    delivery: string
    payment: string
    validUntil: string
    products: QuotationProduct[]
  }
}

interface FollowUpItem {
  type: string
  content: string
  created_at: string
}

interface QuotationVersion {
  version: number
  total: number
  delivery: string
  payment: string
  created_at: string
}

interface FollowUpFormValues {
  type: string
  content: string
}

const RESULT_CONFIG: Record<string, { color: string; label: string }> = {
  'quoting': { color: 'blue', label: '报价中' },
  'quoted': { color: 'purple', label: '已报价' },
  'won': { color: 'green', label: '成单' },
  'lost': { color: 'red', label: '丢单' },
}

const TIMELINE_EVENT_CONFIG: Record<string, { color: string; label: string }> = {
  'quotation': { color: 'blue', label: '报价发送' },
  'follow_up': { color: 'gray', label: '跟进记录' },
  'revision': { color: 'orange', label: '修改报价' },
  'result': { color: 'green', label: '结果标记' },
  'phone': { color: 'blue', label: '电话沟通' },
  'meeting': { color: 'green', label: '面谈' },
  'update': { color: 'gray', label: '更新' },
}

export const QuotationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lead, setLead] = useState<InquiryLead | null>(null)
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([])
  const [quotationHistory, setQuotationHistory] = useState<QuotationVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [resultModalVisible, setResultModalVisible] = useState(false)
  const [selectedResult, setSelectedResult] = useState<'won' | 'lost'>('won')
  const [reason, setReason] = useState('')
  const [form] = Form.useForm()

  useEffect(() => { loadData() }, [id])

  const loadData = async () => {
    try {
      const [leadResult, followUpsResult, historyResult] = await Promise.all([
        inquiryService.getInquiryDetail(id || ''),
        inquiryService.getFollowUps(id || ''),
        inquiryService.getQuotationHistory(id || ''),
      ])
      if (leadResult.success) setLead(leadResult.data)
      if (followUpsResult.success) setFollowUps(followUpsResult.data.items || [])
      if (historyResult.success) setQuotationHistory(historyResult.data.versions || [])
    } catch {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddFollowUp = async (values: FollowUpFormValues) => {
    setSubmitting(true)
    try {
      const result = await inquiryService.addFollowUp(id || '', values)
      if (result.success) {
        message.success('跟进记录已添加')
        form.resetFields()
        loadData()
      }
    } catch {
      message.error('添加失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkResult = async () => {
    setSubmitting(true)
    try {
      const result = await inquiryService.markResult(
        id || '',
        selectedResult,
        reason,
        lead?.quotation?.products?.reduce((s: number, p: QuotationProduct) => s + p.quantity * p.unitPrice, 0),
      )
      if (result.success) {
        message.success(selectedResult === 'won' ? '已标记为成单' : '已标记为丢单')
        setResultModalVisible(false)
        setReason('')
        loadData()
      }
    } catch {
      message.error('标记失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleModifyQuotation = () => {
    navigate(`/inquiry/quotation/${id}`, { state: { mode: 'revision' } })
  }

  const quotationColumns = [
    { title: '产品', dataIndex: 'name', key: 'name' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
    { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', width: 120, render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '小计', dataIndex: 'subtotal', key: 'subtotal', width: 120, render: (_: any, r: QuotationProduct) => `¥${(r.quantity * r.unitPrice).toLocaleString()}` },
  ]

  const totalAmount = (lead?.quotation?.products || []).reduce((sum: number, p: QuotationProduct) => sum + p.quantity * p.unitPrice, 0)

  if (loading) return <div className={styles.center}><Spin size="large" tip="加载报价详情..." /></div>

  const allTimelineItems = [
    ...followUps.map((fu: FollowUpItem) => ({
      color: TIMELINE_EVENT_CONFIG[fu.type]?.color || 'gray',
      children: (
        <div className={styles.timelineItem}>
          <div className={styles.timelineHeader}>
            <Tag color={TIMELINE_EVENT_CONFIG[fu.type]?.color || 'gray'}>
              {TIMELINE_EVENT_CONFIG[fu.type]?.label || fu.type}
            </Tag>
            <Text type="secondary" className={styles.timeText}>{fu.created_at}</Text>
          </div>
          <Text>{fu.content}</Text>
        </div>
      ),
    })),
    ...quotationHistory.map((v: QuotationVersion) => ({
      color: 'orange',
      children: (
        <div className={styles.timelineItem}>
          <div className={styles.timelineHeader}>
            <Tag color="orange">
              {v.version === 1 ? '首次报价' : `第${v.version}次修改报价`}
            </Tag>
            <Text type="secondary" className={styles.timeText}>{v.created_at}</Text>
          </div>
          <Text>总金额: ¥{v.total?.toLocaleString()} | 交期: {v.delivery} | 付款: {v.payment}</Text>
        </div>
      ),
    })),
  ].sort((a, b) => 0)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/inquiry/quotation-list')} className={styles.backButton}>
          返回报价列表
        </Button>
        <div className={styles.headerContent}>
          <Title level={3} className={styles.titleMargin}>报价详情</Title>
          <Space size="middle">
            {lead && <Tag color={RESULT_CONFIG[lead.status]?.color}>{RESULT_CONFIG[lead.status]?.label}</Tag>}
            {quotationHistory.length > 0 && (
              <Tag icon={<HistoryOutlined />} color="orange">已修改 {quotationHistory.length - 1} 次</Tag>
            )}
          </Space>
        </div>
      </div>

      <Row gutter={16}>
        <Col span={16}>
          <Card title={<Space><FileTextOutlined /><Text strong>线索信息</Text></Space>} size="small" className={styles.readonlyCard}>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="线索ID">{lead?.id}</Descriptions.Item>
              <Descriptions.Item label="来源">{lead?.source}</Descriptions.Item>
              <Descriptions.Item label="客户">{lead?.customer}</Descriptions.Item>
              <Descriptions.Item label="公司">{lead?.company}</Descriptions.Item>
              <Descriptions.Item label="联系方式">{lead?.contact}</Descriptions.Item>
              <Descriptions.Item label="时间">{lead?.created_at}</Descriptions.Item>
              <Descriptions.Item label="原始文本" span={2}>{lead?.full_text}</Descriptions.Item>
            </Descriptions>
          </Card>

          {lead?.quotation && (
            <Card title={<Space><Text strong>当前报价</Text></Space>} size="small" className={styles.quotationCard}
              extra={
                lead?.status !== 'won' && lead?.status !== 'lost' ? (
                  <Button type="link" icon={<EditOutlined />} onClick={handleModifyQuotation}>
                    修改并重新发送
                  </Button>
                ) : null
              }
            >
              <Descriptions column={3} size="small" bordered>
                <Descriptions.Item label="交期">{lead.quotation.delivery}</Descriptions.Item>
                <Descriptions.Item label="付款方式">{lead.quotation.payment}</Descriptions.Item>
                <Descriptions.Item label="报价有效期">{lead.quotation.validUntil}</Descriptions.Item>
              </Descriptions>
              <Divider className={styles.dividerCompact} />
              <Table
                columns={quotationColumns}
                dataSource={lead.quotation.products || []}
                rowKey="name"
                size="small"
                pagination={false}
                showHeader
              />
              <div className={styles.totalRow}>
                <Text strong>总金额: ¥{totalAmount.toLocaleString()}</Text>
              </div>
            </Card>
          )}

          <Card title={<Space><ClockCircleOutlined /><Text strong>跟进时间线</Text></Space>} className={styles.followUpCard}>
            <Timeline items={allTimelineItems} />
          </Card>
        </Col>

        <Col span={8}>
          <Card title={<Space><PlusOutlined /><Text strong>添加跟进</Text></Space>} size="small" className={styles.addFollowUpCard}>
            <Form form={form} layout="vertical" onFinish={handleAddFollowUp}>
              <Form.Item name="type" label="跟进方式" rules={[{ required: true }]}>
                <Input placeholder="如 电话沟通、上门拜访" />
              </Form.Item>
              <Form.Item name="content" label="跟进内容" rules={[{ required: true }]}>
                <Input.TextArea rows={4} placeholder="记录沟通内容、客户反馈等" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" icon={<PlusOutlined />} block loading={submitting} htmlType="submit">
                  添加记录
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title={<Space><Text strong>成单/丢单标记</Text></Space>} size="small" className={styles.markResultCard}>
            <Text type="secondary" className={styles.hintText}>
              根据最终结果更新线索状态
            </Text>
            <Space direction="vertical" className={formStyles.fullWidth}>
              <Button
                type="primary"
                icon={<TrophyOutlined />}
                block
                onClick={() => { setSelectedResult('won'); setResultModalVisible(true) }}
                className={styles.wonButton}
              >
                标记为成单
              </Button>
              <Button
                danger
                icon={<FrownOutlined />}
                block
                onClick={() => { setSelectedResult('lost'); setResultModalVisible(true) }}
              >
                标记为丢单
              </Button>
            </Space>
          </Card>

          {lead?.quotation && (
            <Card title={<Space><Text strong>报价摘要</Text></Space>} size="small" className={styles.summaryCard}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="产品数量">{lead.quotation.products?.length || 0} 项</Descriptions.Item>
                <Descriptions.Item label="报价总金额"><Text strong className={styles.totalAmount}>¥{totalAmount.toLocaleString()}</Text></Descriptions.Item>
                <Descriptions.Item label="报价次数">{quotationHistory.length || 1}</Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Col>
      </Row>

      <Modal
        title={selectedResult === 'won' ? '确认成单' : '确认丢单'}
        open={resultModalVisible}
        onOk={handleMarkResult}
        onCancel={() => { setResultModalVisible(false); setReason('') }}
        confirmLoading={submitting}
        okText="确认"
        cancelText="取消"
        okButtonProps={{ danger: selectedResult === 'lost' }}
      >
        <Form layout="vertical" className={styles.modalForm}>
          <Form.Item label={selectedResult === 'won' ? '成单原因' : '丢单原因'} rules={[{ required: true, message: '请输入原因' }]}>
            <Input.TextArea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={selectedResult === 'won' ? '如 价格合理、交期满足、产品质量好' : '如 价格过高、交期太长、竞品更优'}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
