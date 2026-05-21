import { http, HttpResponse, delay } from 'msw'
import { mockAiDelay, mockConfidence, successResponse } from '../utils'

// Agent 拓扑数据 - 包含模型和业务场景映射
const agentsTopology = {
  nodes: [
    { 
      id: 'orchestrator', 
      name: 'Orchestrator Agent', 
      status: 'online', 
      type: 'master', 
      weight: 100,
      model: 'qwen-max',
      modelName: '通义千问 Max',
      businessModules: ['全局调度'],
      routeMapping: [],
    },
    { 
      id: 'shell', 
      name: 'Shell Agent', 
      status: 'online', 
      type: 'worker', 
      weight: 80,
      model: 'claude-3',
      modelName: 'Claude 3 Sonnet',
      businessModules: ['基础设施'],
      routeMapping: [],
    },
    { 
      id: 'bizui-1', 
      name: 'BizUI Agent-1', 
      status: 'online', 
      type: 'worker', 
      weight: 85,
      model: 'gpt-4',
      modelName: 'GPT-4 Turbo',
      businessModules: ['BIZ-001', 'BIZ-002'],
      routeMapping: [
        { label: '询报价归类', path: '/inquiry/list' },
        { label: '商品列表', path: '/product/list' },
        { label: '商品详情', path: '/product/1' },
      ],
    },
    { 
      id: 'bizui-2', 
      name: 'BizUI Agent-2', 
      status: 'offline', 
      type: 'worker', 
      weight: 70,
      model: 'gpt-4',
      modelName: 'GPT-4 Turbo',
      businessModules: ['BIZ-003', 'BIZ-004'],
      routeMapping: [
        { label: '规则归纳', path: '/rules' },
        { label: '客服工作台', path: '/cs/workspace' },
      ],
    },
    { 
      id: 'mktui', 
      name: 'MktUI Agent', 
      status: 'online', 
      type: 'worker', 
      weight: 90,
      model: 'claude-3',
      modelName: 'Claude 3 Sonnet',
      businessModules: ['MKT-001', 'MKT-002', 'MKT-003', 'MKT-004'],
      routeMapping: [
        { label: '营销内容生成', path: '/marketing/create' },
        { label: '卖点提炼', path: '/selling-point/1' },
        { label: '转化看板', path: '/conversion/dashboard' },
        { label: '落地页预览', path: '/landing-page/preview' },
      ],
    },
  ],
  edges: [
    { from: 'orchestrator', to: 'shell', label: '基础设施调度' },
    { from: 'orchestrator', to: 'bizui-1', label: '业务模块 Wave 1-2' },
    { from: 'orchestrator', to: 'bizui-2', label: '业务模块 Wave 3' },
    { from: 'orchestrator', to: 'mktui', label: '营销模块 Wave 4-5' },
  ],
}

// Workflow 节点数据
const workflowsData = {
  'BIZ-001': {
    name: '询报价智能归类',
    agent: 'BizUI Agent-1',
    nodes: [
      {
        id: 'biz-001-node-1',
        label: '文本解析',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0.3, prompt: '从询报价文本中提取品类、规格、数量、交期等关键字段' },
        input: '询价文本',
        output: '结构化字段',
      },
      {
        id: 'biz-001-node-2',
        label: '智能归类',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0.2, prompt: '根据品类知识图谱进行一级、二级类目自动打标' },
        input: '结构化字段',
        output: '类目标签',
      },
      {
        id: 'biz-001-node-3',
        label: '向量检索',
        type: 'ai',
        ai: { model: 'Embedding Model', temperature: 0, prompt: '将询价向量化后检索历史相似方案' },
        input: '类目标签',
        output: 'Top-3 相似方案',
      },
      {
        id: 'biz-001-node-4',
        label: '异常检测',
        type: 'rule',
        ai: null,
        input: '结构化字段',
        output: '风险标记',
      },
      {
        id: 'biz-001-node-5',
        label: '路由分配',
        type: 'rule',
        ai: null,
        input: '类目标签 + 风险标记',
        output: '业务组 + 报价模板',
      },
    ],
  },
  'BIZ-002': {
    name: '商品信息结构化',
    agent: 'BizUI Agent-1',
    nodes: [
      {
        id: 'biz-002-node-1',
        label: '多源抓取',
        type: 'data',
        ai: null,
        input: '商品原始信息',
        output: '多源文本数据',
      },
      {
        id: 'biz-002-node-2',
        label: 'OCR 识别',
        type: 'ai',
        ai: { model: 'GPT-4 Vision', temperature: 0, prompt: '从商品图片中提取文字信息' },
        input: '商品图片',
        output: 'OCR 文字',
      },
      {
        id: 'biz-002-node-3',
        label: 'AI 结构化提取',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0.3, prompt: '从文本中提取尺寸、重量、材质、颜色等标准属性' },
        input: '多源文本 + OCR 文字',
        output: '结构化属性',
      },
      {
        id: 'biz-002-node-4',
        label: '属性校验补全',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0.4, prompt: '校验属性完整性并建议补全缺失字段' },
        input: '结构化属性',
        output: '校验结果 + 补全建议',
      },
      {
        id: 'biz-002-node-5',
        label: '质量评分',
        type: 'rule',
        ai: null,
        input: '属性完整度',
        output: '质量分数 0-100',
      },
    ],
  },
  'BIZ-003': {
    name: '业务规则智能归纳',
    agent: 'BizUI Agent-2',
    nodes: [
      {
        id: 'biz-003-node-1',
        label: '文档导入',
        type: 'data',
        ai: null,
        input: 'PDF/Word/Excel/邮件',
        output: '文档文本',
      },
      {
        id: 'biz-003-node-2',
        label: '规则提取',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0.3, prompt: '从非结构化文档中提取 IF-THEN 规则性条款' },
        input: '文档文本',
        output: '候选规则',
      },
      {
        id: 'biz-003-node-3',
        label: '规则结构化',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0.2, prompt: '将提取的规则标准化为条件-动作结构' },
        input: '候选规则',
        output: '结构化规则',
      },
      {
        id: 'biz-003-node-4',
        label: '冲突检测',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0.1, prompt: '检测规则之间的重复和冲突' },
        input: '结构化规则',
        output: '冲突报告',
      },
      {
        id: 'biz-003-node-5',
        label: '版本管理',
        type: 'rule',
        ai: null,
        input: '结构化规则',
        output: '规则库版本',
      },
    ],
  },
  'BIZ-004': {
    name: '客服智能辅助',
    agent: 'BizUI Agent-2',
    nodes: [
      {
        id: 'biz-004-node-1',
        label: '意图识别',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0.1, prompt: '实时识别客户消息意图（询价/催单/投诉/修改需求）' },
        input: '客户消息',
        output: '意图标签',
      },
      {
        id: 'biz-004-node-2',
        label: '话术推荐',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0.7, prompt: '根据意图和上下文推荐 3-5 条候选回复话术' },
        input: '意图 + 上下文',
        output: '候选话术',
      },
      {
        id: 'biz-004-node-3',
        label: '单据聚合',
        type: 'data',
        ai: null,
        input: '客户 ID',
        output: '历史单据卡片',
      },
      {
        id: 'biz-004-node-4',
        label: '异常预警',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0.1, prompt: '识别客户情绪负面信号和高风险投诉' },
        input: '客户消息',
        output: '预警信号',
      },
      {
        id: 'biz-004-node-5',
        label: '对话摘要',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0.3, prompt: '生成结构化对话摘要并写入 CRM' },
        input: '完整对话',
        output: '结构化摘要',
      },
    ],
  },
  'MKT-001': {
    name: '营销内容智能生成',
    agent: 'MktUI Agent',
    nodes: [
      {
        id: 'mkt-001-node-1',
        label: '场景配置',
        type: 'data',
        ai: null,
        input: '商品信息 + 目标人群 + 活动主题',
        output: '配置参数',
      },
      {
        id: 'mkt-001-node-2',
        label: '内容生成',
        type: 'ai',
        ai: { model: 'Claude 3 Sonnet', temperature: 0.8, prompt: '根据配置参数生成多类型营销文案（标题/正文/Banner/短信）' },
        input: '配置参数',
        output: '候选文案',
      },
      {
        id: 'mkt-001-node-3',
        label: '合规检测',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0, prompt: '检测违禁词、极限词、法规敏感词' },
        input: '候选文案',
        output: '合规报告',
      },
      {
        id: 'mkt-001-node-4',
        label: '多版本输出',
        type: 'ai',
        ai: { model: 'Claude 3 Sonnet', temperature: 0.9, prompt: '生成 3-5 个不同风格的文案版本供择优' },
        input: '候选文案',
        output: '多版本文案',
      },
      {
        id: 'mkt-001-node-5',
        label: '素材联动推荐',
        type: 'ai',
        ai: { model: 'CLIP', temperature: 0, prompt: '根据文案内容匹配图片素材库中的图片' },
        input: '最终文案',
        output: '推荐图片',
      },
    ],
  },
  'MKT-002': {
    name: '商品卖点智能提炼',
    agent: 'MktUI Agent',
    nodes: [
      {
        id: 'mkt-002-node-1',
        label: '多源数据分析',
        type: 'data',
        ai: null,
        input: 'SPU 属性 + 买家评论 + 竞品数据',
        output: '分析数据',
      },
      {
        id: 'mkt-002-node-2',
        label: '卖点提炼',
        type: 'ai',
        ai: { model: 'Claude 3 Sonnet', temperature: 0.7, prompt: '综合分析后提炼具有转化力的核心卖点' },
        input: '分析数据',
        output: '候选卖点',
      },
      {
        id: 'mkt-002-node-3',
        label: '分级输出',
        type: 'ai',
        ai: { model: 'Claude 3 Sonnet', temperature: 0.5, prompt: '区分核心卖点(Top3)、辅助卖点(Top5-10)、差异化亮点' },
        input: '候选卖点',
        output: '分级卖点',
      },
      {
        id: 'mkt-002-node-4',
        label: '场景适配',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0.6, prompt: '同一商品生成适用于详情页/列表页/广告的不同长度表达' },
        input: '分级卖点',
        output: '多场景卖点',
      },
      {
        id: 'mkt-002-node-5',
        label: '效果归因',
        type: 'data',
        ai: null,
        input: '卖点使用数据 + CTR/CVR',
        output: '效果报告',
      },
    ],
  },
  'MKT-003': {
    name: '客服响应优化（营销向）',
    agent: 'MktUI Agent',
    nodes: [
      {
        id: 'mkt-003-node-1',
        label: '营销意图识别',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0.1, prompt: '识别询价/比较/优惠查询/促销咨询等营销意图' },
        input: '客户消息',
        output: '营销意图',
      },
      {
        id: 'mkt-003-node-2',
        label: '个性化推荐',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0.6, prompt: '根据用户意图与画像推荐匹配商品并生成推荐理由' },
        input: '营销意图 + 用户画像',
        output: '推荐商品 + 话术',
      },
      {
        id: 'mkt-003-node-3',
        label: '优惠匹配',
        type: 'rule',
        ai: null,
        input: '用户 + 商品',
        output: '适用优惠',
      },
      {
        id: 'mkt-003-node-4',
        label: '转化引导',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0.7, prompt: '内置组合推荐/限时提醒/社会证明等转化话术' },
        input: '推荐结果',
        output: '转化话术',
      },
      {
        id: 'mkt-003-node-5',
        label: '线索录入',
        type: 'data',
        ai: null,
        input: '潜客信息 + 意向商品',
        output: 'CRM 线索',
      },
    ],
  },
  'MKT-004': {
    name: '流量承接与转化增强',
    agent: 'MktUI Agent',
    nodes: [
      {
        id: 'mkt-004-node-1',
        label: '流量来源分析',
        type: 'data',
        ai: null,
        input: '流量来源 + 关键词 + 用户标签',
        output: '流量画像',
      },
      {
        id: 'mkt-004-node-2',
        label: '动态内容渲染',
        type: 'ai',
        ai: { model: 'GPT-4 Turbo', temperature: 0.5, prompt: '根据流量画像动态替换页面标题/主卖点/主图' },
        input: '流量画像',
        output: '个性化页面',
      },
      {
        id: 'mkt-004-node-3',
        label: 'A/B 测试',
        type: 'ai',
        ai: { model: '统计模型', temperature: 0, prompt: '自动分配流量，显著性达到后自动收敛至胜出版本' },
        input: '页面版本',
        output: '最优版本',
      },
      {
        id: 'mkt-004-node-4',
        label: '行为分析',
        type: 'data',
        ai: null,
        input: '浏览/停留/滚动数据',
        output: '流失节点',
      },
      {
        id: 'mkt-004-node-5',
        label: '漏斗报告',
        type: 'data',
        ai: null,
        input: '全链路数据',
        output: '展现→点击→加购→成交漏斗',
      },
    ],
  },
}

// AI 模型配置数据
const modelsConfig = [
  {
    id: 'gpt-4',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    status: 'active',
    apiKey: 'sk-****-****-****-1234',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 4096,
    latency: 1200,
    costPerCall: 0.03,
  },
  {
    id: 'claude-3',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    status: 'active',
    apiKey: 'sk-ant-****-****-5678',
    endpoint: 'https://api.anthropic.com/v1/messages',
    temperature: 0.6,
    topP: 0.8,
    maxTokens: 8192,
    latency: 1500,
    costPerCall: 0.02,
  },
  {
    id: 'qwen-max',
    name: '通义千问 Max',
    provider: '阿里云',
    status: 'inactive',
    apiKey: 'ak-****-****-9012',
    endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    temperature: 0.8,
    topP: 0.95,
    maxTokens: 2048,
    latency: 800,
    costPerCall: 0.01,
  },
]

// 系统参数
const systemSettings = {
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

// 操作日志数据
const generateAuditLogs = () => {
  const actions = [
    { user: '张三', action: 'AI 归类手动修正', module: 'BIZ-001', result: 'success' },
    { user: '李四', action: '商品属性批量确认', module: 'BIZ-002', result: 'success' },
    { user: '系统', action: '规则冲突自动检测', module: 'BIZ-003', result: 'warning' },
    { user: '王五', action: '营销内容生成', module: 'MKT-001', result: 'success' },
    { user: '赵六', action: '客服话术采纳', module: 'BIZ-004', result: 'success' },
    { user: '系统', action: '模型自动降级', module: 'SYS-002', result: 'error' },
    { user: '管理员', action: '系统参数修改', module: 'SYS-003', result: 'success' },
    { user: '系统', action: '定时任务执行', module: 'SYS-004', result: 'success' },
  ]

  return Array.from({ length: 50 }, (_, i) => {
    const action = actions[i % actions.length]
    const hoursAgo = Math.floor(i * 0.5)
    return {
      id: `log-${i + 1}`,
      timestamp: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
      user: action.user,
      action: action.action,
      module: action.module,
      result: action.result,
      duration: Math.floor(100 + Math.random() * 2000),
      details: `操作详情 ${i + 1}`,
    }
  })
}

// 用户数据
const usersData = [
  {
    id: 'user-1',
    name: '张三',
    email: 'zhangsan@company.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2026-04-17 09:30:00',
  },
  {
    id: 'user-2',
    name: '李四',
    email: 'lisi@company.com',
    role: 'operator',
    status: 'active',
    lastLogin: '2026-04-17 08:45:00',
  },
  {
    id: 'user-3',
    name: '王五',
    email: 'wangwu@company.com',
    role: 'viewer',
    status: 'inactive',
    lastLogin: '2026-04-16 16:20:00',
  },
]

const rolesData = [
  {
    id: 'admin',
    name: '管理员',
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

// 健康指标
const healthMetrics = {
  apiLatency: { p95: 1200, p99: 2800 },
  successRate: 99.2,
  qps: 45,
  activeAgents: 4,
  totalAgents: 5,
  uptime: '99.5%',
  lastDeploy: '2026-04-17 02:00:00',
}

export const systemHandlers = [
  // T31: Agent 编排配置
  http.get('/api/v1/sys/agents/topology', async () => {
    await mockAiDelay()
    return successResponse(agentsTopology)
  }),

  http.post('/api/v1/sys/agents/:id/toggle', async ({ params }) => {
    await mockAiDelay()
    const { id } = params
    return successResponse({ agentId: id, status: 'toggled' })
  }),

  http.post('/api/v1/sys/agents/:id/weight', async ({ params, request }) => {
    await mockAiDelay()
    const { id } = params
    const body = await request.json() as { weight: number }
    return successResponse({ agentId: id, weight: body.weight })
  }),

  // T32: AI 模型配置
  http.get('/api/v1/sys/models', async () => {
    await mockAiDelay()
    return successResponse(modelsConfig)
  }),

  http.put('/api/v1/sys/models/:id/config', async ({ request }) => {
    await mockAiDelay()
    const body = await request.json()
    return successResponse({ updated: true, config: body })
  }),

  http.post('/api/v1/sys/models/:id/test', async () => {
    await delay(1500)
    return successResponse({ success: true, latency: 1200, message: '连接成功' })
  }),

  // T33: 系统参数设置
  http.get('/api/v1/sys/settings', async () => {
    await mockAiDelay()
    return successResponse(systemSettings)
  }),

  http.put('/api/v1/sys/settings/batch', async ({ request }) => {
    await mockAiDelay()
    const body = await request.json()
    return successResponse({ updated: true, settings: body })
  }),

  // T34: 操作日志与监控
  http.get('/api/v1/sys/audit-logs', async ({ request }) => {
    await mockAiDelay()
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const logs = generateAuditLogs()
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return successResponse({
      items: logs.slice(start, end),
      total: logs.length,
      page,
      pageSize,
    })
  }),

  http.get('/api/v1/sys/audit-logs/export', async () => {
    await mockAiDelay()
    const logs = generateAuditLogs()
    const csv = logs.map(l => `${l.timestamp},${l.user},${l.action},${l.module},${l.result}`).join('\n')
    return new HttpResponse(`timestamp,user,action,module,result\n${csv}`, {
      headers: { 'Content-Type': 'text/csv' },
    })
  }),

  // T35: 用户与权限管理
  http.get('/api/v1/sys/users', async () => {
    await mockAiDelay()
    return successResponse({ items: usersData, total: usersData.length })
  }),

  http.get('/api/v1/sys/roles', async () => {
    await mockAiDelay()
    return successResponse(rolesData)
  }),

  http.put('/api/v1/sys/users/:id/role', async ({ request }) => {
    await mockAiDelay()
    const body = await request.json() as { role: string }
    return successResponse({ updated: true, role: body.role })
  }),

  // T36: 系统状态仪表盘
  http.get('/api/v1/sys/health', async () => {
    await mockAiDelay()
    return successResponse(healthMetrics)
  }),

  http.get('/api/v1/sys/recent-actions', async () => {
    await mockAiDelay()
    const logs = generateAuditLogs()
    return successResponse(logs.slice(0, 10))
  }),

  // 获取所有 workflow 数据
  http.get('/api/v1/sys/workflows', async () => {
    await mockAiDelay()
    return successResponse(workflowsData)
  }),

  // 获取单个 workflow 数据
  http.get('/api/v1/sys/workflows/:moduleId', async ({ params }) => {
    await mockAiDelay()
    const { moduleId } = params
    return successResponse(workflowsData[moduleId])
  }),

  // T32: 模型降级策略配置
  http.post('/api/v1/sys/models/:id/fallback', async ({ params, request }) => {
    await mockAiDelay()
    const { id } = params
    const body = await request.json() as { fallbackModel: string }
    return successResponse({
      agentId: id,
      fallbackModel: body.fallbackModel,
      message: '降级策略已设置',
    })
  }),

  // T33: 合规词库管理
  http.get('/api/v1/sys/compliance-words', async () => {
    await mockAiDelay()
    return successResponse({
      forbidden: ['最优惠', '第一', '顶级', '唯一', '绝对', '100%', '国家级', '全球首发'],
      extreme: ['最好', '最强', '最大', '最便宜', '第一品牌', '全网最低', '独家'],
      sensitive: ['疗效', '治愈', '无副作用', '保本', '稳赚'],
      total: 19,
    })
  }),

  // T33: 通知配置管理
  http.get('/api/v1/sys/notifications', async () => {
    await mockAiDelay()
    return successResponse({
      templates: [
        { id: 'ntf-1', type: 'email', name: 'AI 归类异常通知', enabled: true, recipients: ['admin@company.com'] },
        { id: 'ntf-2', type: 'sms', name: '系统性能告警', enabled: false, recipients: ['138****1234'] },
        { id: 'ntf-3', type: 'webhook', name: 'Agent 状态变更', enabled: true, url: 'https://hooks.example.com/notify' },
        { id: 'ntf-4', type: 'email', name: '合规检测违规通知', enabled: true, recipients: ['compliance@company.com'] },
      ],
    })
  }),

  // T34: 审计日志（用户登录/权限变更/配置修改）
  http.get('/api/v1/sys/audit-logs/audit', async ({ request }) => {
    await mockAiDelay()
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const auditLogs = Array.from({ length: 30 }, (_, i) => {
      const types = ['login', 'permission_change', 'config_change', 'data_export']
      const users = ['张三', '李四', '管理员', '系统']
      const hoursAgo = Math.floor(i * 2)
      return {
        id: `audit-${i + 1}`,
        timestamp: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
        user: users[i % users.length],
        type: types[i % types.length],
        description: [
          '用户登录成功 (IP: 192.168.1.100)',
          '将李四角色从 operator 改为 viewer',
          '修改系统参数: aiTimeout 从 3000 改为 5000',
          '导出操作日志 CSV (50 条记录)',
          '用户登录失败 (IP: 10.0.0.5)',
          '开启 BizUI Agent-2 (bizui-2)',
          '修改 GPT-4 模型 Temperature 0.7 -> 0.8',
          '新增 API Key (sk-****-****-5678)',
        ][i % 8],
        ip: ['192.168.1.100', '10.0.0.5', '172.16.0.1'][i % 3],
      }
    })
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return successResponse({
      items: auditLogs.slice(start, end),
      total: auditLogs.length,
      page,
      pageSize,
    })
  }),
]
