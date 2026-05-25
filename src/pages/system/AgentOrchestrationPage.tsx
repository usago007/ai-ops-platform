import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Switch, Slider, Tag, Alert, Table, Descriptions, Button, Tooltip, Modal, Tabs, Form, Input, Select, InputNumber, Divider, Badge, Space, List, Popconfirm, Empty, Statistic, Progress, message, Timeline } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  LinkOutlined,
  AppstoreOutlined,
  EyeOutlined,
  RocketOutlined,
  CodeOutlined,
  DatabaseOutlined,
  GatewayOutlined,
  ApiOutlined,
  CloudServerOutlined,
  FileTextOutlined,
  SecurityScanOutlined,
  DashboardOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  LockOutlined,
  FilterOutlined,
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
  HistoryOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  RollbackOutlined,
} from '@ant-design/icons'
import { Pie, Line, Column } from '@ant-design/charts'
import styles from './AgentOrchestrationPage.module.css'
import { systemService } from '../../services'
import { CHART_COLORS, CHART_PALETTE, STATUS_COLORS, CHART_LABEL_COLOR } from '../../styles/chartColors'

const { TabPane } = Tabs
const { TextArea } = Input
const { Option } = Select

interface AgentNode {
  id: string
  name: string
  status: 'online' | 'offline'
  type: 'master' | 'worker'
  weight: number
  model?: string
  modelName?: string
  businessModules?: string[]
  routeMapping?: Array<{ label: string; path: string }>
}

interface Edge {
  from: string
  to: string
  label: string
}

interface TopologyData {
  nodes: AgentNode[]
  edges: Edge[]
}

interface WorkflowNode {
  id: string
  label: string
  type: 'ai' | 'rule' | 'data'
  ai: { model: string; temperature: number; prompt: string } | null
  input: string
  output: string
}

interface Workflow {
  name: string
  agent: string
  nodes: WorkflowNode[]
}

interface LLMGatewayConfig {
  apiKey: string
  rateLimit: number
  maxTokens: number
  timeout: number
  fallbackModel: string
  retryCount: number
  authEnabled: boolean
  ipWhitelist: string[]
  modelRouting: Array<{ pattern: string; model: string }>
}

interface WorkflowEngine {
    id: string
    name: string
    type: 'dify' | 'coze' | 'n8n' | 'custom'
    status: 'running' | 'stopped' | 'error'
    version: string
    endpoint: string
    activeFlows: number
    totalFlows: number
    description?: string
    apiKey?: string
    connectTimeout?: number
    requestTimeout?: number
    maxConcurrency?: number
    retryCount?: number
    retryInterval?: number
    logLevel?: string
    timeoutStrategy?: string
    maxExecutionTime?: number
    errorStrategy?: string
    promptVersion?: string
    ragIndex?: string
    ruleSet?: string
    dataSource?: string
    ipWhitelist?: string[]
    authEnabled?: boolean
    encryptionEnabled?: boolean
    auditEnabled?: boolean
    
    // Dify 专用字段
    difyWorkflowId?: string
    responseMode?: 'blocking' | 'streaming'
    userContextPrefix?: string
    fileUploadEnabled?: boolean
    
    // Coze 专用字段
    cozeWorkflowId?: string
    cozeAppId?: string
    cozeBotId?: string
    cozeExecuteMode?: 'RELEASE' | 'DEBUG'
    cozeConnectorId?: string
    parametersFormat?: 'json_string' | 'json_object'
    
    // n8n 专用字段
    n8nWorkflowId?: string
    n8nWebhookPath?: string
    n8nAuthMethod?: 'none' | 'basic' | 'header'
    n8nAuthUsername?: string
    n8nAuthPassword?: string
    n8nAuthHeaderName?: string
    n8nAuthHeaderValue?: string
    
    // Custom 专用字段
    customRequestMethod?: 'GET' | 'POST' | 'PUT'
    customRequestFormat?: 'json' | 'xml' | 'form'
    customResponseFormat?: 'json' | 'xml' | 'text'
    customHeaders?: Record<string, string>
    customRequestBodyTemplate?: string
  }

interface RAGService {
  vectorDb: string
  embeddingModel: string
  chunkSize: number
  overlap: number
  topK: number
  rerankModel: string
  status: 'healthy' | 'degraded' | 'offline'
  indexCount: number
  documentCount: number
}

interface PromptVersion {
  id: string
  name: string
  version: string
  content: string
  status: 'active' | 'draft' | 'archived'
  creator: string
  updatedAt: string
  usageCount: number
  successRate: number
}

interface HealthStatus {
  component: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  lastCheck: string
  metrics: {
    qps: number
    successRate: number
    p95Latency: number
    errorRate: number
  }
}

interface BusinessMapping {
  moduleId: string
  moduleName: string
  icon: string
  workflowId?: string
  promptId?: string
  ragIndexId?: string
  routePath: string
}

interface TrafficDistribution {
  model: string
  calls: number
  percentage: number
  cost: number
  avgLatency: number
}

interface ApiKeyItem {
  id: string
  key: string
  status: 'active' | 'disabled' | 'expired'
  usageCount: number
  lastUsed: string
  rotationPolicy: 'manual' | 'auto'
}

interface RequestLog {
  id: string
  timestamp: string
  method: string
  endpoint: string
  model: string
  status: 'success' | 'error'
  latency: number
  tokens: number
}

interface WorkflowExecution {
  id: string
  workflowId: string
  workflowName: string
  status: 'success' | 'failed' | 'running'
  startTime: string
  endTime?: string
  duration?: number
  triggerType: 'manual' | 'scheduled' | 'event'
  errorMessage?: string
}

interface WorkflowTrigger {
  id: string
  workflowId: string
  type: 'manual' | 'scheduled' | 'event'
  name: string
  schedule?: string
  event?: string
  enabled: boolean
}

interface WorkflowTemplate {
  id: string
  name: string
  icon: string
  description: string
  category: string
  presetConfig: Partial<WorkflowEngine>
}

interface RagIndex {
  id: string
  name: string
  status: 'active' | 'building' | 'error'
  documentCount: number
  vectorCount: number
  lastUpdated: string
  businessModule: string
  embeddingModel: string
}

interface RetrievalMetrics {
  accuracy: number
  recall: number
  avgLatency: number
  trend: Array<{ day: string; accuracy: number; recall: number }>
}

interface DocumentHistory {
  id: string
  name: string
  type: string
  status: 'completed' | 'processing' | 'failed'
  chunks: number
  uploadedAt: string
  processedAt?: string
}

interface ABTest {
  id: string
  name: string
  status: 'running' | 'paused' | 'completed'
  variants: Array<{
    promptId: string
    promptName: string
    trafficPercent: number
    metrics: {
      conversionRate: number
      successRate: number
      avgResponseTime: number
    }
  }>
  startDate: string
  endDate?: string
}

interface PromptBusinessMapping {
  promptId: string
  promptName: string
  workflows: string[]
  modules: string[]
  usageCount: number
}

interface CanaryConfig {
  promptId: string
  promptName: string
  currentVersion: string
  canaryVersion: string
  canaryPercent: number
  autoRollbackThreshold: number
  status: 'inactive' | 'canary' | 'rolling' | 'completed'
}

interface UsageStat {
  time: string
  calls: number
  successRate: number
}

interface PromptEvaluation {
  id: string
  promptId: string
  promptName: string
  evaluator: string
  score: number
  comment: string
  evaluatedAt: string
  type: 'manual' | 'auto'
}

const businessModuleColors: Record<string, string> = {
  'BIZ-001': 'blue',
  'BIZ-002': 'green',
  'BIZ-003': 'orange',
  'BIZ-004': 'purple',
  'MKT-001': 'red',
  'MKT-002': 'magenta',
  'MKT-003': 'volcano',
  'MKT-004': 'geekblue',
}

const workflowEngineIcons: Record<string, string> = {
  dify: '🔵',
  coze: '🟢',
  n8n: '🟠',
  custom: '⚫',
}

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

  // 路由规则状态
  const [routeRuleModalVisible, setRouteRuleModalVisible] = useState(false)
  const [routeRuleForm] = Form.useForm()
  const [editingRouteRule, setEditingRouteRule] = useState<{ pattern: string; model: string } | null>(null)
  const [editingRouteRuleIndex, setEditingRouteRuleIndex] = useState<number | null>(null)

  // 工作流配置状态
  const [wfConfigModalVisible, setWfConfigModalVisible] = useState(false)
  const [selectedEngineForConfig, setSelectedEngineForConfig] = useState<WorkflowEngine | null>(null)

  const handleConfigWorkflow = (record: WorkflowEngine) => {
    setSelectedEngineForConfig(record)
    setWfConfigModalVisible(true)
  }

  const handleSaveWorkflowConfig = (values: any) => {
    setWorkflowEngines(prev =>
      prev.map(e =>
        e.id === selectedEngineForConfig?.id
          ? {
              ...e,
              ...values,
              ipWhitelist: typeof values.ipWhitelist === 'string' ? values.ipWhitelist.split('\n').filter(Boolean) : values.ipWhitelist,
            }
          : e
      )
    )
    message.success('工作流配置已保存')
    setWfConfigModalVisible(false)
  }

  // 工作流日志状态
  const [wfLogsModalVisible, setWfLogsModalVisible] = useState(false)
  const [selectedEngineForLogs, setSelectedEngineForLogs] = useState<WorkflowEngine | null>(null)

  // 新增工作流状态
  const [wfCreateModalVisible, setWfCreateModalVisible] = useState(false)
  const [wfCreateForm] = Form.useForm()

  // 新建 Prompt 状态
  const [promptCreateModalVisible, setPromptCreateModalVisible] = useState(false)
  const [promptCreateForm] = Form.useForm()

  // Prompt 编辑状态
  const [promptEditFormVisible, setPromptEditFormVisible] = useState(false)
  const [promptEditForm] = Form.useForm()
  const [editingPrompt, setEditingPrompt] = useState<PromptVersion | null>(null)

  // LLM 网关状态
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

  // 工作流引擎状态
  const [workflowEngines, setWorkflowEngines] = useState<WorkflowEngine[]>([
    { id: 'wf-1', name: '询报价归类流程', type: 'dify', status: 'running', version: 'v2.1.0', endpoint: 'https://dify.example.com/v1', activeFlows: 12, totalFlows: 15, description: '处理询价线索的AI解析、归类和相似推荐全流程', apiKey: 'sk-dify-****-1234', connectTimeout: 10, requestTimeout: 60, maxConcurrency: 20, retryCount: 3, retryInterval: 2, logLevel: 'INFO', timeoutStrategy: 'retry', maxExecutionTime: 120, errorStrategy: 'retry', promptVersion: 'v3.2.1', ragIndex: 'idx-inquiry-001', ruleSet: 'RULE-100', dataSource: 'MySQL-Primary', ipWhitelist: ['192.168.1.0/24'], authEnabled: true, encryptionEnabled: true, auditEnabled: true, difyWorkflowId: 'wf-inquiry-classification', responseMode: 'blocking', userContextPrefix: 'prod_', fileUploadEnabled: false },
    { id: 'wf-2', name: '商品信息结构化', type: 'dify', status: 'running', version: 'v1.8.3', endpoint: 'https://dify.example.com/v1', activeFlows: 8, totalFlows: 10, description: '从非结构化文本中提取并标准化商品属性', apiKey: 'sk-dify-****-5678', connectTimeout: 10, requestTimeout: 45, maxConcurrency: 15, retryCount: 2, retryInterval: 3, logLevel: 'INFO', timeoutStrategy: 'terminate', maxExecutionTime: 90, errorStrategy: 'skip', promptVersion: 'v2.5.0', ragIndex: 'idx-product-002', ruleSet: 'RULE-200', dataSource: 'PostgreSQL-Product', ipWhitelist: [], authEnabled: true, encryptionEnabled: false, auditEnabled: true, difyWorkflowId: 'wf-product-structuring', responseMode: 'blocking', userContextPrefix: 'prod_', fileUploadEnabled: false },
    { id: 'wf-3', name: '营销内容生成', type: 'coze', status: 'running', version: 'v3.0.1', endpoint: 'https://api.coze.com/v1', activeFlows: 5, totalFlows: 8, description: '基于商品卖点自动生成多渠道营销文案', apiKey: 'coze-****-abcd', connectTimeout: 15, requestTimeout: 30, maxConcurrency: 10, retryCount: 2, retryInterval: 5, logLevel: 'WARN', timeoutStrategy: 'warn', maxExecutionTime: 60, errorStrategy: 'retry', promptVersion: 'v4.0.0', ragIndex: 'idx-marketing-003', ruleSet: null, dataSource: 'API-Marketing', ipWhitelist: [], authEnabled: true, encryptionEnabled: true, auditEnabled: false, cozeWorkflowId: 'wf_123456789', cozeAppId: 'app_987654321', cozeBotId: 'bot_001', cozeExecuteMode: 'RELEASE', cozeConnectorId: '1024', parametersFormat: 'json_string' },
    { id: 'wf-4', name: '客服智能辅助', type: 'n8n', status: 'stopped', version: 'v1.5.0', endpoint: 'https://n8n.example.com/api', activeFlows: 0, totalFlows: 6, description: '客服对话中的意图识别和话术推荐', apiKey: 'n8n-****-efgh', connectTimeout: 10, requestTimeout: 30, maxConcurrency: 25, retryCount: 3, retryInterval: 2, logLevel: 'DEBUG', timeoutStrategy: 'terminate', maxExecutionTime: 30, errorStrategy: 'terminate', promptVersion: 'v2.1.3', ragIndex: 'idx-cs-004', ruleSet: 'RULE-300', dataSource: 'Redis-CS', ipWhitelist: ['10.0.0.0/8'], authEnabled: true, encryptionEnabled: true, auditEnabled: true, n8nWorkflowId: 'abc123def456', n8nWebhookPath: '/webhook/customer-support', n8nAuthMethod: 'basic', n8nAuthUsername: 'api-user', n8nAuthPassword: '****' },
    { id: 'wf-5', name: '规则冲突检测', type: 'custom', status: 'error', version: 'v2.0.0', endpoint: 'https://api.internal.com/rules', activeFlows: 0, totalFlows: 4, description: '自动检测业务规则之间的逻辑冲突', apiKey: 'internal-****-ijkl', connectTimeout: 5, requestTimeout: 20, maxConcurrency: 5, retryCount: 1, retryInterval: 1, logLevel: 'ERROR', timeoutStrategy: 'terminate', maxExecutionTime: 15, errorStrategy: 'terminate', promptVersion: 'v1.8.0', ragIndex: null, ruleSet: 'RULE-ALL', dataSource: 'Local-File', ipWhitelist: ['127.0.0.1'], authEnabled: false, encryptionEnabled: false, auditEnabled: true, customRequestMethod: 'POST', customRequestFormat: 'json', customResponseFormat: 'json', customHeaders: { 'X-Tenant-ID': 'default' }, customRequestBodyTemplate: '{"rules": ["{{ruleSet}}"], "data": {{inputData}}}' },
  ])

  // RAG 服务状态
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

  // Prompt 管理状态
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

  const getWorkflowImpactInfo = (workflowId: string) => {
    const modules = businessMappings.filter(m => m.workflowId === workflowId)
    const workflow = workflowEngines.find(w => w.id === workflowId)
    return {
      moduleCount: modules.length,
      moduleNames: modules.map(m => m.moduleName),
      dailyCalls: workflow?.activeFlows || 0,
      successRate: workflow?.status === 'running' ? '96.5%' : 'N/A',
    }
  }

  // 架构概览 - 健康状态
  const [componentHealth, setComponentHealth] = useState<HealthStatus[]>([
    { component: 'LLM 网关', status: 'healthy', lastCheck: '2026-04-21 10:32:15', metrics: { qps: 1250, successRate: 97.3, p95Latency: 1.2, errorRate: 0.3 } },
    { component: '工作流引擎', status: 'degraded', lastCheck: '2026-04-21 10:32:12', metrics: { qps: 850, successRate: 96.5, p95Latency: 2.8, errorRate: 3.5 } },
    { component: 'RAG 服务', status: 'healthy', lastCheck: '2026-04-21 10:32:18', metrics: { qps: 2100, successRate: 94.8, p95Latency: 0.45, errorRate: 0.1 } },
    { component: 'Prompt 管理', status: 'healthy', lastCheck: '2026-04-21 10:32:10', metrics: { qps: 3200, successRate: 96.1, p95Latency: 0.12, errorRate: 0.2 } },
  ])

  // 架构概览 - 业务关联映射
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

  // 架构概览 - 活跃告警
  const [activeAlerts] = useState<Array<{ id: string; level: 'warning' | 'error'; message: string; time: string }>>([
    { id: 'alert-1', level: 'warning', message: '工作流引擎 "询报价归类流程" P95延迟超过阈值 (2.8s > 2.0s)', time: '2026-04-21 10:28:33' },
    { id: 'alert-2', level: 'error', message: '工作流引擎 "规则冲突检测" 状态异常，错误率 100%', time: '2026-04-21 09:45:12' },
  ])

  // LLM 网关 - 流量分配统计
  const [trafficDistribution] = useState<TrafficDistribution[]>([
    { model: 'GPT-4 Turbo', calls: 45200, percentage: 45, cost: 351.20, avgLatency: 2.1 },
    { model: 'Claude 3 Sonnet', calls: 28500, percentage: 28, cost: 198.50, avgLatency: 1.8 },
    { model: 'GPT-3.5 Turbo', calls: 15300, percentage: 15, cost: 45.80, avgLatency: 0.9 },
    { model: 'Qwen Turbo', calls: 8200, percentage: 8, cost: 12.40, avgLatency: 1.2 },
    { model: '其他', calls: 4050, percentage: 4, cost: 8.60, avgLatency: 1.5 },
  ])

  // LLM 网关 - API Key管理
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    { id: 'key-1', key: 'sk-****-****-****-1234', status: 'active', usageCount: 45230, lastUsed: '2026-04-21 10:32:15', rotationPolicy: 'auto' },
    { id: 'key-2', key: 'sk-****-****-****-5678', status: 'active', usageCount: 28500, lastUsed: '2026-04-21 10:30:42', rotationPolicy: 'auto' },
    { id: 'key-3', key: 'sk-****-****-****-9abc', status: 'disabled', usageCount: 12450, lastUsed: '2026-04-15 14:22:08', rotationPolicy: 'manual' },
  ])

  // LLM 网关 - 请求日志
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

  // 工作流引擎 - 执行历史
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

  // 工作流引擎 - 触发器配置
  const [workflowTriggers] = useState<WorkflowTrigger[]>([
    { id: 'trigger-1', workflowId: 'wf-1', type: 'event', name: '新询盘到达', event: 'inquiry.created', enabled: true },
    { id: 'trigger-2', workflowId: 'wf-3', type: 'scheduled', name: '每日营销内容生成', schedule: '0 9 * * *', enabled: true },
    { id: 'trigger-3', workflowId: 'wf-5', type: 'scheduled', name: '每周规则冲突检测', schedule: '0 2 * * 1', enabled: false },
    { id: 'trigger-4', workflowId: 'wf-4', type: 'event', name: '客服会话开始', event: 'cs.session.started', enabled: true },
    { id: 'trigger-5', workflowId: 'wf-2', type: 'event', name: '商品数据导入', event: 'product.imported', enabled: true },
    { id: 'trigger-6', workflowId: 'wf-2', type: 'manual', name: '批量结构化任务', enabled: true },
  ])

  // 工作流引擎 - 模板库
  const [workflowTemplates] = useState<WorkflowTemplate[]>([
    { id: 'tpl-1', name: '询盘解析模板', icon: '📋', description: '自动解析、归类询报价文本，提取品类、规格、数量等关键信息', category: '询盘处理', presetConfig: { name: '询盘解析流程', type: 'dify', timeoutStrategy: 'retry', maxExecutionTime: 120 } },
    { id: 'tpl-2', name: '报价生成模板', icon: '💰', description: '基于询盘信息自动生成标准化报价单，包含价格、交期、付款条款', category: '报价管理', presetConfig: { name: '报价生成流程', type: 'dify', timeoutStrategy: 'warn', maxExecutionTime: 90 } },
    { id: 'tpl-3', name: '营销文案模板', icon: '📝', description: '根据商品特点和目标人群自动生成多渠道营销文案', category: '营销内容', presetConfig: { name: '营销内容生成', type: 'coze', timeoutStrategy: 'retry', maxExecutionTime: 60 } },
    { id: 'tpl-4', name: '客服辅助模板', icon: '👥', description: '客服对话中的意图识别和话术推荐工作流', category: '客户服务', presetConfig: { name: '客服智能辅助', type: 'n8n', timeoutStrategy: 'terminate', maxExecutionTime: 30 } },
  ])

  // RAG服务 - 知识库索引
  const [ragIndices] = useState<RagIndex[]>([
    { id: 'idx-001', name: '询报价知识库', status: 'active', documentCount: 5680, vectorCount: 28400, lastUpdated: '2026-04-21 09:15:32', businessModule: '询盘管理', embeddingModel: 'text-embedding-3-large' },
    { id: 'idx-002', name: '商品信息库', status: 'active', documentCount: 3200, vectorCount: 16000, lastUpdated: '2026-04-21 08:42:18', businessModule: '商品结构化', embeddingModel: 'text-embedding-3-large' },
    { id: 'idx-003', name: '营销素材库', status: 'active', documentCount: 4500, vectorCount: 22500, lastUpdated: '2026-04-20 18:30:45', businessModule: '营销内容', embeddingModel: 'text-embedding-3-large' },
    { id: 'idx-004', name: '客服话术库', status: 'building', documentCount: 2300, vectorCount: 11500, lastUpdated: '2026-04-21 10:28:12', businessModule: '客户服务', embeddingModel: 'bge-large-zh' },
  ])

  // RAG服务 - 检索效果指标
  const [retrievalMetrics] = useState<RetrievalMetrics>({
    accuracy: 92.5,
    recall: 88.3,
    avgLatency: 145,
    trend: Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - 13 + i)
      return {
        day: `${d.getMonth() + 1}/${d.getDate()}`,
        accuracy: 90 + Math.random() * 5,
        recall: 85 + Math.random() * 5,
      }
    }),
  })

  // RAG服务 - 文档处理历史
  const [documentHistory] = useState<DocumentHistory[]>([
    { id: 'doc-1', name: '产品规格手册2026.pdf', type: 'PDF', status: 'completed', chunks: 245, uploadedAt: '2026-04-21 09:15:32', processedAt: '2026-04-21 09:18:45' },
    { id: 'doc-2', name: '客户询报价样本.docx', type: 'DOCX', status: 'completed', chunks: 128, uploadedAt: '2026-04-21 08:42:18', processedAt: '2026-04-21 08:44:52' },
    { id: 'doc-3', name: '营销文案模板库.xlsx', type: 'XLSX', status: 'processing', chunks: 0, uploadedAt: '2026-04-21 10:28:12' },
    { id: 'doc-4', name: '客服FAQ集合.json', type: 'JSON', status: 'completed', chunks: 89, uploadedAt: '2026-04-20 16:30:00', processedAt: '2026-04-20 16:31:15' },
    { id: 'doc-5', name: '竞品分析报告.pdf', type: 'PDF', status: 'failed', chunks: 0, uploadedAt: '2026-04-20 14:22:08' },
  ])

  // Prompt管理 - A/B测试
  const [abTests] = useState<ABTest[]>([
    {
      id: 'ab-1',
      name: '询报价分类 Prompt A/B测试',
      status: 'running',
      variants: [
        { promptId: 'p-1', promptName: '询报价分类 Prompt v3.2.1', trafficPercent: 60, metrics: { conversionRate: 94.5, successRate: 94.5, avgResponseTime: 2.1 } },
        { promptId: 'p-6', promptName: '询报价分类 Prompt v3.3.0', trafficPercent: 40, metrics: { conversionRate: 96.2, successRate: 96.2, avgResponseTime: 1.8 } },
      ],
      startDate: '2026-04-18',
    },
    {
      id: 'ab-2',
      name: '客服话术推荐 A/B测试',
      status: 'completed',
      variants: [
        { promptId: 'p-4', promptName: '客服话术推荐 Prompt v2.1.3', trafficPercent: 50, metrics: { conversionRate: 88.7, successRate: 88.7, avgResponseTime: 0.9 } },
        { promptId: 'p-7', promptName: '客服话术推荐 Prompt v2.2.0', trafficPercent: 50, metrics: { conversionRate: 91.3, successRate: 91.3, avgResponseTime: 0.7 } },
      ],
      startDate: '2026-04-10',
      endDate: '2026-04-17',
    },
  ])

  // Prompt管理 - 业务关联映射
  const [promptBusinessMappings] = useState<PromptBusinessMapping[]>([
    { promptId: 'p-1', promptName: '询报价分类 Prompt', workflows: ['wf-1'], modules: ['询盘管理', '报价管理', '智能分类'], usageCount: 1523 },
    { promptId: 'p-2', promptName: '商品属性提取 Prompt', workflows: ['wf-2'], modules: ['智能分类'], usageCount: 892 },
    { promptId: 'p-3', promptName: '营销文案生成 Prompt', workflows: ['wf-3'], modules: ['营销内容', '卖点管理'], usageCount: 0 },
    { promptId: 'p-4', promptName: '客服话术推荐 Prompt', workflows: ['wf-4'], modules: ['客户服务', '归因分析'], usageCount: 2341 },
    { promptId: 'p-5', promptName: '规则归纳 Prompt', workflows: ['wf-5'], modules: ['规则管理'], usageCount: 456 },
  ])

  // Prompt管理 - 灰度发布配置
  const [canaryConfigs, setCanaryConfigs] = useState<CanaryConfig[]>([
    { promptId: 'p-1', promptName: '询报价分类 Prompt', currentVersion: 'v3.2.1', canaryVersion: 'v3.3.0', canaryPercent: 40, autoRollbackThreshold: 90, status: 'canary' },
  ])

  // Prompt管理 - 使用统计
  const [promptUsageStats] = useState<UsageStat[]>(
    Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - 13 + i)
      return {
        time: `${d.getMonth() + 1}/${d.getDate()}`,
        calls: 150 + Math.floor(Math.random() * 200),
        successRate: 90 + Math.random() * 8,
      }
    })
  )

  // Prompt管理 - 评测结果
  const [promptEvaluations] = useState<PromptEvaluation[]>([
    { id: 'eval-1', promptId: 'p-1', promptName: '询报价分类 Prompt', evaluator: '陈明远', score: 92, comment: '分类准确率高，但个别冷门品类识别有待提升', evaluatedAt: '2026-04-20 15:30:00', type: 'manual' },
    { id: 'eval-2', promptId: 'p-2', promptName: '商品属性提取 Prompt', evaluator: '系统', score: 88, comment: '字段提取完整率88%，材质字段偶有遗漏', evaluatedAt: '2026-04-20 12:00:00', type: 'auto' },
    { id: 'eval-3', promptId: 'p-4', promptName: '客服话术推荐 Prompt', evaluator: '林晓峰', score: 85, comment: '推荐话术合理，但缺少多轮对话上下文理解', evaluatedAt: '2026-04-19 10:15:00', type: 'manual' },
    { id: 'eval-4', promptId: 'p-3', promptName: '营销文案生成 Prompt', evaluator: '系统', score: 0, comment: '尚未开始评测', evaluatedAt: '-', type: 'auto' },
  ])

  // UI状态 - 各种Modal
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

  // 工作流日志操作
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

  // 新增工作流操作
  const handleCreateWorkflow = () => {
    setWfCreateModalVisible(true)
  }

  const handleSaveNewWorkflow = (values: any) => {
    const typeMap: Record<string, string> = { dify: 'dify', coze: 'coze', n8n: 'n8n', custom: 'custom' }
    const newEngine: WorkflowEngine = {
      id: `wf-${Date.now()}`,
      name: values.name,
      type: typeMap[values.type] || 'custom',
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

  // 新建 Prompt 操作
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

  // 健康状态刷新
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

  // API Key管理操作
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

  // 工作流模板应用
  const handleApplyTemplate = (template: WorkflowTemplate) => {
    setWfCreateForm.setFieldsValue(template.presetConfig)
    setWfCreateModalVisible(true)
    message.success(`已应用模板: ${template.name}`)
  }

  // Prompt版本对比
  const handleCompareVersions = (left: PromptVersion, right: PromptVersion) => {
    setCompareVersions({ left, right })
    setVersionCompareModalVisible(true)
  }

  // 灰度发布操作
  const handleUpdateCanary = (values: any) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'running':
      case 'healthy':
      case 'active':
        return 'success'
      case 'offline':
      case 'stopped':
      case 'archived':
        return 'default'
      case 'error':
      case 'degraded':
        return 'error'
      case 'draft':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      online: '在线',
      offline: '离线',
      running: '运行中',
      stopped: '已停止',
      error: '异常',
      healthy: '健康',
      degraded: '降级',
      active: '已启用',
      draft: '草稿',
      archived: '已归档',
    }
    return statusMap[status] || status
  }

  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }

  const architectureTab = (
    <div className={styles.container}>
      {/* 架构图概览 */}
      <Card title="AI 编排层核心架构" className={styles.card}>
        <div className={styles.architectureDiagram}>
          {/* 核心枢纽 */}
          <div className={styles.coreHub}>
            <div className={styles.hubHeader}>
              <DashboardOutlined className={styles.hubIcon} />
              <span>AI 编排层 ← 核心枢纽</span>
            </div>
          </div>

          {/* 四大核心组件 */}
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

          {/* 数据流向 */}
          <div className={styles.dataFlow}>
            <Alert
              message="数据流向"
              description="用户请求 → LLM 网关(鉴权/限流) → 工作流引擎(流程编排) → RAG 服务(知识增强) → Prompt 管理(版本控制) → AI 模型响应"
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
            />
          </div>

          {/* 数据流向可视化 */}
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

      {/* 活跃告警横幅 */}
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

      {/* 实时健康状态指示器 */}
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

      {/* 工作流引擎 - 业务模块关联拓扑 */}
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
                      <Tooltip key={mapping.moduleId} title={`路由: ${mapping.routePath}${mapping.promptId ? '\nPrompt: ' + (promptVersions.find(p => p.id === mapping.promptId)?.name || '-') : ''}${mapping.ragIndexId ? '\nRAG: ' + ragIndices.find(i => i.id === mapping.ragIndexId)?.name || '-' : ''}`}>
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

      {/* 业务关联映射 */}
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

  const llmGatewayTab = (
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

      {/* 实时监控面板 */}
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

      {/* 流量分配统计 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="模型流量分配" className={styles.card}>
            <div className={styles.trafficChartContainer}>
              <Pie
                data={trafficDistribution.map(t => ({ type: t.model, value: t.percentage }))}
                angleField="value"
                colorField="type"
                radius={0.8}
                innerRadius={0.6}
                label={{ type: 'outer', content: '{name} {percentage}%' }}
                interactions={[{ type: 'element-active' }]}
                color={[CHART_COLORS[1], CHART_COLORS[3], CHART_COLORS[4], CHART_COLORS[5], CHART_COLORS[6]]}
                containerStyle={{ height: 280 }}
              />
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

      {/* API Key管理 */}
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

      {/* 请求日志查看器 */}
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

  const workflowEngineTab = (
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

      {/* 执行统计卡片 */}
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

      {/* 工作流模板库 */}
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

      {/* 触发器配置 */}
      <Card title="触发器配置" className={`${styles.card} ${styles.triggerConfigCard}`}>
        <Table
          dataSource={workflowTriggers}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            { title: '触发器名称', dataIndex: 'name', key: 'name' },
            { title: '类型', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={t === 'event' ? 'blue' : t === 'scheduled' ? 'green' : 'default'}>{t === 'event' ? '事件' : t === 'scheduled' ? '定时' : '手动'}</Tag> },
            { title: '事件/表达式', dataIndex: 'event', key: 'event', render: (v: string, r: any) => v || r.schedule || '-' },
            { title: '关联工作流', dataIndex: 'workflowId', key: 'workflowId', render: (v: string) => workflowEngines.find(w => w.id === v)?.name },
            { title: '状态', dataIndex: 'enabled', key: 'enabled', render: (v: boolean) => <Badge status={v ? 'success' : 'default'} text={v ? '已启用' : '已禁用'} /> },
          ]}
        />
      </Card>

      {/* 执行历史看板 */}
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

  const ragServiceTab = (
    <div className={styles.container}>
      <Card title="RAG 服务配置" className={styles.card}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card title="向量数据库" size="small" className={styles.subCard}>
              <Form layout="vertical">
                <Form.Item label="数据库类型">
                  <Select defaultValue={ragService.vectorDb}>
                    <Option value="Milvus">Milvus</Option>
                    <Option value="Pinecone">Pinecone</Option>
                    <Option value="Weaviate">Weaviate</Option>
                    <Option value="Qdrant">Qdrant</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="状态">
                  <Badge status={getStatusColor(ragService.status) as any} text={getStatusText(ragService.status)} />
                </Form.Item>
                <Form.Item label="索引数量">
                  <Statistic value={ragService.indexCount} />
                </Form.Item>
                <Form.Item label="文档总数">
                  <Statistic value={ragService.documentCount} />
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Embedding 配置" size="small" className={styles.subCard}>
              <Form layout="vertical">
                <Form.Item label="Embedding 模型">
                  <Select defaultValue={ragService.embeddingModel}>
                    <Option value="text-embedding-3-large">text-embedding-3-large</Option>
                    <Option value="text-embedding-3-small">text-embedding-3-small</Option>
                    <Option value="bge-large-zh">bge-large-zh</Option>
                    <Option value="m3e">m3e</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Chunk 大小">
                  <InputNumber min={128} max={2048} defaultValue={ragService.chunkSize} />
                </Form.Item>
                <Form.Item label="重叠大小">
                  <InputNumber min={0} max={512} defaultValue={ragService.overlap} />
                </Form.Item>
                <Form.Item label="Top K">
                  <InputNumber min={1} max={100} defaultValue={ragService.topK} />
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="重排服务" size="small" className={styles.subCard}>
              <Form layout="vertical">
                <Form.Item label="重排模型">
                  <Select defaultValue={ragService.rerankModel}>
                    <Option value="bge-reranker-v2">bge-reranker-v2</Option>
                    <Option value="jina-reranker-v2">jina-reranker-v2</Option>
                    <Option value="colbert-v2">colbert-v2</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="重排阈值">
                  <Slider min={0} max={1} step={0.01} defaultValue={0.75} />
                </Form.Item>
                <Form.Item label="重排数量">
                  <InputNumber min={1} max={50} defaultValue={10} />
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>

        <div className={styles.formActions}>
          <Button icon={<ReloadOutlined />} onClick={() => message.info('RAG 配置已重置')}>重置</Button>
          <Button type="primary" icon={<CheckOutlined />} className={styles.saveButton} onClick={() => message.success('RAG 服务配置已保存')}>
            保存配置
          </Button>
        </div>
      </Card>

      {/* 知识库索引管理 */}
      <Card title="知识库索引管理" className={styles.card}>
        {ragIndices.map(index => (
          <div className={styles.indexItem} key={index.id}>
            <div className={styles.indexHeader}>
              <div>
                <span className={styles.indexName}>{index.name}</span>
                <Tag color={index.status === 'active' ? 'success' : index.status === 'building' ? 'processing' : 'error'} className={styles.modalTagMargin}>
                  {index.status === 'active' ? '就绪' : index.status === 'building' ? '构建中' : '异常'}
                </Tag>
              </div>
              <Space>
                <Tag color="blue">{index.businessModule}</Tag>
                <Tag>{index.embeddingModel}</Tag>
                <span className={styles.indexUpdateTime}>更新于: {index.lastUpdated}</span>
              </Space>
            </div>
            <div className={styles.indexStats}>
              <div className={styles.indexStat}>
                <div className={styles.indexStatValue}>{index.documentCount.toLocaleString()}</div>
                <div className={styles.indexStatLabel}>文档数</div>
              </div>
              <div className={styles.indexStat}>
                <div className={styles.indexStatValue}>{index.vectorCount.toLocaleString()}</div>
                <div className={styles.indexStatLabel}>向量数</div>
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* 检索效果评估 */}
      <Row gutter={16}>
        <Col span={8}>
          <Card title="检索效果指标" className={`${styles.card} ${styles.evaluationCard}`}>
            <div className={`${styles.executionStatsRow} ${styles.retrievalStatsColumn}`}>
              <div className={styles.executionStatCard}>
                <div className={`${styles.executionStatValue} ${styles.statValueSuccess}`}>{retrievalMetrics.accuracy}%</div>
                <div className={styles.executionStatLabel}>准确率 (Accuracy)</div>
                <Progress percent={Math.round(retrievalMetrics.accuracy)} strokeColor={STATUS_COLORS.success} showInfo={false} />
              </div>
              <div className={styles.executionStatCard}>
                <div className={`${styles.executionStatValue} ${styles.statValueChart1}`}>{retrievalMetrics.recall}%</div>
                <div className={styles.executionStatLabel}>召回率 (Recall)</div>
                <Progress percent={Math.round(retrievalMetrics.recall)} strokeColor={CHART_COLORS[1]} showInfo={false} />
              </div>
              <div className={styles.executionStatCard}>
                <div className={`${styles.executionStatValue} ${styles.statValueWarning}`}>{retrievalMetrics.avgLatency}ms</div>
                <div className={styles.executionStatLabel}>平均检索延迟</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="检索效果趋势" className={`${styles.card} ${styles.evaluationCard}`}>
            <div className={styles.successRateChartContainer}>
              <Line
                data={retrievalMetrics.trend.flatMap(t => [
                  { day: t.day, metric: '准确率', value: t.accuracy },
                  { day: t.day, metric: '召回率', value: t.recall },
                ])}
                xField="day"
                yField="value"
                seriesField="metric"
                smooth
                color={[STATUS_COLORS.success, CHART_COLORS[1]]}
                point={{ size: 3, shape: 'circle' }}
                yAxis={{ label: { style: { fill: CHART_LABEL_COLOR } } }}
                xAxis={{ label: { style: { fill: CHART_LABEL_COLOR } } }}
                containerStyle={{ height: 250 }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 文档处理历史 */}
      <Card title="文档处理历史" className={`${styles.card} ${styles.documentHistoryCard}`}>
        <Table
          dataSource={documentHistory}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            { title: '文档名称', dataIndex: 'name', key: 'name' },
            { title: '类型', dataIndex: 'type', key: 'type', render: (t: string) => <Tag>{t}</Tag> },
            { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Badge status={s === 'completed' ? 'success' : s === 'processing' ? 'processing' : 'error'} text={s === 'completed' ? '已完成' : s === 'processing' ? '处理中' : '失败'} /> },
            { title: '分块数', dataIndex: 'chunks', key: 'chunks' },
            { title: '上传时间', dataIndex: 'uploadedAt', key: 'uploadedAt', width: 180 },
            { title: '处理完成时间', dataIndex: 'processedAt', key: 'processedAt', width: 180, render: (v: string) => v || '-' },
          ]}
        />
      </Card>
    </div>
  )

  const promptManagementTab = (
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

      {/* A/B 测试配置 */}
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

      {/* Prompt 业务关联映射 */}
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
            { title: '使用次数', dataIndex: 'usageCount', key: 'usageCount', sorter: (a: any, b: any) => a.usageCount - b.usageCount },
          ]}
        />
      </Card>

      {/* 使用统计 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="使用量趋势" className={`${styles.card} ${styles.usageStatsCard}`}>
            <div className={styles.chartContainer}>
              <Column
                data={promptUsageStats}
                xField="time"
                yField="calls"
                color={CHART_COLORS[1]}
                xAxis={{ label: { style: { fill: CHART_LABEL_COLOR } } }}
                yAxis={{ label: { style: { fill: CHART_LABEL_COLOR } } }}
                containerStyle={{ height: 300 }}
              />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="成功率趋势" className={`${styles.card} ${styles.usageStatsCard}`}>
            <div className={styles.chartContainer}>
              <Line
                data={promptUsageStats}
                xField="time"
                yField="successRate"
                smooth
                color={STATUS_COLORS.success}
                point={{ size: 3, shape: 'circle' }}
                xAxis={{ label: { style: { fill: CHART_LABEL_COLOR } } }}
                yAxis={{ label: { style: { fill: CHART_LABEL_COLOR } } }}
                containerStyle={{ height: 300 }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 灰度发布配置 */}
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

      {/* Prompt 评测结果 */}
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

      {/* 版本对比按钮 */}
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
          {architectureTab}
        </TabPane>
        <TabPane tab={<span><GatewayOutlined />LLM 网关</span>} key="llm-gateway">
          {llmGatewayTab}
        </TabPane>
        <TabPane tab={<span><ApiOutlined />工作流引擎</span>} key="workflow-engine">
          {workflowEngineTab}
        </TabPane>
        <TabPane tab={<span><DatabaseOutlined />RAG 服务</span>} key="rag-service">
          {ragServiceTab}
        </TabPane>
        <TabPane tab={<span><FileTextOutlined />Prompt 管理</span>} key="prompt-management">
          {promptManagementTab}
        </TabPane>
      </Tabs>

      {/* Agent 详情弹窗 */}
      <Modal
        title="Agent 详细信息"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedAgent && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Agent ID" span={2}>{selectedAgent.id}</Descriptions.Item>
            <Descriptions.Item label="Agent 名称" span={2}>{selectedAgent.name}</Descriptions.Item>
            <Descriptions.Item label="使用模型">{selectedAgent.modelName}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedAgent.status === 'online' ? 'success' : 'error'}>
                {selectedAgent.status === 'online' ? '在线' : '离线'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="权重">{selectedAgent.weight}</Descriptions.Item>
            <Descriptions.Item label="类型">{selectedAgent.type === 'master' ? 'Master' : 'Worker'}</Descriptions.Item>
            <Descriptions.Item label="负责模块" span={2}>
              {selectedAgent.businessModules?.map((module, idx) => (
                <Tag key={idx} color={businessModuleColors[module]}>
                  {module}
                </Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="页面映射" span={2}>
              {selectedAgent.routeMapping?.map((route, idx) => (
                <div key={idx} className={styles.routeItemMargin}>
                  <a href={route.path}>{route.label}</a> <code>{route.path}</code>
                </div>
              ))}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Workflow 可视化弹窗 */}
      <Modal
        title={`Workflow 流程: ${selectedWorkflow?.name || ''}`}
        open={workflowModalVisible}
        onCancel={() => setWorkflowModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedWorkflow && (
          <div>
            <Alert
              message={`负责 Agent: ${selectedWorkflow.agent}`}
              type="info"
              showIcon
              className={styles.alertMargin}
            />
            <Table
              dataSource={selectedWorkflow.nodes}
              rowKey="id"
              columns={[
                { title: '节点', dataIndex: 'label', key: 'label' },
                {
                  title: '类型',
                  dataIndex: 'type',
                  key: 'type',
                  render: (type: string) => (
                    <Tag color={type === 'ai' ? 'purple' : type === 'rule' ? 'blue' : 'green'}>
                      {type === 'ai' ? 'AI' : type === 'rule' ? '规则' : '数据'}
                    </Tag>
                  )
                },
                { title: '模型', dataIndex: ['ai', 'model'], key: 'model' },
                { title: '输入', dataIndex: 'input', key: 'input' },
                { title: '输出', dataIndex: 'output', key: 'output' },
              ]}
              pagination={false}
            />
          </div>
        )}
      </Modal>

      {/* Prompt 编辑弹窗 */}
      <Modal
        title={`Prompt 详情: ${selectedPrompt?.name || ''}`}
        open={promptEditModalVisible}
        onCancel={() => setPromptEditModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPromptEditModalVisible(false)}>关闭</Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => { setPromptEditModalVisible(false); if (selectedPrompt) handleEditPrompt(selectedPrompt) }}>编辑</Button>,
        ]}
        width={700}
      >
        {selectedPrompt && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Prompt ID">{selectedPrompt.id}</Descriptions.Item>
              <Descriptions.Item label="版本">{selectedPrompt.version}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge status={getStatusColor(selectedPrompt.status) as any} text={getStatusText(selectedPrompt.status)} />
              </Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedPrompt.creator}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{selectedPrompt.updatedAt}</Descriptions.Item>
              <Descriptions.Item label="使用次数">{selectedPrompt.usageCount}</Descriptions.Item>
              <Descriptions.Item label="成功率">
                {selectedPrompt.successRate}%
              </Descriptions.Item>
            </Descriptions>
            <Divider>Prompt 内容</Divider>
            <TextArea
              rows={8}
              value={selectedPrompt.content}
              readOnly
              className={styles.promptContent}
            />
          </div>
        )}
      </Modal>

      {/* 路由规则 Modal */}
      <Modal
        title={editingRouteRuleIndex !== null ? '编辑路由规则' : '添加路由规则'}
        open={routeRuleModalVisible}
        onOk={handleSaveRouteRule}
        onCancel={() => setRouteRuleModalVisible(false)}
      >
        <Form form={routeRuleForm} layout="vertical">
          <Form.Item label="匹配模式" name="pattern" rules={[{ required: true, message: '请输入匹配模式' }]}>
            <Input placeholder="如：classification、generation、embedding" />
          </Form.Item>
          <Form.Item label="目标模型" name="model" rules={[{ required: true, message: '请选择模型' }]}>
            <Select>
              <Select.Option value="gpt-4-turbo">GPT-4 Turbo</Select.Option>
              <Select.Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Select.Option>
              <Select.Option value="claude-3-sonnet">Claude 3 Sonnet</Select.Option>
              <Select.Option value="claude-3-haiku">Claude 3 Haiku</Select.Option>
              <Select.Option value="text-embedding-3-large">text-embedding-3-large</Select.Option>
              <Select.Option value="qwen-turbo">通义千问 Turbo</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 工作流配置 Modal */}
      <Modal
        title={`配置工作流：${selectedEngineForConfig?.name || ''}`}
        open={wfConfigModalVisible}
        onOk={() => {
          const formValues = (document.getElementById('wf-config-form') as HTMLFormElement)
          if (formValues) formValues.requestSubmit()
        }}
        onCancel={() => setWfConfigModalVisible(false)}
        width={800}
        okText="保存配置"
        cancelText="取消"
      >
        <Form
          layout="vertical"
          initialValues={selectedEngineForConfig ? {
            name: selectedEngineForConfig.name,
            type: selectedEngineForConfig.type,
            endpoint: selectedEngineForConfig.endpoint,
            version: selectedEngineForConfig.version,
            description: selectedEngineForConfig.description,
            apiKey: selectedEngineForConfig.apiKey,
            connectTimeout: selectedEngineForConfig.connectTimeout,
            requestTimeout: selectedEngineForConfig.requestTimeout,
            maxConcurrency: selectedEngineForConfig.maxConcurrency,
            retryCount: selectedEngineForConfig.retryCount,
            retryInterval: selectedEngineForConfig.retryInterval,
            logLevel: selectedEngineForConfig.logLevel,
            timeoutStrategy: selectedEngineForConfig.timeoutStrategy,
            maxExecutionTime: selectedEngineForConfig.maxExecutionTime,
            errorStrategy: selectedEngineForConfig.errorStrategy,
            promptVersion: selectedEngineForConfig.promptVersion,
            ragIndex: selectedEngineForConfig.ragIndex,
            ruleSet: selectedEngineForConfig.ruleSet,
            dataSource: selectedEngineForConfig.dataSource,
            ipWhitelist: selectedEngineForConfig.ipWhitelist?.join('\n'),
            authEnabled: selectedEngineForConfig.authEnabled,
            encryptionEnabled: selectedEngineForConfig.encryptionEnabled,
            auditEnabled: selectedEngineForConfig.auditEnabled,
          } : {}}
          onFinish={(values) => {
            handleSaveWorkflowConfig(values)
          }}
          id="wf-config-form"
        >
          {selectedEngineForConfig && (
            <Alert
              message="参数变更影响范围"
              description={
                <div className={styles.impactAlertContent}>
                  <div>影响业务模块：{getWorkflowImpactInfo(selectedEngineForConfig.id).moduleNames.join('、') || '无'}</div>
                  <div>每日调用量：~{getWorkflowImpactInfo(selectedEngineForConfig.id).dailyCalls * 50} 次</div>
                  <div>当前成功率：{getWorkflowImpactInfo(selectedEngineForConfig.id).successRate}</div>
                </div>
              }
              type="warning"
              icon={<WarningOutlined />}
              showIcon
              className={styles.alertMargin}
            />
          )}

          <Card title="关联业务模块" size="small" className={styles.modalSubCard}>
            <Space direction="vertical" size="small" className={styles.fullWidth}>
              {selectedEngineForConfig && businessMappings
                .filter(m => m.workflowId === selectedEngineForConfig.id)
                .map(mapping => (
                  <div key={mapping.moduleId} className={styles.modalRelatedModule}>
                    <Space>
                      <span>{mapping.icon}</span>
                      <strong>{mapping.moduleId}</strong>
                      <span>{mapping.moduleName}</span>
                      <Tag color="blue" className={styles.modalRouteTag}>{mapping.routePath}</Tag>
                    </Space>
                    <div className={styles.modalRelatedModuleDetail}>
                      使用 Prompt: {promptVersions.find(p => p.id === mapping.promptId)?.name || '-'} | 
                      RAG 索引: {mapping.ragIndexId || '-'}
                    </div>
                  </div>
                ))
              }
              {selectedEngineForConfig && businessMappings.filter(m => m.workflowId === selectedEngineForConfig.id).length === 0 && (
                <Empty description="暂无关联业务模块" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Space>
          </Card>

          <Divider orientation="left">基础配置</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="工作流名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="引擎类型" name="type">
                <Select disabled>
                  <Select.Option value="dify">Dify</Select.Option>
                  <Select.Option value="coze">Coze</Select.Option>
                  <Select.Option value="n8n">n8n</Select.Option>
                  <Select.Option value="custom">Custom</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="版本" name="version">
                <Input placeholder="v1.0.0" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="描述说明" name="description">
            <TextArea rows={2} placeholder="工作流的功能描述" />
          </Form.Item>
          <Form.Item label="端点地址" name="endpoint" rules={[{ required: true, message: '请输入端点地址' }]}>
            <Input placeholder="https://dify.example.com/v1" />
          </Form.Item>

          {/* Dify 专用字段 */}
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
            {({ getFieldValue }) =>
              getFieldValue('type') === 'dify' && (
                <>
                  <Divider orientation="left">Dify 专用配置</Divider>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Dify 工作流 ID" name="difyWorkflowId" rules={[{ required: true, message: '请输入 Dify 工作流 ID' }]}>
                        <Input placeholder="wf-inquiry-classification" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="响应模式" name="responseMode" initialValue="blocking">
                        <Select>
                          <Select.Option value="blocking">同步（阻塞等待结果）</Select.Option>
                          <Select.Option value="streaming">流式（实时返回中间结果）</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="用户上下文前缀" name="userContextPrefix" initialValue="prod_">
                        <Input placeholder="prod_" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="文件上传支持" name="fileUploadEnabled" valuePropName="checked" initialValue={false}>
                        <Switch checkedChildren="开" unCheckedChildren="关" />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )
            }
          </Form.Item>

          {/* Coze 专用字段 */}
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
            {({ getFieldValue }) =>
              getFieldValue('type') === 'coze' && (
                <>
                  <Divider orientation="left">Coze 专用配置</Divider>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Coze 工作流 ID" name="cozeWorkflowId" rules={[{ required: true, message: '请输入 Coze 工作流 ID' }]}>
                        <Input placeholder="wf_123456789" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Coze 应用 ID" name="cozeAppId" rules={[{ required: true, message: '请输入 Coze 应用 ID' }]}>
                        <Input placeholder="app_987654321" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="执行模式" name="cozeExecuteMode" initialValue="RELEASE">
                        <Select>
                          <Select.Option value="RELEASE">正式环境</Select.Option>
                          <Select.Option value="DEBUG">调试模式</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="渠道 ID" name="cozeConnectorId" initialValue="1024">
                        <Input placeholder="1024" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="参数格式" name="parametersFormat" initialValue="json_string">
                        <Select>
                          <Select.Option value="json_string">JSON 字符串</Select.Option>
                          <Select.Option value="json_object">JSON 对象</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="智能体 ID (ChatFlow 需要)" name="cozeBotId">
                    <Input placeholder="bot_001 (可选)" />
                  </Form.Item>
                </>
              )
            }
          </Form.Item>

          {/* n8n 专用字段 */}
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
            {({ getFieldValue }) =>
              getFieldValue('type') === 'n8n' && (
                <>
                  <Divider orientation="left">n8n 专用配置</Divider>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="n8n 工作流 ID" name="n8nWorkflowId" rules={[{ required: true, message: '请输入 n8n 工作流 ID' }]}>
                        <Input placeholder="abc123def456" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Webhook 路径" name="n8nWebhookPath" rules={[{ required: true, message: '请输入 Webhook 路径' }]}>
                        <Input placeholder="/webhook/workflow-xxx" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="认证方式" name="n8nAuthMethod" initialValue="none">
                    <Select>
                      <Select.Option value="none">无认证</Select.Option>
                      <Select.Option value="basic">Basic 认证</Select.Option>
                      <Select.Option value="header">Header 认证</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item noStyle shouldUpdate={(prev, curr) => prev.n8nAuthMethod !== curr.n8nAuthMethod}>
                    {({ getFieldValue }) =>
                      getFieldValue('n8nAuthMethod') === 'basic' && (
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item label="用户名" name="n8nAuthUsername">
                              <Input placeholder="api-user" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="密码" name="n8nAuthPassword">
                              <Input.Password placeholder="****" />
                            </Form.Item>
                          </Col>
                        </Row>
                      )
                    }
                  </Form.Item>
                  <Form.Item noStyle shouldUpdate={(prev, curr) => prev.n8nAuthMethod !== curr.n8nAuthMethod}>
                    {({ getFieldValue }) =>
                      getFieldValue('n8nAuthMethod') === 'header' && (
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item label="Header 名称" name="n8nAuthHeaderName">
                              <Input placeholder="X-API-KEY" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Header 值" name="n8nAuthHeaderValue">
                              <Input.Password placeholder="****" />
                            </Form.Item>
                          </Col>
                        </Row>
                      )
                    }
                  </Form.Item>
                </>
              )
            }
          </Form.Item>

          {/* Custom 专用字段 */}
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
            {({ getFieldValue }) =>
              getFieldValue('type') === 'custom' && (
                <>
                  <Divider orientation="left">Custom 专用配置</Divider>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="HTTP 方法" name="customRequestMethod" initialValue="POST">
                        <Select>
                          <Select.Option value="GET">GET</Select.Option>
                          <Select.Option value="POST">POST</Select.Option>
                          <Select.Option value="PUT">PUT</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="请求格式" name="customRequestFormat" initialValue="json">
                        <Select>
                          <Select.Option value="json">JSON</Select.Option>
                          <Select.Option value="xml">XML</Select.Option>
                          <Select.Option value="form">Form</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="响应格式" name="customResponseFormat" initialValue="json">
                        <Select>
                          <Select.Option value="json">JSON</Select.Option>
                          <Select.Option value="xml">XML</Select.Option>
                          <Select.Option value="text">Text</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="自定义请求头 (JSON 格式)" name="customHeaders">
                    <TextArea rows={2} placeholder='{"X-Tenant-ID": "default"}' />
                  </Form.Item>
                  <Form.Item label="请求体模板" name="customRequestBodyTemplate">
                    <TextArea rows={3} placeholder='{"rules": ["{{ruleSet}}"], "data": {{inputData}}}' />
                  </Form.Item>
                </>
              )
            }
          </Form.Item>

          <Divider orientation="left">连接配置</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="API Key" name="apiKey">
                <Input.Password placeholder="sk-xxxx-xxxx" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="连接超时(秒)" name="connectTimeout">
                <InputNumber min={1} max={60} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="请求超时(秒)" name="requestTimeout">
                <InputNumber min={1} max={300} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="最大并发数" name="maxConcurrency">
                <InputNumber min={1} max={100} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="重试次数" name="retryCount">
                <InputNumber min={0} max={10} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="重试间隔(秒)" name="retryInterval">
                <InputNumber min={1} max={30} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">运行配置</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="日志级别" name="logLevel">
                <Select>
                  <Select.Option value="DEBUG">DEBUG</Select.Option>
                  <Select.Option value="INFO">INFO</Select.Option>
                  <Select.Option value="WARN">WARN</Select.Option>
                  <Select.Option value="ERROR">ERROR</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="超时策略" name="timeoutStrategy">
                <Select>
                  <Select.Option value="terminate">终止</Select.Option>
                  <Select.Option value="continue">继续</Select.Option>
                  <Select.Option value="warn">告警</Select.Option>
                  <Select.Option value="retry">重试</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="最大执行时间(秒)" name="maxExecutionTime">
                <InputNumber min={1} max={600} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="错误处理策略" name="errorStrategy">
                <Select>
                  <Select.Option value="skip">跳过</Select.Option>
                  <Select.Option value="terminate">终止</Select.Option>
                  <Select.Option value="retry">重试</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">关联配置</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="关联 Prompt 版本" name="promptVersion">
                <Input placeholder="v1.0.0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="关联 RAG 索引" name="ragIndex">
                <Input placeholder="idx-xxx" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="关联规则集" name="ruleSet">
                <Input placeholder="RULE-100" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="数据源" name="dataSource">
            <Input placeholder="MySQL-Primary / API / 文件路径" />
          </Form.Item>

          <Divider orientation="left">安全配置</Divider>
          <Form.Item label="IP 白名单" name="ipWhitelist">
            <TextArea rows={2} placeholder="每行一个 IP 或 IP 段" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="请求鉴权" name="authEnabled" valuePropName="checked">
                <Switch checkedChildren="开" unCheckedChildren="关" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="数据加密" name="encryptionEnabled" valuePropName="checked">
                <Switch checkedChildren="开" unCheckedChildren="关" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="审计日志" name="auditEnabled" valuePropName="checked">
                <Switch checkedChildren="开" unCheckedChildren="关" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 工作流日志 Modal */}
      <Modal
        title={`工作流日志 - ${selectedEngineForLogs?.name || ''}`}
        open={wfLogsModalVisible}
        onCancel={() => setWfLogsModalVisible(false)}
        footer={<Button onClick={() => setWfLogsModalVisible(false)}>关闭</Button>}
        width={800}
      >
        <Table
          dataSource={[
            { id: 1, time: '2026-04-19 22:01:15', level: 'INFO', message: '工作流启动成功', node: '初始化' },
            { id: 2, time: '2026-04-19 22:01:18', level: 'INFO', message: '数据拉取完成，共 156 条记录', node: '数据节点' },
            { id: 3, time: '2026-04-19 22:01:22', level: 'WARN', message: 'AI 响应延迟 3.2s', node: 'AI 推理' },
            { id: 4, time: '2026-04-19 22:01:25', level: 'INFO', message: '规则校验通过', node: '规则引擎' },
            { id: 5, time: '2026-04-19 22:01:30', level: 'INFO', message: '工作流执行完成', node: '完成' },
          ]}
          rowKey="id"
          columns={[
            { title: '时间', dataIndex: 'time', key: 'time', width: 180 },
            { title: '级别', dataIndex: 'level', key: 'level', width: 70, render: (l: string) => <Tag color={l === 'INFO' ? 'blue' : l === 'WARN' ? 'orange' : 'red'}>{l}</Tag> },
            { title: '节点', dataIndex: 'node', key: 'node', width: 100 },
            { title: '消息', dataIndex: 'message', key: 'message' },
          ]}
          pagination={false}
          size="small"
          scroll={{ y: 300 }}
        />
      </Modal>

      {/* 新增工作流 Modal */}
      <Modal
        title="新增工作流"
        open={wfCreateModalVisible}
        onCancel={() => setWfCreateModalVisible(false)}
        width={800}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={(values) => handleSaveNewWorkflow(values)}
        >
          <Divider orientation="left">基础配置</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="工作流名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
                <Input placeholder="如：询报价归类流程" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="引擎类型" name="type" rules={[{ required: true, message: '请选择类型' }]}>
                <Select>
                  <Select.Option value="dify">Dify</Select.Option>
                  <Select.Option value="coze">Coze</Select.Option>
                  <Select.Option value="n8n">n8n</Select.Option>
                  <Select.Option value="custom">Custom</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="版本" name="version" initialValue="v1.0.0">
                <Input placeholder="v1.0.0" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="描述说明" name="description">
            <TextArea rows={2} placeholder="工作流的功能描述" />
          </Form.Item>
          <Form.Item label="端点地址" name="endpoint" rules={[{ required: true, message: '请输入端点地址' }]}>
            <Input placeholder="https://dify.example.com/v1" />
          </Form.Item>

          <Divider orientation="left">连接配置</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="API Key" name="apiKey">
                <Input.Password placeholder="sk-xxxx-xxxx" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="连接超时(秒)" name="connectTimeout" initialValue={10}>
                <InputNumber min={1} max={60} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="请求超时(秒)" name="requestTimeout" initialValue={60}>
                <InputNumber min={1} max={300} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="最大并发数" name="maxConcurrency" initialValue={10}>
                <InputNumber min={1} max={100} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="重试次数" name="retryCount" initialValue={3}>
                <InputNumber min={0} max={10} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="重试间隔(秒)" name="retryInterval" initialValue={2}>
                <InputNumber min={1} max={30} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">运行配置</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="日志级别" name="logLevel" initialValue="INFO">
                <Select>
                  <Select.Option value="DEBUG">DEBUG</Select.Option>
                  <Select.Option value="INFO">INFO</Select.Option>
                  <Select.Option value="WARN">WARN</Select.Option>
                  <Select.Option value="ERROR">ERROR</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="超时策略" name="timeoutStrategy" initialValue="retry">
                <Select>
                  <Select.Option value="terminate">终止</Select.Option>
                  <Select.Option value="continue">继续</Select.Option>
                  <Select.Option value="warn">告警</Select.Option>
                  <Select.Option value="retry">重试</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="最大执行时间(秒)" name="maxExecutionTime" initialValue={120}>
                <InputNumber min={1} max={600} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="错误处理策略" name="errorStrategy" initialValue="retry">
                <Select>
                  <Select.Option value="skip">跳过</Select.Option>
                  <Select.Option value="terminate">终止</Select.Option>
                  <Select.Option value="retry">重试</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">关联配置</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="关联 Prompt 版本" name="promptVersion">
                <Input placeholder="v1.0.0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="关联 RAG 索引" name="ragIndex">
                <Input placeholder="idx-xxx" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="关联规则集" name="ruleSet">
                <Input placeholder="RULE-100" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="数据源" name="dataSource">
            <Input placeholder="MySQL-Primary / API / 文件路径" />
          </Form.Item>

          <Divider orientation="left">安全配置</Divider>
          <Form.Item label="IP 白名单" name="ipWhitelist">
            <TextArea rows={2} placeholder="每行一个 IP 或 IP 段" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="请求鉴权" name="authEnabled" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="开" unCheckedChildren="关" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="数据加密" name="encryptionEnabled" valuePropName="checked">
                <Switch checkedChildren="开" unCheckedChildren="关" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="审计日志" name="auditEnabled" valuePropName="checked">
                <Switch checkedChildren="开" unCheckedChildren="关" />
              </Form.Item>
            </Col>
          </Row>

          <div className={styles.formFooter}>
            <Button onClick={() => setWfCreateModalVisible(false)} className={styles.cancelButton}>取消</Button>
            <Button type="primary" htmlType="submit">创建工作流</Button>
          </div>
        </Form>
      </Modal>

      {/* 新建 Prompt Modal */}
      <Modal
        title="新建 Prompt"
        open={promptCreateModalVisible}
        onOk={handleSaveNewPrompt}
        onCancel={() => setPromptCreateModalVisible(false)}
        width={700}
      >
        <Form form={promptCreateForm} layout="vertical">
          <Form.Item label="Prompt 名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：询报价分类 Prompt" />
          </Form.Item>
          <Form.Item label="Prompt 内容" name="content" rules={[{ required: true, message: '请输入内容' }]}>
            <TextArea rows={10} placeholder="请输入 Prompt 模板内容..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Prompt 编辑 Modal */}
      <Modal
        title="编辑 Prompt"
        open={promptEditFormVisible}
        onOk={handleSavePromptEdit}
        onCancel={() => setPromptEditFormVisible(false)}
        width={700}
      >
        <Form form={promptEditForm} layout="vertical">
          <Form.Item label="Prompt 名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="Prompt 名称" />
          </Form.Item>
          <Form.Item label="版本号" name="version" rules={[{ required: true, message: '请输入版本号' }]}>
            <Input placeholder="如：v1.0.1" />
          </Form.Item>
          <Form.Item label="Prompt 内容" name="content" rules={[{ required: true, message: '请输入内容' }]}>
            <TextArea rows={12} placeholder="请输入 Prompt 模板内容..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 版本对比 Modal */}
      <Modal
        title="Prompt 版本对比"
        open={versionCompareModalVisible}
        onCancel={() => setVersionCompareModalVisible(false)}
        footer={<Button onClick={() => setVersionCompareModalVisible(false)}>关闭</Button>}
        width={1200}
      >
        {compareVersions.left && compareVersions.right && (
          <div className={styles.versionDiffContainer}>
            <div className={styles.versionPanel}>
              <div className={styles.versionPanelHeader}>
                <span className={styles.versionPanelTitle}>{compareVersions.left.name} ({compareVersions.left.version})</span>
                <Tag color="blue">旧版本</Tag>
              </div>
              <div className={styles.versionContent}>
                {compareVersions.left.content}
              </div>
            </div>
            <div className={styles.versionPanel}>
              <div className={styles.versionPanelHeader}>
                <span className={styles.versionPanelTitle}>{compareVersions.right.name} ({compareVersions.right.version})</span>
                <Tag color="green">新版本</Tag>
              </div>
              <div className={styles.versionContent}>
                {compareVersions.right.content}
              </div>
            </div>
          </div>
        )}
        <Alert
          message="差异说明"
          description="绿色背景表示新增内容，红色背景表示删除内容。实际diff功能需要后端支持。"
          type="info"
          showIcon
          className={styles.alertMarginTop}
        />
      </Modal>
    </div>
  )
}
