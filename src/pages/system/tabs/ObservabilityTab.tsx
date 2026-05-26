import React from 'react'
import { Card, Row, Col, Statistic, Timeline, Tag } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined } from '@/iconMap'
import { BarChart, Bar, PieChart, Pie as RPie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CHART_COLORS, CHART_LABEL_COLOR, STATUS_COLORS } from '../../../styles/chartColors'
import styles from '../SystemStatusPage.module.css'

interface LatencyBucket {
  bucket: string
  count: number
}

interface ErrorType {
  type: string
  count: number
}

interface RequestVolume {
  time: string
  requests: number
}

interface OperationEvent {
  timestamp: string
  status: 'success' | 'error'
  endpoint: string
  latency: number
  method: string
}

export const ObservabilityTab: React.FC = () => {
  const latencyData: LatencyBucket[] = [
    { bucket: '<100ms', count: 12500 },
    { bucket: '100-300ms', count: 45200 },
    { bucket: '300-500ms', count: 28100 },
    { bucket: '500ms-1s', count: 15400 },
    { bucket: '1s-2s', count: 6200 },
    { bucket: '>2s', count: 1800 },
  ]

  const errorData: ErrorType[] = [
    { type: '超时', count: 35 },
    { type: '格式错误', count: 25 },
    { type: '模型错误', count: 20 },
    { type: '网络错误', count: 15 },
    { type: '其他', count: 5 },
  ]

  const volumeData: RequestVolume[] = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    requests: Math.floor(800 + Math.random() * 1200),
  }))

  const recentOperations: OperationEvent[] = [
    { timestamp: '2026-04-19 14:32:15', status: 'success', endpoint: '/api/v1/inquiry/parse', latency: 245, method: 'POST' },
    { timestamp: '2026-04-19 14:31:08', status: 'error', endpoint: '/api/v1/agent/orchestrate', latency: 3200, method: 'POST' },
    { timestamp: '2026-04-19 14:30:42', status: 'success', endpoint: '/api/v1/product/generate', latency: 890, method: 'POST' },
    { timestamp: '2026-04-19 14:29:55', status: 'success', endpoint: '/api/v1/rules/evaluate', latency: 120, method: 'GET' },
    { timestamp: '2026-04-19 14:28:33', status: 'error', endpoint: '/api/v1/model/invoke', latency: 5100, method: 'POST' },
    { timestamp: '2026-04-19 14:27:10', status: 'success', endpoint: '/api/v1/selling-point/extract', latency: 430, method: 'POST' },
    { timestamp: '2026-04-19 14:26:44', status: 'success', endpoint: '/api/v1/agent/status', latency: 85, method: 'GET' },
    { timestamp: '2026-04-19 14:25:19', status: 'success', endpoint: '/api/v1/content/create', latency: 1560, method: 'POST' },
  ]

  const errorTotal = errorData.reduce((s, d) => s + d.count, 0)

  const latencyColors = [STATUS_COLORS.success, CHART_COLORS[1], STATUS_COLORS.warning, STATUS_COLORS.warning, STATUS_COLORS.error, STATUS_COLORS.error]

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card className={styles.statCardSuccess}>
            <Statistic
              title="API 成功率"
              value={99.7}
              precision={1}
              suffix="%"
              valueStyle={{ color: 'var(--success)' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCardInfo}>
            <Statistic
              title="P50 延迟"
              value={320}
              suffix="ms"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCardWarning}>
            <Statistic
              title="P95 延迟"
              value={1.2}
              suffix="s"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={styles.statCardError}>
            <Statistic
              title="P99 延迟"
              value={2.8}
              suffix="s"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className={styles.rowMarginTop}>
        <Col span={12}>
          <Card className={styles.chartCard} title="延迟分布">
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="bucket" tick={{ fill: CHART_LABEL_COLOR }} />
                  <YAxis tick={{ fill: CHART_LABEL_COLOR }} />
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), '请求数']} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {latencyData.map((_, idx) => (
                      <Cell key={idx} fill={latencyColors[idx % latencyColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card className={styles.chartCard} title="错误类型分布">
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <RPie
                    data={errorData}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    innerRadius="60%"
                    label={({ type, count }: { type: string; count: number }) => `${type} ${(count / errorTotal * 100).toFixed(0)}%`}
                  >
                    {errorData.map((_, idx) => (
                      <Cell key={idx} fill={[STATUS_COLORS.error, STATUS_COLORS.warning, STATUS_COLORS.warning, CHART_COLORS[1], CHART_LABEL_COLOR][idx]} />
                    ))}
                  </RPie>
                  <Tooltip formatter={(value: number) => [`${(value / errorTotal * 100).toFixed(1)}%`, '占比']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className={`${styles.chartCard} ${styles.cardMarginTop}`} title="请求量趋势 (24h)">
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={volumeData}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" tick={{ fill: CHART_LABEL_COLOR }} />
              <YAxis tick={{ fill: CHART_LABEL_COLOR }} />
              <Tooltip formatter={(value: number) => [value.toLocaleString(), '请求数']} />
              <Area type="monotone" dataKey="requests" stroke={CHART_COLORS[1]} fill="url(#volumeGradient)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className={`${styles.chartCard} ${styles.cardMarginTop}`} title="最近操作时间线">
        <div className={styles.timelineContainer}>
          <Timeline
            items={recentOperations.map((op) => ({
              color: op.status === 'success' ? 'green' : 'red',
              children: (
                <div className={styles.timelineItem}>
                  <div className={styles.timelineHeader}>
                    <Tag color={op.method === 'POST' ? 'blue' : 'cyan'}>{op.method}</Tag>
                    <span className={styles.endpoint}>{op.endpoint}</span>
                    <span
                      className={styles.latency}
                      style={{
                        color: op.latency > 1000 ? 'var(--error)' : op.latency > 500 ? 'var(--warning)' : 'var(--success)',
                      }}
                    >
                      {op.latency >= 1000 ? `${(op.latency / 1000).toFixed(1)}s` : `${op.latency}ms`}
                    </span>
                  </div>
                  <div className={styles.timelineMeta}>
                    <span className={styles.timestamp}>{op.timestamp}</span>
                    <Tag color={op.status === 'success' ? 'success' : 'error'}>
                      {op.status === 'success' ? '成功' : '失败'}
                    </Tag>
                  </div>
                </div>
              ),
            }))}
          />
        </div>
      </Card>
    </>
  )
}
