import React from 'react'
import { Card, Row, Col, Statistic, Timeline, Tag } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { Column, Pie, Line } from '@ant-design/charts'
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

  const latencyConfig = {
    data: latencyData,
    xField: 'bucket',
    yField: 'count',
    color: (item: LatencyBucket) => {
      const colors = [STATUS_COLORS.success, CHART_COLORS[1], STATUS_COLORS.warning, STATUS_COLORS.warning, STATUS_COLORS.error, STATUS_COLORS.error]
      const index = latencyData.indexOf(item)
      return colors[index]
    },
    label: {
      position: 'top',
      style: {
        fill: '#ffffff',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoRotate: true,
        style: { fill: CHART_LABEL_COLOR },
      },
    },
    yAxis: {
      label: {
        style: { fill: CHART_LABEL_COLOR },
      },
    },
    tooltip: {
      formatter: (datum: LatencyBucket) => ({
        name: '请求数',
        value: datum.count.toLocaleString(),
      }),
    },
  }

  const errorConfig = {
    data: errorData,
    angleField: 'count',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{percentage}',
      style: {
        textAlign: 'center',
        fontSize: 14,
        fill: '#ffffff',
      },
    },
    interactions: [{ type: 'element-active' }],
    legend: {
      position: 'right',
      itemName: {
        style: { fill: CHART_LABEL_COLOR },
      },
    },
    tooltip: {
      formatter: (datum: ErrorType) => ({
        name: datum.type,
        value: `${datum.count}%`,
      }),
    },
    color: [STATUS_COLORS.error, STATUS_COLORS.warning, STATUS_COLORS.warning, CHART_COLORS[1], CHART_LABEL_COLOR],
  }

  const volumeConfig = {
    data: volumeData,
    xField: 'time',
    yField: 'requests',
    smooth: true,
    color: CHART_COLORS[1],
    point: { size: 3, shape: 'circle' },
    areaStyle: {
      fill: 'l(270) 0:#1e40af 0.5:#2563eb 1:#3b82f6',
    },
    xAxis: {
      label: {
        autoRotate: false,
        autoHide: { type: 'equidistance', cfg: { minGap: 6 } },
        style: { fill: CHART_LABEL_COLOR },
      },
    },
    yAxis: {
      label: {
        style: { fill: CHART_LABEL_COLOR },
      },
    },
    tooltip: {
      formatter: (datum: RequestVolume) => ({
        name: '请求数',
        value: datum.requests.toLocaleString(),
      }),
    },
  }

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card style={{ borderLeft: '3px solid var(--success)' }}>
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
          <Card style={{ borderLeft: '3px solid var(--info)' }}>
            <Statistic
              title="P50 延迟"
              value={320}
              suffix="ms"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderLeft: '3px solid var(--warning)' }}>
            <Statistic
              title="P95 延迟"
              value={1.2}
              suffix="s"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderLeft: '3px solid var(--error)' }}>
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
              <Column {...latencyConfig} />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card className={styles.chartCard} title="错误类型分布">
            <div className={styles.chartContainer}>
              <Pie {...errorConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      <Card className={`${styles.chartCard} ${styles.cardMarginTop}`} title="请求量趋势 (24h)">
        <div className={styles.chartContainer}>
          <Line {...volumeConfig} />
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
