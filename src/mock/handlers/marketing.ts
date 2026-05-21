import { http, delay } from 'msw'
import { mockAiDelay, successResponse } from '../utils'
import {
  generateMarketingContent,
  generateSellingPoints,
  generateFunnelData,
  generateLandingPageConfig,
  generateTemplates,
} from '../data/factory'
import { logAICall } from '../ai-log'

const styleConfigs = [
  { id: 'v1', name: '专业', temperature: 0.5, tokenMultiplier: 1.0 },
  { id: 'v2', name: '活泼', temperature: 0.8, tokenMultiplier: 1.2 },
  { id: 'v3', name: '正式', temperature: 0.3, tokenMultiplier: 0.9 },
  { id: 'v4', name: '情感化', temperature: 0.9, tokenMultiplier: 1.3 },
  { id: 'v5', name: '简洁', temperature: 0.2, tokenMultiplier: 0.7 },
]

const estimateTokenUsage = (versionCount: number) => {
  const inputTokens = 120 + Math.floor(Math.random() * 80)
  const outputPerVersion = 200 + Math.floor(Math.random() * 150)
  const outputTokens = outputPerVersion * versionCount
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    estimatedCost: Number(
      ((inputTokens / 1000) * 0.01 + (outputTokens / 1000) * 0.03).toFixed(6)
    ),
    perVersion: outputPerVersion,
  }
}

export const marketingHandlers = [
  http.post('/api/v1/marketing/generate', async ({ request }) => {
    const startTime = Date.now()
    const body = (await request.json()) as { versionCount?: number, styles?: string[], productName?: string }
    const versionCount = Math.min((body.versionCount ?? 3), 5)
    const baseContent = generateMarketingContent()
    const generated = baseContent.versions.slice(0, versionCount)
    if (generated.length < versionCount) {
      const extraStyles = ['情感化', '简洁']
      for (let i = generated.length; i < versionCount; i++) {
        generated.push({
          id: `v${i + 1}`,
          title: `${body.productName ?? 'FX3U PLC'} - ${extraStyles[i % extraStyles.length]}风格`,
          subtitle: `${extraStyles[i % extraStyles.length]}营销文案，精准触达目标用户`,
          body: `针对${body.productName ?? '本产品'}的${extraStyles[i % extraStyles.length]}风格文案，采用创新表达方式，提升用户共鸣和转化率。`,
          style: extraStyles[i % extraStyles.length],
        })
      }
    }
    await mockAiDelay()
    const tokenUsage = estimateTokenUsage(versionCount)
    logAICall({
      endpoint: '/api/v1/marketing/generate',
      model: 'claude-3-sonnet',
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      totalTokens: tokenUsage.totalTokens,
      engine: 'ai_engine',
      duration: Date.now() - startTime,
      status: 'success',
    })
    return successResponse({
      versions: generated,
      compliance: baseContent.compliance,
      tokenUsage,
      model: 'claude-3-sonnet',
      styles: generated.map(v => v.style),
    })
  }),

  http.get('/api/v1/marketing/templates', async () => {
    await delay(300)
    return successResponse({ templates: generateTemplates() })
  }),

  http.post('/api/v1/marketing/compliance-check', async () => {
    await mockAiDelay()
    const content = '这是一段营销文案，包含最优惠的价格和第一品牌';
    return successResponse({
      passed: false,
      violations: [
        { word: '最优惠', position: [12, 15], suggestion: '改为"极具竞争力"', severity: 'error' },
        { word: '第一品牌', position: [18, 22], suggestion: '改为"领先品牌"', severity: 'error' },
      ],
    })
  }),

  http.get('/api/v1/marketing/materials', async () => {
    await delay(300)
    return successResponse({
      materials: [
        { id: 'img-1', name: 'FX3U产品主图', url: 'https://via.placeholder.com/400x300/1890ff/fff?text=FX3U', tag: '产品图' },
        { id: 'img-2', name: '应用场景图', url: 'https://via.placeholder.com/400x300/52c41a/fff?text=应用', tag: '场景' },
        { id: 'img-3', name: '技术参数图', url: 'https://via.placeholder.com/400x300/faad14/fff?text=参数', tag: '参数' },
      ],
    })
  }),

  http.get('/api/v1/product/:id/selling-points', async () => {
    await mockAiDelay()
    return successResponse(generateSellingPoints())
  }),

  http.get('/api/v1/conversion/funnel', async () => {
    await delay(500)
    return successResponse(generateFunnelData())
  }),

  http.get('/api/v1/landing-page/preview', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const source = url.searchParams.get('source') || 'direct'
    return successResponse(generateLandingPageConfig(source))
  }),

  http.post('/api/v1/ab-test/create', async () => {
    await mockAiDelay()
    return successResponse({
      testId: 'AB-2025-0417',
      status: 'running',
      version_a: { name: '原版', conversion: 2.1, traffic: 50 },
      version_b: { name: 'AI优化版', conversion: 3.4, traffic: 50 },
      significant: true,
      winner: 'version_b',
    })
  }),
]
