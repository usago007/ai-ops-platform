export interface PipelineStage {
  name: string
  duration: number
  status: 'completed' | 'failed' | 'skipped'
  output: Record<string, unknown>
}

export interface PipelineResult {
  stages: PipelineStage[]
  totalDuration: number
  engine: 'rule_engine' | 'ai_engine'
  success: boolean
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const preprocessText = async (text: string): Promise<{ cleaned: string, keywords: string[] }> => {
  await sleep(80 + Math.random() * 40)
  const cleaned = text.trim().replace(/\s+/g, ' ')
  const keywordPatterns = [
    /(\d+)\s*(台|个|件|套|箱|包|吨|米|kg|千克|升)/,
    /价格|单价|报价|费用|多少钱|价位/,
    /交期|交货|发货|到货|几天|工作日/,
    /批发|批量|采购|订购|购买/,
    /含税|不含税|增值税|发票/,
    /PLC|传感器|变频器|伺服|电机|控制器|工业/,
  ]
  const keywords = keywordPatterns
    .map(pattern => text.match(pattern)?.[0] ?? '')
    .filter(Boolean)
  return { cleaned, keywords }
}

const extractFields = async (
  cleaned: string,
  keywords: string[]
): Promise<{
  quantity: { value: number, unit: string } | null
  hasPrice: boolean
  hasDelivery: boolean
  productName: string | null
  confidence: number
}> => {
  await sleep(100 + Math.random() * 60)
  const quantityMatch = cleaned.match(/(\d+)\s*(台|个|件|套|箱|包|吨|米|kg|千克|升)/)
  const quantity = quantityMatch
    ? { value: parseInt(quantityMatch[1], 10), unit: quantityMatch[2] }
    : null
  const hasPrice = /价格|单价|报价|费用|多少钱|价位/.test(cleaned)
  const hasDelivery = /交期|交货|发货|到货|几天|工作日/.test(cleaned)
  const productPatterns = [
    /([A-Z]{2,}\d{1,4}[-\w]*)/,
    /(PLC控制器[^\s，,。]*)/,
    /(传感器[^\s，,。]*)/,
    /(变频器[^\s，,。]*)/,
    /(伺服[^\s，,。]*)/,
  ]
  let productName: string | null = null
  for (const pattern of productPatterns) {
    const match = cleaned.match(pattern)
    if (match) { productName = match[1]; break }
  }
  let confidence = 0
  if (quantity) confidence += 0.3
  if (hasPrice) confidence += 0.2
  if (hasDelivery) confidence += 0.15
  if (productName) confidence += 0.25
  if (keywords.length >= 2) confidence += 0.1
  confidence = Math.min(confidence, 0.98)
  return { quantity, hasPrice, hasDelivery, productName, confidence }
}

const assessConfidence = async (
  fields: Awaited<ReturnType<typeof extractFields>>
): Promise<{ score: number, level: 'high' | 'medium' | 'low' }> => {
  await sleep(40 + Math.random() * 30)
  const noise = (Math.random() - 0.5) * 0.08
  const score = Number((fields.confidence + noise).toFixed(2))
  const clamped = Math.max(0, Math.min(1, score))
  const level = clamped >= 0.7 ? 'high' : clamped >= 0.4 ? 'medium' : 'low'
  return { score: clamped, level }
}

const classifyMatch = async (
  fields: Awaited<ReturnType<typeof extractFields>>
): Promise<{ category: string, subCategory: string, team: string }> => {
  await sleep(60 + Math.random() * 40)
  const text = JSON.stringify(fields)
  let category = '工业自动化'
  let subCategory = 'PLC控制器'
  let team = '自动化组'
  if (/传感器/i.test(text) || fields.productName?.includes('传感器')) {
    category = '传感器'
    subCategory = '工业传感器'
    team = '传感器组'
  } else if (/变频/i.test(text) || fields.productName?.includes('变频')) {
    category = '电气元件'
    subCategory = '变频器'
    team = '电气组'
  } else if (/伺服|电机/i.test(text)) {
    category = '驱动系统'
    subCategory = '伺服电机'
    team = '驱动组'
  }
  return { category, subCategory, team }
}

export const runPipeline = async (text: string): Promise<PipelineResult> => {
  const stages: PipelineStage[] = []
  const startTime = Date.now()

  const preprocessed = await preprocessText(text)
  stages.push({
    name: 'text_preprocessing',
    duration: 80 + Math.random() * 40,
    status: 'completed',
    output: { keywordsFound: preprocessed.keywords.length, textLength: preprocessed.cleaned.length },
  })

  const fields = await extractFields(preprocessed.cleaned, preprocessed.keywords)
  stages.push({
    name: 'field_extraction',
    duration: 100 + Math.random() * 60,
    status: 'completed',
    output: {
      quantity: fields.quantity,
      hasPrice: fields.hasPrice,
      hasDelivery: fields.hasDelivery,
      productName: fields.productName,
    },
  })

  const confidence = await assessConfidence(fields)
  stages.push({
    name: 'confidence_assessment',
    duration: 40 + Math.random() * 30,
    status: 'completed',
    output: { score: confidence.score, level: confidence.level },
  })

  const classification = await classifyMatch(fields)
  stages.push({
    name: 'classification_matching',
    duration: 60 + Math.random() * 40,
    status: 'completed',
    output: classification,
  })

  return {
    stages,
    totalDuration: Date.now() - startTime,
    engine: confidence.level === 'high' ? 'rule_engine' : 'ai_engine',
    success: true,
  }
}
