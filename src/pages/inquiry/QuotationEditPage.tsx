import React, { useState, useEffect } from 'react'
import { Card, Form, Input, InputNumber, Button, Table, Space, Typography, Tag, Row, Col, message, Divider, Spin, Descriptions, Alert } from 'antd'
import { ArrowLeftOutlined, SendOutlined, FileTextOutlined, CheckCircleOutlined } from '@/iconMap'
import { useParams, useNavigate } from 'react-router-dom'
import { inquiryService } from '../../services'
import styles from './QuotationEditPage.module.css'

const { Title, Text } = Typography

interface SimilarQuotation {
  id: string
  customer: string
  products: string
  total: number
  delivery: string
  status: string
}

interface QuotationFormValues {
  products?: Array<{ name: string; quantity: number; unit: string; unitPrice: number }>
  delivery?: string
  payment?: string
  validUntil?: string
  note?: string
}

export const QuotationEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lead, setLead] = useState<Record<string, unknown> | null>(null)
  const [similarQuotations, setSimilarQuotations] = useState<SimilarQuotation[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => { loadData() }, [id])

  const loadData = async () => {
    try {
      const [leadResult, similarResult] = await Promise.all([
        inquiryService.getInquiryDetail(id || ''),
        inquiryService.getSimilarQuotations(id || ''),
      ])
      if (leadResult.success) setLead(leadResult.data)
      if (similarResult.success) setSimilarQuotations(similarResult.data.similar)
    } catch (e) {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: QuotationFormValues) => {
    setSubmitting(true)
    try {
      const result = await inquiryService.saveQuotation(id || '', values)
      if (result.success) {
        message.success('报价已保存并发送')
        navigate(`/inquiry/quotation-detail/${id}`)
      }
    } catch (e) {
      message.error('保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  const similarColumns = [
    { title: '报价单号', dataIndex: 'id', key: 'id', width: 140 },
    { title: '客户', dataIndex: 'customer', key: 'customer' },
    { title: '产品', dataIndex: 'products', key: 'products' },
    { title: '总金额', dataIndex: 'total', key: 'total', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '交期', dataIndex: 'delivery', key: 'delivery' },
    {
      title: '结果', dataIndex: 'status', key: 'status', width: 70,
      render: (s: string) => <Tag color={s === 'won' ? 'green' : 'red'}>{s === 'won' ? '成单' : '丢单'}</Tag>,
    },
  ]

  if (loading) return <div className={styles.center}><Spin size="large" tip="加载报价数据..." /></div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/inquiry/quotation-list')} className={styles.backButton}>
          返回报价列表
        </Button>
        <Title level={3} className={styles.titleMargin}>报价单编辑</Title>
      </div>

      <Row gutter={16}>
        <Col span={16}>
          <Card title={<Space><FileTextOutlined /><Text strong>询价信息</Text></Space>} size="small" className={styles.readonlyCard}>
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

          <Card title={<Space><SendOutlined /><Text strong>报价明细</Text></Space>} className={styles.formCard}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.List name="products">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={8} align="middle" className={styles.productRow}>
                        <Col span={8}>
                          <Form.Item {...restField} name={[name, 'name']} label="产品名称" rules={[{ required: true }]}>
                            <Input placeholder="如 PLC控制器 S7-1200" />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item {...restField} name={[name, 'quantity']} label="数量" rules={[{ required: true }]}>
                            <InputNumber className={styles.fullWidth} min={1} />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item {...restField} name={[name, 'unit']} label="单位" rules={[{ required: true }]}>
                            <Input placeholder="台/个/件" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item {...restField} name={[name, 'unitPrice']} label="单价(元)" rules={[{ required: true }]}>
                            <InputNumber className={styles.fullWidth} min={0} precision={2} />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                           <Button type="link" danger onClick={() => remove(name)} className={styles.deleteButton}>删除</Button>
                        </Col>
                      </Row>
                    ))}
                    <Button type="dashed" onClick={() => add()} block>+ 添加产品</Button>
                  </>
                )}
              </Form.List>

              <Divider />

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="delivery" label="交期" rules={[{ required: true }]}>
                    <Input placeholder="如 30天内" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="payment" label="付款方式" rules={[{ required: true }]}>
                    <Input placeholder="如 月结60天" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="validUntil" label="报价有效期">
                    <Input placeholder="如 30天" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="note" label="备注">
                <Input.TextArea rows={3} placeholder="补充说明、优惠条件等" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" icon={<SendOutlined />} size="large" htmlType="submit" loading={submitting}>
                    保存并发送报价
                  </Button>
                  <Button onClick={() => navigate('/inquiry/quotation-list')}>取消</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title={<Space><CheckCircleOutlined /><Text strong>历史相似报价</Text></Space>} size="small" className={styles.similarCard}>
            <Text type="secondary" className={styles.hintText}>
              参考以下历史报价制定报价策略
            </Text>
            <Table
              columns={similarColumns}
              dataSource={similarQuotations}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ y: 400 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
