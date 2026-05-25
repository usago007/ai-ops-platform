import React from 'react'
import { Card, Row, Col, Form, Table, Tag, Badge, Button, Space, Tooltip } from 'antd'
import {
  PlusOutlined,
  SettingOutlined,
  EyeOutlined,
  StopOutlined,
  PlayCircleOutlined,
} from '@/iconMap'
import styles from '../AgentOrchestrationPage.module.css'
import type { WorkflowEngine, BusinessMapping, WorkflowTemplate, WorkflowTrigger, WorkflowExecution } from '../AgentOrchestrationPage.types'
import { workflowEngineIcons, getStatusColor, getStatusText } from '../AgentOrchestrationPage.types'

interface WorkflowEngineTabProps {
  workflowEngines: WorkflowEngine[]
  businessMappings: BusinessMapping[]
  workflowTemplates: WorkflowTemplate[]
  workflowTriggers: WorkflowTrigger[]
  workflowExecutions: WorkflowExecution[]
  handleToggleWorkflowEngine: (engineId: string) => void
  handleConfigWorkflow: (record: WorkflowEngine) => void
  handleViewWorkflowLogs: (record: WorkflowEngine) => void
  handleCreateWorkflow: () => void
  handleApplyTemplate: (template: WorkflowTemplate) => void
}

export const WorkflowEngineTab: React.FC<WorkflowEngineTabProps> = ({
  workflowEngines,
  businessMappings,
  workflowTemplates,
  workflowTriggers,
  workflowExecutions,
  handleToggleWorkflowEngine,
  handleConfigWorkflow,
  handleViewWorkflowLogs,
  handleCreateWorkflow,
  handleApplyTemplate,
}) => {
  return (
    <div className={styles.container}>
      <Card
        title="工作流引擎管理"
        className={styles.card}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateWorkflow}>
            新增工作流
          </Button>
        }
      >
        <Table
          dataSource={workflowEngines}
          rowKey="id"
          scroll={{ x: 1800 }}
          columns={[
            {
              title: '引擎类型',
              dataIndex: 'type',
              key: 'type',
              render: (type: string) => (
                <Tag icon={<span>{workflowEngineIcons[type]}</span>} color={type === 'dify' ? 'blue' : type === 'coze' ? 'green' : type === 'n8n' ? 'orange' : 'default'}>
                  {type.toUpperCase()}
                </Tag>
              ),
            },
            { title: '工作流名称', dataIndex: 'name', key: 'name' },
            { title: '版本', dataIndex: 'version', key: 'version', width: 90 },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              width: 100,
              render: (status: string) => (
                <Badge status={getStatusColor(status) as any} text={getStatusText(status)} />
              ),
            },
            { title: '最大并发', dataIndex: 'maxConcurrency', key: 'maxConcurrency', width: 100, render: (v: number) => v || '-' },
            { title: '超时时间', dataIndex: 'maxExecutionTime', key: 'maxExecutionTime', width: 90, render: (v: number) => v ? `${v}s` : '-' },
            { title: '关联 Prompt', dataIndex: 'promptVersion', key: 'promptVersion', width: 100, render: (v: string) => v || '-' },
            { title: '端点', dataIndex: 'endpoint', key: 'endpoint', width: 250, ellipsis: true },
            {
              title: '外部工作流 ID',
              key: 'externalWorkflowId',
              width: 220,
              render: (_: any, record: WorkflowEngine) => {
                const externalId = record.type === 'dify' ? record.difyWorkflowId
                  : record.type === 'coze' ? record.cozeWorkflowId
                  : record.type === 'n8n' ? record.n8nWorkflowId
                  : record.customRequestBodyTemplate?.split(':')[0] || '-'
                return externalId ? <Tag color="purple">{externalId}</Tag> : <span className={styles.unconfiguredText}>未配置</span>
              },
            },
            {
              title: '流程数',
              key: 'flows',
              width: 150,
              render: (_: any, record: WorkflowEngine) => (
                <Space>
                  <Tag color="success">{record.activeFlows} 运行中</Tag>
                  <Tag>{record.totalFlows} 总计</Tag>
                </Space>
              ),
            },
            {
              title: '关联业务模块',
              key: 'businessModules',
              width: 200,
              render: (_: any, record: WorkflowEngine) => {
                const modules = businessMappings.filter(m => m.workflowId === record.id)
                return (
                  <Space wrap>
                    {modules.map(m => (
                      <Tooltip key={m.moduleId} title={`${m.moduleName} (${m.routePath})`}>
                        <Tag color="blue" className={styles.bizModuleTag}>{m.icon} {m.moduleId}</Tag>
                      </Tooltip>
                    ))}
                    {modules.length === 0 && <span className={styles.unconfiguredText}>无</span>}
                  </Space>
                )
              },
            },
            {
              title: '操作',
              key: 'action',
              width: 280,
              render: (_: any, record: WorkflowEngine) => (
                <Space size="small" wrap>
                  <Tooltip title={record.status === 'running' ? '停止' : '启动'}>
                    <Button
                      type={record.status === 'running' ? 'primary' : 'default'}
                      size="small"
                      icon={record.status === 'running' ? <StopOutlined /> : <PlayCircleOutlined />}
                      onClick={() => handleToggleWorkflowEngine(record.id)}
                    >
                      {record.status === 'running' ? '停止' : '启动'}
                    </Button>
                  </Tooltip>
                  <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => handleConfigWorkflow(record)}>
                    配置
                  </Button>
                  <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewWorkflowLogs(record)}>
                    日志
                  </Button>
                </Space>
              ),
            },
          ]}
          pagination={false}
        />
      </Card>

      <Card className={styles.card}>
        <div className={styles.executionStatsRow}>
          <div className={styles.executionStatCard}>
            <div className={`${styles.executionStatValue} ${styles.statValueSuccess}`}>75%</div>
            <div className={styles.executionStatLabel}>今日成功率</div>
          </div>
          <div className={styles.executionStatCard}>
            <div className={`${styles.executionStatValue} ${styles.statValueChart1}`}>156</div>
            <div className={styles.executionStatLabel}>今日执行次数</div>
          </div>
          <div className={styles.executionStatCard}>
            <div className={`${styles.executionStatValue} ${styles.statValueWarning}`}>42s</div>
            <div className={styles.executionStatLabel}>平均耗时</div>
          </div>
          <div className={styles.executionStatCard}>
            <div className={`${styles.executionStatValue} ${styles.statValueChart5}`}>8</div>
            <div className={styles.executionStatLabel}>运行中工作流</div>
          </div>
        </div>
      </Card>

      <Card title="工作流模板库" className={styles.card}>
        <Row gutter={[16, 16]}>
          {workflowTemplates.map(template => (
            <Col span={6} key={template.id}>
              <div className={styles.templateCard} onClick={() => handleApplyTemplate(template)}>
                <div className={styles.templateIcon}>{template.icon}</div>
                <div className={styles.templateName}>{template.name}</div>
                <div className={styles.templateDesc}>{template.description}</div>
                <Tag color="blue" className={styles.templateCategoryTag}>{template.category}</Tag>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="触发器配置" className={`${styles.card} ${styles.triggerConfigCard}`}>
        <Table
          dataSource={workflowTriggers}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            { title: '触发器名称', dataIndex: 'name', key: 'name' },
            { title: '类型', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={t === 'event' ? 'blue' : t === 'scheduled' ? 'green' : 'default'}>{t === 'event' ? '事件' : t === 'scheduled' ? '定时' : '手动'}</Tag> },
            { title: '事件/表达式', dataIndex: 'event', key: 'event', render: (v: string, r: WorkflowTrigger) => v || r.schedule || '-' },
            { title: '关联工作流', dataIndex: 'workflowId', key: 'workflowId', render: (v: string) => workflowEngines.find(w => w.id === v)?.name },
            { title: '状态', dataIndex: 'enabled', key: 'enabled', render: (v: boolean) => <Badge status={v ? 'success' : 'default'} text={v ? '已启用' : '已禁用'} /> },
          ]}
        />
      </Card>

      <Card title="工作流执行历史" className={`${styles.card} ${styles.executionHistoryCard}`}>
        <Table
          dataSource={workflowExecutions}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
          columns={[
            { title: '工作流', dataIndex: 'workflowName', key: 'workflowName', render: (text: string) => <Tag color="blue">{text}</Tag> },
            { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Badge status={s === 'success' ? 'success' : s === 'failed' ? 'error' : 'processing'} text={s === 'success' ? '成功' : s === 'failed' ? '失败' : '运行中'} /> },
            { title: '触发类型', dataIndex: 'triggerType', key: 'triggerType', render: (t: string) => <Tag>{t === 'event' ? '事件' : t === 'scheduled' ? '定时' : '手动'}</Tag> },
            { title: '开始时间', dataIndex: 'startTime', key: 'startTime', width: 180 },
            { title: '耗时', dataIndex: 'duration', key: 'duration', render: (v: number) => v ? `${v}s` : '-' },
            { title: '错误信息', dataIndex: 'errorMessage', key: 'errorMessage', ellipsis: true, render: (v: string) => v ? <Tooltip title={v}><Tag color="error">失败</Tag></Tooltip> : '-' },
          ]}
        />
      </Card>
    </div>
  )
}
