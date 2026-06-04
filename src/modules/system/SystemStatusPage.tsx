/**
 * SystemStatusPage — 系统底座
 */
import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Card, Empty, Select, Table, Tag } from 'antd'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ApiOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  DollarOutlined,
  FileSearchOutlined,
  InboxOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@/iconMap'
import { useNavigate } from 'react-router-dom'
import {
  mockAgentConfigAdapter,
  mockAuditAdapter,
  mockKnowledgeItemAdapter,
  mockMetricSnapshotAdapter,
  mockModelConfigAdapter,
  mockSystemHealthAdapter,
} from '../../adapters'
import { getSystemFoundationOverview } from '../../domain'
import { formatDateTime } from '../shared/formatters'
import { PageShell } from '../shared/SharedUI'
import { MetricRibbon } from '../shared/MetricRibbon'
import sharedStyles from '../shared/SharedUI.module.css'
import styles from './SystemStatusPage.module.css'
import type { AgentConfig, AuditEntry, KnowledgeItem, MetricSnapshot, ModelConfig, SystemHealth } from '../../contracts'

const STATUS_COLOR = {
  normal: 'green',
  warning: 'orange',
  critical: 'red',
} as const

const STATUS_LABEL = {
  normal: '正常',
  warning: '关注',
  critical: '异常',
} as const

const CHART_COLORS = ['var(--brand-primary)', 'var(--success)', 'var(--warning)', 'var(--text-tertiary)', 'var(--brand-secondary)']

export const SystemStatusPage: React.FC = () => {
  const navigate = useNavigate()
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [models, setModels] = useState<ModelConfig[]>([])
  const [agents, setAgents] = useState<AgentConfig[]>([])
  const [audits, setAudits] = useState<AuditEntry[]>([])
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [metrics, setMetrics] = useState<MetricSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stepFilter, setStepFilter] = useState<string | undefined>()

  useEffect(() => {
    Promise.all([
      mockSystemHealthAdapter.get(),
      mockModelConfigAdapter.list(),
      mockAgentConfigAdapter.list(),
      mockAuditAdapter.list(),
      mockKnowledgeItemAdapter.list(),
      mockMetricSnapshotAdapter.history(),
    ])
      .then(([healthData, modelData, agentData, auditData, knowledgeData, metricData]) => {
        setHealth(healthData)
        setModels(modelData)
        setAgents(agentData)
        setAudits(auditData)
        setKnowledgeItems(knowledgeData)
        setMetrics(metricData)
        setLoading(false)
      })
      .catch(() => {
        setError('加载系统状态失败，请刷新重试')
        setLoading(false)
      })
  }, [])

  const foundation = useMemo(() => {
    if (!health) return null
    return getSystemFoundationOverview(health, models, agents, audits, knowledgeItems, metrics)
  }, [health, models, agents, audits, knowledgeItems, metrics])

  if (loading) return <PageShell loading />
  if (error) return <PageShell><Alert type="error" title={error} showIcon style={{ marginTop: 16 }} /></PageShell>
  if (!health || !foundation) return <PageShell><Empty description="暂无系统健康数据" /></PageShell>

  const capabilityRows = stepFilter
    ? foundation.capabilityNodes.filter(node => node.key === stepFilter)
    : foundation.capabilityNodes
  const stepOptions = foundation.capabilityNodes.map(node => ({ value: node.key, label: node.step }))
  const trendData = [...metrics].reverse().map(item => ({
    date: item.date.slice(5),
    calls: Math.round(item.leadCount * 18),
    latency: health.avgLatencyMs + Math.round((item.manualReviewRate - 0.3) * 100),
    errorRate: Math.round(health.errorRate * 1000) / 10,
  }))
  const capabilityChart = foundation.capabilityNodes.map(node => ({
    name: node.step,
    calls: node.calls,
    models: node.enabledModelCount,
    agents: node.enabledAgentCount,
  }))

  const quickLinks = [
    { label: '模型配置', value: `${models.length} 项`, icon: <InboxOutlined />, path: '/sys/model-config' },
    { label: 'Agent 编排', value: `${agents.length} 个`, icon: <RobotOutlined />, path: '/sys/agent-orchestration' },
    { label: '审计日志', value: `${audits.length} 条`, icon: <FileSearchOutlined />, path: '/sys/audit-log' },
    { label: 'AI 成本', value: '成本拆分', icon: <DollarOutlined />, path: '/sys/ai-cost' },
    { label: '可观测性', value: '失败事件', icon: <DashboardOutlined />, path: '/sys/observability' },
    { label: '业务指标', value: '经营指标', icon: <CheckCircleOutlined />, path: '/sys/business-metrics' },
  ]

  return (
    <PageShell
      icon={<ApiOutlined />}
      title="系统底座"
      extra={<div className={styles.headerMeta}>更新时间 {formatDateTime(health.updatedAt)}</div>}
    >
      <div className={sharedStyles.systemStack}>
        <MetricRibbon items={[
          { label: '健康分', value: foundation.healthScore, prefix: <CheckCircleOutlined />, color: foundation.healthScore >= 90 ? 'var(--success)' : 'var(--warning)' },
          { label: '模型调用', value: health.totalModelCalls.toLocaleString(), prefix: <ThunderboltOutlined /> },
          { label: '工作流执行', value: health.workflowRuns, prefix: <ApiOutlined /> },
          { label: '平均延迟', value: `${health.avgLatencyMs}ms`, prefix: <ClockCircleOutlined />, color: health.avgLatencyMs > 380 ? 'var(--warning)' : undefined },
          { label: '错误率', value: `${(health.errorRate * 100).toFixed(2)}%`, prefix: <WarningOutlined />, color: health.errorRate > 0.03 ? 'var(--error)' : 'var(--success)' },
          { label: '活跃连接', value: health.activeConnections, prefix: <DashboardOutlined /> },
        ]} />

        <div className={styles.quickJumpGrid}>
          {quickLinks.map(link => (
            <button key={link.path} className={styles.quickJump} onClick={() => navigate(link.path)}>
              <span className={styles.quickIcon}>{link.icon}</span>
              <span>
                <strong>{link.label}</strong>
                <small>{link.value}</small>
              </span>
            </button>
          ))}
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h3>主链能力覆盖</h3>
              <span>模型、Agent、调用量</span>
            </div>
          </div>
          <div className={styles.capabilityMap}>
            {foundation.capabilityNodes.map(node => (
              <div key={node.key} className={styles.capabilityNode}>
                <div className={styles.nodeTop}>
                  <strong>{node.step}</strong>
                  <Tag color={STATUS_COLOR[node.status]}>{STATUS_LABEL[node.status]}</Tag>
                </div>
                <div className={styles.nodeMetrics}>
                  <span>{node.calls.toLocaleString()} 调用</span>
                  <span>{node.enabledModelCount}/{node.modelCount} 模型</span>
                  <span>{node.enabledAgentCount}/{node.agentCount} Agent</span>
                </div>
                <div className={styles.progressTrack}>
                  <span style={{ width: `${Math.max(4, Math.round(node.callShare * 100))}%` }} />
                </div>
                <small>{node.avgLatencyMs}ms · 成功率 {Math.round(node.successRate * 100)}%</small>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.analysisGrid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3>模型调用分布</h3>
                <span>主链步骤调用量</span>
              </div>
            </div>
            <div className={styles.chartShort}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capabilityChart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border-secondary)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                  <Tooltip />
                  <Bar dataKey="calls" name="调用量" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3>Agent 编排状态</h3>
                <span>类型分布</span>
              </div>
            </div>
            <div className={styles.chartShort}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={foundation.agentDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={3}>
                    {foundation.agentDistribution.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.assetGrid}>
              <div><span>启用模型</span><strong>{foundation.enabledModels}/{models.length}</strong></div>
              <div><span>启用 Agent</span><strong>{foundation.enabledAgents}/{agents.length}</strong></div>
              <div><span>知识资产</span><strong>{foundation.publishedKnowledgeItems}</strong></div>
              <div><span>指标快照</span><strong>{foundation.metricSnapshots}</strong></div>
            </div>
          </section>
        </div>

        <div className={styles.analysisGrid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3>审计与风险</h3>
                <span>失败与复核</span>
              </div>
            </div>
            <div className={styles.riskStrip}>
              <div>
                <span>失败</span>
                <strong>{foundation.failureAudits}</strong>
              </div>
              <div>
                <span>复核</span>
                <strong>{foundation.reviewAudits}</strong>
              </div>
              <div>
                <span>总审计</span>
                <strong>{audits.length}</strong>
              </div>
            </div>
            <div className={styles.chartShort}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="latencyTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border-secondary)" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="latency" name="延迟" stroke="var(--brand-primary)" fill="url(#latencyTrend)" strokeWidth={2} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3>资源入口</h3>
                <span>配置、审计、观测</span>
              </div>
            </div>
            <div className={styles.resourceList}>
              {quickLinks.map(link => (
                <button key={link.path} onClick={() => navigate(link.path)}>
                  <span className={styles.quickIcon}>{link.icon}</span>
                  <strong>{link.label}</strong>
                  <small>{link.value}</small>
                </button>
              ))}
            </div>
          </section>
        </div>

        <Card
          title="诊断明细"
          size="small"
          className={sharedStyles.systemInsightPanel}
          extra={
            <Select
              allowClear
              placeholder="筛选步骤"
              value={stepFilter}
              onChange={setStepFilter}
              options={stepOptions}
              size="small"
              style={{ minWidth: 140 }}
            />
          }
        >
          <Table
            size="small"
            pagination={false}
            dataSource={capabilityRows}
            columns={[
              { title: '主链步骤', dataIndex: 'step', width: 140 },
              { title: '调用量', dataIndex: 'calls', width: 100, render: (value: number) => value.toLocaleString() },
              { title: '占比', dataIndex: 'callShare', width: 100, render: (value: number) => `${Math.round(value * 100)}%` },
              { title: '模型', dataIndex: 'modelCount', width: 100, render: (_: number, row) => `${row.enabledModelCount}/${row.modelCount}` },
              { title: 'Agent', dataIndex: 'agentCount', width: 100, render: (_: number, row) => `${row.enabledAgentCount}/${row.agentCount}` },
              { title: '平均延迟', dataIndex: 'avgLatencyMs', width: 100, render: (value: number) => `${value}ms` },
              { title: '状态', dataIndex: 'status', width: 90, render: (value: keyof typeof STATUS_COLOR) => <Tag color={STATUS_COLOR[value]}>{STATUS_LABEL[value]}</Tag> },
            ]}
            locale={{ emptyText: <Empty description="暂无步骤数据" /> }}
          />
        </Card>
      </div>
    </PageShell>
  )
}

export default SystemStatusPage
