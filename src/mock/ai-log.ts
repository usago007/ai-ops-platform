export interface AICallLogEntry {
  id: string
  timestamp: string
  endpoint: string
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
  engine: 'rule_engine' | 'ai_engine'
  duration: number
  status: 'success' | 'error'
}

const callLogs: AICallLogEntry[] = []
let callCounter = 0

const MODEL_PRICING: Record<string, { input: number, output: number }> = {
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'deepseek-v3': { input: 0.0002, output: 0.0008 },
  'qwen-max': { input: 0.0004, output: 0.0012 },
  'rule_engine': { input: 0, output: 0 },
}

export const logAICall = (entry: Omit<AICallLogEntry, 'id' | 'timestamp'>): AICallLogEntry => {
  callCounter++
  const pricing = MODEL_PRICING[entry.model] ?? MODEL_PRICING['gpt-3.5-turbo']
  const cost = Number(
    ((entry.inputTokens / 1000) * pricing.input + (entry.outputTokens / 1000) * pricing.output).toFixed(6)
  )
  const fullEntry: AICallLogEntry = {
    ...entry,
    id: `call-${Date.now()}-${callCounter}`,
    timestamp: new Date().toISOString(),
    cost,
  }
  callLogs.push(fullEntry)
  return fullEntry
}

export const getCallLogs = (): AICallLogEntry[] => [...callLogs]

export const getCallLogsSummary = () => {
  const totalCalls = callLogs.length
  const aiCalls = callLogs.filter(e => e.engine === 'ai_engine').length
  const ruleCalls = callLogs.filter(e => e.engine === 'rule_engine').length
  const totalTokens = callLogs.reduce((sum, e) => sum + e.totalTokens, 0)
  const totalCost = Number(callLogs.reduce((sum, e) => sum + e.cost, 0).toFixed(4))
  const avgDuration = totalCalls > 0
    ? Number((callLogs.reduce((sum, e) => sum + e.duration, 0) / totalCalls).toFixed(0))
    : 0
  return { totalCalls, aiCalls, ruleCalls, totalTokens, totalCost, avgDuration }
}

export const clearCallLogs = () => {
  callLogs.length = 0
  callCounter = 0
}
