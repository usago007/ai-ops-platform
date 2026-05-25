export interface AgentNode {
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

export interface Edge {
  from: string
  to: string
  label: string
}

export interface TopologyData {
  nodes: AgentNode[]
  edges: Edge[]
}

export interface WorkflowNode {
  id: string
  label: string
  type: 'ai' | 'rule' | 'data'
  ai: { model: string; temperature: number; prompt: string } | null
  input: string
  output: string
}

export interface Workflow {
  name: string
  agent: string
  nodes: WorkflowNode[]
}

export interface LLMGatewayConfig {
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

export interface WorkflowEngine {
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
  difyWorkflowId?: string
  responseMode?: 'blocking' | 'streaming'
  userContextPrefix?: string
  fileUploadEnabled?: boolean
  cozeWorkflowId?: string
  cozeAppId?: string
  cozeBotId?: string
  cozeExecuteMode?: 'RELEASE' | 'DEBUG'
  cozeConnectorId?: string
  parametersFormat?: 'json_string' | 'json_object'
  n8nWorkflowId?: string
  n8nWebhookPath?: string
  n8nAuthMethod?: 'none' | 'basic' | 'header'
  n8nAuthUsername?: string
  n8nAuthPassword?: string
  n8nAuthHeaderName?: string
  n8nAuthHeaderValue?: string
  customRequestMethod?: 'GET' | 'POST' | 'PUT'
  customRequestFormat?: 'json' | 'xml' | 'form'
  customResponseFormat?: 'json' | 'xml' | 'text'
  customHeaders?: Record<string, string>
  customRequestBodyTemplate?: string
}

export interface RAGService {
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

export interface PromptVersion {
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

export interface HealthStatus {
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

export interface BusinessMapping {
  moduleId: string
  moduleName: string
  icon: string
  workflowId?: string
  promptId?: string
  ragIndexId?: string
  routePath: string
}

export interface TrafficDistribution {
  model: string
  calls: number
  percentage: number
  cost: number
  avgLatency: number
}

export interface ApiKeyItem {
  id: string
  key: string
  status: 'active' | 'disabled' | 'expired'
  usageCount: number
  lastUsed: string
  rotationPolicy: 'manual' | 'auto'
}

export interface RequestLog {
  id: string
  timestamp: string
  method: string
  endpoint: string
  model: string
  status: 'success' | 'error'
  latency: number
  tokens: number
}

export interface WorkflowExecution {
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

export interface WorkflowTrigger {
  id: string
  workflowId: string
  type: 'manual' | 'scheduled' | 'event'
  name: string
  schedule?: string
  event?: string
  enabled: boolean
}

export interface WorkflowTemplate {
  id: string
  name: string
  icon: string
  description: string
  category: string
  presetConfig: Partial<WorkflowEngine>
}

export interface RagIndex {
  id: string
  name: string
  status: 'active' | 'building' | 'error'
  documentCount: number
  vectorCount: number
  lastUpdated: string
  businessModule: string
  embeddingModel: string
}

export interface RetrievalMetrics {
  accuracy: number
  recall: number
  avgLatency: number
  trend: Array<{ day: string; accuracy: number; recall: number }>
}

export interface DocumentHistory {
  id: string
  name: string
  type: string
  status: 'completed' | 'processing' | 'failed'
  chunks: number
  uploadedAt: string
  processedAt?: string
}

export interface ABTest {
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

export interface PromptBusinessMapping {
  promptId: string
  promptName: string
  workflows: string[]
  modules: string[]
  usageCount: number
}

export interface CanaryConfig {
  promptId: string
  promptName: string
  currentVersion: string
  canaryVersion: string
  canaryPercent: number
  autoRollbackThreshold: number
  status: 'inactive' | 'canary' | 'rolling' | 'completed'
}

export interface UsageStat {
  time: string
  calls: number
  successRate: number
}

export interface PromptEvaluation {
  id: string
  promptId: string
  promptName: string
  evaluator: string
  score: number
  comment: string
  evaluatedAt: string
  type: 'manual' | 'auto'
}

export const businessModuleColors: Record<string, string> = {
  'BIZ-001': 'blue',
  'BIZ-002': 'green',
  'BIZ-003': 'orange',
  'BIZ-004': 'purple',
  'MKT-001': 'red',
  'MKT-002': 'magenta',
  'MKT-003': 'volcano',
  'MKT-004': 'geekblue',
}

export const workflowEngineIcons: Record<string, string> = {
  dify: '\uD83D\uDD35',
  coze: '\uD83D\uDFE2',
  n8n: '\uD83D\uDFE0',
  custom: '\u26AB',
}

export function getStatusColor(status: string) {
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

export function getStatusText(status: string) {
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
