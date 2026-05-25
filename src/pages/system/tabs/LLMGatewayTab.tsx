import React from 'react'
import { Card, Row, Col, Form, Input, InputNumber, Select, Switch, Divider, List, Button, Tag, Popconfirm, Space, Table, Badge, Statistic, Tooltip, message } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckOutlined,
} from '@/iconMap'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip, Legend } from 'recharts'
import styles from '../AgentOrchestrationPage.module.css'
import type { LLMGatewayConfig, TrafficDistribution, ApiKeyItem, RequestLog } from '../AgentOrchestrationPage.types'
import { CHART_COLORS, CHART_LABEL_COLOR } from '../../../styles/chartColors'

const { TextArea } = Input
const { Option } = Select

interface LLMGatewayTabProps {
  llmGatewayConfig: LLMGatewayConfig
  trafficDistribution: TrafficDistribution[]
  apiKeys: ApiKeyItem[]
  requestLogs: RequestLog[]
  handleAddRouteRule: () => void
  handleEditRouteRule: (rule: { pattern: string; model: string }, index: number) => void
  handleDeleteRouteRule: (index: number) => void
  handleToggleApiKey: (keyId: string) => void
  handleDeleteApiKey: (keyId: string) => void
}

export const LLMGatewayTab: React.FC<LLMGatewayTabProps> = ({
  llmGatewayConfig,
  trafficDistribution,
  apiKeys,
  requestLogs,
  handleAddRouteRule,
  handleEditRouteRule,
  handleDeleteRouteRule,
  handleToggleApiKey,
  handleDeleteApiKey,
}) => {
  return (
    <div className={styles.container}>
      <Card title="LLM 网关配置" className={styles.card}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="基础配置" size="small" className={styles.subCard}>
              <Form layout="vertical" initialValues={llmGatewayConfig}>
                <Form.Item label="API Key">
                  <Input.Password defaultValue={llmGatewayConfig.apiKey} />
                </Form.Item>
                <Form.Item label="限流阈值 (请求/分钟)">
                  <InputNumber min={100} max={10000} defaultValue={llmGatewayConfig.rateLimit} />
                </Form.Item>
                <Form.Item label="最大 Token 数">
                  <InputNumber min={1024} max={32768} defaultValue={llmGatewayConfig.maxTokens} />
                </Form.Item>
                <Form.Item label="超时时间 (ms)">
                  <InputNumber min={5000} max={120000} defaultValue={llmGatewayConfig.timeout} />
                </Form.Item>
                <Form.Item label="备用模型">
                  <Select defaultValue={llmGatewayConfig.fallbackModel}>
                    <Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Option>
                    <Option value="claude-3-haiku">Claude 3 Haiku</Option>
                    <Option value="qwen-turbo">通义千问 Turbo</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="重试次数">
                  <InputNumber min={0} max={10} defaultValue={llmGatewayConfig.retryCount} />
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="鉴权与路由" size="small" className={styles.subCard}>
              <Form layout="vertical">
                <Form.Item label="鉴权开关">
                  <Switch defaultChecked={llmGatewayConfig.authEnabled} />
                  <span className={styles.authLabel}>
                    {llmGatewayConfig.authEnabled ? '已启用' : '已禁用'}
                  </span>
                </Form.Item>
                <Form.Item label="IP 白名单">
                  <TextArea
                    rows={3}
                    defaultValue={llmGatewayConfig.ipWhitelist.join('\n')}
                    placeholder="每行一个 IP 或 IP 段"
                  />
                </Form.Item>

                <Divider orientation="left">模型路由规则</Divider>
                <List
                  dataSource={llmGatewayConfig.modelRouting}
                  renderItem={(item, index) => (
                    <List.Item
                      actions={[
                        <Button key="edit" type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditRouteRule(item, index)}>编辑</Button>,
                        <Popconfirm key="delete" title="确定删除此路由规则？" onConfirm={() => handleDeleteRouteRule(index)}>
                          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
                        </Popconfirm>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <Tag color="blue">{item.pattern}</Tag>
                            <span>→</span>
                            <Tag color="green">{item.model}</Tag>
                          </Space>
                        }
                        description="路由规则描述"
                      />
                    </List.Item>
                  )}
                />
                <Button type="dashed" block icon={<PlusOutlined />} className={styles.addRouteButton} onClick={handleAddRouteRule}>
                  添加路由规则
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>

        <div className={styles.formActions}>
          <Button icon={<ReloadOutlined />} onClick={() => message.info('配置已重置')}>重置</Button>
          <Button type="primary" icon={<CheckOutlined />} className={styles.saveButton} onClick={() => message.success('LLM 网关配置已保存')}>
            保存配置
          </Button>
        </div>
      </Card>

      <Card title="实时请求监控" className={styles.card}>
        <div className={styles.monitoringPanel}>
          <div className={styles.monitoringGrid}>
            <div className={styles.monitoringItem}>
              <div className={`${styles.monitoringValue} ${styles.monitoringValueInfo}`}>1,250</div>
              <div className={styles.monitoringLabel}>QPS (请求/秒)</div>
            </div>
            <div className={styles.monitoringItem}>
              <div className={`${styles.monitoringValue} ${styles.monitoringValueSuccess}`}>99.7%</div>
              <div className={styles.monitoringLabel}>成功率</div>
            </div>
            <div className={styles.monitoringItem}>
              <div className={`${styles.monitoringValue} ${styles.monitoringValueWarning}`}>1.2s</div>
              <div className={styles.monitoringLabel}>P95 延迟</div>
            </div>
            <div className={styles.monitoringItem}>
              <div className={`${styles.monitoringValue} ${styles.monitoringValueError}`}>0.3%</div>
              <div className={styles.monitoringLabel}>错误率</div>
            </div>
            <div className={styles.monitoringItem}>
              <div className={`${styles.monitoringValue} ${styles.monitoringValueChart5}`}>780</div>
              <div className={styles.monitoringLabel}>限流剩余</div>
            </div>
            <div className={styles.monitoringItem}>
              <div className={`${styles.monitoringValue} ${styles.monitoringValueChart2}`}>101.5K</div>
              <div className={styles.monitoringLabel}>Token/分钟</div>
            </div>
          </div>
        </div>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="模型流量分配" className={styles.card}>
            <div className={styles.trafficChartContainer}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={trafficDistribution.map(t => ({ name: t.model, value: t.percentage }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={75}
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {trafficDistribution.map((_, idx) => (
                      <Cell key={idx} fill={[CHART_COLORS[1], CHART_COLORS[3], CHART_COLORS[4], CHART_COLORS[5], CHART_COLORS[6]][idx % 5]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="流量统计详情" className={styles.card}>
            <Table
              dataSource={trafficDistribution}
              rowKey="model"
              pagination={false}
              size="small"
              columns={[
                { title: '模型', dataIndex: 'model', key: 'model', render: (text: string) => <Tag color="blue">{text}</Tag> },
                { title: '调用次数', dataIndex: 'calls', key: 'calls', render: (v: number) => v.toLocaleString() },
                { title: '占比', dataIndex: 'percentage', key: 'percentage', render: (v: number) => `${v}%` },
                { title: '费用(USD)', dataIndex: 'cost', key: 'cost', render: (v: number) => `$${v.toFixed(2)}` },
                { title: '平均延迟', dataIndex: 'avgLatency', key: 'avgLatency', render: (v: number) => `${v}s` },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Card title="API Key 管理" className={styles.card} extra={<Button type="primary" icon={<PlusOutlined />} size="small">添加 Key</Button>}>
        {apiKeys.map(key => (
          <div className={styles.apiKeyItem} key={key.id}>
            <div className={styles.apiKeyStatus}>
              <Badge status={key.status === 'active' ? 'success' : key.status === 'disabled' ? 'default' : 'error'} />
              <code className={styles.apiKeyCode}>{key.key}</code>
              <Tag color={key.rotationPolicy === 'auto' ? 'green' : 'orange'}>
                {key.rotationPolicy === 'auto' ? '自动轮换' : '手动'}
              </Tag>
            </div>
            <Space>
              <Statistic title="使用次数" value={key.usageCount} valueStyle={{ fontSize: 14 }} />
              <span className={styles.apiKeyLastUsed}>最后使用: {key.lastUsed}</span>
              <Button type="link" size="small" onClick={() => handleToggleApiKey(key.id)}>
                {key.status === 'active' ? '禁用' : '启用'}
              </Button>
              <Popconfirm title="确定删除此 API Key？" onConfirm={() => handleDeleteApiKey(key.id)}>
                <Button type="link" size="small" danger>删除</Button>
              </Popconfirm>
            </Space>
          </div>
        ))}
      </Card>

      <Card title="最近请求日志" className={styles.card}>
        <div className={styles.requestLogContainer}>
          {requestLogs.map(log => (
            <div className={styles.requestLogItem} key={log.id}>
              <span className={styles.requestLogTime}>{log.timestamp}</span>
              <Tag color={log.method === 'POST' ? 'blue' : 'cyan'} className={styles.methodTag}>{log.method}</Tag>
              <span className={styles.requestLogEndpoint}>{log.endpoint}</span>
              <Tag color="purple" className={styles.modelTag}>{log.model}</Tag>
              <Tag color={log.status === 'success' ? 'success' : 'error'}>
                {log.status === 'success' ? '成功' : '失败'}
              </Tag>
              <span className={`${styles.requestLogLatency} ${log.latency > 3000 ? styles.latencyCritical : log.latency > 1000 ? styles.latencyWarning : styles.latencyNormal}`}>
                {log.latency >= 1000 ? `${(log.latency / 1000).toFixed(1)}s` : `${log.latency}ms`}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
