export interface ModelConfig {
  id: string
  name: string
  provider: string
  status: 'active' | 'inactive'
  apiKey: string
  endpoint: string
  temperature: number
  topP: number
  maxTokens: number
  latency: number
  costPerCall: number
}

const models: ModelConfig[] = [
  {
    id: 'model-1',
    name: 'gpt-4-turbo',
    provider: 'OpenAI',
    status: 'active',
    apiKey: 'sk-****1234',
    endpoint: 'https://api.openai.com/v1',
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 4096,
    latency: 250,
    costPerCall: 0.03,
  },
  {
    id: 'model-2',
    name: 'claude-3-opus',
    provider: 'Anthropic',
    status: 'active',
    apiKey: 'sk-ant-****5678',
    endpoint: 'https://api.anthropic.com/v1',
    temperature: 0.8,
    topP: 0.95,
    maxTokens: 8192,
    latency: 320,
    costPerCall: 0.05,
  },
  {
    id: 'model-3',
    name: 'qwen-max',
    provider: 'Alibaba',
    status: 'active',
    apiKey: 'sk-****9012',
    endpoint: 'https://dashscope.aliyuncs.com/api/v1',
    temperature: 0.6,
    topP: 0.85,
    maxTokens: 2048,
    latency: 180,
    costPerCall: 0.02,
  },
  {
    id: 'model-4',
    name: 'gemini-pro',
    provider: 'Google',
    status: 'inactive',
    apiKey: 'AIza****3456',
    endpoint: 'https://generativelanguage.googleapis.com/v1',
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 4096,
    latency: 0,
    costPerCall: 0,
  },
  {
    id: 'model-5',
    name: 'gpt-3.5-turbo',
    provider: 'OpenAI',
    status: 'active',
    apiKey: 'sk-****7890',
    endpoint: 'https://api.openai.com/v1',
    temperature: 0.7,
    topP: 1.0,
    maxTokens: 4096,
    latency: 150,
    costPerCall: 0.002,
  },
]

export const modelDataStore = {
  getModels: (): { models: ModelConfig[] } => ({
    models: models.map(m => ({ ...m })),
  }),

  updateModel: (id: string, data: Partial<ModelConfig>): { message: string; model?: ModelConfig } => {
    const index = models.findIndex(m => m.id === id)
    if (index === -1) {
      return { message: '模型不存在' }
    }
    models[index] = { ...models[index], ...data }
    return { message: '模型配置已更新', model: models[index] }
  },

  testModel: (id: string): { message: string; latency?: number } => {
    const model = models.find(m => m.id === id)
    if (!model) {
      return { message: '模型不存在' }
    }
    if (model.status === 'inactive') {
      return { message: '模型未启用，无法测试' }
    }
    const simulatedLatency = Math.floor(Math.random() * 200) + 100
    return { message: '连接成功', latency: simulatedLatency }
  },

  createModel: (data: Omit<ModelConfig, 'id' | 'latency' | 'costPerCall'>): { message: string; model?: ModelConfig } => {
    const newModel: ModelConfig = {
      id: `model-${Date.now()}`,
      ...data,
      latency: 0,
      costPerCall: 0,
    }
    models.push(newModel)
    return { message: '模型添加成功', model: newModel }
  },

  toggleModelStatus: (id: string): { message: string; status?: 'active' | 'inactive' } => {
    const model = models.find(m => m.id === id)
    if (!model) {
      return { message: '模型不存在' }
    }
    model.status = model.status === 'active' ? 'inactive' : 'active'
    return { message: `模型已${model.status === 'active' ? '启用' : '停用'}`, status: model.status }
  },
}
