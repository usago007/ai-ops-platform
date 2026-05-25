import React, { useEffect, useState } from 'react'
import { Alert, Tabs, Form, message } from 'antd'
import { DashboardOutlined, GatewayOutlined, ApiOutlined, DatabaseOutlined, FileTextOutlined } from '@/iconMap'
import styles from './AgentOrchestrationPage.module.css'
import { systemService } from '../../services'

import type {
  AgentNode, TopologyData, Workflow, WorkflowEngine, RAGService, PromptVersion,
  HealthStatus, BusinessMapping, TrafficDistribution, ApiKeyItem, RequestLog,
  WorkflowExecution, WorkflowTrigger, WorkflowTemplate, RagIndex, RetrievalMetrics,
  DocumentHistory, ABTest, PromptBusinessMapping, CanaryConfig, UsageStat, PromptEvaluation,
  LLMGatewayConfig,
} from './AgentOrchestrationPage.types'

import { ArchitectureTab } from './tabs/ArchitectureTab'
import { LLMGatewayTab } from './tabs/LLMGatewayTab'
import { WorkflowEngineTab } from './tabs/WorkflowEngineTab'
import { RAGServiceTab } from './tabs/RAGServiceTab'
import { PromptManagementTab } from './tabs/PromptManagementTab'

import { AgentDetailModal } from './agent-modals/AgentDetailModal'
import { WorkflowVisualModal } from './agent-modals/WorkflowVisualModal'
import { PromptDetailModal } from './agent-modals/PromptDetailModal'
import { RouteRuleModal } from './agent-modals/RouteRuleModal'
import { WorkflowConfigModal } from './agent-modals/WorkflowConfigModal'
import { WorkflowLogsModal } from './agent-modals/WorkflowLogsModal'
import { WorkflowCreateModal } from './agent-modals/WorkflowCreateModal'
import { PromptCreateModal } from './agent-modals/PromptCreateModal'
import { PromptEditModal } from './agent-modals/PromptEditModal'
import { VersionCompareModal } from './agent-modals/VersionCompareModal'

const { TabPane } = Tabs

export const AgentOrchestrationPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [topology, setTopology] = useState<TopologyData | null>(null)
  const [agents, setAgents] = useState<AgentNode[]>([])
  const [selectedAgent, setSelectedAgent] = useState<AgentNode | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [workflows, setWorkflows] = useState<Record<string, Workflow>>({})
  const [selectedModule, setSelectedModule] = useState<string>('BIZ-001')
  const [workflowModalVisible, setWorkflowModalVisible] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const [routeRuleModalVisible, setRouteRuleModalVisible] = useState(false)
  const [routeRuleForm] = Form.useForm()
  const [editingRouteRule, setEditingRouteRule] = useState<{ pattern: string; model: string } | null>(null)
  const [editingRouteRuleIndex, setEditingRouteRuleIndex] = useState<number | null>(null)

  const [wfConfigModalVisible, setWfConfigModalVisible] = useState(false)
  const [selectedEngineForConfig, setSelectedEngineForConfig] = useState<WorkflowEngine | null>(null)

  const handleConfigWorkflow = (record: WorkflowEngine) => {
    setSelectedEngineForConfig(record)
    setWfConfigModalVisible(true)
  }

  const handleSaveWorkflowConfig = (values: Record<string, unknown>) => {
    setWorkflowEngines(prev =>
      prev.map(e =>
        e.id === selectedEngineForConfig?.id
          ? { ...e, ...values, ipWhitelist: typeof values.ipWhitelist === 'string' ? values.ipWhitelist.split('\n').filter(Boolean) : values.ipWhitelist }
          : e
      )
    )
    message.success('工作流配置已保存')
    setWfConfigModalVisible(false)
  }

  const [wfLogsModalVisible, setWfLogsModalVisible] = useState(false)
  const [selectedEngineForLogs, setSelectedEngineForLogs] = useState<WorkflowEngine | null>(null)

  const [wfCreateModalVisible, setWfCreateModalVisible] = useState(false)
  const [wfCreateForm] = Form.useForm()

  const [promptCreateModalVisible, setPromptCreateModalVisible] = useState(false)
  const [promptCreateForm] = Form.useForm()

  const [promptEditFormVisible, setPromptEditFormVisible] = useState(false)
  const [promptEditForm] = Form.useForm()
  const [editingPrompt, setEditingPrompt] = useState<PromptVersion | null>(null)

  const [llmGatewayConfig, setLLMGatewayConfig] = useState<LLMGatewayConfig>({
    apiKey: 'sk-****-****-****-1234',
    rateLimit: 1000,
    maxTokens: 8192,
    timeout: 30000,
    fallbackModel: 'gpt-3.5-turbo',
    retryCount: 3,
    authEnabled: true,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    modelRouting: [
      { pattern: 'classification', model: 'gpt-4-turbo' },
      { pattern: 'generation', model: 'claude-3-sonnet' },
      { pattern: 'embedding', model: 'text-embedding-3-large' },
    ],
  })

  const [workflowEngines, setWorkflowEngines] = useState<WorkflowEngine[]>([
    { id: 'wf-1', name: '询报价归类流程', type: 'dify', status: 'running', version: 'v2.1.0', endpoint: 'https://dify.example.com/v1', activeFlows: 12, totalFlows: 15, description: '处理询价线索的AI解析、归类和相似推荐全流程', apiKey: 'sk-dify-****-1234', connectTimeout: 10, requestTimeout: 60, maxConcurrency: 20, retryCount: 3, retryInterval: 2, logLevel: 'INFO', timeoutStrategy: 'retry', maxExecutionTime: 120, errorStrategy: 'retry', promptVersion: 'v3.2.1', ragIndex: 'idx-inquiry-001', ruleSet: 'RULE-100', dataSource: 'MySQL-Primary', ipWhitelist: ['192.168.1.0/24'], authEnabled: true, encryptionEnabled: true, auditEnabled: true, difyWorkflowId: 'wf-inquiry-classification', responseMode: 'blocking', userContextPrefix: 'prod_', fileUploadEnabled: false },
    { id: 'wf-2', name: '商品信息结构化', type: 'dify', status: 'running', version: 'v1.8.3', endpoint: 'https://dify.example.com/v1', activeFlows: 8, totalFlows: 10, description: '从非结构化文本中提取并标准化商品属性', apiKey: 'sk-dify-****-5678', connectTimeout: 10, requestTimeout: 45, maxConcurrency: 15, retryCount: 2, retryInterval: 3, logLevel: 'INFO', timeoutStrategy: 'terminate', maxExecutionTime: 90, errorStrategy: 'skip', promptVersion: 'v2.5.0', ragIndex: 'idx-product-002', ruleSet: 'RULE-200', dataSource: 'PostgreSQL-Product', ipWhitelist: [], authEnabled: true, encryptionEnabled: false, auditEnabled: true, difyWorkflowId: 'wf-product-structuring', responseMode: 'blocking', userContextPrefix: 'prod_', fileUploadEnabled: false },
    { id: 'wf-3', name: '营销内容生成', type: 'coze', status: 'running', version: 'v3.0.1', endpoint: 'https://api.coze.com/v1', activeFlows: 5, totalFlows: 8, description: '基于商品卖点自动生成多渠道营销文案', apiKey: 'coze-****-abcd', connectTimeout: 15, requestTimeout: 30, maxConcurrency: 10, retryCount: 2, retryInterval: 5, logLevel: 'WARN', timeoutStrategy: 'warn', maxExecutionTime: 60, errorStrategy: 'retry', promptVersion: 'v4.0.0', ragIndex: 'idx-marketing-003', ruleSet: null, dataSource: 'API-Marketing', ipWhitelist: [], authEnabled: true, encryptionEnabled: true, auditEnabled: false, cozeWorkflowId: 'wf_123456789', cozeAppId: 'app_987654321', cozeBotId: 'bot_001', cozeExecuteMode: 'RELEASE', cozeConnectorId: '1024', parametersFormat: 'json_string' },
    { id: 'wf-4', name: '客服智能辅助', type: 'n8n', status: 'stopped', version: 'v1.5.0', endpoint: 'https://n8n.example.com/api', activeFlows: 0, totalFlows: 6, description: '客服对话中的意图识别和话术推荐', apiKey: 'n8n-****-efgh', connectTimeout: 10, requestTimeout: 30, maxConcurrency: 25, retryCount: 3, retryInterval: 2, logLevel: 'DEBUG', timeoutStrategy: 'terminate', maxExecutionTime: 30, errorStrategy: 'terminate', promptVersion: 'v2.1.3', ragIndex: 'idx-cs-004', ruleSet: 'RULE-300', dataSource: 'Redis-CS', ipWhitelist: ['10.0.0.0/8'], authEnabled: true, encryptionEnabled: true, auditEnabled: true, n8nWorkflowId: 'abc123def456', n8nWebhookPath: '/webhook/customer-support', n8nAuthMethod: 'basic', n8nAuthUsername: 'api-user', n8nAuthPassword: '****' },
    { id: 'wf-5', name: '规则冲突检测', type: 'custom', status: 'error', version: 'v2.0.0', endpoint: 'https://api.internal.com/rules', activeFlows: 0, totalFlows: 4, description: '自动检测业务规则之间的逻辑冲突', apiKey: 'internal-****-ijkl', connectTimeout: 5, requestTimeout: 20, maxConcurrency: 5, retryCount: 1, retryInterval: 1, logLevel: 'ERROR', timeoutStrategy: 'terminate', maxExecutionTime: 15, errorStrategy: 'terminate', promptVersion: 'v1.8.0', ragIndex: null, ruleSet: 'RULE-ALL', dataSource: 'Local-File', ipWhitelist: ['127.0.0.1'], authEnabled: false, encryptionEnabled: false, auditEnabled: true, customRequestMethod: 'POST', customRequestFormat: 'json', customResponseFormat: 'json', customHeaders: { 'X-Tenant-ID': 'default' }, customRequestBodyTemplate: '{"rules": ["{{ruleSet}}"], "data": {{inputData}}}' },
  ])

  const [ragService, setRAGService] = useState<RAGService>({
    vectorDb: 'Milvus',
    embeddingModel: 'text-embedding-3-large',
    chunkSize: 512,
    overlap: 50,
    topK: 10,
    rerankModel: 'bge-reranker-v2',
    status: 'healthy',
    indexCount: 24,
    documentCount: 15680,
  })

  const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([
    { id: 'p-1', name: '询报价分类 Prompt', version: 'v3.2.1', content: '请分析以下询报价文本，提取品类、规格、数量等关键信息...', status: 'active', creator: '陈明远', updatedAt: '2026-04-18', usageCount: 1523, successRate: 94.5 },
    { id: 'p-2', name: '商品属性提取 Prompt', version: 'v2.5.0', content: '从商品描述中提取标准化属性字段，包括尺寸、重量、材质...', status: 'active', creator: '林晓峰', updatedAt: '2026-04-17', usageCount: 892, successRate: 91.2 },
    { id: 'p-3', name: '营销文案生成 Prompt', version: 'v4.0.0', content: '根据商品特点和目标人群，生成具有吸引力的营销文案...', status: 'draft', creator: '周思琪', updatedAt: '2026-04-19', usageCount: 0, successRate: 0 },
    { id: 'p-4', name: '客服话术推荐 Prompt', version: 'v2.1.3', content: '根据客户意图和历史对话，推荐合适的回复话术...', status: 'active', creator: '吴建国', updatedAt: '2026-04-16', usageCount: 2341, successRate: 88.7 },
    { id: 'p-5', name: '规则归纳 Prompt', version: 'v1.8.0', content: '从非结构化文档中提取 IF-THEN 规则性条款...', status: 'archived', creator: '系统', updatedAt: '2026-04-10', usageCount: 456, successRate: 85.3 },
  ])

  const [llmGatewayModalVisible, setLLMGatewayModalVisible] = useState(false)
  const [workflowEngineModalVisible, setWorkflowEngineModalVisible] = useState(false)
  const [ragConfigModalVisible, setRAGConfigModalVisible] = useState(false)
  const [promptEditModalVisible, setPromptEditModalVisible] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<PromptVersion | null>(null)
  const [selectedWorkflowEngine, setSelectedWorkflowEngine] = useState<WorkflowEngine | null>(null)
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null)

  const getBusinessModulesByWorkflow = (workflowId: string): BusinessMapping[] => {
    return businessMappings.filter(m => m.workflowId === workflowId)
  }

  const getWorkflowByBusinessModule = (moduleId: string): WorkflowEngine | undefined => {
    const mapping = businessMappings.find(m => m.moduleId === moduleId)
    return mapping?.workflowId ? workflowEngines.find(w => w.id === mapping.workflowId) : undefined
  }

  const [componentHealth, setComponentHealth] = useState<HealthStatus[]>([
    { component: 'LLM 网关', status: 'healthy', lastCheck: '2026-04-21 10:32:15', metrics: { qps: 1250, successRate: 97.3, p95Latency: 1.2, errorRate: 0.3 } },
    { component: '工作流引擎', status: 'degraded', lastCheck: '2026-04-21 10:32:12', metrics: { qps: 850, successRate: 96.5, p95Latency: 2.8, errorRate: 3.5 } },
    { component: 'RAG 服务', status: 'healthy', lastCheck: '2026-04-21 10:32:18', metrics: { qps: 2100, successRate: 94.8, p95Latency: 0.45, errorRate: 0.1 } },
    { component: 'Prompt 管理', status: 'healthy', lastCheck: '2026-04-21 10:32:10', metrics: { qps: 3200, successRate: 96.1, p95Latency: 0.12, errorRate: 0.2 } },
  ])

  const [businessMappings] = useState<BusinessMapping[]>([
    { moduleId: 'BIZ-001', moduleName: '询盘管理', icon: '📋', workflowId: 'wf-1', promptId: 'p-1', ragIndexId: 'idx-001', routePath: '/inquiry' },
    { moduleId: 'BIZ-002', moduleName: '报价管理', icon: '💰', workflowId: 'wf-1', promptId: 'p-1', ragIndexId: 'idx-001', routePath: '/quotation' },
    { moduleId: 'BIZ-003', moduleName: '智能分类', icon: '🏷️', workflowId: 'wf-1', promptId: 'p-1', routePath: '/product/category' },
    { moduleId: 'BIZ-004', moduleName: '归因分析', icon: '📊', workflowId: 'wf-4', promptId: 'p-4', ragIndexId: 'idx-004', routePath: '/conversion/dashboard' },
    { moduleId: 'MKT-001', moduleName: '营销内容', icon: '📝', workflowId: 'wf-3', promptId: 'p-3', ragIndexId: 'idx-003', routePath: '/mkt/overview' },
    { moduleId: 'MKT-002', moduleName: '卖点管理', icon: '✨', workflowId: 'wf-3', promptId: 'p-3', routePath: '/selling-point' },
    { moduleId: 'MKT-003', moduleName: '落地页预览', icon: '🌐', workflowId: 'wf-3', routePath: '/conversion/landing' },
    { moduleId: 'CS-001', moduleName: '客户服务', icon: '👥', workflowId: 'wf-4', promptId: 'p-4', ragIndexId: 'idx-004', routePath: '/cs/workspace' },
    { moduleId: 'PROD-001', moduleName: '商品结构化', icon: '📦', workflowId: 'wf-2', promptId: 'p-2', ragIndexId: 'idx-002', routePath: '/product/list' },
    { moduleId: 'RULE-001', moduleName: '规则管理', icon: '⚖️', workflowId: 'wf-5', promptId: 'p-5', routePath: '/rules' },
  ])

  const [activeAlerts] = useState<Array<{ id: string; level: 'warning' | 'error'; message: string; time: string }>>([
    { id: 'alert-1', level: 'warning', message: '工作流引擎 "询报价归类流程" P95延迟超过阈值 (2.8s > 2.0s)', time: '2026-04-21 10:28:33' },
    { id: 'alert-2', level: 'error', message: '工作流引擎 "规则冲突检测" 状态异常，错误率 100%', time: '2026-04-21 09:45:12' },
  ])

  const [trafficDistribution] = useState<TrafficDistribution[]>([
    { model: 'GPT-4 Turbo', calls: 45200, percentage: 45, cost: 351.20, avgLatency: 2.1 },
    { model: 'Claude 3 Sonnet', calls: 28500, percentage: 28, cost: 198.50, avgLatency: 1.8 },
    { model: 'GPT-3.5 Turbo', calls: 15300, percentage: 15, cost: 45.80, avgLatency: 0.9 },
    { model: 'Qwen Turbo', calls: 8200, percentage: 8, cost: 12.40, avgLatency: 1.2 },
    { model: '其他', calls: 4050, percentage: 4, cost: 8.60, avgLatency: 1.5 },
  ])

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    { id: 'key-1', key: 'sk-****-****-****-1234', status: 'active', usageCount: 45230, lastUsed: '2026-04-21 10:32:15', rotationPolicy: 'auto' },
    { id: 'key-2', key: 'sk-****-****-****-5678', status: 'active', usageCount: 28500, lastUsed: '2026-04-21 10:30:42', rotationPolicy: 'auto' },
    { id: 'key-3', key: 'sk-****-****-****-9abc', status: 'disabled', usageCount: 12450, lastUsed: '2026-04-15 14:22:08', rotationPolicy: 'manual' },
  ])

  const [requestLogs] = useState<RequestLog[]>([
    { id: 'log-1', timestamp: '2026-04-21 10:32:15', method: 'POST', endpoint: '/v1/chat/completions', model: 'GPT-4 Turbo', status: 'success', latency: 245, tokens: 1250 },
    { id: 'log-2', timestamp: '2026-04-21 10:32:12', method: 'POST', endpoint: '/v1/chat/completions', model: 'Claude 3 Sonnet', status: 'success', latency: 1800, tokens: 3200 },
    { id: 'log-3', timestamp: '2026-04-21 10:32:08', method: 'POST', endpoint: '/v1/embeddings', model: 'text-embedding-3-large', status: 'success', latency: 120, tokens: 512 },
    { id: 'log-4', timestamp: '2026-04-21 10:31:55', method: 'POST', endpoint: '/v1/chat/completions', model: 'GPT-3.5 Turbo', status: 'error', latency: 5100, tokens: 0 },
    { id: 'log-5', timestamp: '2026-04-21 10:31:42', method: 'POST', endpoint: '/v1/chat/completions', model: 'GPT-4 Turbo', status: 'success', latency: 890, tokens: 2100 },
    { id: 'log-6', timestamp: '2026-04-21 10:31:33', method: 'POST', endpoint: '/v1/chat/completions', model: 'Qwen Turbo', status: 'success', latency: 650, tokens: 1800 },
    { id: 'log-7', timestamp: '2026-04-21 10:31:18', method: 'POST', endpoint: '/v1/chat/completions', model: 'Claude 3 Sonnet', status: 'success', latency: 1200, tokens: 2800 },
    { id: 'log-8', timestamp: '2026-04-21 10:31:05', method: 'POST', endpoint: '/v1/chat/completions', model: 'GPT-4 Turbo', status: 'error', latency: 3200, tokens: 0 },
  ])

  const [workflowExecutions] = useState<WorkflowExecution[]>([
    { id: 'exec-1', workflowId: 'wf-1', workflowName: '询报价归类流程', status: 'success', startTime: '2026-04-21 10:30:00', endTime: '2026-04-21 10:30:45', duration: 45, triggerType: 'event' },
    { id: 'exec-2', workflowId: 'wf-2', workflowName: '商品信息结构化', status: 'success', startTime: '2026-04-21 10:28:00', endTime: '2026-04-21 10:28:32', duration: 32, triggerType: 'manual' },
    { id: 'exec-3', workflowId: 'wf-3', workflowName: '营销内容生成', status: 'failed', startTime: '2026-04-21 10:25:00', endTime: '2026-04-21 10:25:58', duration: 58, triggerType: 'scheduled', errorMessage: 'AI响应超时 (60s > 30s)' },
    { id: 'exec-4', workflowId: 'wf-1', workflowName: '询报价归类流程', status: 'success', startTime: '2026-04-21 10:22:00', endTime: '2026-04-21 10:22:38', duration: 38, triggerType: 'event' },
    { id: 'exec-5', workflowId: 'wf-4', workflowName: '客服智能辅助', status: 'success', startTime: '2026-04-21 10:18:00', endTime: '2026-04-21 10:18:25', duration: 25, triggerType: 'event' },
    { id: 'exec-6', workflowId: 'wf-5', workflowName: '规则冲突检测', status: 'failed', startTime: '2026-04-21 10:15:00', endTime: '2026-04-21 10:15:05', duration: 5, triggerType: 'scheduled', errorMessage: '引擎状态异常' },
    { id: 'exec-7', workflowId: 'wf-2', workflowName: '商品信息结构化', status: 'success', startTime: '2026-04-21 10:12:00', endTime: '2026-04-21 10:12:42', duration: 42, triggerType: 'manual' },
    { id: 'exec-8', workflowId: 'wf-3', workflowName: '营销内容生成', status: 'success', startTime: '2026-04-21 10:08:00', endTime: '2026-04-21 10:08:55', duration: 55, triggerType: 'event' },
  ])

  const [workflowTriggers] = useState<WorkflowTrigger[]>([
    { id: 'trigger-1', workflowId: 'wf-1', type: 'event', name: '新询盘到达', event: 'inquiry.created', enabled: true },
    { id: 'trigger-2', workflowId: 'wf-3', type: 'scheduled', name: '每日营销内容生成', schedule: '0 9 * * *', enabled: true },
    { id: 'trigger-3', workflowId: 'wf-5', type: 'scheduled', name: '每周规则冲突检测', schedule: '0 2 * * 1', enabled: false },
    { id: 'trigger-4', workflowId: 'wf-4', type: 'event', name: '客服会话开始', event: 'cs.session.started', enabled: true },
    { id: 'trigger-5', workflowId: 'wf-2', type: 'event', name: '商品数据导入', event: 'product.imported', enabled: true },
    { id: 'trigger-6', workflowId: 'wf-2', type: 'manual', name: '批量结构化任务', enabled: true },
  ])

  const [workflowTemplates] = useState<WorkflowTemplate[]>([
    { id: 'tpl-1', name: '询盘解析模板', icon: '📋', description: '自动解析、归类询报价文本，提取品类、规格、数量等关键信息', category: '询盘处理', presetConfig: { name: '询盘解析流程', type: 'dify', timeoutStrategy: 'retry', maxExecutionTime: 120 } },
    { id: 'tpl-2', name: '报价生成模板', icon: '💰', description: '基于询盘信息自动生成标准化报价单，包含价格、交期、付款条款', category: '报价管理', presetConfig: { name: '报价生成流程', type: 'dify', timeoutStrategy: 'warn', maxExecutionTime: 90 } },
    { id: 'tpl-3', name: '营销文案模板', icon: '📝', description: '根据商品特点和目标人群自动生成多渠道营销文案', category: '营销内容', presetConfig: { name: '营销内容生成', type: 'coze', timeoutStrategy: 'retry', maxExecutionTime: 60 } },
    { id: 'tpl-4', name: '客服辅助模板', icon: '👥', description: '客服对话中的意图识别和话术推荐工作流', category: '客户服务', presetConfig: { name: '客服智能辅助', type: 'n8n', timeoutStrategy: 'terminate', maxExecutionTime: 30 } },
  ])

  const [ragIndices] = useState<RagIndex[]>([
    { id: 'idx-001', name: '询报价知识库', status: 'active', documentCount: 5680, vectorCount: 28400, lastUpdated: '2026-04-21 09:15:32', businessModule: '询盘管理', embeddingModel: 'text-embedding-3-large' },
    { id: 'idx-002', name: '商品信息库', status: 'active', documentCount: 3200, vectorCount: 16000, lastUpdated: '2026-04-21 08:42:18', businessModule: '商品结构化', embeddingModel: 'text-embedding-3-large' },
    { id: 'idx-003', name: '营销素材库', status: 'active', documentCount: 4500, vectorCount: 22500, lastUpdated: '2026-04-20 18:30:45', businessModule: '营销内容', embeddingModel: 'text-embedding-3-large' },
    { id: 'idx-004', name: '客服话术库', status: 'building', documentCount: 2300, vectorCount: 11500, lastUpdated: '2026-04-21 10:28:12', businessModule: '客户服务', embeddingModel: 'bge-large-zh' },
  ])

  const [retrievalMetrics] = useState<RetrievalMetrics>({
    accuracy: 92.5,
    recall: 88.3,
    avgLatency: 145,
    trend: Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - 13 + i)
      return { day: `${d.getMonth() + 1}/${d.getDate()}`, accuracy: 90 + Math.random() * 5, recall: 85 + Math.random() * 5 }
    }),
  })

  const [documentHistory] = useState<DocumentHistory[]>([
    { id: 'doc-1', name: '产品规格手册2026.pdf', type: 'PDF', status: 'completed', chunks: 245, uploadedAt: '2026-04-21 09:15:32', processedAt: '2026-04-21 09:18:45' },
    { id: 'doc-2', name: '客户询报价样本.docx', type: 'DOCX', status: 'completed', chunks: 128, uploadedAt: '2026-04-21 08:42:18', processedAt: '2026-04-21 08:44:52' },
    { id: 'doc-3', name: '营销文案模板库.xlsx', type: 'XLSX', status: 'processing', chunks: 0, uploadedAt: '2026-04-21 10:28:12' },
    { id: 'doc-4', name: '客服FAQ集合.json', type: 'JSON', status: 'completed', chunks: 89, uploadedAt: '2026-04-20 16:30:00', processedAt: '2026-04-20 16:31:15' },
    { id: 'doc-5', name: '竞品分析报告.pdf', type: 'PDF', status: 'failed', chunks: 0, uploadedAt: '2026-04-20 14:22:08' },
  ])

  const [abTests] = useState<ABTest[]>([
    {
      id: 'ab-1', name: '询报价分类 Prompt A/B测试', status: 'running',
      variants: [
        { promptId: 'p-1', promptName: '询报价分类 Prompt v3.2.1', trafficPercent: 60, metrics: { conversionRate: 94.5, successRate: 94.5, avgResponseTime: 2.1 } },
        { promptId: 'p-6', promptName: '询报价分类 Prompt v3.3.0', trafficPercent: 40, metrics: { conversionRate: 96.2, successRate: 96.2, avgResponseTime: 1.8 } },
      ],
      startDate: '2026-04-18',
    },
    {
      id: 'ab-2', name: '客服话术推荐 A/B测试', status: 'completed',
      variants: [
        { promptId: 'p-4', promptName: '客服话术推荐 Prompt v2.1.3', trafficPercent: 50, metrics: { conversionRate: 88.7, successRate: 88.7, avgResponseTime: 0.9 } },
        { promptId: 'p-7', promptName: '客服话术推荐 Prompt v2.2.0', trafficPercent: 50, metrics: { conversionRate: 91.3, successRate: 91.3, avgResponseTime: 0.7 } },
      ],
      startDate: '2026-04-10', endDate: '2026-04-17',
    },
  ])

  const [promptBusinessMappings] = useState<PromptBusinessMapping[]>([
    { promptId: 'p-1', promptName: '询报价分类 Prompt', workflows: ['wf-1'], modules: ['询盘管理', '报价管理', '智能分类'], usageCount: 1523 },
    { promptId: 'p-2', promptName: '商品属性提取 Prompt', workflows: ['wf-2'], modules: ['智能分类'], usageCount: 892 },
    { promptId: 'p-3', promptName: '营销文案生成 Prompt', workflows: ['wf-3'], modules: ['营销内容', '卖点管理'], usageCount: 0 },
    { promptId: 'p-4', promptName: '客服话术推荐 Prompt', workflows: ['wf-4'], modules: ['客户服务', '归因分析'], usageCount: 2341 },
    { promptId: 'p-5', promptName: '规则归纳 Prompt', workflows: ['wf-5'], modules: ['规则管理'], usageCount: 456 },
  ])

  const [canaryConfigs, setCanaryConfigs] = useState<CanaryConfig[]>([
    { promptId: 'p-1', promptName: '询报价分类 Prompt', currentVersion: 'v3.2.1', canaryVersion: 'v3.3.0', canaryPercent: 40, autoRollbackThreshold: 90, status: 'canary' },
  ])

  const [promptUsageStats] = useState<UsageStat[]>(
    Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - 13 + i)
      return { time: `${d.getMonth() + 1}/${d.getDate()}`, calls: 150 + Math.floor(Math.random() * 200), successRate: 90 + Math.random() * 8 }
    })
  )

  const [promptEvaluations] = useState<PromptEvaluation[]>([
    { id: 'eval-1', promptId: 'p-1', promptName: '询报价分类 Prompt', evaluator: '陈明远', score: 92, comment: '分类准确率高，但个别冷门品类识别有待提升', evaluatedAt: '2026-04-20 15:30:00', type: 'manual' },
    { id: 'eval-2', promptId: 'p-2', promptName: '商品属性提取 Prompt', evaluator: '系统', score: 88, comment: '字段提取完整率88%，材质字段偶有遗漏', evaluatedAt: '2026-04-20 12:00:00', type: 'auto' },
    { id: 'eval-3', promptId: 'p-4', promptName: '客服话术推荐 Prompt', evaluator: '林晓峰', score: 85, comment: '推荐话术合理，但缺少多轮对话上下文理解', evaluatedAt: '2026-04-19 10:15:00', type: 'manual' },
    { id: 'eval-4', promptId: 'p-3', promptName: '营销文案生成 Prompt', evaluator: '系统', score: 0, comment: '尚未开始评测', evaluatedAt: '-', type: 'auto' },
  ])

  const [abTestModalVisible, setAbTestModalVisible] = useState(false)
  const [versionCompareModalVisible, setVersionCompareModalVisible] = useState(false)
  const [canaryModalVisible, setCanaryModalVisible] = useState(false)
  const [compareVersions, setCompareVersions] = useState<{ left: PromptVersion | null; right: PromptVersion | null }>({ left: null, right: null })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [topoRes, wfRes] = await Promise.all([
        systemService.getTopology(),
        systemService.getWorkflows(),
      ])
      setTopology(topoRes.data)
      setAgents(topoRes.data.nodes)
      setWorkflows(wfRes.data)
    } catch (error) {
      console.error('Failed to load data', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (agentId: string) => {
    systemService.toggleAgent(agentId)
      .then(() => {
        setAgents(prev =>
          prev.map(a =>
            a.id === agentId
              ? { ...a, status: a.status === 'online' ? 'offline' : 'online' }
              : a
          )
        )
      })
  }

  const handleWeightChange = async (agentId: string, weight: number) => {
    try {
      await systemService.updateAgentWeight(agentId, weight)
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, weight } : a))
    } catch (error) {
      console.error('Failed to update weight', error)
    }
  }

  const handleViewWorkflow = (moduleId: string) => {
    const workflow = workflows[moduleId]
    if (workflow) {
      setSelectedWorkflow(workflow)
      setWorkflowModalVisible(true)
    }
  }

  const handleViewWorkflowLogs = (record: WorkflowEngine) => {
    setSelectedEngineForLogs(record)
    setWfLogsModalVisible(true)
  }

  const handleToggleWorkflowEngine = (engineId: string) => {
    setWorkflowEngines(prev =>
      prev.map(e =>
        e.id === engineId
          ? { ...e, status: e.status === 'running' ? 'stopped' : 'running' as 'running' | 'stopped' | 'error' }
          : e
      )
    )
  }

  const handleDeletePrompt = (promptId: string) => {
    setPromptVersions(prev => prev.filter(p => p.id !== promptId))
  }

  const handlePromptStatusChange = (promptId: string, status: 'active' | 'draft' | 'archived') => {
    setPromptVersions(prev =>
      prev.map(p => p.id === promptId ? { ...p, status } : p)
    )
  }

  const handleAddRouteRule = () => {
    setEditingRouteRule(null)
    setEditingRouteRuleIndex(null)
    routeRuleForm.resetFields()
    setRouteRuleModalVisible(true)
  }

  const handleEditRouteRule = (rule: { pattern: string; model: string }, index: number) => {
    setEditingRouteRule(rule)
    setEditingRouteRuleIndex(index)
    routeRuleForm.setFieldsValue(rule)
    setRouteRuleModalVisible(true)
  }

  const handleSaveRouteRule = () => {
    routeRuleForm.validateFields().then(values => {
      setLLMGatewayConfig(prev => {
        const newRules = [...prev.modelRouting]
        if (editingRouteRuleIndex !== null) {
          newRules[editingRouteRuleIndex] = values
        } else {
          newRules.push(values)
        }
        return { ...prev, modelRouting: newRules }
      })
      message.success(editingRouteRuleIndex !== null ? '路由规则已更新' : '路由规则已添加')
      setRouteRuleModalVisible(false)
      routeRuleForm.resetFields()
    })
  }

  const handleDeleteRouteRule = (index: number) => {
    setLLMGatewayConfig(prev => ({
      ...prev,
      modelRouting: prev.modelRouting.filter((_, i) => i !== index),
    }))
    message.success('路由规则已删除')
  }

  const handleCreateWorkflow = () => {
    setWfCreateModalVisible(true)
  }

  const handleSaveNewWorkflow = (values: Record<string, unknown>) => {
    const typeMap: Record<string, string> = { dify: 'dify', coze: 'coze', n8n: 'n8n', custom: 'custom' }
    const newEngine: WorkflowEngine = {
      id: `wf-${Date.now()}`,
      name: values.name,
      type: (typeMap[values.type] || 'custom') as WorkflowEngine['type'],
      status: 'stopped',
      version: values.version || 'v1.0.0',
      endpoint: values.endpoint || '',
      activeFlows: 0,
      totalFlows: 0,
      description: values.description,
      apiKey: values.apiKey,
      connectTimeout: values.connectTimeout || 10,
      requestTimeout: values.requestTimeout || 60,
      maxConcurrency: values.maxConcurrency || 10,
      retryCount: values.retryCount || 3,
      retryInterval: values.retryInterval || 2,
      logLevel: values.logLevel || 'INFO',
      timeoutStrategy: values.timeoutStrategy || 'retry',
      maxExecutionTime: values.maxExecutionTime || 120,
      errorStrategy: values.errorStrategy || 'retry',
      promptVersion: values.promptVersion,
      ragIndex: values.ragIndex,
      ruleSet: values.ruleSet,
      dataSource: values.dataSource,
      ipWhitelist: values.ipWhitelist ? values.ipWhitelist.split('\n').filter(Boolean) : [],
      authEnabled: values.authEnabled !== false,
      encryptionEnabled: values.encryptionEnabled || false,
      auditEnabled: values.auditEnabled || false,
    }
    setWorkflowEngines(prev => [...prev, newEngine])
    message.success(`工作流 "${values.name}" 已创建`)
    setWfCreateModalVisible(false)
  }

  const handleCreatePrompt = () => {
    promptCreateForm.resetFields()
    setPromptCreateModalVisible(true)
  }

  const handleSaveNewPrompt = () => {
    promptCreateForm.validateFields().then(values => {
      const newPrompt: PromptVersion = {
        id: `p-${Date.now()}`,
        name: values.name,
        version: 'v1.0.0',
        content: values.content,
        status: 'draft',
        creator: '当前用户',
        updatedAt: new Date().toISOString().split('T')[0],
        usageCount: 0,
        successRate: 0,
      }
      setPromptVersions(prev => [...prev, newPrompt])
      message.success(`Prompt "${values.name}" 已创建（草稿）`)
      setPromptCreateModalVisible(false)
      promptCreateForm.resetFields()
    })
  }

  const handleEditPrompt = (record: PromptVersion) => {
    setEditingPrompt(record)
    promptEditForm.setFieldsValue({
      name: record.name,
      version: record.version,
      content: record.content,
    })
    setPromptEditFormVisible(true)
  }

  const handleSavePromptEdit = () => {
    promptEditForm.validateFields().then(values => {
      if (editingPrompt) {
        setPromptVersions(prev =>
          prev.map(p =>
            p.id === editingPrompt.id
              ? { ...p, name: values.name, version: values.version, content: values.content, updatedAt: new Date().toISOString().split('T')[0] }
              : p
          )
        )
        message.success(`Prompt "${values.name}" 已更新`)
        setPromptEditFormVisible(false)
        promptEditForm.resetFields()
        setEditingPrompt(null)
      }
    })
  }

  const refreshHealthStatus = () => {
    setComponentHealth(prev =>
      prev.map(h => ({
        ...h,
        lastCheck: new Date().toLocaleString(),
        metrics: {
          qps: Math.floor(h.metrics.qps * (0.9 + Math.random() * 0.2)),
          successRate: Math.min(99.5, Math.max(92, h.metrics.successRate + (Math.random() - 0.5) * 0.5)),
          p95Latency: Math.max(0.1, h.metrics.p95Latency * (0.9 + Math.random() * 0.2)),
          errorRate: Math.max(0, h.metrics.errorRate + (Math.random() - 0.5) * 0.2),
        },
      }))
    )
  }

  const handleToggleApiKey = (keyId: string) => {
    setApiKeys(prev =>
      prev.map(k =>
        k.id === keyId
          ? { ...k, status: k.status === 'active' ? 'disabled' : 'active' as 'active' | 'disabled' | 'expired' }
          : k
      )
    )
    message.success('API Key 状态已更新')
  }

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== keyId))
    message.success('API Key 已删除')
  }

  const handleApplyTemplate = (template: WorkflowTemplate) => {
    wfCreateForm.setFieldsValue(template.presetConfig)
    setWfCreateModalVisible(true)
    message.success(`已应用模板: ${template.name}`)
  }

  const handleCompareVersions = (left: PromptVersion, right: PromptVersion) => {
    setCompareVersions({ left, right })
    setVersionCompareModalVisible(true)
  }

  const handleUpdateCanary = (values: Record<string, unknown>) => {
    setCanaryConfigs(prev =>
      prev.map(c =>
        c.promptId === values.promptId
          ? { ...c, canaryPercent: values.canaryPercent, autoRollbackThreshold: values.autoRollbackThreshold }
          : c
      )
    )
    message.success('灰度配置已更新')
    setCanaryModalVisible(false)
  }

  const handleRollbackCanary = (promptId: string) => {
    setCanaryConfigs(prev =>
      prev.filter(c => c.promptId !== promptId)
    )
    message.success('已回滚到当前版本')
  }

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <Alert
        message="AI 编排配置中心"
        description="可视化管理 AI 编排层的核心组件：LLM 网关、工作流引擎、RAG 服务和 Prompt 管理"
        type="info"
        showIcon
        className={styles.alert}
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab} className={styles.mainTabs}>
        <TabPane tab={<span><DashboardOutlined />架构概览</span>} key="overview">
          <ArchitectureTab
            llmGatewayConfig={llmGatewayConfig}
            workflowEngines={workflowEngines}
            ragService={ragService}
            promptVersions={promptVersions}
            componentHealth={componentHealth}
            businessMappings={businessMappings}
            activeAlerts={activeAlerts}
            selectedWorkflowId={selectedWorkflowId}
            refreshHealthStatus={refreshHealthStatus}
            setActiveTab={setActiveTab}
            setSelectedWorkflowId={setSelectedWorkflowId}
            ragIndices={ragIndices}
          />
        </TabPane>
        <TabPane tab={<span><GatewayOutlined />LLM 网关</span>} key="llm-gateway">
          <LLMGatewayTab
            llmGatewayConfig={llmGatewayConfig}
            trafficDistribution={trafficDistribution}
            apiKeys={apiKeys}
            requestLogs={requestLogs}
            handleAddRouteRule={handleAddRouteRule}
            handleEditRouteRule={handleEditRouteRule}
            handleDeleteRouteRule={handleDeleteRouteRule}
            handleToggleApiKey={handleToggleApiKey}
            handleDeleteApiKey={handleDeleteApiKey}
          />
        </TabPane>
        <TabPane tab={<span><ApiOutlined />工作流引擎</span>} key="workflow-engine">
          <WorkflowEngineTab
            workflowEngines={workflowEngines}
            businessMappings={businessMappings}
            workflowTemplates={workflowTemplates}
            workflowTriggers={workflowTriggers}
            workflowExecutions={workflowExecutions}
            handleToggleWorkflowEngine={handleToggleWorkflowEngine}
            handleConfigWorkflow={handleConfigWorkflow}
            handleViewWorkflowLogs={handleViewWorkflowLogs}
            handleCreateWorkflow={handleCreateWorkflow}
            handleApplyTemplate={handleApplyTemplate}
          />
        </TabPane>
        <TabPane tab={<span><DatabaseOutlined />RAG 服务</span>} key="rag-service">
          <RAGServiceTab
            ragService={ragService}
            ragIndices={ragIndices}
            retrievalMetrics={retrievalMetrics}
            documentHistory={documentHistory}
          />
        </TabPane>
        <TabPane tab={<span><FileTextOutlined />Prompt 管理</span>} key="prompt-management">
          <PromptManagementTab
            promptVersions={promptVersions}
            abTests={abTests}
            promptBusinessMappings={promptBusinessMappings}
            promptUsageStats={promptUsageStats}
            canaryConfigs={canaryConfigs}
            promptEvaluations={promptEvaluations}
            workflowEngines={workflowEngines}
            handleCreatePrompt={handleCreatePrompt}
            handleEditPrompt={handleEditPrompt}
            handleDeletePrompt={handleDeletePrompt}
            handlePromptStatusChange={handlePromptStatusChange}
            setSelectedPrompt={setSelectedPrompt}
            setPromptEditModalVisible={setPromptEditModalVisible}
            setVersionCompareModalVisible={setVersionCompareModalVisible}
            setCompareVersions={setCompareVersions}
            setCanaryConfigs={setCanaryConfigs}
            handleRollbackCanary={handleRollbackCanary}
          />
        </TabPane>
      </Tabs>

      <AgentDetailModal
        open={detailModalVisible}
        selectedAgent={selectedAgent}
        onClose={() => setDetailModalVisible(false)}
      />

      <WorkflowVisualModal
        open={workflowModalVisible}
        selectedWorkflow={selectedWorkflow}
        onClose={() => setWorkflowModalVisible(false)}
      />

      <PromptDetailModal
        open={promptEditModalVisible}
        selectedPrompt={selectedPrompt}
        onClose={() => setPromptEditModalVisible(false)}
        onEdit={handleEditPrompt}
      />

      <RouteRuleModal
        open={routeRuleModalVisible}
        editingRouteRuleIndex={editingRouteRuleIndex}
        form={routeRuleForm}
        onOk={handleSaveRouteRule}
        onCancel={() => setRouteRuleModalVisible(false)}
      />

      <WorkflowConfigModal
        open={wfConfigModalVisible}
        selectedEngineForConfig={selectedEngineForConfig}
        businessMappings={businessMappings}
        promptVersions={promptVersions}
        onSave={handleSaveWorkflowConfig}
        onCancel={() => setWfConfigModalVisible(false)}
      />

      <WorkflowLogsModal
        open={wfLogsModalVisible}
        selectedEngineForLogs={selectedEngineForLogs}
        onClose={() => setWfLogsModalVisible(false)}
      />

      <WorkflowCreateModal
        open={wfCreateModalVisible}
        form={wfCreateForm}
        onFinish={handleSaveNewWorkflow}
        onCancel={() => setWfCreateModalVisible(false)}
      />

      <PromptCreateModal
        open={promptCreateModalVisible}
        form={promptCreateForm}
        onOk={handleSaveNewPrompt}
        onCancel={() => setPromptCreateModalVisible(false)}
      />

      <PromptEditModal
        open={promptEditFormVisible}
        form={promptEditForm}
        onOk={handleSavePromptEdit}
        onCancel={() => setPromptEditFormVisible(false)}
      />

      <VersionCompareModal
        open={versionCompareModalVisible}
        compareVersions={compareVersions}
        onClose={() => setVersionCompareModalVisible(false)}
      />
    </div>
  )
}
