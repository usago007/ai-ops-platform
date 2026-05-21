import React, { useState, useRef, useEffect } from 'react'
import { Card, Input, Button, Upload, Space, message, Tag, Collapse, Typography, Row, Col, Statistic, Divider, Alert } from 'antd'
import { InboxOutlined, SendOutlined, ThunderboltOutlined, RobotOutlined, ClockCircleOutlined, BulbOutlined, BarChartOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { runPipeline, PipelineStage } from '../../mock/engine'
import { ProcessingSteps } from '../../components/ProcessingSteps/ProcessingSteps'
import { CapabilityBanner } from '../../components/CapabilityBanner/CapabilityBanner'
import { inquiryService } from '../../services'
import styles from './InquiryNewPage.module.css'

const { Text } = Typography

const SAMPLE_INQUIRIES = [
  {
    label: '简单案例 - 标准产品询价',
    difficulty: '简单',
    color: 'green',
    text: '需要采购西门子PLC控制器S7-1200系列，CPU1214C DC/DC/DC 10台，要求30天内交货到上海，请报价。',
  },
  {
    label: '中等案例 - 多品类询价',
    difficulty: '中等',
    color: 'orange',
    text: '采购清单：1. 西门子PLC S7-1200 CPU1214C x10台 2. V90伺服驱动器3AC 400V x3台 3. 1FK7伺服电机 x3套，要求45天内交货到苏州工业园区，付款方式月结60天，需含13%增值税。',
  },
  {
    label: '复杂案例 - 批量定制询价',
    difficulty: '复杂',
    color: 'red',
    text: '紧急采购：STM32F103C8T6 x500, LM317T x200, 100uF/25V电解电容 x1000, 10K 0805贴片电阻 x5000, IRLZ44N MOS管 x300。要求原装正品，需提供RoHS证书，深圳交货，本周内下单。另需定制加工45号钢齿轮轴20件，图纸稍后提供。',
  },
]

const STAGE_LABELS: Record<string, string> = {
  text_preprocessing: '文本预处理',
  field_extraction: '关键字段提取',
  confidence_assessment: '置信度评估',
  classification_matching: '分类匹配',
}

type ProcessingStatus = 'idle' | 'processing' | 'complete'

interface StepState {
  label: string
  status: 'pending' | 'processing' | 'done'
}

export const InquiryNewPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const lead = location.state?.lead
  const [text, setText] = useState(lead?.full_text || '')
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle')
  const [steps, setSteps] = useState<StepState[]>([])
  const [engineType, setEngineType] = useState<'rule_engine' | 'ai_engine'>('rule_engine')
  const [totalDuration, setTotalDuration] = useState(0)
  const [parseResult, setParseResult] = useState<any>(null)
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    if (lead) {
      message.success(`已加载线索 ${lead.id}: ${lead.customer} - ${lead.company}`)
    }
  }, [lead])

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  const handleParse = async () => {
    if (!text.trim()) {
      message.warning('请输入询价内容')
      return
    }

    setProcessingStatus('processing')
    setEngineType('rule_engine')
    setTotalDuration(0)
    setParseResult(null)
    clearTimers()

    try {
      const result = await inquiryService.parseInquiry(text, { source: lead?.source || '手动录入' })
      if (!result.success) {
        message.error(result.message || '解析失败')
        setProcessingStatus('idle')
        return
      }

      const mockPipeline = await runPipeline(text)
      setEngineType(mockPipeline.engine)
      setTotalDuration(mockPipeline.totalDuration)

      const initialSteps: StepState[] = mockPipeline.stages.map((stage: PipelineStage) => ({
        label: STAGE_LABELS[stage.name] || stage.name,
        status: 'pending',
      }))
      setSteps(initialSteps)

      mockPipeline.stages.forEach((stage: PipelineStage, index: number) => {
        const delay = mockPipeline.stages.slice(0, index).reduce((sum, s) => sum + s.duration, 0)
        
        const processTimer = window.setTimeout(() => {
          setSteps(prev => prev.map((step, i) => 
            i === index ? { ...step, status: 'processing' } : step
          ))
        }, delay)
        timersRef.current.push(processTimer)

        const doneTimer = window.setTimeout(() => {
          setSteps(prev => prev.map((step, i) => 
            i === index ? { ...step, status: 'done' } : step
          ))
          if (index === mockPipeline.stages.length - 1) {
            setProcessingStatus('complete')
            setParseResult(result.data)
          }
        }, delay + stage.duration * 0.8)
        timersRef.current.push(doneTimer)
      })
    } catch {
      message.error('解析失败')
      setProcessingStatus('idle')
    }
  }

  const handleContinue = () => {
    navigate('/inquiry/result', { state: { parseResult, leadId: parseResult?.leadId, engineType, totalDuration } })
  }

  const handleReset = () => {
    clearTimers()
    setProcessingStatus('idle')
    setSteps([])
    setEngineType('rule_engine')
    setTotalDuration(0)
    setParseResult(null)
  }

  const isProcessing = processingStatus === 'processing'
  const isComplete = processingStatus === 'complete'
  const isIdle = processingStatus === 'idle'

  return (
    <div className={styles.container}>
      {lead && (
        <Alert
          message={`线索来源: ${lead.source} | ${lead.customer} - ${lead.company}`}
          description={`线索ID: ${lead.id} | 创建时间: ${lead.created_at}`}
          type="info"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" icon={<ArrowLeftOutlined />} onClick={() => navigate('/inquiry/list')}>
              返回线索池
            </Button>
          }
        />
      )}

      <CapabilityBanner
        title="💡 本模块支持自动解析以下信息"
        icon={<BulbOutlined />}
        capabilities={[
          '品类 / 规格 / 数量 / 交期 / 地域 / 付款方式',
          '支持 PDF、Word、Excel、图片等多种格式',
          '单次最大处理 5000 字',
        ]}
        limits={[
          '解析准确率 85%~98%（视文本质量而定）',
          '支持中文/英文/混合文本',
        ]}
        storageKey="inquiry-banner-dismissed"
      />

      <h2 className={styles.title}>询报价智能归类</h2>
      <p className={styles.desc}>粘贴询价文本，AI 将自动解析关键字段并归类</p>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="询价内容录入" className={styles.card}>
            <Input.TextArea
              rows={8}
              placeholder="请粘贴或输入询价内容..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={styles.textarea}
              disabled={isProcessing}
            />

            {isIdle && (
              <div className={styles.uploadArea}>
                <Upload.Dragger maxCount={5} showUploadList={false}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">点击或拖拽文件到此区域</p>
                  <p className="ant-upload-hint">支持 PDF、Word、Excel、图片等格式</p>
                </Upload.Dragger>
              </div>
            )}

            {isProcessing && (
              <div className={styles.processingCard}>
                <div className={styles.processingHeader}>
                  <span className={styles.processingTitle}>处理中...</span>
                  {engineType === 'rule_engine' ? (
                    <Tag color="green" icon={<ThunderboltOutlined />}>⚡ 规则引擎处理</Tag>
                  ) : (
                    <Tag color="purple" icon={<RobotOutlined />}>🤖 AI 引擎处理</Tag>
                  )}
                </div>
                <ProcessingSteps steps={steps} />
                {isComplete && (
                  <div className={styles.resultSummary}>
                    <Tag color="blue">
                      <ClockCircleOutlined /> 处理耗时 {totalDuration}ms
                    </Tag>
                    {engineType === 'ai_engine' && (
                      <Tag color="orange">AI 引擎耗时较长，请耐心等待</Tag>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className={styles.actions}>
              {isIdle && (
                <Button type="primary" icon={<SendOutlined />} onClick={handleParse}>
                  AI 解析
                </Button>
              )}
              {isComplete && (
                <Space>
                  <Button onClick={handleReset}>重新解析</Button>
                  <Button type="primary" onClick={handleContinue}>
                    查看解析结果
                  </Button>
                </Space>
              )}
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="处理统计" className={styles.statsCard} size="small">
            <Statistic title="今日已处理" value={23} suffix="条" valueStyle={{ color: '#1890ff' }} />
            <Divider />
            <Statistic title="平均解析耗时" value={1200} suffix="ms" valueStyle={{ color: '#52c41a' }} />
            <Divider />
            <Statistic title="归类准确率" value={94.2} suffix="%" valueStyle={{ color: '#faad14' }} precision={1} />
          </Card>

          <Card title="快捷示例" className={styles.sampleCard} size="small" style={{ marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              点击快速填充询价文本体验
            </Text>
            <Collapse
              ghost
              size="small"
              items={SAMPLE_INQUIRIES.map((sample, i) => ({
                key: i,
                label: (
                  <Space>
                    <Tag color={sample.color}>{sample.difficulty}</Tag>
                    <Text style={{ fontSize: 13 }}>{sample.label}</Text>
                  </Space>
                ),
                children: (
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{sample.text}</p>
                    <Button size="small" type="primary" onClick={() => {
                      setText(sample.text)
                      message.info('已填充示例文本，点击 AI 解析体验')
                    }}>
                      使用此示例
                    </Button>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
