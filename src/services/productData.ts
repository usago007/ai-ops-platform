import { generatePendingProducts, generateProducts, generateStructuredProduct, productCategories } from '../mock/data/factory'

interface ProductCategoryNode {
  id: string
  name: string
  level: number
  brand?: string
  productCount?: number
  inquiryCount?: number
  children?: ProductCategoryNode[]
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

const seedInquiryLeads = [
  { id: 'IQ-2024-0003', status: 'quoting', full_text: '批量采购：STM32F103C8T6 x500, LM317T x200, 100uF/25V电解电容 x1000, 10K 0805贴片电阻 x5000, IRLZ44N MOS管 x300。要求原装正品。', summary: 'STM32F103C8T6 x500, LM317T x200, 电解电容...', created_at: '3小时前' },
  { id: 'IQ-2024-0007', status: 'quoted', full_text: '采购ABB IRB 1200-7/0.7 六轴工业机器人2台，负载7kg，臂展700mm，用于3C行业装配线，要求含培训和售后服务。', summary: 'IRB 1200-7/0.7 六轴工业机器人 x2台...', created_at: '2小时前' },
  { id: 'IQ-2024-0006', status: 'confirmed', full_text: '采购ABB变频器ACS580-01-044A-3 5台，功率22kW，三相380V，要求含安装指导手册，30天内交货。', summary: '变频器ACS580-01-044A-3 x5台，含安装指导...', created_at: '4小时前' },
]

const baseProducts = generateProducts().map((product: any, index: number) => ({
  ...product,
  id: product.id,
  brand: ['三菱', '欧姆龙', 'ABB', '三菱', 'Basler', '西门子', '倍加福', '施耐德', '西门子', '库卡', '横河', '施耐德'][index] || '待确认',
  model: product.name.split(' ').slice(1).join(' ') || product.name,
  source: 'manual',
  unit: '台',
  description: `${product.name} 标准商品资料`,
  attributes: [
    { name: '品牌', value: ['三菱', '欧姆龙', 'ABB', '三菱', 'Basler', '西门子', '倍加福', '施耐德', '西门子', '库卡', '横河', '施耐德'][index] || '待确认', confidence: 0.98, status: 'confirmed', source: 'manual' },
    { name: '型号', value: product.name.split(' ').slice(1).join(' '), confidence: 0.95, status: 'confirmed', source: 'manual' },
    { name: '品类', value: product.category, confidence: 0.95, status: 'confirmed', source: 'manual' },
  ],
  created_at: '2026-05-01',
}))

const pendingProducts = generatePendingProducts(seedInquiryLeads as any)
let createdProducts: any[] = []
let categories: ProductCategoryNode[] = clone(productCategories)

const allProducts = () => [...baseProducts, ...pendingProducts, ...createdProducts]

const defaultStructured = (id: string) => {
  const match = allProducts().find(product => product.id === id)
  if (!match) {
    const generated = generateStructuredProduct()
    return {
      id,
      category: '工业自动化',
      brand: '三菱',
      model: generated.name,
      completenessScore: generated.quality_score,
      description: generated.original_text,
      unit: '台',
      attributes: generated.attributes,
    }
  }
  if (match.attributes) {
    return clone(match)
  }
  const generated = generateStructuredProduct()
  return {
    ...match,
    completenessScore: match.completenessScore || generated.quality_score,
    attributes: generated.attributes,
    description: match.description || generated.original_text,
    unit: match.unit || '台',
  }
}

const normalizeLevel1 = (value?: string | null) => value || '其他'

export const productDataStore = {
  getProducts: () => {
    const items = allProducts()
    return { items: clone(items), total: items.length }
  },

  getProductDetail: (id: string) => clone(defaultStructured(id)),

  batchStructure: () => ({ taskId: 'batch-001', status: 'processing', total: pendingProducts.length, completed: Math.min(2, pendingProducts.length) }),

  getCategories: () => ({ categories: clone(categories) }),

  createCategory: (data: { level1?: string; parent_id?: string | null; name: string; brand?: string }) => {
    const level1Name = normalizeLevel1(data.level1)
    const parent = categories.find((item) => item.name === level1Name || item.id === data.parent_id)
    if (!parent) {
      return { message: '一级品类不存在' }
    }
    const newChild = {
      id: `cat-${Date.now()}`,
      name: data.name,
      level: 2,
      brand: data.brand || '',
      productCount: 0,
      inquiryCount: 0,
    }
    parent.children = parent.children || []
    parent.children.unshift(newChild)
    return { message: '品类已创建', category: clone(newChild) }
  },

  createProduct: (payload: any) => {
    const id = `SKU-${String(2000 + createdProducts.length + 1)}`
    const product = {
      id,
      name: `${payload.brand || ''} ${payload.category || ''} ${payload.model || ''}`.trim(),
      category: payload.category || '其他',
      brand: payload.brand || '待确认',
      model: payload.model || '待确认',
      description: payload.description || payload.raw_text || '',
      unit: payload.unit || '台',
      price: Number(payload.price || 0),
      completenessScore: payload.category && payload.brand && payload.model ? 88 : 60,
      status: '正常',
      source: payload.source || 'manual',
      created_at: '刚刚',
      attributes: [
        { name: '品牌', value: payload.brand || '待确认', confidence: 1, status: 'confirmed', source: 'manual' },
        { name: '品类', value: payload.category || '待确认', confidence: 1, status: 'confirmed', source: 'manual' },
        { name: '型号', value: payload.model || '待确认', confidence: 1, status: 'confirmed', source: 'manual' },
        { name: '描述', value: payload.description || payload.raw_text || '', confidence: 1, status: 'confirmed', source: 'manual' },
      ],
    }
    createdProducts.unshift(product)
    return { message: '商品已创建', product: clone(product) }
  },

  confirmProduct: (id: string, payload: any) => {
    const pendingIndex = pendingProducts.findIndex(product => product.id === id)
    if (pendingIndex >= 0) {
      const pending = pendingProducts[pendingIndex]
      const confirmed = {
        ...pending,
        ...payload,
        source_inquiry: undefined,
        original_text: pending.original_text,
        status: '正常',
        source: 'ai',
        completenessScore: 90,
        created_at: '刚刚',
      }
      pendingProducts.splice(pendingIndex, 1)
      createdProducts.unshift(confirmed)
      return { message: '结构化结果已确认并保存', product: clone(confirmed) }
    }
    const existingIndex = createdProducts.findIndex(product => product.id === id)
    if (existingIndex >= 0) {
      createdProducts[existingIndex] = { ...createdProducts[existingIndex], ...payload }
      return { message: '结构化结果已确认并保存', product: clone(createdProducts[existingIndex]) }
    }
    return { message: '商品不存在' }
  },

  parseProductText: (text: string) => {
    const categoryMatch = text.match(/(PLC控制器|变频器|传感器|伺服系统|继电器|工业机器人|断路器)/)
    const category = categoryMatch ? categoryMatch[1] : '其他'
    const specMatch = text.match(/[\u4e00-\u9fa5A-Z0-9\-]+(?:系列|型号|型)?/)
    const spec = specMatch ? specMatch[0] : '待确认'
    return {
      parsed: {
        category,
        spec,
        confidence: 0.85,
      },
    }
  },
}
