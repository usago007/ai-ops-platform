import { http, HttpResponse, delay } from 'msw'
import { mockAiDelay, successResponse } from '../utils'
import { generateProducts, generateStructuredProduct, generateQualityScore, generatePendingProducts, productCategories } from '../data/factory'

const structuredProducts: any[] = []

export const productHandlers = [
  http.get('/api/v1/products', async () => {
    await delay(300)
    const standardItems = generateProducts()
    const pendingItems = generatePendingProducts([
      { id: 'IQ-2024-0003', status: 'quoting', full_text: '批量采购：STM32F103C8T6 x500, LM317T x200, 100uF/25V电解电容 x1000, 10K 0805贴片电阻 x5000, IRLZ44N MOS管 x300。要求原装正品。', summary: 'STM32F103C8T6 x500, LM317T x200, 电解电容...', created_at: '3小时前' },
      { id: 'IQ-2024-0007', status: 'quoted', full_text: '采购ABB IRB 1200-7/0.7 六轴工业机器人2台，负载7kg，臂展700mm，用于3C行业装配线，要求含培训和售后服务。', summary: 'IRB 1200-7/0.7 六轴工业机器人 x2台...', created_at: '2小时前' },
      { id: 'IQ-2024-0006', status: 'confirmed', full_text: '采购ABB变频器ACS580-01-044A-3 5台，功率22kW，三相380V，要求含安装指导手册，30天内交货。', summary: '变频器ACS580-01-044A-3 x5台，含安装指导...', created_at: '4小时前' },
    ])
    const items = [...standardItems, ...pendingItems, ...structuredProducts]
    return successResponse({ items, total: items.length })
  }),

  http.get('/api/v1/product/:id/structured', async ({ params }) => {
    await mockAiDelay()
    const structured = structuredProducts.find(p => p.id === params.id)
    if (structured) {
      return successResponse(structured)
    }
    return successResponse(generateStructuredProduct())
  }),

  http.get('/api/v1/product/:id/quality-score', async () => {
    await delay(200)
    return successResponse(generateQualityScore())
  }),

  http.post('/api/v1/product/batch-structure', async () => {
    await mockAiDelay()
    return successResponse({ taskId: 'batch-001', status: 'processing', total: 50, completed: 12 })
  }),

  http.post('/api/v1/product', async ({ request }) => {
    await delay(500)
    const body = await request.json() as any
    const newProduct = {
      id: body.id || `SKU-${String(2000 + Math.floor(Math.random() * 1000))}`,
      name: `${body.brand || ''} ${body.category || ''} ${body.model || ''}`.trim(),
      category: body.category || '其他',
      brand: body.brand || '待确认',
      model: body.model || '待确认',
      description: body.description || '',
      unit: body.unit || '台',
      price: body.price || 0,
      completenessScore: body.category && body.brand && body.model ? 85 : 40,
      status: '正常',
      source: body.source || 'manual',
      attributes: [
        { name: '品牌', value: body.brand || '待确认', confidence: 0.95, status: 'confirmed', source: 'manual' },
        { name: '品类', value: body.category || '待确认', confidence: 0.9, status: 'confirmed', source: 'manual' },
        { name: '型号', value: body.model || '待确认', confidence: 0.92, status: 'confirmed', source: 'manual' },
        { name: '描述', value: body.description || '', confidence: 1, status: 'confirmed', source: 'manual' },
      ],
      created_at: new Date().toISOString().slice(0, 10),
    }
    structuredProducts.push(newProduct)
    return successResponse({ message: '商品已创建', product: newProduct })
  }),

  http.post('/api/v1/product/:id/confirm', async ({ request, params }) => {
    await delay(400)
    const body = await request.json() as any
    const idx = structuredProducts.findIndex(p => p.id === params.id)
    if (idx >= 0) {
      structuredProducts[idx] = { ...structuredProducts[idx], ...body, status: '正常' }
    } else {
      structuredProducts.push({
        id: params.id,
        ...body,
        status: '正常',
        created_at: new Date().toISOString().slice(0, 10),
      })
    }
    return successResponse({ message: '结构化结果已确认并保存' })
  }),

  http.get('/api/v1/product/categories', async () => {
    await delay(300)
    return successResponse({ categories: productCategories })
  }),

  http.post('/api/v1/product/categories', async ({ request }) => {
    await delay(300)
    const body = await request.json() as any
    return successResponse({ message: '品类已创建', category: { id: `cat-new-${Date.now()}`, ...body } })
  }),
]
