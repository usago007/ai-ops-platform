import React from 'react'
import { Card, Row, Col, Tag, Badge, Button, Space, Statistic, Alert, Timeline, Tooltip } from 'antd'
import {
  DashboardOutlined,
  GatewayOutlined,
  ApiOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  SecurityScanOutlined,
  ThunderboltOutlined,
  FilterOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@/iconMap'
import styles from '../AgentOrchestrationPage.module.css'
import type { LLMGatewayConfig, WorkflowEngine, RAGService, PromptVersion, HealthStatus, BusinessMapping } from '../AgentOrchestrationPage.types'
import { workflowEngineIcons } from '../AgentOrchestrationPage.types'

interface ArchitectureTabProps {
  llmGatewayConfig: LLMGatewayConfig
  workflowEngines: WorkflowEngine[]
  ragService: RAGService
  promptVersions: PromptVersion[]
  componentHealth: HealthStatus[]
  businessMappings: BusinessMapping[]
  activeAlerts: Array<{ id: string; level: 'warning' | 'error'; message: string; time: string }>
  selectedWorkflowId: string | null
  refreshHealthStatus: () => void
  setActiveTab: (tab: string) => void
  setSelectedWorkflowId: (id: string | null) => void
  ragIndices: Array<{ id: string; name: string }>
}

export const ArchitectureTab: React.FC<ArchitectureTabProps> = ({
  llmGatewayConfig,
  workflowEngines,
  ragService,
  promptVersions,
  componentHealth,
  businessMappings,
  activeAlerts,
  selectedWorkflowId,
  refreshHealthStatus,
  setActiveTab,
  setSelectedWorkflowId,
  ragIndices,
}) => {
  return (
    <div className={styles.container}>
      <Card title="AI 编排层核心架构" className={styles.card}>
        <div className={styles.architectureDiagram}>
          <div className={styles.coreHub}>
            <div className={styles.hubHeader}>
              <DashboardOutlined className={styles.hubIcon} />
              <span>AI 编排层 ← 核心枢纽</span>
            </div>
          </div>

          <Row gutter={[24, 24]} className={styles.componentRow}>
            <Col span={6}>
              <Card
                className={`${styles.archComponentCard} ${styles.llmGatewayCard}`}
                hoverable
                onClick={() => setActiveTab('llm-gateway')}
              >
                <div className={styles.componentIcon}>
                  <GatewayOutlined className={styles.gatewayIcon} />
                </div>
                <h3 className={styles.componentTitle}>LLM 网关</h3>
                <div className={styles.componentFeatures}>
                  <Tag icon={<SecurityScanOutlined />} color="blue">鉴权</Tag>
                  <Tag icon={<ThunderboltOutlined />} color="cyan">限流</Tag>
                  <Tag icon={<FilterOutlined />} color="purple">路由</Tag>
                </div>
                <div className={styles.componentStats}>
                  <Statistic title="请求/分钟" value={llmGatewayConfig.rateLimit} valueStyle={{ color: 'var(--chart-1)' }} />
                  <Statistic title="超时(ms)" value={llmGatewayConfig.timeout} />
                </div>
                <Button type="primary" block icon={<SettingOutlined />} onClick={(e) => { e.stopPropagation(); setActiveTab('llm-gateway') }}>
                  配置管理
                </Button>
              </Card>
            </Col>

            <Col span={6}>
              <Card
                className={`${styles.archComponentCard} ${styles.workflowCard}`}
                hoverable
                onClick={() => setActiveTab('workflow-engine')}
              >
                <div className={styles.componentIcon}>
                  <ApiOutlined className={styles.workflowIcon} />
                </div>
                <h3 className={styles.componentTitle}>工作流引擎</h3>
                <div className={styles.componentFeatures}>
                  <Tag color="green">Dify</Tag>
                  <Tag color="lime">Coze</Tag>
                  <Tag color="orange">n8n</Tag>
                </div>
                <div className={styles.componentStats}>
                  <Statistic title="运行中流程" value={workflowEngines.filter(e => e.status === 'running').length} valueStyle={{ color: 'var(--success)' }} />
                  <Statistic title="总流程数" value={workflowEngines.length} />
                </div>
                <Button type="primary" block icon={<SettingOutlined />} onClick={(e) => { e.stopPropagation(); setActiveTab('workflow-engine') }}>
                  流程管理
                </Button>
              </Card>
            </Col>

            <Col span={6}>
              <Card
                className={`${styles.archComponentCard} ${styles.ragCard}`}
                hoverable
                onClick={() => setActiveTab('rag-service')}
              >
                <div className={styles.componentIcon}>
                  <DatabaseOutlined className={styles.ragIcon} />
                </div>
                <h3 className={styles.componentTitle}>RAG 服务</h3>
                <div className={styles.componentFeatures}>
                  <Tag icon={<SearchOutlined />} color="purple">召回</Tag>
                  <Tag icon={<FilterOutlined />} color="magenta">重排</Tag>
                  <Tag icon={<ThunderboltOutlined />} color="volcano">增强</Tag>
                </div>
                <div className={styles.componentStats}>
                  <Statistic title="文档数" value={ragService.documentCount} valueStyle={{ color: 'var(--chart-5)' }} />
                  <Statistic title="索引数" value={ragService.indexCount} />
                </div>
                <Button type="primary" block icon={<SettingOutlined />} onClick={(e) => { e.stopPropagation(); setActiveTab('rag-service') }}>
                  服务配置
                </Button>
              </Card>
            </Col>

            <Col span={6}>
              <Card
                className={`${styles.archComponentCard} ${styles.promptCard}`}
                hoverable
                onClick={() => setActiveTab('prompt-management')}
              >
                <div className={styles.componentIcon}>
                  <FileTextOutlined className={styles.promptIcon} />
                </div>
                <h3 className={styles.componentTitle}>Prompt 管理</h3>
                <div className={styles.componentFeatures}>
                  <Tag color="orange">版本</Tag>
                  <Tag color="gold">评测</Tag>
                  <Tag color="red">灰度</Tag>
                </div>
                <div className={styles.componentStats}>
                  <Statistic title="活跃版本" value={promptVersions.filter(p => p.status === 'active').length} valueStyle={{ color: 'var(--warning)' }} />
                  <Statistic title="总版本数" value={promptVersions.length} />
                </div>
                <Button type="primary" block icon={<SettingOutlined />} onClick={(e) => { e.stopPropagation(); setActiveTab('prompt-management') }}>
                  版本管理
                </Button>
              </Card>
            </Col>
          </Row>

          <div className={styles.dataFlow}>
            <Alert
              message="数据流向"
              description="用户请求 → LLM 网关(鉴权/限流) → 工作流引擎(流程编排) → RAG 服务(知识增强) → Prompt 管理(版本控制) → AI 模型响应"
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
            />
          </div>

          <div className={styles.dataFlowVisual}>
            <div className={styles.flowNode}>
              <div className={styles.flowNodeIcon}>🌐</div>
              <div className={styles.flowNodeLabel}>用户请求</div>
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={`${styles.flowNode} ${styles.flowNodeActive}`}>
              <div className={styles.flowNodeIcon}>🔒</div>
              <div className={styles.flowNodeLabel}>LLM 网关</div>
              <Badge status="success" text="健康" className={styles.flowBadge} />
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowNode}>
              <div className={styles.flowNodeIcon}>🔀</div>
              <div className={styles.flowNodeLabel}>工作流引擎</div>
              <Badge status="warning" text="降级" className={styles.flowBadge} />
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowNode}>
              <div className={styles.flowNodeIcon}>📚</div>
              <div className={styles.flowNodeLabel}>RAG 服务</div>
              <Badge status="success" text="健康" className={styles.flowBadge} />
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowNode}>
              <div className={styles.flowNodeIcon}>📝</div>
              <div className={styles.flowNodeLabel}>Prompt 管理</div>
              <Badge status="success" text="健康" className={styles.flowBadge} />
            </div>
            <div className={styles.flowArrow}>→</div>
            <div className={styles.flowNode}>
              <div className={styles.flowNodeIcon}>🤖</div>
              <div className={styles.flowNodeLabel}>AI 模型</div>
            </div>
          </div>
        </div>
      </Card>

      {activeAlerts.length > 0 && (
        <Card title="活跃告警" className={`${styles.card} ${styles.alertBanner}`}>
          <Timeline
            items={activeAlerts.map(alert => ({
              color: alert.level === 'error' ? 'red' : 'orange',
              children: (
                <Space direction="vertical" size="small" className={styles.fullWidth}>
                  <div>
                    <Tag color={alert.level === 'error' ? 'error' : 'warning'}>
                      {alert.level === 'error' ? '错误' : '警告'}
                    </Tag>
                    <span className={styles.alertMessage}>{alert.message}</span>
                  </div>
                  <span className={styles.alertTime}>{alert.time}</span>
                </Space>
              ),
            }))}
          />
        </Card>
      )}

      <Card
        title="组件健康状态"
        className={styles.card}
        extra={
          <Button icon={<ReloadOutlined />} size="small" onClick={refreshHealthStatus}>
            刷新
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          {componentHealth.map(comp => (
            <Col span={6} key={comp.component}>
              <div className={`${styles.healthStatusCard} ${styles[comp.status]}`}>
                <div className={styles.healthIcon}>
                  {comp.status === 'healthy' ? '✅' : comp.status === 'degraded' ? '⚠️' : '❌'}
                </div>
                <div className={styles.healthTitle}>{comp.component}</div>
                <div className={`${styles.metricValue} ${comp.status === 'healthy' ? styles.statValueSuccess : comp.status === 'degraded' ? styles.statValueWarning : styles.statValueError}`}>
                  {comp.metrics.successRate}%
                </div>
                <div className={styles.metricLabel}>成功率</div>
                <Row gutter={[8, 8]} className={styles.healthMetricsRow}>
                  <Col span={12}>
                    <Statistic title="QPS" value={comp.metrics.qps} valueStyle={{ fontSize: 16, color: 'var(--text-primary)' }} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="P95延迟" value={comp.metrics.p95Latency} suffix="s" valueStyle={{ fontSize: 16, color: 'var(--text-primary)' }} />
                  </Col>
                </Row>
                <div className={styles.healthStatusFooter}>
                  <Tag color={comp.status === 'healthy' ? 'success' : comp.status === 'degraded' ? 'warning' : 'error'}>
                    {comp.status === 'healthy' ? '健康' : comp.status === 'degraded' ? '降级' : '异常'}
                  </Tag>
                  <span className={styles.healthCheckTime}>
                    最后检查: {comp.lastCheck}
                  </span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Card
        title={
          <Space>
            <span>工作流引擎 ↔ 业务模块关联拓扑</span>
            {selectedWorkflowId && (
              <Tag color="blue" closable onClose={() => setSelectedWorkflowId(null)}>
                已筛选: {workflowEngines.find(w => w.id === selectedWorkflowId)?.name}
              </Tag>
            )}
          </Space>
        }
        className={styles.card}
      >
        <Space direction="vertical" size="large" className={styles.topologySpace}>
          {workflowEngines.map(engine => {
            const relatedModules = businessMappings.filter(m => m.workflowId === engine.id)
            const isSelected = selectedWorkflowId === engine.id
            const isDimmed = selectedWorkflowId && !isSelected
            return (
              <div
                key={engine.id}
                className={`${styles.topologyRow} ${isDimmed ? styles.topologyRowDimmed : ''} ${styles.topologyRowInner} ${isDimmed ? styles.topologyRowDimmedInner : ''}`}
              >
                <div
                  className={`${styles.workflowNodeCard} ${isSelected ? styles.workflowNodeSelected : ''} ${styles.workflowNodeClickable}`}
                  onClick={() => setSelectedWorkflowId(isSelected ? null : engine.id)}
                >
                  <div className={styles.workflowNodeContent}>
                    <span className={styles.workflowNodeIcon}>{workflowEngineIcons[engine.type]}</span>
                    <div className={styles.workflowNodeName}>{engine.name}</div>
                    <Tag
                      color={engine.type === 'dify' ? 'blue' : engine.type === 'coze' ? 'green' : engine.type === 'n8n' ? 'orange' : 'default'}
                      className={styles.workflowNodeTypeTag}
                    >
                      {engine.type.toUpperCase()}
                    </Tag>
                    <div className={styles.workflowNodeBadgeWrap}>
                      <Badge
                        status={engine.status === 'running' ? 'success' : engine.status === 'stopped' ? 'default' : 'error'}
                        text={engine.status === 'running' ? '运行中' : engine.status === 'stopped' ? '已停止' : '异常'}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.topologyArrow}>→</div>

                <div className={styles.relatedModulesContainer}>
                  {relatedModules.length > 0 ? (
                    relatedModules.map(mapping => (
                      <Tooltip key={mapping.moduleId} title={`路由: ${mapping.routePath}${mapping.promptId ? '\nPrompt: ' + (promptVersions.find(p => p.id === mapping.promptId)?.name || '-') : ''}${mapping.ragIndexId ? '\nRAG: ' + (ragIndices.find(i => i.id === mapping.ragIndexId)?.name || '-') : ''}`}>
                        <div className={styles.businessModuleNode}>
                          <div className={styles.moduleMappingPill}>
                            <Space>
                              <span>{mapping.icon}</span>
                              <span className={styles.moduleMappingId}>{mapping.moduleId}</span>
                              <span className={styles.moduleMappingName}>{mapping.moduleName}</span>
                            </Space>
                          </div>
                        </div>
                      </Tooltip>
                    ))
                  ) : (
                    <span className={styles.noModulesText}>暂无关联业务模块</span>
                  )}
                </div>
              </div>
            )
          })}
        </Space>
      </Card>

      <Card title="业务模块关联映射" className={styles.card}>
        <Row gutter={[16, 16]}>
          {businessMappings.map(mapping => (
            <Col span={6} key={mapping.moduleId}>
              <Card className={styles.businessMappingCard} hoverable>
                <div className={styles.mappingIconCenter}>
                  <span className={styles.mappingIconLarge}>{mapping.icon}</span>
                  <div className={styles.mappingNameLarge}>{mapping.moduleName}</div>
                </div>
                <Space direction="vertical" size="small" className={styles.fullWidth}>
                  {mapping.workflowId && (
                    <div className={styles.mappingDetailRow}>
                      <Tag color="green">工作流</Tag>
                      <span>{workflowEngines.find(w => w.id === mapping.workflowId)?.name}</span>
                    </div>
                  )}
                  {mapping.promptId && (
                    <div className={styles.mappingDetailRow}>
                      <Tag color="orange">Prompt</Tag>
                      <span>{promptVersions.find(p => p.id === mapping.promptId)?.name}</span>
                    </div>
                  )}
                  {mapping.ragIndexId && (
                    <div className={styles.mappingDetailRow}>
                      <Tag color="purple">RAG索引</Tag>
                      <span>{mapping.ragIndexId}</span>
                    </div>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  )
}
