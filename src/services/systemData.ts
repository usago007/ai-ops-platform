export interface SystemSettings {
  performance: {
    aiTimeout: number
    maxConcurrent: number
    apiRateLimit: number
  }
  security: {
    dataMasking: boolean
    keyRotationDays: number
    ipWhitelist: string[]
  }
  business: {
    classificationThreshold: number
    productQualityThreshold: number
  }
  environment: string
  language: string
}

export interface ComplianceWordsData {
  forbidden: string[]
  extreme: string[]
  sensitive: string[]
  total: number
}

export interface NotificationTemplate {
  id: string
  type: string
  name: string
  enabled: boolean
  recipients?: string[]
  url?: string
}

export interface SystemUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastLogin: string
}

export interface RolePermission {
  id: string
  name: string
  permissions: Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean }>
}

let settings: SystemSettings = {
  performance: {
    aiTimeout: 3000,
    maxConcurrent: 50,
    apiRateLimit: 1000,
  },
  security: {
    dataMasking: true,
    keyRotationDays: 90,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
  },
  business: {
    classificationThreshold: 0.92,
    productQualityThreshold: 60,
  },
  environment: 'development',
  language: 'zh-CN',
}

let complianceWords: ComplianceWordsData = {
  forbidden: ['最优惠', '第一', '顶级', '唯一', '绝对', '100%', '国家级', '全球首发'],
  extreme: ['最好', '最强', '最大', '最便宜', '第一品牌', '全网最低', '独家'],
  sensitive: ['疗效', '治愈', '无副作用', '保本', '稳赚'],
  total: 19,
}

let notifications: NotificationTemplate[] = [
  { id: 'ntf-1', type: 'email', name: 'AI 归类异常通知', enabled: true, recipients: ['admin@company.com'] },
  { id: 'ntf-2', type: 'sms', name: '系统性能告警', enabled: false, recipients: ['138****1234'] },
  { id: 'ntf-3', type: 'webhook', name: 'Agent 状态变更', enabled: true, url: 'https://hooks.example.com/notify' },
  { id: 'ntf-4', type: 'email', name: '合规检测违规通知', enabled: true, recipients: ['compliance@company.com'] },
]

let users: SystemUser[] = [
  { id: 'user-1', name: '陈明远', email: 'zhangsan@company.com', role: 'admin', status: 'active', lastLogin: '2026-04-17 09:30:00' },
  { id: 'user-2', name: '林晓峰', email: 'lisi@company.com', role: 'operator', status: 'active', lastLogin: '2026-04-17 08:45:00' },
  { id: 'user-3', name: '周思琪', email: 'wangwu@company.com', role: 'viewer', status: 'inactive', lastLogin: '2026-04-16 16:20:00' },
]

const roles: RolePermission[] = [
  {
    id: 'admin',
    name: '系统管理员',
    permissions: {
      inquiry: { create: true, read: true, update: true, delete: true },
      product: { create: true, read: true, update: true, delete: true },
      rules: { create: true, read: true, update: true, delete: true },
      marketing: { create: true, read: true, update: true, delete: true },
      system: { create: true, read: true, update: true, delete: true },
    },
  },
  {
    id: 'operator',
    name: '操作员',
    permissions: {
      inquiry: { create: true, read: true, update: true, delete: false },
      product: { create: true, read: true, update: true, delete: false },
      rules: { create: false, read: true, update: true, delete: false },
      marketing: { create: true, read: true, update: true, delete: false },
      system: { create: false, read: true, update: false, delete: false },
    },
  },
  {
    id: 'viewer',
    name: '只读用户',
    permissions: {
      inquiry: { create: false, read: true, update: false, delete: false },
      product: { create: false, read: true, update: false, delete: false },
      rules: { create: false, read: true, update: false, delete: false },
      marketing: { create: false, read: true, update: false, delete: false },
      system: { create: false, read: true, update: false, delete: false },
    },
  },
]

const health = {
  apiLatency: { p95: 1200, p99: 2800 },
  successRate: 97.6,
  qps: 45,
  activeAgents: 4,
  totalAgents: 5,
  uptime: '99.5%',
  lastDeploy: '2026-04-17 02:00:00',
}

let agentsTopology = {
  nodes: [
    { id: 'orchestrator', name: 'Orchestrator Agent', status: 'online', type: 'master', weight: 100, model: 'qwen-max', modelName: '通义千问 Max', businessModules: ['全局调度'], routeMapping: [] },
    { id: 'shell', name: 'Shell Agent', status: 'online', type: 'worker', weight: 80, model: 'claude-3', modelName: 'Claude 3 Sonnet', businessModules: ['基础设施'], routeMapping: [] },
    { id: 'bizui-1', name: 'BizUI Agent-1', status: 'online', type: 'worker', weight: 85, model: 'gpt-4', modelName: 'GPT-4 Turbo', businessModules: ['BIZ-001', 'BIZ-002'], routeMapping: [{ label: '询报价归类', path: '/inquiry/list' }, { label: '商品列表', path: '/product/list' }] },
    { id: 'bizui-2', name: 'BizUI Agent-2', status: 'offline', type: 'worker', weight: 70, model: 'gpt-4', modelName: 'GPT-4 Turbo', businessModules: ['BIZ-003', 'BIZ-004'], routeMapping: [{ label: '规则归纳', path: '/rules' }, { label: '客服工作台', path: '/cs/workspace' }] },
    { id: 'mktui', name: 'MktUI Agent', status: 'online', type: 'worker', weight: 90, model: 'claude-3', modelName: 'Claude 3 Sonnet', businessModules: ['MKT-001', 'MKT-002', 'MKT-003', 'MKT-004'], routeMapping: [{ label: '营销内容生成', path: '/marketing/create' }, { label: '卖点提炼', path: '/selling-point/SKU-1000' }, { label: '转化看板', path: '/conversion/dashboard' }] },
  ],
  edges: [
    { from: 'orchestrator', to: 'shell', label: '基础设施调度' },
    { from: 'orchestrator', to: 'bizui-1', label: '业务模块 Wave 1-2' },
    { from: 'orchestrator', to: 'bizui-2', label: '业务模块 Wave 3' },
    { from: 'orchestrator', to: 'mktui', label: '营销模块 Wave 4-5' },
  ],
}

const workflows = {
  'BIZ-001': { name: '询报价智能归类', agent: 'BizUI Agent-1', nodes: [{ id: 'biz-001-node-1', label: '文本解析', type: 'ai', ai: { model: 'GPT-4 Turbo' }, input: '询价文本', output: '结构化字段' }] },
  'BIZ-002': { name: '商品信息结构化', agent: 'BizUI Agent-1', nodes: [{ id: 'biz-002-node-1', label: '多源抓取', type: 'data', ai: null, input: '商品原始信息', output: '多源文本数据' }] },
  'BIZ-003': { name: '业务规则智能归纳', agent: 'BizUI Agent-2', nodes: [{ id: 'biz-003-node-1', label: '文档导入', type: 'data', ai: null, input: 'PDF/Word/Excel/邮件', output: '文档文本' }] },
  'BIZ-004': { name: '客服智能辅助', agent: 'BizUI Agent-2', nodes: [{ id: 'biz-004-node-1', label: '意图识别', type: 'ai', ai: { model: 'GPT-4 Turbo' }, input: '客户消息', output: '意图标签' }] },
  'MKT-001': { name: '营销内容智能生成', agent: 'MktUI Agent', nodes: [{ id: 'mkt-001-node-1', label: '场景配置', type: 'data', ai: null, input: '商品信息 + 目标人群 + 活动主题', output: '配置参数' }] },
  'MKT-002': { name: '商品卖点智能提炼', agent: 'MktUI Agent', nodes: [{ id: 'mkt-002-node-1', label: '多源数据分析', type: 'data', ai: null, input: 'SPU 属性 + 买家评论 + 竞品数据', output: '分析数据' }] },
  'MKT-003': { name: '客服响应优化（营销向）', agent: 'MktUI Agent', nodes: [{ id: 'mkt-003-node-1', label: '营销意图识别', type: 'ai', ai: { model: 'GPT-4 Turbo' }, input: '客户消息', output: '营销意图' }] },
  'MKT-004': { name: '流量承接与转化增强', agent: 'MktUI Agent', nodes: [{ id: 'mkt-004-node-1', label: '流量来源分析', type: 'data', ai: null, input: '流量来源 + 关键词 + 用户标签', output: '流量画像' }] },
}

const generateAuditLogs = () => {
  const actions = [
    { user: '陈明远', action: 'AI 归类手动修正', module: 'BIZ-001', result: 'success' },
    { user: '林晓峰', action: '商品属性批量确认', module: 'BIZ-002', result: 'success' },
    { user: '系统', action: '规则冲突自动检测', module: 'BIZ-003', result: 'warning' },
    { user: '周思琪', action: '营销内容生成', module: 'MKT-001', result: 'success' },
    { user: '系统管理员', action: '系统参数修改', module: 'SYS-003', result: 'success' },
  ]
  return Array.from({ length: 50 }, (_, i) => {
    const action = actions[i % actions.length]
    return {
      id: `log-${i + 1}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      user: action.user,
      action: action.action,
      module: action.module,
      result: action.result,
      duration: Math.floor(100 + Math.random() * 2000),
      details: `操作详情 ${i + 1}`,
    }
  })
}

const generateAuditTrailLogs = () => Array.from({ length: 30 }, (_, i) => ({
  id: `audit-${i + 1}`,
  timestamp: new Date(Date.now() - i * 7200000).toISOString(),
  user: ['陈明远', '林晓峰', '系统管理员', '系统'][i % 4],
  type: ['login', 'permission_change', 'config_change', 'data_export'][i % 4],
  description: [
    '用户登录成功 (IP: 192.168.1.100)',
    '将林晓峰角色从 operator 改为 viewer',
    '修改系统参数: aiTimeout 从 3000 改为 5000',
    '导出操作日志 CSV (50 条记录)',
  ][i % 4],
  ip: ['192.168.1.100', '10.0.0.5', '172.16.0.1'][i % 3],
}))

export const systemDataStore = {
  getSettings: () => ({ ...settings }),
  updateSettings: (data: Partial<SystemSettings>) => {
    settings = {
      ...settings,
      ...data,
      performance: { ...settings.performance, ...(data.performance || {}) },
      security: { ...settings.security, ...(data.security || {}), ipWhitelist: Array.isArray(data.security?.ipWhitelist) ? data.security.ipWhitelist : settings.security.ipWhitelist },
      business: { ...settings.business, ...(data.business || {}) },
    }
    return { updated: true, settings: { ...settings }, message: '系统参数已保存，立即生效' }
  },
  getComplianceWords: () => ({ ...complianceWords, forbidden: [...complianceWords.forbidden], extreme: [...complianceWords.extreme], sensitive: [...complianceWords.sensitive] }),
  addComplianceWord: (category: keyof Omit<ComplianceWordsData, 'total'>, word: string) => {
    complianceWords[category] = [...complianceWords[category], word]
    complianceWords.total = complianceWords.forbidden.length + complianceWords.extreme.length + complianceWords.sensitive.length
    return { ...complianceWords }
  },
  removeComplianceWord: (category: keyof Omit<ComplianceWordsData, 'total'>, word: string) => {
    complianceWords[category] = complianceWords[category].filter(item => item !== word)
    complianceWords.total = complianceWords.forbidden.length + complianceWords.extreme.length + complianceWords.sensitive.length
    return { ...complianceWords }
  },
  getNotifications: () => ({ templates: notifications.map(item => ({ ...item, recipients: item.recipients ? [...item.recipients] : undefined })) }),
  toggleNotification: (id: string, enabled: boolean) => {
    notifications = notifications.map(item => item.id === id ? { ...item, enabled } : item)
    return { templates: notifications.map(item => ({ ...item })), message: `通知模板已${enabled ? '启用' : '禁用'}` }
  },
  addNotification: (data: Omit<NotificationTemplate, 'id'>) => {
    const notification = { id: `ntf-${Date.now()}`, ...data }
    notifications = [...notifications, notification]
    return { templates: notifications.map(item => ({ ...item })), notification, message: '通知模板已添加' }
  },
  deleteNotification: (id: string) => {
    notifications = notifications.filter(item => item.id !== id)
    return { templates: notifications.map(item => ({ ...item })), message: '通知模板已删除' }
  },
  getUsers: () => ({ items: users.map(item => ({ ...item })), total: users.length }),
  getRoles: () => roles.map(item => ({ ...item, permissions: { ...item.permissions } })),
  updateUserRole: (id: string, role: string) => {
    users = users.map(item => item.id === id ? { ...item, role } : item)
    return { updated: true, role }
  },
  getHealth: () => ({ ...health, apiLatency: { ...health.apiLatency } }),
  getRecentActions: () => generateAuditLogs().slice(0, 10),
  getAuditLogs: (page = 1, pageSize = 10) => {
    const logs = generateAuditLogs()
    const start = (page - 1) * pageSize
    return { items: logs.slice(start, start + pageSize), total: logs.length, page, pageSize }
  },
  getAuditTrailLogs: (page = 1, pageSize = 10, keyword = '') => {
    const all = generateAuditTrailLogs().filter(item => !keyword || `${item.user} ${item.description} ${item.type}`.includes(keyword))
    const start = (page - 1) * pageSize
    return { items: all.slice(start, start + pageSize), total: all.length, page, pageSize }
  },
  exportAuditLogs: () => {
    const logs = generateAuditLogs()
    const rows = logs.map(item => `${item.timestamp},${item.user},${item.action},${item.module},${item.result}`)
    return `timestamp,user,action,module,result\n${rows.join('\n')}`
  },
  getTopology: () => ({ nodes: agentsTopology.nodes.map(item => ({ ...item, businessModules: [...item.businessModules], routeMapping: item.routeMapping.map(route => ({ ...route })) })), edges: agentsTopology.edges.map(item => ({ ...item })) }),
  toggleAgent: (id: string) => {
    agentsTopology = {
      ...agentsTopology,
      nodes: agentsTopology.nodes.map(item => item.id === id ? { ...item, status: item.status === 'online' ? 'offline' : 'online' } : item),
    }
    return { agentId: id, status: agentsTopology.nodes.find(item => item.id === id)?.status }
  },
  updateAgentWeight: (id: string, weight: number) => {
    agentsTopology = {
      ...agentsTopology,
      nodes: agentsTopology.nodes.map(item => item.id === id ? { ...item, weight } : item),
    }
    return { agentId: id, weight }
  },
  getWorkflows: () => ({ ...workflows }),
  getWorkflow: (moduleId: string) => workflows[moduleId as keyof typeof workflows],
}
