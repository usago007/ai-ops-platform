import React, { useState, useEffect } from 'react'
import { Card, Descriptions, Tag, Progress, Spin, Alert, Button, Space, Result, Row, Col, message, Input, Form, Modal } from 'antd'
import { CheckCircleOutlined, WarningOutlined, InboxOutlined, ThunderboltOutlined, RobotOutlined, EditOutlined, CheckOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { inquiryService } from '../../services'
import styles from './InquiryResultPage.module.css'

export const InquiryResultPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [parseResult, setParseResult] = useState<any>(null)
  const [classifyResult, setClassifyResult] = useState<any>(null)
  const [similarItems, setSimilarItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [classifyLoading, setClassifyLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [engineType, setEngineType] = useState<'rule_engine' | 'ai_engine'>('rule_engine')
  const [totalDuration, setTotalDuration] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState<any>({})

  useEffect(() => {
    if (location.state?.parseResult) {
      setParseResult(location.state.parseResult)
      setEngineType(location.state.engineType || 'rule_engine')
      setTotalDuration(location.state.totalDuration || 0)
      setLoading(false)
      setShowResult(true)
      handleClassify()
      handleSimilar()
    } else {
      const leadId = searchParams.get('leadId')
      if (leadId) {
        loadLeadData(leadId)
      }
    }
  }, [])

  const loadLeadData = async (leadId: string) => {
    setLoading(true)
    try {
      const result = await inquiryService.getInquiryDetail(leadId)
      if (result.success) {
        const lead = result.data
        setParseResult({
          raw_text: lead.full_text,
          category: lead.quotation?.products?.[0]?.name || '待解析',
          spec: lead.quotation?.products?.map((p: any) => p.name).join(', ') || '',
          quantity: { value: lead.quotation?.products?.reduce((s: number, p: any) => s + p.quantity, 0) || 0, unit: lead.quotation?.products?.[0]?.unit || '' },
          delivery: lead.quotation?.delivery || '-',
          region: '-',
          payment: lead.quotation?.payment || '-',
          confidence: 0.85,
          risk_level: 'low',
        })
        setEngineType('rule_engine')
        setTotalDuration(0)
        setShowResult(true)
        handleClassify()
        handleSimilar()
      }
    } catch (e) {
      message.error('加载线索失败')
    } finally {
      setLoading(false)
    }
  }

  const handleClassify = async () => {
    setClassifyLoading(true)
    try {
      const result = await inquiryService.classifyInquiry()
      if (result.success) {
        setClassifyResult(result.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setClassifyLoading(false)
    }
  }

  const handleSimilar = async () => {
    try {
      const result = await inquiryService.getSimilarInquiries()
      if (result.success) {
        setSimilarItems(result.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getRiskConfig = (level: string) => {
    if (level === 'high') return { color: 'red', icon: <WarningOutlined />, text: '高风险' }
    if (level === 'medium') return { color: 'orange', icon: <WarningOutlined />, text: '中风险' }
    return { color: 'green', icon: <CheckCircleOutlined />, text: '低风险' }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return { color: '#10b981', gradient: 'linear-gradient(90deg, #10b981, #34d399)' }
    if (score >= 0.6) return { color: '#f59e0b', gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }
    return { color: '#ef4444', gradient: 'linear-gradient(90deg, #ef4444, #f87171)' }
  }

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return '高置信度'
    if (score >= 0.6) return '中等置信度'
    return '低置信度'
  }

  const handleEdit = () => {
    setEditForm({
      category: parseResult?.category || '',
      spec: parseResult?.spec || '',
      quantity: parseResult?.quantity?.value || '',
      unit: parseResult?.quantity?.unit || '',
      delivery: parseResult?.delivery || '',
      region: parseResult?.region || '',
      payment: parseResult?.payment || '',
    })
    setEditMode(true)
  }

  const handleEditCancel = () => {
    setEditMode(false)
  }

  const handleEditSave = () => {
    setParseResult({
      ...parseResult,
      category: editForm.category,
      spec: editForm.spec,
      quantity: { value: editForm.quantity, unit: editForm.unit },
      delivery: editForm.delivery,
      region: editForm.region,
      payment: editForm.payment,
    })
    setEditMode(false)
    message.success('修改已保存')
  }

  const handleConfirm = async () => {
    const leadId = location.state?.leadId || searchParams.get('leadId')
    try {
      const result = await inquiryService.confirmInquiry(leadId, classifyResult, parseResult)
      if (result.success) {
        message.success('归类已确认，线索池状态已更新')
        setTimeout(() => navigate('/inquiry/list'), 500)
      }
    } catch (e) {
      message.error('确认失败')
    }
  }

  if (loading) {
    return (
      <div className={styles.center}>
        <Spin size="large" tip="AI 正在解析询价内容..." />
      </div>
    )
  }

  if (!parseResult) {
    return (
      <Result
        status="info"
        title="暂无解析结果"
        subTitle="请先在询价录入页提交询价内容"
        extra={<Button type="primary" onClick={() => navigate('/inquiry/manual-entry')}>前往录入页</Button>}
      />
    )
  }

  const riskConfig = getRiskConfig(parseResult.risk_level)
  const confidenceConfig = getConfidenceColor(parseResult.confidence)
  const confidencePercentage = Math.round(parseResult.confidence * 100)
  const confidenceLabel = getConfidenceLabel(parseResult.confidence)

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/inquiry/list')} style={{ padding: 0, marginBottom: 8 }}>
            返回线索池
          </Button>
          <h2 className={styles.title}>AI 解析结果</h2>
        </div>
        <Space>
          {engineType === 'rule_engine' ? (
            <Tag color="green" icon={<ThunderboltOutlined />}>⚡ 规则引擎处理</Tag>
          ) : (
            <Tag color="purple" icon={<RobotOutlined />}>🤖 AI 引擎处理</Tag>
          )}
          <Tag color="blue" icon={<InboxOutlined />}>{totalDuration}ms</Tag>
        </Space>
      </div>

      {parseResult.risk_level === 'high' && (
        <Alert
          message="高风险询价预警"
          description={
            <div>
              <p>该询价存在以下风险：</p>
              <ul>
                {(parseResult.risk_reasons || []).map((reason: string, i: number) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>
          }
          type="error"
          showIcon
          className={styles.alert}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card
            title="关键字段提取"
            className={styles.card}
            extra={
              <Button type="link" icon={<EditOutlined />} onClick={handleEdit}>
                修改
              </Button>
            }
          >
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="品类">{parseResult.category}</Descriptions.Item>
              <Descriptions.Item label="规格型号">{parseResult.spec}</Descriptions.Item>
              <Descriptions.Item label="数量">
                {parseResult.quantity?.value} {parseResult.quantity?.unit}
              </Descriptions.Item>
              <Descriptions.Item label="交期要求">{parseResult.delivery}</Descriptions.Item>
              <Descriptions.Item label="交货地区">{parseResult.region}</Descriptions.Item>
              <Descriptions.Item label="付款方式">{parseResult.payment}</Descriptions.Item>
            </Descriptions>

            <div className={styles.confidenceSection}>
              <div className={styles.confidenceHeader}>
                <span className={styles.confidenceLabel}>解析置信度</span>
                <span className={styles.confidenceBadge} style={{ color: confidenceConfig.color }}>
                  {confidenceLabel}
                </span>
              </div>
              <div className={styles.gaugeContainer}>
                <div className={styles.gaugeTrack}>
                  <div
                    className={styles.gaugeFill}
                    style={{
                      width: `${confidencePercentage}%`,
                      background: confidenceConfig.gradient,
                    }}
                  />
                </div>
                <div className={styles.gaugeLabels}>
                  <span style={{ color: confidenceConfig.color, fontWeight: 700, fontSize: 20 }}>
                    {confidencePercentage}%
                  </span>
                  <span className={styles.gaugeScale}>
                    <span style={{ color: confidencePercentage >= 80 ? 'var(--success)' : confidencePercentage >= 60 ? 'var(--warning)' : 'var(--error)' }}>
                      ●
                    </span>
                    {' >80% 高'}
                    <span style={{ color: confidencePercentage >= 60 && confidencePercentage < 80 ? 'var(--warning)' : 'var(--text-muted)' }}>
                      ●
                    </span>
                    {' 60-80% 中'}
                    <span style={{ color: confidencePercentage < 60 ? 'var(--error)' : 'var(--text-muted)' }}>
                      ●
                    </span>
                    {' <60% 低'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="AI 归类结果" className={styles.card} loading={classifyLoading}>
            {classifyResult && (
              <div>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <span className={styles.label}>一级类目：</span>
                    <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                      {classifyResult.level1}
                    </Tag>
                    <span className={styles.confidenceText}>
                      置信度 {(classifyResult.level1_confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className={styles.label}>二级类目：</span>
                    <Tag color="cyan" style={{ fontSize: 14, padding: '4px 12px' }}>
                      {classifyResult.level2}
                    </Tag>
                    <span className={styles.confidenceText}>
                      置信度 {(classifyResult.level2_confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </Space>
              </div>
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card title="相似询价推荐">
            {similarItems.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {similarItems.map((item: any) => (
                  <Card key={item.id} size="small" className={styles.similarCard}>
                    <div className={styles.similarTitle}>{item.title}</div>
                    <div className={styles.similarMeta}>
                      <Tag>{item.id}</Tag>
                      <Tag color={item.status === '成交' ? 'green' : 'default'}>{item.status}</Tag>
                      {item.amount && <span className={styles.amount}>{item.amount}</span>}
                    </div>
                    <Progress
                      percent={Math.round(item.similarity * 100)}
                      size="small"
                      strokeColor="#1890ff"
                      format={(p) => `匹配度 ${p}%`}
                    />
                  </Card>
                ))}
              </Space>
            ) : (
              <div className={styles.empty}>暂无相似记录</div>
            )}
          </Card>

          <Card title="风险等级" className={styles.card}>
            <div className={styles.riskCenter}>
              {React.cloneElement(riskConfig.icon as React.ReactElement, {
                style: { fontSize: 48, color: riskConfig.color },
              })}
              <div className={styles.riskText}>{riskConfig.text}</div>
            </div>
          </Card>
        </Col>
      </Row>

      <div className={styles.actions}>
        <Space size="large">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/inquiry/list')}>返回线索池</Button>
          <Button onClick={() => navigate('/inquiry/manual-entry', { state: { text: parseResult?.raw_text } })}>返回修改</Button>
          <Button type="default" icon={<EditOutlined />} onClick={handleEdit}>
            修改结果
          </Button>
          <Button type="primary" icon={<CheckOutlined />} size="large" onClick={handleConfirm}>
            确认归类
          </Button>
        </Space>
      </div>

      <Modal
        title="修改解析结果"
        open={editMode}
        onCancel={handleEditCancel}
        footer={
          <Space>
            <Button icon={<CloseOutlined />} onClick={handleEditCancel}>取消</Button>
            <Button type="primary" icon={<CheckOutlined />} onClick={handleEditSave}>保存</Button>
          </Space>
        }
        width={600}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="品类">
                <Input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="规格型号">
                <Input value={editForm.spec} onChange={(e) => setEditForm({ ...editForm, spec: e.target.value })} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="数量">
                <Input type="number" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="单位">
                <Input value={editForm.unit} onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="交期要求">
                <Input value={editForm.delivery} onChange={(e) => setEditForm({ ...editForm, delivery: e.target.value })} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="交货地区">
                <Input value={editForm.region} onChange={(e) => setEditForm({ ...editForm, region: e.target.value })} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="付款方式">
                <Input value={editForm.payment} onChange={(e) => setEditForm({ ...editForm, payment: e.target.value })} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
