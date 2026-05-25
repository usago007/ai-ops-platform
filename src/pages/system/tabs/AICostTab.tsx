import React from 'react'
import { Card, Row, Col, Statistic, Table, Tag } from 'antd'
import { ArrowUpOutlined, ThunderboltOutlined, DollarOutlined, ClockCircleOutlined } from '@/iconMap'
import { PieChart, Pie as RPie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ColumnsType } from 'antd/es/table'
import { CHART_COLORS, CHART_LABEL_COLOR, STATUS_COLORS } from '../../../styles/chartColors'
import styles from '../SystemStatusPage.module.css'

interface ModuleCostRow {
  key: string
  module: string
  calls: number
  inputTokens: number
  outputTokens: number
  cost: number
  avgLatency: number
}



const moduleDistribution = [
  { module: '询报价', percentage: 45 },
  { module: '营销内容', percentage: 25 },
  { module: '卖点提炼', percentage: 15 },
  { module: '客服问答', percentage: 15 },
]

const pieData = moduleDistribution.map((m) => ({
  name: m.module,
  value: m.percentage,
}))

const PIE_COLORS = [CHART_COLORS[1], STATUS_COLORS.success, STATUS_COLORS.warning, STATUS_COLORS.error]

const modelColors = [CHART_COLORS[1], STATUS_COLORS.success, STATUS_COLORS.warning, CHART_COLORS[5]] as const

const modelDistribution = [
  { model: 'GPT-4', percentage: 40 },
  { model: 'Claude-3', percentage: 35 },
  { model: 'Qwen', percentage: 20 },
  { model: 'DeepSeek', percentage: 5 },
]

interface TokenTrendPointWide {
  day: string
  input_tokens: number
  output_tokens: number
}

function generateTokenTrend(): TokenTrendPointWide[] {
  const data: TokenTrendPointWide[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const day = `${d.getMonth() + 1}/${d.getDate()}`
    const baseInput = 80000 + Math.random() * 40000
    const baseOutput = 30000 + Math.random() * 20000
    data.push({ day, input_tokens: Math.round(baseInput), output_tokens: Math.round(baseOutput) })
  }
  return data
}

const lineData = generateTokenTrend()

const costTableData: ModuleCostRow[] = [
  { key: 'quote', module: '询报价', calls: 5603, inputTokens: 2_240_000, outputTokens: 890_000, cost: 351.20, avgLatency: 2.1 },
  { key: 'marketing', module: '营销内容', calls: 3113, inputTokens: 1_550_000, outputTokens: 1_240_000, cost: 215.80, avgLatency: 3.4 },
  { key: 'selling', module: '卖点提炼', calls: 1868, inputTokens: 934_000, outputTokens: 468_000, cost: 98.50, avgLatency: 1.6 },
  { key: 'cs', module: '客服问答', calls: 1866, inputTokens: 560_000, outputTokens: 280_000, cost: 114.83, avgLatency: 0.9 },
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
        <strong className={styles.costHighlight}>${val.toFixed(2)}</strong>
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
      const color = val > 2 ? 'var(--error)' : val > 1 ? 'var(--warning)' : 'var(--success)'
      return (
        <span style={{ color }}>
          {val}s
        </span>
      )
    },
  },
]

export const AICostTab: React.FC = () => {
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card className={`${styles.statCard} ${styles.statCardChart1}`}>
            <Statistic
              title="总调用次数"
              value={12450}
              valueStyle={{ color: 'var(--chart-1)' }}
              prefix={<ArrowUpOutlined />}
              suffix="次"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={`${styles.statCard} ${styles.statCardSuccess}`}>
            <Statistic
              title="总 Token 消耗"
              value={8.2}
              precision={1}
              valueStyle={{ color: 'var(--success)' }}
              prefix={<ThunderboltOutlined />}
              suffix="M tokens"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={`${styles.statCard} ${styles.statCardWarning}`}>
            <Statistic
              title="月度费用估算"
              value={780.50}
              precision={2}
              valueStyle={{ color: 'var(--warning)' }}
              prefix={<DollarOutlined />}
              suffix=" USD"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={`${styles.statCard} ${styles.statCardChart5}`}>
            <Statistic
              title="平均响应时间"
              value={1.8}
              precision={1}
              valueStyle={{ color: 'var(--chart-5)' }}
              prefix={<ClockCircleOutlined />}
              suffix="s"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className={styles.rowMarginTop}>
        <Col span={12}>
          <Card className={styles.chartCard} title="模块调用分布">
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <RPie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    innerRadius="60%"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </RPie>
                  <Tooltip formatter={(value: number) => [`${value}%`, '占比']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card className={styles.chartCard} title="Token 用量趋势 (30 天)">
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" tick={{ fill: CHART_LABEL_COLOR }} interval={4} />
                  <YAxis tick={{ fill: CHART_LABEL_COLOR }} tickFormatter={(v: number) => v >= 100000 ? `${(v / 1000).toFixed(0)}K` : v.toString()} />
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Tokens']} />
                  <Legend />
                  <Line type="monotone" dataKey="input_tokens" stroke={CHART_COLORS[1]} name="Input Tokens" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="output_tokens" stroke={STATUS_COLORS.success} name="Output Tokens" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className={`${styles.chartCard} ${styles.cardMarginTop}`} title="模型分布">
        <div className={styles.modelDistributionContent}>
          {modelDistribution.map((m, i) => (
            <span key={m.model} className={styles.modelTag}>
              <Tag color={modelColors[i]} className={styles.modelTagInner}>{m.model}</Tag>
              <span className={styles.modelPercentage}>{m.percentage}%</span>
            </span>
          ))}
        </div>
      </Card>

      <Card className={`${styles.chartCard} ${styles.cardMarginTop}`} title="费用明细">
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
    </>
  )
}
