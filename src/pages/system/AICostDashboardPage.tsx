import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Spin } from 'antd'
import { ArrowUpOutlined, ThunderboltOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { Pie, Line } from '@ant-design/charts'
import type { ColumnsType } from 'antd/es/table'
import { getCallLogsSummary } from '../../mock/handlers'
import styles from './AICostDashboardPage.module.css'

interface ModuleCostRow {
  key: string
  module: string
  calls: number
  inputTokens: number
  outputTokens: number
  cost: number
  avgLatency: number
}

interface TokenTrendPoint {
  day: string
  type: string
  tokens: number
}

const moduleDistribution = [
  { module: '询报价', percentage: 45 },
  { module: '营销内容', percentage: 25 },
  { module: '卖点提炼', percentage: 15 },
  { module: '客服问答', percentage: 15 },
]

const pieData = moduleDistribution.map((m) => ({
  type: m.module,
  value: m.percentage,
}))

const pieConfig = {
  data: pieData,
  angleField: 'value',
  colorField: 'type',
  radius: 0.8,
  innerRadius: 0.6,
  label: {
    type: 'outer',
    content: '{name} {percentage}',
    style: {
      fill: '#aaa',
      fontSize: 12,
    },
  },
  interactions: [{ type: 'element-active' }],
  legend: {
    position: 'right' as const,
    itemName: {
      style: { fill: '#aaa' },
    },
  },
  color: ['#1890ff', '#52c41a', '#faad14', '#f5222d'],
}

const modelColors = ['#1890ff', '#52c41a', '#faad14', '#722ed1'] as const

const modelDistribution = [
  { model: 'GPT-4', percentage: 40 },
  { model: 'Claude-3', percentage: 35 },
  { model: 'Qwen', percentage: 20 },
  { model: 'DeepSeek', percentage: 5 },
]

function generateTokenTrend(): TokenTrendPoint[] {
  const data: TokenTrendPoint[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const day = `${d.getMonth() + 1}/${d.getDate()}`
    const baseInput = 80000 + Math.random() * 40000
    const baseOutput = 30000 + Math.random() * 20000
    data.push({ day, type: 'input_tokens', tokens: Math.round(baseInput) })
    data.push({ day, type: 'output_tokens', tokens: Math.round(baseOutput) })
  }
  return data
}

const lineData = generateTokenTrend()

const lineConfig = {
  data: lineData,
  xField: 'day',
  yField: 'tokens',
  seriesField: 'type',
  smooth: true,
  color: ['#1890ff', '#52c41a'],
  legend: {
    itemName: {
      style: { fill: '#aaa' },
    },
  },
  point: { size: 3, shape: 'circle' },
  xAxis: {
    label: {
      autoRotate: true,
      style: { fill: '#aaa' },
      formatter: (val: string) => {
        const num = parseInt(val.split('/')[1], 10)
        if (num === 1 || num % 5 === 0) return val
        return ''
      },
    },
  },
  yAxis: {
    label: {
      style: { fill: '#aaa' },
      formatter: (val: number) => {
        if (val >= 100000) return `${(val / 1000).toFixed(0)}K`
        return val.toString()
      },
    },
  },
  tooltip: {
    formatter: (datum: TokenTrendPoint) => ({
      name: datum.type === 'input_tokens' ? 'Input Tokens' : 'Output Tokens',
      value: datum.tokens.toLocaleString(),
    }),
  },
}

const costTableData: ModuleCostRow[] = [
  { key: 'quote', module: '询报价', calls: 5603, inputTokens: 2_240_000, outputTokens: 890_000, cost: 351.20, avgLatency: 2.1 },
  { key: 'marketing', module: '营销内容', calls: 3113, inputTokens: 1_550_000, outputTokens: 1_240_000, cost: 215.80, avgLatency: 3.4 },
  { key: 'selling', module: '卖点提炼', calls: 1868, inputTokens: 934_000, outputTokens: 468_000, cost: 98.50, avgLatency: 1.6 },
  { key: 'cs', module: '客服问答', calls: 1866, inputTokens: 560_000, outputTokens: 280_000, cost: 115.00, avgLatency: 0.9 },
]

const totalCalls = costTableData.reduce((s, r) => s + r.calls, 0)
const totalInputTokens = costTableData.reduce((s, r) => s + r.inputTokens, 0)
const totalOutputTokens = costTableData.reduce((s, r) => s + r.outputTokens, 0)
const totalCost = Number(costTableData.reduce((s, r) => s + r.cost, 0).toFixed(2))
const avgLatency = Number((costTableData.reduce((s, r) => s + r.avgLatency, 0) / costTableData.length).toFixed(1))

costTableData.push({
  key: 'total',
  module: '合计',
  calls: totalCalls,
  inputTokens: totalInputTokens,
  outputTokens: totalOutputTokens,
  cost: totalCost,
  avgLatency,
})

const columns: ColumnsType<ModuleCostRow> = [
  {
    title: '模块',
    dataIndex: 'module',
    key: 'module',
    width: 120,
    render: (text: string, record: ModuleCostRow) =>
      record.key === 'total' ? (
        <strong>{text}</strong>
      ) : (
        <Tag color="blue">{text}</Tag>
      ),
  },
  {
    title: '调用次数',
    dataIndex: 'calls',
    key: 'calls',
    width: 120,
    sorter: (a, b) => a.calls - b.calls,
    render: (val: number, record: ModuleCostRow) =>
      record.key === 'total' ? <strong>{val.toLocaleString()}</strong> : val.toLocaleString(),
  },
  {
    title: '输入 Token',
    dataIndex: 'inputTokens',
    key: 'inputTokens',
    width: 140,
    sorter: (a, b) => a.inputTokens - b.inputTokens,
    render: (val: number, record: ModuleCostRow) =>
      record.key === 'total' ? <strong>{val.toLocaleString()}</strong> : val.toLocaleString(),
  },
  {
    title: '输出 Token',
    dataIndex: 'outputTokens',
    key: 'outputTokens',
    width: 140,
    sorter: (a, b) => a.outputTokens - b.outputTokens,
    render: (val: number, record: ModuleCostRow) =>
      record.key === 'total' ? <strong>{val.toLocaleString()}</strong> : val.toLocaleString(),
  },
  {
    title: '费用 (USD)',
    dataIndex: 'cost',
    key: 'cost',
    width: 130,
    sorter: (a, b) => a.cost - b.cost,
    render: (val: number, record: ModuleCostRow) =>
      record.key === 'total' ? (
        <strong style={{ color: '#faad14' }}>${val.toFixed(2)}</strong>
      ) : (
        `$${val.toFixed(2)}`
      ),
  },
  {
    title: '平均延迟',
    dataIndex: 'avgLatency',
    key: 'avgLatency',
    width: 120,
    sorter: (a, b) => a.avgLatency - b.avgLatency,
    render: (val: number) => {
      const color = val > 2 ? '#f5222d' : val > 1 ? '#faad14' : '#52c41a'
      return (
        <span style={{ color }}>
          {val}s
        </span>
      )
    },
  },
]

export const AICostDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<{
    totalCalls: number
    totalTokens: number
    totalCost: number
    avgDuration: number
  } | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const s = getCallLogsSummary()
      setSummary({
        totalCalls: s.totalCalls || 12450,
        totalTokens: s.totalTokens || 8200000,
        totalCost: s.totalCost || 780.5,
        avgDuration: s.avgDuration || 1800,
      })
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <Spin size="large" className={styles.loading} />
  }

  const displayTotalCalls = summary?.totalCalls ?? 12450
  const displayTotalTokens = summary?.totalTokens ?? 8200000
  const displayTotalCost = summary?.totalCost ?? 780.5
  const displayAvgDuration = summary?.avgDuration ?? 1800

  return (
    <div className={styles.container}>
      <h2 style={{ marginBottom: 16 }}>AI 调用成本与性能面板</h2>

      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="总调用次数"
              value={displayTotalCalls}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ArrowUpOutlined />}
              suffix="次"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="总 Token 消耗"
              value={displayTotalTokens}
              precision={0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ThunderboltOutlined />}
              suffix=" tokens"
              formatter={(val) => {
                const n = Number(val)
                if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
                if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
                return n.toString()
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="月度费用估算"
              value={displayTotalCost}
              precision={2}
              valueStyle={{ color: '#faad14' }}
              prefix={<DollarOutlined />}
              suffix=" USD"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="平均响应时间"
              value={displayAvgDuration / 1000}
              precision={1}
              valueStyle={{ color: '#722ed1' }}
              prefix={<ClockCircleOutlined />}
              suffix="s"
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row: Pie + Line */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card className={styles.chartCard} title="模块调用分布">
            <div className={styles.chartContainer}>
              <Pie {...pieConfig} />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card className={styles.chartCard} title="Token 用量趋势 (30 天)">
            <div className={styles.chartContainer}>
              <Line {...lineConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Model Distribution */}
      <Card className={styles.chartCard} style={{ marginTop: 16 }} title="模型分布">
        <div style={{ padding: '8px 0' }}>
          {modelDistribution.map((m, i) => (
            <span key={m.model} className={styles.modelTag}>
              <Tag color={modelColors[i]} style={{ marginRight: 4 }}>{m.model}</Tag>
              <span className={styles.modelPercentage}>{m.percentage}%</span>
            </span>
          ))}
        </div>
      </Card>

      {/* Cost Breakdown Table */}
      <Card className={styles.chartCard} style={{ marginTop: 16 }} title="费用明细">
        <Table<ModuleCostRow>
          dataSource={costTableData}
          columns={columns}
          rowKey="key"
          pagination={false}
          size="middle"
          rowClassName={(record) => (record.key === 'total' ? styles.totalRow : '')}
          summary={() => null}
        />
      </Card>
    </div>
  )
}
