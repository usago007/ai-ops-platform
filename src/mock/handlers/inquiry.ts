import { http, HttpResponse, delay } from 'msw'
import { mockAiDelay, mockRiskLevel, successResponse } from '../utils'
import { generateParseResult, generateClassificationResult, generateSimilarInquiries } from '../data/factory'
import { runPipeline } from '../engine'
import { logAICall } from '../ai-log'

const inquiryLeads = [
  {
    id: 'IQ-2024-0001', source: '官网表单', customer: '张三', company: '上海自动化科技有限公司',
    contact: '138****1234', summary: '需要采购西门子PLC控制器S7-1200系列，CPU1214C DC/DC/DC 10台...',
    full_text: '需要采购西门子PLC控制器S7-1200系列，CPU1214C DC/DC/DC 10台，要求30天内交货到上海，请报价。',
    status: 'pending', priority: 'high', created_at: '2小时前',
  },
  {
    id: 'IQ-2024-0002', source: '邮件', customer: '李四', company: '苏州精密机械有限公司',
    contact: '139****5678', summary: 'V90伺服驱动器3AC 400V x3台，1FK7伺服电机配套使用...',
    full_text: '采购V90伺服驱动器3AC 400V 3台，配套1FK7伺服电机，要求45天交货，苏州工业园区。',
    status: 'processing', priority: 'high', created_at: '1小时前',
  },
  {
    id: 'IQ-2024-0003', source: '系统API', customer: '王五', company: '深圳电子元器件公司',
    contact: '137****9012', summary: 'STM32F103C8T6 x500, LM317T x200, 电解电容...',
    full_text: '批量采购：STM32F103C8T6 x500, LM317T x200, 100uF/25V电解电容 x1000, 10K 0805贴片电阻 x5000, IRLZ44N MOS管 x300。要求原装正品。',
    status: 'quoting', priority: 'medium', created_at: '3小时前',
  },
  {
    id: 'IQ-2024-0004', source: '微信', customer: '赵六', company: '宁波模具制造有限公司',
    contact: '136****3456', summary: '定制加工45号钢齿轮轴20件，图纸稍后提供...',
    full_text: '定制加工45号钢齿轮轴，模数3，齿数28，总长185mm，调质处理HRC28-32，20件，15天交货到宁波北仑。',
    status: 'anomaly', priority: 'low', created_at: '5小时前',
  },
  {
    id: 'IQ-2024-0005', source: '官网表单', customer: '孙七', company: '杭州化工科技有限公司',
    contact: '135****7890', summary: '紧急采购工业级乙醇500kg，纯度≥99.7%...',
    full_text: '紧急采购工业级乙醇500kg，纯度≥99.7%，要求本周内交货到苏州工业园区，含税运价格。',
    status: 'quoting', priority: 'high', created_at: '30分钟前',
  },
  {
    id: 'IQ-2024-0006', source: '邮件', customer: '周八', company: '无锡电气设备有限公司',
    contact: '134****2345', summary: '变频器ACS580-01-044A-3 x5台，含安装指导...',
    full_text: '采购ABB变频器ACS580-01-044A-3 5台，功率22kW，三相380V，要求含安装指导手册，30天内交货。',
    status: 'quoted', priority: 'medium', created_at: '4小时前',
  },
  {
    id: 'IQ-2024-0007', source: '系统API', customer: '吴九', company: '南京工业机器人公司',
    contact: '133****6789', summary: 'IRB 1200-7/0.7 六轴工业机器人 x2台...',
    full_text: '采购ABB IRB 1200-7/0.7 六轴工业机器人2台，负载7kg，臂展700mm，用于3C行业装配线，要求含培训和售后服务。',
    status: 'won', priority: 'high', created_at: '2小时前',
  },
  {
    id: 'IQ-2024-0008', source: '微信', customer: '郑十', company: '常州液压气动公司',
    contact: '132****0123', summary: '液压缸HSG80/50-300 x10件，工作压力16MPa...',
    full_text: '采购液压缸HSG80/50-300 10件，工作压力16MPa，行程300mm，缸径80mm，杆径50mm，20天内交货。',
    status: 'lost', priority: 'medium', created_at: '6小时前',
  },
  {
    id: 'IQ-2024-0009', source: '官网表单', customer: '钱十一', company: '合肥自动化仪表公司',
    contact: '131****4567', summary: '温度变送器SBWZ-230 x50台，PT100传感器配套...',
    full_text: '采购温度变送器SBWZ-230 50台，配PT100温度传感器，测量范围-50~500℃，4-20mA输出，15天内交货。',
    status: 'pending', priority: 'low', created_at: '8小时前',
  },
  {
    id: 'IQ-2024-0010', source: '邮件', customer: '冯十二', company: '天津气动元件公司',
    contact: '130****8901', summary: 'SMC气缸CDQ2B40-50D x100个...',
    full_text: '采购SMC气缸CDQ2B40-50D 100个，缸径40mm，行程50mm，双作用，要求原装正品，提供合格证。',
    status: 'pending', priority: 'medium', created_at: '10小时前',
  },
  {
    id: 'IQ-2024-0011', source: '系统API', customer: '陈十三', company: '青岛焊接材料公司',
    contact: '129****2345', summary: '氩弧焊机WSM-400 x3台，含氩气减压器...',
    full_text: '采购氩弧焊机WSM-400 3台，额定电流400A，脉冲功能，含氩气减压器和焊枪，25天内交货。',
    status: 'quoting', priority: 'low', created_at: '12小时前',
  },
  {
    id: 'IQ-2024-0012', source: '微信', customer: '褚十四', company: '大连轴承制造有限公司',
    contact: '128****6789', summary: '深沟球轴承6205-2RS x500套...',
    full_text: '采购深沟球轴承6205-2RS 500套，内径25mm，外径52mm，宽度15mm，双面密封，要求NSK或SKF品牌。',
    status: 'quoting', priority: 'medium', created_at: '1天前',
  },
]

const ruleBasedExtract = async (text: string) => {
  const quantityMatch = text.match(/(\d+)\s*(台|个|件|套|箱|包|吨|米|kg|千克|升)/)
  const priceMatch = text.match(/([¥￥]?\d{1,5}(\.\d{1,2})?)\s*(元|块|¥|￥)?/g)
  const productMatch = text.match(/(PLC控制器|传感器|变频器|伺服电机|工业相机|人机界面)[\s]*(\w{2,10})?/)
  const deliveryMatch = text.match(/(\d+)\s*(天|日|工作日|小时|周)/)
  const paymentMatch = text.match(/(月结|现结|预付|货到付款)/)
  const regionMatch = text.match(/(华东|华南|华北|华中|西南|西北|东北)/)
  let confidence = 0
  if (quantityMatch) confidence += 0.35
  if (productMatch) confidence += 0.35
  if (priceMatch?.length) confidence += 0.15
  if (deliveryMatch) confidence += 0.1
  if (paymentMatch) confidence += 0.05
  confidence = Math.min(confidence, 0.95)
  const products = ['PLC控制器 FX3U-64MT', '温度传感器 PT100', '变频器 ACS580', '伺服电机 MR-J4']
  const categories = ['工业自动化', '传感器', '电气元件', '驱动系统']
  return {
    category: productMatch
      ? categories.find(c => text.includes(c.slice(0, 2))) ?? '工业自动化'
      : '工业自动化',
    spec: productMatch
      ? `${productMatch[1]} ${productMatch[2] ?? ''}`.trim()
      : products[Math.floor(Math.random() * products.length)],
    quantity: quantityMatch
      ? { value: parseInt(quantityMatch[1], 10), unit: quantityMatch[2] }
      : { value: Math.floor(Math.random() * 100) + 10, unit: '台' },
    delivery: deliveryMatch ? `${deliveryMatch[1]}${deliveryMatch[2]}内` : '30天内',
    region: regionMatch ? `${regionMatch[1]}地区` : '华东地区',
    payment: paymentMatch ? paymentMatch[1] : '月结30天',
    confidence: Number(confidence.toFixed(2)),
    risk_level: confidence > 0.8 ? mockRiskLevel() : 'low',
    risk_reasons: confidence < 0.7 ? ['信息不完整，建议补充'] : [],
  }
}

export const inquiryHandlers = [
  http.get('/api/v1/inquiry/list', async () => {
    await delay(400)
    const stats = {
      pending: inquiryLeads.filter(l => l.status === 'pending').length,
      processing: inquiryLeads.filter(l => l.status === 'processing').length,
      confirmed: inquiryLeads.filter(l => l.status === 'confirmed').length,
      quoting: inquiryLeads.filter(l => l.status === 'quoting').length,
      quoted: inquiryLeads.filter(l => l.status === 'quoted').length,
      won: inquiryLeads.filter(l => l.status === 'won').length,
      lost: inquiryLeads.filter(l => l.status === 'lost').length,
      anomaly: inquiryLeads.filter(l => l.status === 'anomaly').length,
    }
    return successResponse({
      items: inquiryLeads,
      total: inquiryLeads.length,
      stats,
    })
  }),

  http.post('/api/v1/inquiry/batch-transform', async ({ request }) => {
    await delay(800)
    const body = await request.json() as { ids: string[] }
    return successResponse({ total: body.ids.length, message: `已创建${body.ids.length}个AI转化任务` })
  }),

  http.post('/api/v1/inquiry/parse', async ({ request }) => {
    const startTime = Date.now()
    const body = (await request.json()) as { text: string }
    const ruleResult = await ruleBasedExtract(body.text)
    if (ruleResult.confidence >= 0.7) {
      const pipelineResult = await runPipeline(body.text)
      const duration = Date.now() - startTime
      logAICall({
        endpoint: '/api/v1/inquiry/parse',
        model: 'rule_engine',
        inputTokens: body.text.length,
        outputTokens: JSON.stringify(ruleResult).length,
        totalTokens: body.text.length + JSON.stringify(ruleResult).length,
        engine: 'rule_engine',
        duration,
        status: 'success',
      })
      return successResponse({
        ...ruleResult,
        engine: 'rule_engine',
        pipeline: pipelineResult.stages.map(s => ({ name: s.name, duration: s.duration })),
        totalDuration: pipelineResult.totalDuration,
      })
    }
    await mockAiDelay()
    const aiResult = generateParseResult(body.text)
    const duration = Date.now() - startTime
    logAICall({
      endpoint: '/api/v1/inquiry/parse',
      model: 'gpt-4-turbo',
      inputTokens: body.text.length,
      outputTokens: JSON.stringify(aiResult).length,
      totalTokens: body.text.length + JSON.stringify(aiResult).length,
      engine: 'ai_engine',
      duration,
      status: 'success',
    })
    return successResponse({
      ...aiResult,
      engine: 'ai_engine',
      confidence: Number((ruleResult.confidence * 0.3 + aiResult.confidence * 0.7).toFixed(2)),
    })
  }),

  http.post('/api/v1/inquiry/classify', async () => {
    await mockAiDelay()
    return successResponse(generateClassificationResult())
  }),

  http.get('/api/v1/inquiry/similar', async () => {
    await delay(500)
    return successResponse(generateSimilarInquiries())
  }),

  http.post('/api/v1/inquiry/route', async () => {
    await mockAiDelay()
    return successResponse({ routed: true, team: '工业自动化组', estimatedTime: '2小时内' })
  }),

  http.post('/api/v1/inquiry/feedback', async () => {
    await delay(300)
    return successResponse({ feedbackRecorded: true })
  }),

  http.get('/api/v1/inquiry/:id', async ({ params }) => {
    await delay(300)
    const lead = inquiryLeads.find(l => l.id === params.id)
    if (lead) {
      return successResponse(lead)
    }
    return HttpResponse.json({ success: false, message: '线索不存在' }, { status: 404 })
  }),

  http.post('/api/v1/inquiry/confirm', async ({ request }) => {
    await delay(500)
    const body = await request.json() as { leadId: string }
    const lead = inquiryLeads.find(l => l.id === body.leadId)
    if (lead) {
      lead.status = 'quoting'
    }
    return successResponse({ message: '归类已确认，已进入待报价列表' })
  }),

  http.post('/api/v1/inquiry/quote', async ({ request }) => {
    await delay(800)
    const body = await request.json() as { leadId: string; quotation: any }
    const lead = inquiryLeads.find(l => l.id === body.leadId)
    if (lead) {
      lead.status = 'quoted'
      lead.quotation = body.quotation
    }
    return successResponse({ message: '报价已保存并发送' })
  }),

  http.post('/api/v1/inquiry/mark-result', async ({ request }) => {
    await delay(500)
    const body = await request.json() as { leadId: string; result: 'won' | 'lost'; reason?: string; amount?: number }
    const lead = inquiryLeads.find(l => l.id === body.leadId)
    if (lead) {
      lead.status = body.result
      lead.result_reason = body.reason
      lead.result_amount = body.amount
    }
    return successResponse({ message: body.result === 'won' ? '已标记为成单' : '已标记为丢单' })
  }),

  http.post('/api/v1/inquiry/follow-up', async ({ request }) => {
    await delay(300)
    const body = await request.json() as { leadId: string; content: string }
    return successResponse({ message: '跟进记录已添加', record: { id: `FU-${Date.now()}`, content: body.content, created_at: '刚刚' } })
  }),

  http.get('/api/v1/inquiry/:id/follow-ups', async ({ params }) => {
    await delay(300)
    const lead = inquiryLeads.find(l => l.id === params.id)
    return successResponse({
      items: [
        { id: 'FU-001', content: '客户确认收到报价，等待内部审批', created_at: '2小时前', type: 'update', leadId: lead?.id },
        { id: 'FU-002', content: '报价邮件已发送至客户邮箱', created_at: '1天前', type: 'quotation', leadId: lead?.id },
        { id: 'FU-003', content: '电话沟通交期细节，客户要求提前5天', created_at: '3天前', type: 'phone', leadId: lead?.id },
        { id: 'FU-004', content: '首次报价发送，包含3项产品', created_at: '4天前', type: 'update', leadId: lead?.id },
      ],
    })
  }),

  http.get('/api/v1/inquiry/:id/quotation-history', async ({ params }) => {
    await delay(300)
    const lead = inquiryLeads.find(l => l.id === params.id)
    return successResponse({
      versions: [
        {
          version: 1,
          created_at: '2024-04-15 10:30',
          total: 45600,
          delivery: '30天内',
          payment: '月结60天',
          products: 3,
        },
        {
          version: 2,
          created_at: '2024-04-18 14:20',
          total: 42800,
          delivery: '25天内',
          payment: '月结45天',
          products: 3,
          note: '根据客户反馈调整价格和交期',
        },
      ],
    })
  }),

  http.get('/api/v1/inquiry/:id/similar-quotations', async () => {
    await delay(400)
    return successResponse({
      similar: [
        {
          id: 'QT-2024-0089',
          customer: '杭州自动化公司',
          date: '2024-03-15',
          products: 'PLC控制器 S7-1200 x8台',
          total: 45600,
          delivery: '30天内',
          payment: '月结60天',
          status: 'won',
        },
        {
          id: 'QT-2024-0076',
          customer: '苏州电气科技',
          date: '2024-03-10',
          products: 'PLC控制器 S7-1500 x5台',
          total: 67800,
          delivery: '45天内',
          payment: '月结30天',
          status: 'won',
        },
        {
          id: 'QT-2024-0065',
          customer: '南京工业控制',
          date: '2024-02-28',
          products: 'PLC控制器 FX5U x12台',
          total: 38400,
          delivery: '25天内',
          payment: '预付50%',
          status: 'lost',
        },
      ],
    })
  }),

  http.get('/api/v1/inquiry/attribution/funnel', async () => {
    await delay(400)
    return successResponse({
      funnel: [
        { stage: '线索获取', count: 1280, rate: 100, color: '#1890ff' },
        { stage: 'AI转化', count: 1156, rate: 90.3, color: '#13c2c2' },
        { stage: '归类确认', count: 982, rate: 76.7, color: '#722ed1' },
        { stage: '报价发送', count: 856, rate: 66.9, color: '#fa8c16' },
        { stage: '客户跟进', count: 645, rate: 50.4, color: '#eb2f96' },
        { stage: '成单', count: 234, rate: 18.3, color: '#52c41a' },
      ],
      total_leads: 1280,
      total_won: 234,
      total_lost: 156,
      conversion_rate: 18.3,
      avg_cycle_days: 12.5,
    })
  }),

  http.get('/api/v1/inquiry/attribution/source', async () => {
    await delay(400)
    return successResponse({
      sources: [
        { name: '官网表单', count: 456, won: 98, rate: 21.5 },
        { name: '邮件', count: 312, won: 67, rate: 21.5 },
        { name: '系统API', count: 289, won: 42, rate: 14.5 },
        { name: '微信', count: 223, won: 27, rate: 12.1 },
      ],
    })
  }),

  http.get('/api/v1/inquiry/attribution/category', async () => {
    await delay(400)
    return successResponse({
      categories: [
        { name: '工业自动化', count: 345, won: 89, rate: 25.8, avg_amount: 45600 },
        { name: '电气元件', count: 278, won: 56, rate: 20.1, avg_amount: 23400 },
        { name: '传感器', count: 198, won: 45, rate: 22.7, avg_amount: 12800 },
        { name: '驱动系统', count: 156, won: 28, rate: 17.9, avg_amount: 67800 },
        { name: '仪器仪表', count: 123, won: 16, rate: 13.0, avg_amount: 34500 },
      ],
    })
  }),

  http.get('/api/v1/inquiry/knowledge-base', async () => {
    await delay(400)
    return successResponse({
      items: [
        {
          id: 'KB-001',
          title: 'PLC控制器S7-1200报价策略',
          category: '工业自动化',
          type: 'pricing',
          summary: '针对S7-1200系列PLC，推荐报价区间1200-1500元/台，交期30天内，月结60天付款条件成单率最高',
          source_lead: 'IQ-2024-0001',
          outcome: 'won',
          amount: 45600,
          created_at: '2024-04-10',
          tags: ['PLC', '西门子', '报价策略'],
        },
        {
          id: 'KB-002',
          title: '伺服驱动器V90丢单原因分析',
          category: '驱动系统',
          type: 'lost_analysis',
          summary: 'V90伺服驱动器丢单主要原因是交期过长（>45天）和价格高于竞品15%以上，建议优化供应链',
          source_lead: 'IQ-2024-0002',
          outcome: 'lost',
          reason: '价格过高、交期太长',
          created_at: '2024-04-08',
          tags: ['伺服', '丢单分析', '价格敏感'],
        },
        {
          id: 'KB-003',
          title: '电子元器件批量采购报价模板',
          category: '电气元件',
          type: 'template',
          summary: '针对批量采购电子元器件（数量>100），推荐采用阶梯报价策略，交期20天内，预付50%条件最优',
          source_lead: 'IQ-2024-0003',
          outcome: 'won',
          amount: 28900,
          created_at: '2024-04-05',
          tags: ['电子元器件', '批量采购', '阶梯报价'],
        },
        {
          id: 'KB-004',
          title: '工业机器人售后服务标准方案',
          category: '工业自动化',
          type: 'service',
          summary: 'IRB系列工业机器人报价应包含培训+1年售后，成单率提升35%，客户满意度达92%',
          source_lead: 'IQ-2024-0007',
          outcome: 'won',
          amount: 156000,
          created_at: '2024-03-28',
          tags: ['机器人', '售后服务', '增值服务'],
        },
      ],
    })
  }),

  http.get('/api/v1/inquisition/attribution/trend', async () => {
    await delay(400)
    return successResponse({
      trend: {
        dates: ['4/1', '4/2', '4/3', '4/4', '4/5', '4/6', '4/7', '4/8', '4/9', '4/10', '4/11', '4/12', '4/13', '4/14', '4/15'],
        leads: [45, 52, 48, 63, 57, 71, 68, 75, 82, 79, 85, 90, 88, 95, 102],
        won: [12, 15, 11, 18, 16, 21, 19, 23, 25, 22, 26, 28, 27, 29, 32],
        amount: [45600, 52000, 38400, 67800, 58900, 78400, 72100, 89500, 95600, 87300, 98700, 105000, 102300, 112000, 125600],
      },
    })
  }),
]
