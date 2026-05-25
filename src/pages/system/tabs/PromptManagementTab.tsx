import React, { useState } from 'react'
import { Card, Row, Col, Form, Input, Table, Tag, Badge, Button, Space, Modal, Divider, Select, Slider, Progress, Empty, Alert, Popconfirm, Statistic } from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  StopOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  RollbackOutlined,
} from '@/iconMap'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import styles from '../AgentOrchestrationPage.module.css'
import type { PromptVersion, ABTest, PromptBusinessMapping, UsageStat, CanaryConfig, PromptEvaluation, WorkflowEngine } from '../AgentOrchestrationPage.types'
import { getStatusColor, getStatusText } from '../AgentOrchestrationPage.types'
import { CHART_COLORS, CHART_LABEL_COLOR, STATUS_COLORS } from '../../../styles/chartColors'

const { TextArea } = Input

interface PromptManagementTabProps {
  promptVersions: PromptVersion[]
  abTests: ABTest[]
  promptBusinessMappings: PromptBusinessMapping[]
  promptUsageStats: UsageStat[]
  canaryConfigs: CanaryConfig[]
  promptEvaluations: PromptEvaluation[]
  workflowEngines: WorkflowEngine[]
  handleCreatePrompt: () => void
  handleEditPrompt: (record: PromptVersion) => void
  handleDeletePrompt: (promptId: string) => void
  handlePromptStatusChange: (promptId: string, status: 'active' | 'draft' | 'archived') => void
  setSelectedPrompt: (p: PromptVersion | null) => void
  setPromptEditModalVisible: (v: boolean) => void
  setVersionCompareModalVisible: (v: boolean) => void
  setCompareVersions: (v: { left: PromptVersion | null; right: PromptVersion | null }) => void
  setCanaryConfigs: React.Dispatch<React.SetStateAction<CanaryConfig[]>>
  handleRollbackCanary: (promptId: string) => void
}

export const PromptManagementTab: React.FC<PromptManagementTabProps> = ({
  promptVersions,
  abTests,
  promptBusinessMappings,
  promptUsageStats,
  canaryConfigs,
  promptEvaluations,
  workflowEngines,
  handleCreatePrompt,
  handleEditPrompt,
  handleDeletePrompt,
  handlePromptStatusChange,
  setSelectedPrompt,
  setPromptEditModalVisible,
  setVersionCompareModalVisible,
  setCompareVersions,
  setCanaryConfigs,
  handleRollbackCanary,
}) => {
  return (
    <div className={styles.container}>
      <Card
        title="Prompt 版本管理"
        className={styles.card}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreatePrompt}>
            新建 Prompt
          </Button>
        }
      >
        <Table
          dataSource={promptVersions}
          rowKey="id"
          columns={[
            { title: 'Prompt 名称', dataIndex: 'name', key: 'name' },
            { title: '版本', dataIndex: 'version', key: 'version' },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              render: (status: string) => (
                <Badge status={getStatusColor(status) as any} text={getStatusText(status)} />
              ),
            },
            { title: '创建人', dataIndex: 'creator', key: 'creator' },
            { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
            { title: '使用次数', dataIndex: 'usageCount', key: 'usageCount' },
            {
              title: '成功率',
              dataIndex: 'successRate',
              key: 'successRate',
              render: (rate: number) => `${rate}%`,
            },
            {
              title: '操作',
              key: 'action',
              render: (_: any, record: PromptVersion) => (
                <Space>
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => { setSelectedPrompt(record); setPromptEditModalVisible(true) }}
                  >
                    查看
                  </Button>
                  <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditPrompt(record)}>
                    编辑
                  </Button>
                  {record.status === 'draft' && (
                    <Button
                      type="link"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => handlePromptStatusChange(record.id, 'active')}
                    >
                      发布
                    </Button>
                  )}
                  {record.status === 'active' && (
                    <Button
                      type="link"
                      size="small"
                      icon={<StopOutlined />}
                      onClick={() => handlePromptStatusChange(record.id, 'archived')}
                    >
                      归档
                    </Button>
                  )}
                  <Popconfirm
                    title="确定删除此 Prompt 版本？"
                    onConfirm={() => handleDeletePrompt(record.id)}
                  >
                    <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          pagination={false}
        />
      </Card>

      <Card title="A/B 测试" className={styles.card} extra={<Button type="primary" icon={<ExperimentOutlined />} size="small">创建测试</Button>}>
        {abTests.map(test => (
          <div className={styles.abTestCard} key={test.id}>
            <div className={styles.abTestHeader}>
              <div>
                <span className={styles.abTestName}>{test.name}</span>
                <Tag color={test.status === 'running' ? 'processing' : test.status === 'paused' ? 'warning' : 'default'} className={styles.modalTagMargin}>
                  {test.status === 'running' ? '运行中' : test.status === 'paused' ? '已暂停' : '已完成'}
                </Tag>
              </div>
              <Space>
                <span className={styles.abTestDateRange}>{test.startDate} ~ {test.endDate || '进行中'}</span>
              </Space>
            </div>
            <div className={styles.abTestVariants}>
              {test.variants.map((variant, idx) => (
                <div className={styles.abVariant} key={variant.promptId}>
                  <div className={`${styles.abVariantName} ${idx === 0 ? styles.statValueChart1 : styles.statValueSuccess}`}>
                    {idx === 0 ? 'A' : 'B'}: {variant.promptName}
                  </div>
                  <div className={`${styles.abVariantTraffic} ${idx === 0 ? styles.statValueChart1 : styles.statValueSuccess}`}>
                    {variant.trafficPercent}%
                  </div>
                  <div className={styles.abVariantMetrics}>流量分配</div>
                  <Row gutter={[8, 8]} className={styles.abMetricsRow}>
                    <Col span={8}>
                      <Statistic title="转化率" value={variant.metrics.conversionRate} suffix="%" valueStyle={{ fontSize: 14, color: 'var(--text-primary)' }} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="成功率" value={variant.metrics.successRate} suffix="%" valueStyle={{ fontSize: 14, color: 'var(--text-primary)' }} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="平均响应" value={variant.metrics.avgResponseTime} suffix="s" valueStyle={{ fontSize: 14, color: 'var(--text-primary)' }} />
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>

      <Card title="Prompt 业务关联映射" className={styles.card}>
        <Table
          dataSource={promptBusinessMappings}
          rowKey="promptId"
          pagination={false}
          size="small"
          columns={[
            { title: 'Prompt 名称', dataIndex: 'promptName', key: 'promptName', render: (text: string) => <Tag color="orange">{text}</Tag> },
            { title: '关联工作流', dataIndex: 'workflows', key: 'workflows', render: (v: string[]) => v.map(id => workflowEngines.find(w => w.id === id)?.name).join(', ') || '-' },
            { title: '使用模块', dataIndex: 'modules', key: 'modules', render: (v: string[]) => v.map(m => <Tag key={m}>{m}</Tag>) },
            { title: '使用次数', dataIndex: 'usageCount', key: 'usageCount', sorter: (a: PromptBusinessMapping, b: PromptBusinessMapping) => a.usageCount - b.usageCount },
          ]}
        />
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="使用量趋势" className={`${styles.card} ${styles.usageStatsCard}`}>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={promptUsageStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="time" tick={{ fill: CHART_LABEL_COLOR }} />
                  <YAxis tick={{ fill: CHART_LABEL_COLOR }} />
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), '调用次数']} />
                  <Bar dataKey="calls" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="成功率趋势" className={`${styles.card} ${styles.usageStatsCard}`}>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={promptUsageStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="time" tick={{ fill: CHART_LABEL_COLOR }} />
                  <YAxis tick={{ fill: CHART_LABEL_COLOR }} />
                  <Tooltip formatter={(value: number) => [`${value}%`, '成功率']} />
                  <Line type="monotone" dataKey="successRate" stroke={STATUS_COLORS.success} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="灰度发布" className={`${styles.card} ${styles.canaryConfigCard}`}>
        {canaryConfigs.length > 0 ? (
          canaryConfigs.map(config => (
            <div key={config.promptId} className={styles.canaryConfigRow}>
              <Row gutter={16} align="middle">
                <Col span={6}>
                  <div className={styles.canaryConfigName}>{config.promptName}</div>
                  <Tag color="processing" className={styles.canaryConfigTag}>灰度中</Tag>
                </Col>
                <Col span={4}>
                  <div className={styles.canaryConfigLabel}>当前版本</div>
                  <Tag>{config.currentVersion}</Tag>
                </Col>
                <Col span={4}>
                  <div className={styles.canaryConfigLabel}>灰度版本</div>
                  <Tag color="blue">{config.canaryVersion}</Tag>
                </Col>
                <Col span={6}>
                  <div className={styles.canaryConfigLabelWithMargin}>灰度比例: {config.canaryPercent}%</div>
                  <Slider value={config.canaryPercent} onChange={(v) => {
                    setCanaryConfigs(prev => prev.map(c => c.promptId === config.promptId ? { ...c, canaryPercent: v } : c))
                  }} min={0} max={100} />
                </Col>
                <Col span={4}>
                  <Space>
                    <Button type="link" size="small" icon={<RollbackOutlined />} onClick={() => handleRollbackCanary(config.promptId)}>
                      回滚
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>
          ))
        ) : (
          <Empty description="暂无灰度配置" />
        )}
      </Card>

      <Card title="Prompt 评测结果" className={`${styles.card} ${styles.evaluationResultsCard}`}>
        <Table
          dataSource={promptEvaluations}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            { title: 'Prompt 名称', dataIndex: 'promptName', key: 'promptName', render: (text: string) => <Tag color="orange">{text}</Tag> },
            { title: '评测者', dataIndex: 'evaluator', key: 'evaluator' },
            { title: '类型', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={t === 'manual' ? 'blue' : 'green'}>{t === 'manual' ? '人工' : '自动'}</Tag> },
            { title: '评分', dataIndex: 'score', key: 'score', render: (v: number) => v > 0 ? <Progress percent={v} size="small" strokeColor={v >= 90 ? STATUS_COLORS.success : v >= 80 ? STATUS_COLORS.warning : STATUS_COLORS.error} /> : '-' },
            { title: '评测意见', dataIndex: 'comment', key: 'comment', ellipsis: true },
            { title: '评测时间', dataIndex: 'evaluatedAt', key: 'evaluatedAt', width: 180 },
          ]}
        />
      </Card>

      <Card title="版本对比" className={styles.card}>
        <Alert
          message="选择两个 Prompt 版本进行对比"
          description="在上面的 Prompt 列表中勾选两个版本，然后点击对比按钮查看差异"
          type="info"
          showIcon
          className={styles.alertMargin}
        />
        <Space>
          {promptVersions.filter(p => p.status !== 'archived').slice(0, 3).map((p, idx) => (
            <Button key={p.id} icon={<FileTextOutlined />} onClick={() => {
              if (idx === 0) {
                setCompareVersions({ left: p, right: promptVersions[1] || p })
                setVersionCompareModalVisible(true)
              }
            }}>
              {p.name} ({p.version})
            </Button>
          ))}
        </Space>
      </Card>
    </div>
  )
}
