import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Timeline, Spin, Tag } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { Line } from '@ant-design/charts'
import { systemService } from '../../services'
import styles from './SystemDashboardPage.module.css'

interface HealthMetrics {
  apiLatency: { p95: number; p99: number }
  successRate: number
  qps: number
  activeAgents: number
  totalAgents: number
  uptime: string
  lastDeploy: string
}

export const SystemDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [health, setHealth] = useState<HealthMetrics | null>(null)

  useEffect(() => {
    systemService.getHealth()
      .then(data => {
        setHealth(data.data)
      })
      .catch((error) => {
        console.error(error)
        setHealth({
          apiLatency: { p95: 0, p99: 0 },
          successRate: 0,
          qps: 0,
          activeAgents: 0,
          totalAgents: 0,
          uptime: '-',
          lastDeploy: '-',
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const chartData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    latency: 800 + Math.random() * 600,
    qps: 30 + Math.random() * 40,
  }))

  const latencyConfig = {
    data: chartData,
    xField: 'time',
    yField: 'latency',
    smooth: true,
    color: '#1890ff',
    point: { size: 3, shape: 'circle' },
    label: {
      style: { fill: '#aaa' },
    },
    xAxis: {
      label: {
        autoRotate: false,
        autoHide: { type: 'equidistance', cfg: { minGap: 6 } },
      },
    },
  }

  if (loading) {
    return <Spin size="large" className={styles.loading} />
  }

  return (
    <div className={styles.container}>
      <h2 style={{ marginBottom: 16 }}>系统仪表盘</h2>

      <Row gutter={[16, 16]}>
        {/* 健康指标卡片 */}
        <Col span={6}>
          <Card>
            <Statistic
              title="API 成功率"
              value={health?.successRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="当前 QPS"
              value={health?.qps}
              suffix="req/s"
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="P95 延迟"
              value={health?.apiLatency.p95}
              suffix="ms"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在线 Agent"
              value={health?.activeAgents}
              suffix={`/ ${health?.totalAgents}`}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="API 延迟趋势 (24h)">
            <div className={styles.chartContainer}>
              <Line {...latencyConfig} />
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="最近操作时间线">
            <div className={styles.timelineContainer}>
              <Timeline
                items={[
                  {
                    color: 'green',
                    children: (
                      <div>
                        <strong>系统部署</strong>
                        <br />
                        <Tag color="blue">SYS-004</Tag> 2026-04-17 02:00:00
                      </div>
                    ),
                  },
                  {
                    color: 'blue',
                    children: (
                      <div>
                        <strong>模型切换</strong>
                        <br />
                        <Tag color="green">SYS-002</Tag> GPT-4 → Claude 3
                      </div>
                    ),
                  },
                  {
                    color: 'green',
                    children: (
                      <div>
                        <strong>参数更新</strong>
                        <br />
                        <Tag color="orange">SYS-003</Tag> AI 超时阈值调整
                      </div>
                    ),
                  },
                  {
                    color: 'red',
                    children: (
                      <div>
                        <strong>Agent 离线告警</strong>
                        <br />
                        <Tag color="red">SYS-001</Tag> BizUI Agent-2 离线
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <Row>
          <Col span={8}>
            <Statistic title="系统可用率" value={99.5} precision={1} suffix="%" />
          </Col>
          <Col span={8}>
            <Statistic title="P99 延迟" value={health?.apiLatency.p99} suffix="ms" />
          </Col>
          <Col span={8}>
            <Statistic title="上次部署" value={health?.lastDeploy} />
          </Col>
        </Row>
      </Card>
    </div>
  )
}
