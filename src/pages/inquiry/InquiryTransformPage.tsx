import React, { useState, useEffect, useRef } from 'react'
import { Card, Button, Tag, Space, Typography, Spin, Progress, Result, Divider, Alert, List } from 'antd'
import {
  ThunderboltOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { inquiryService } from '../../services'
import styles from './InquiryTransformPage.module.css'

const { Title, Text } = Typography

const STAGE_LABELS: Record<string, string> = {
  text_preprocessing: '文本预处理',
  field_extraction: '关键字段提取',
  confidence_assessment: '置信度评估',
  classification_matching: '分类匹配',
}

interface TransformStage {
  name: string
  status: 'pending' | 'processing' | 'done'
  duration?: number
}

interface TransformTask {
  leadId: string
  customer: string
  company: string
  summary: string
  status: 'queued' | 'running' | 'done' | 'failed'
  stages: TransformStage[]
  result?: any
}

export const InquiryTransformPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const ids = searchParams.get('ids')?.split(',') || []
  const [tasks, setTasks] = useState<TransformTask[]>([])
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadLeads()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const loadLeads = async () => {
    setLoading(true)
    try {
      const result = await inquiryService.getInquiryList()
      if (result.success) {
        const leads = result.data.items.filter((l: any) => ids.includes(l.id))
        const initialTasks: TransformTask[] = leads.map((lead: any) => ({
          leadId: lead.id,
          customer: lead.customer,
          company: lead.company,
          summary: lead.summary,
          status: 'queued',
          stages: [],
        }))
        setTasks(initialTasks)
        if (initialTasks.length > 0) {
          startTransform(initialTasks)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const startTransform = async (taskList: TransformTask[]) => {
    for (let i = 0; i < taskList.length; i++) {
      await processTask(i)
    }
  }

  const processTask = async (index: number) => {
    setTasks(prev => prev.map((t, i) =>
      i === index ? { ...t, status: 'running', stages: Object.keys(STAGE_LABELS).map(name => ({ name, status: 'pending' as const })) } : t
    ))

    const stages = Object.keys(STAGE_LABELS)
    let totalMs = 0

    for (let j = 0; j < stages.length; j++) {
      const stageDuration = 300 + Math.floor(Math.random() * 500)
      totalMs += stageDuration

      await new Promise(resolve => {
        timerRef.current = setTimeout(() => {
          setTasks(prev => prev.map((t, i) =>
            i === index ? {
              ...t,
              stages: t.stages.map((s, k) => k === j ? { ...s, status: 'processing', duration: stageDuration } : s)
            } : t
          ))
          timerRef.current = setTimeout(() => {
            setTasks(prev => prev.map((t, i) =>
              i === index ? {
                ...t,
                stages: t.stages.map((s, k) => k === j ? { ...s, status: 'done', duration: stageDuration } : s)
              } : t
            ))
            resolve(true)
          }, stageDuration * 0.8)
        }, j === 0 ? 200 : 100)
      })
    }

    const mockResult = {
      category: '工业控制设备',
      spec: 'PLC控制器 S7-1200',
      quantity: { value: 10, unit: '台' },
      delivery: '30天内',
      region: '上海',
      payment: '月结60天',
      confidence: 0.85 + Math.random() * 0.14,
      risk_level: 'low',
    }

    setTasks(prev => prev.map((t, i) =>
      i === index ? { ...t, status: 'done', result: mockResult } : t
    ))
  }

  const handleViewResult = (task: TransformTask) => {
    navigate('/inquiry/result', { state: { leadId: task.leadId, parseResult: task.result, engineType: 'rule_engine', totalDuration: task.stages.reduce((s, st) => s + (st.duration || 0), 0) } })
  }

  const handleBack = () => {
    navigate('/inquiry/list')
  }

  const runningTask = tasks.find(t => t.status === 'running')
  const allDone = tasks.length > 0 && tasks.every(t => t.status === 'done')
  const allCompleted = tasks.filter(t => t.status === 'done').length

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ padding: 0 }}>
          返回线索池
        </Button>
        <Title level={3} style={{ margin: '8px 0 4px' }}>AI 转化执行</Title>
        <Text type="secondary">正在处理 {tasks.length} 条线索</Text>
      </div>

      {loading ? (
        <div className={styles.center}><Spin size="large" tip="加载线索数据..." /></div>
      ) : tasks.length === 0 ? (
        <Result
          status="warning"
          title="没有选中的线索"
          subTitle="请从线索池选择要转化的线索"
          extra={<Button type="primary" onClick={handleBack}>返回线索池</Button>}
        />
      ) : (
        <>
          {runningTask && (
            <Card className={styles.activeCard} title={
              <Space>
                <LoadingOutlined style={{ color: '#1890ff' }} />
                <Text strong>正在处理: {runningTask.leadId} - {runningTask.customer}/{runningTask.company}</Text>
              </Space>
            }>
              <div className={styles.stages}>
                {runningTask.stages.map((stage, i) => (
                  <div key={stage.name} className={`${styles.stage} ${styles[stage.status]}`}>
                    <div className={styles.stageIcon}>
                      {stage.status === 'done' && <CheckCircleOutlined />}
                      {stage.status === 'processing' && <LoadingOutlined />}
                      {stage.status === 'pending' && <ClockCircleOutlined />}
                    </div>
                    <div className={styles.stageInfo}>
                      <Text strong>{STAGE_LABELS[stage.name]}</Text>
                      {stage.duration && <Text type="secondary" style={{ marginLeft: 8 }}>{stage.duration}ms</Text>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {allCompleted > 0 && (
            <Card title={<Space><CheckCircleOutlined style={{ color: '#52c41a' }} /><Text strong>已完成 ({allCompleted}/{tasks.length})</Text></Space>} className={styles.completedCard}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {tasks.filter(t => t.status === 'done').map(task => (
                  <Card key={task.leadId} size="small" className={styles.resultCard}>
                    <div className={styles.resultHeader}>
                      <div>
                        <Text strong>{task.leadId}</Text>
                        <Text type="secondary" style={{ marginLeft: 8 }}>{task.customer} - {task.company}</Text>
                      </div>
                      <Button type="primary" size="small" icon={<EyeOutlined />} onClick={() => handleViewResult(task)}>
                        查看结果
                      </Button>
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
                    <div className={styles.resultPreview}>
                      <Tag color="blue">{task.result?.category}</Tag>
                      <Tag>数量: {task.result?.quantity?.value} {task.result?.quantity?.unit}</Tag>
                      <Tag color="green">置信度: {Math.round((task.result?.confidence || 0) * 100)}%</Tag>
                    </div>
                  </Card>
                ))}
              </Space>
            </Card>
          )}

          {tasks.some(t => t.status === 'queued') && (
            <Card title="队列中" size="small" className={styles.queueCard}>
              <List
                size="small"
                dataSource={tasks.filter(t => t.status === 'queued')}
                renderItem={(task: TransformTask) => (
                  <List.Item>
                    <Space>
                      <ClockCircleOutlined style={{ color: '#d9d9d9' }} />
                      <Text>{task.leadId}</Text>
                      <Text type="secondary">{task.customer} - {task.company}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}

          {allDone && (
            <Alert
              type="success"
              message="全部转化完成"
              description={`共处理 ${tasks.length} 条线索，请点击各结果的"查看结果"按钮进行确认归类。`}
              showIcon
              className={styles.doneAlert}
            />
          )}
        </>
      )}
    </div>
  )
}
