import {
  generateMarketingContent,
  generateSellingPoints,
  generateFunnelData,
  generateLandingPageConfig,
} from '../mock/data/factory'

export interface ComplianceResult {
  passed: boolean
  violations: Array<{ word: string; type?: string; severity?: string; position: [number, number]; suggestion: string }>
}

const materials = [
  { id: 'img-1', name: 'FX3U产品主图', url: 'https://picsum.photos/seed/marketing-1/400/300', tag: '产品图' },
  { id: 'img-2', name: '应用场景图', url: 'https://picsum.photos/seed/marketing-2/400/300', tag: '场景' },
  { id: 'img-3', name: '技术参数图', url: 'https://picsum.photos/seed/marketing-3/400/300', tag: '参数' },
]

const complianceWords = ['最优惠', '第一品牌', '绝对领先', '100%']

export const marketingDataStore = {
  generate: (data: { product?: string; productName?: string; versionCount?: number }) => {
    const base = generateMarketingContent()
    const versionCount = Math.min(Math.max(data.versionCount ?? 3, 1), 5)
    const versions = base.versions.slice(0, versionCount).map((version, index) => ({
      ...version,
      id: `${version.id}-${index + 1}`,
      title: version.title.replace('FX3U系列PLC控制器', data.productName || data.product || 'PLC控制器 FX3U-64MT'),
      body: version.body.replace('三菱FX3U系列PLC控制器', data.productName || data.product || 'PLC控制器 FX3U-64MT'),
    }))
    return {
      versions,
      compliance: base.compliance,
      tokenUsage: {
        inputTokens: 168,
        outputTokens: 942,
        totalTokens: 1110,
        estimatedCost: 0.0312,
      },
      model: 'claude-3-sonnet',
      styles: versions.map(item => item.style),
    }
  },

  getMaterials: () => ({
    materials: materials.map(item => ({ ...item })),
  }),

  complianceCheck: (data: { content: string }) => {
    const content = data.content || ''
    const violations: ComplianceResult['violations'] = []
    complianceWords.forEach((word) => {
      const start = content.indexOf(word)
      if (start !== -1) {
        violations.push({
          word,
          severity: 'error',
          position: [start, start + word.length],
          suggestion: word.includes('第一') ? '领先品牌' : '极具竞争力',
        })
      }
    })
    return {
      passed: violations.length === 0,
      violations,
    }
  },

  getSellingPoints: (productId?: string) => generateSellingPoints(),

  getConversionFunnel: () => generateFunnelData(),

  getLandingPagePreview: (source?: string) => generateLandingPageConfig(source),
}
