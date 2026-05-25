import { generateClassificationResult, generateParseResult, generateSimilarInquiries } from '../mock/data/factory'
import { runPipeline } from '../mock/engine'

type LeadStatus = 'pending' | 'processing' | 'confirmed' | 'quoting' | 'quoted' | 'won' | 'lost' | 'anomaly' | 'completed'

interface InquiryLead {
  id: string
  source: string
  customer: string
  company: string
  contact: string
  summary: string
  full_text: string
  status: LeadStatus
  priority: 'high' | 'medium' | 'low'
  created_at: string
  quotation?: QuotationInfo
  result_reason?: string
  result_amount?: number
  classification?: ClassificationResult
  parse_result?: ParseResult
}

interface FollowUpRecord {
  id: string
  leadId: string
  content: string
  created_at: string
  type: string
}

interface QuotationVersion {
  version: number
  created_at: string
  total: number
  delivery: string
  payment: string
  products: number
  note?: string
}

interface QuotationProduct {
  name: string
  quantity: number
  unit: string
  unitPrice: number
}

interface QuotationInfo {
  products: QuotationProduct[]
  delivery: string
  payment: string
  validUntil: string
  note?: string
}

interface ClassificationResult {
  category?: string
  spec?: string
  [key: string]: string | undefined
}

interface ParseResult {
  category?: string
  spec?: string
  quantity?: { value: number; unit: string }
  delivery?: string
  payment?: string
}

const leads: InquiryLead[] = [
  {
    id: 'IQ-2024-0001', source: '官网表单', customer: '陈明远', company: '上海自动化科技有限公司',
    contact: '138****1234', summary: '需要采购西门子PLC控制器S7-1200系列，CPU1214C DC/DC/DC 10台...',
    full_text: '需要采购西门子PLC控制器S7-1200系列，CPU1214C DC/DC/DC 10台，要求30天内交货到上海，请报价。',
    status: 'pending', priority: 'high', created_at: '2小时前',
  },
  {
    id: 'IQ-2024-0002', source: '邮件', customer: '林晓峰', company: '苏州精密机械有限公司',
    contact: '139****5678', summary: 'V90伺服驱动器3AC 400V x3台，1FK7伺服电机配套使用...',
    full_text: '采购V90伺服驱动器3AC 400V 3台，配套1FK7伺服电机，要求45天交货，苏州工业园区。',
    status: 'processing', priority: 'high', created_at: '1小时前',
  },
  {
    id: 'IQ-2024-0003', source: '系统API', customer: '周思琪', company: '深圳电子元器件公司',
    contact: '137****9012', summary: 'STM32F103C8T6 x500, LM317T x200, 电解电容...',
    full_text: '批量采购：STM32F103C8T6 x500, LM317T x200, 100uF/25V电解电容 x1000, 10K 0805贴片电阻 x5000, IRLZ44N MOS管 x300。要求原装正品。',
    status: 'quoting', priority: 'medium', created_at: '3小时前',
    quotation: {
      products: [
        { name: 'STM32F103C8T6', quantity: 500, unit: '件', unitPrice: 11.8 },
        { name: 'LM317T', quantity: 200, unit: '件', unitPrice: 3.2 },
      ],
      delivery: '20天内',
      payment: '预付50%',
      validUntil: '30天',
      note: '原装正品，含RoHS',
    },
  },
  {
    id: 'IQ-2024-0004', source: '微信', customer: '吴建国', company: '宁波模具制造有限公司',
    contact: '136****3456', summary: '定制加工45号钢齿轮轴20件，图纸稍后提供...',
    full_text: '定制加工45号钢齿轮轴，模数3，齿数28，总长185mm，调质处理HRC28-32，20件，15天交货到宁波北仑。',
    status: 'anomaly', priority: 'low', created_at: '5小时前',
  },
  {
    id: 'IQ-2024-0005', source: '官网表单', customer: '孙七', company: '杭州化工科技有限公司',
    contact: '135****7890', summary: '紧急采购工业级乙醇500kg，纯度≥99.7%...',
    full_text: '紧急采购工业级乙醇500kg，纯度≥99.7%，要求本周内交货到苏州工业园区，含税运价格。',
    status: 'quoting', priority: 'high', created_at: '30分钟前',
    quotation: {
      products: [
        { name: '工业级乙醇', quantity: 500, unit: 'kg', unitPrice: 6.5 },
      ],
      delivery: '本周内',
      payment: '含税运',
      validUntil: '7天',
      note: '危化品运输另行确认',
    },
  },
  {
    id: 'IQ-2024-0006', source: '邮件', customer: '周八', company: '无锡电气设备有限公司',
    contact: '134****2345', summary: '变频器ACS580-01-044A-3 x5台，含安装指导...',
    full_text: '采购ABB变频器ACS580-01-044A-3 5台，功率22kW，三相380V，要求含安装指导手册，30天内交货。',
    status: 'quoted', priority: 'medium', created_at: '4小时前',
    quotation: {
      products: [
        { name: 'ABB变频器 ACS580-01-044A-3', quantity: 5, unit: '台', unitPrice: 12800 },
      ],
      delivery: '30天内',
      payment: '月结45天',
      validUntil: '15天',
      note: '含安装指导手册',
    },
  },
  {
    id: 'IQ-2024-0007', source: '系统API', customer: '吴九', company: '南京工业机器人公司',
    contact: '133****6789', summary: 'IRB 1200-7/0.7 六轴工业机器人 x2台...',
    full_text: '采购ABB IRB 1200-7/0.7 六轴工业机器人2台，负载7kg，臂展700mm，用于3C行业装配线，要求含培训和售后服务。',
    status: 'won', priority: 'high', created_at: '2小时前',
    result_reason: '含培训和售后服务方案，客户接受总价',
    result_amount: 156000,
    quotation: {
      products: [
        { name: 'ABB IRB 1200-7/0.7', quantity: 2, unit: '台', unitPrice: 78000 },
      ],
      delivery: '45天内',
      payment: '预付30%，验收后70%',
      validUntil: '30天',
      note: '含培训和售后服务',
    },
  },
  {
    id: 'IQ-2024-0008', source: '微信', customer: '郑十', company: '常州液压气动公司',
    contact: '132****0123', summary: '液压缸HSG80/50-300 x10件，工作压力16MPa...',
    full_text: '采购液压缸HSG80/50-300 10件，工作压力16MPa，行程300mm，缸径80mm，杆径50mm，20天内交货。',
    status: 'lost', priority: 'medium', created_at: '6小时前',
    result_reason: '客户转向本地供应商',
    result_amount: 0,
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
    quotation: {
      products: [
        { name: '氩弧焊机 WSM-400', quantity: 3, unit: '台', unitPrice: 9200 },
      ],
      delivery: '25天内',
      payment: '预付50%',
      validUntil: '20天',
      note: '含氩气减压器和焊枪',
    },
  },
  {
    id: 'IQ-2024-0012', source: '微信', customer: '褚十四', company: '大连轴承制造有限公司',
    contact: '128****6789', summary: '深沟球轴承6205-2RS x500套...',
    full_text: '采购深沟球轴承6205-2RS 500套，内径25mm，外径52mm，宽度15mm，双面密封，要求NSK或SKF品牌。',
    status: 'quoting', priority: 'medium', created_at: '1天前',
    quotation: {
      products: [
        { name: '深沟球轴承 6205-2RS', quantity: 500, unit: '套', unitPrice: 18.5 },
      ],
      delivery: '20天内',
      payment: '月结30天',
      validUntil: '15天',
      note: '品牌限定 NSK / SKF',
    },
  },
]

const followUps: FollowUpRecord[] = [
  { id: 'FU-001', leadId: 'IQ-2024-0003', content: '客户确认收到报价，等待内部审批', created_at: '2小时前', type: 'update' },
  { id: 'FU-002', leadId: 'IQ-2024-0003', content: '报价邮件已发送至客户邮箱', created_at: '1天前', type: 'quotation' },
  { id: 'FU-003', leadId: 'IQ-2024-0003', content: '电话沟通交期细节，客户要求提前5天', created_at: '3天前', type: 'phone' },
  { id: 'FU-004', leadId: 'IQ-2024-0005', content: '首次报价发送，包含1项产品', created_at: '4天前', type: 'update' },
]

const quotationHistories: Record<string, QuotationVersion[]> = {
  'IQ-2024-0003': [
    { version: 1, created_at: '2024-04-15 10:30', total: 45600, delivery: '30天内', payment: '月结60天', products: 3 },
    { version: 2, created_at: '2024-04-18 14:20', total: 42800, delivery: '25天内', payment: '月结45天', products: 3, note: '根据客户反馈调整价格和交期' },
  ],
}

const similarQuotations = [
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
]

const attributionFunnel = {
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
}

const attributionSources = [
  { name: '官网表单', count: 456, won: 98, rate: 21.5 },
  { name: '邮件', count: 312, won: 67, rate: 21.5 },
  { name: '系统API', count: 289, won: 42, rate: 14.5 },
  { name: '微信', count: 223, won: 27, rate: 12.1 },
]

const attributionCategories = [
  { name: '工业自动化', count: 345, won: 89, rate: 25.8, avg_amount: 45600 },
  { name: '电气元件', count: 278, won: 56, rate: 20.1, avg_amount: 23400 },
  { name: '传感器', count: 198, won: 45, rate: 22.7, avg_amount: 12800 },
  { name: '驱动系统', count: 156, won: 28, rate: 17.9, avg_amount: 67800 },
  { name: '仪器仪表', count: 123, won: 16, rate: 13.0, avg_amount: 34500 },
]

const knowledgeBase = [
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
]

const attributionTrend = {
  dates: ['4/1', '4/2', '4/3', '4/4', '4/5', '4/6', '4/7', '4/8', '4/9', '4/10', '4/11', '4/12', '4/13', '4/14', '4/15'],
  leads: [45, 52, 48, 63, 57, 71, 68, 75, 82, 79, 85, 90, 88, 95, 102],
  won: [12, 15, 11, 18, 16, 21, 19, 23, 25, 22, 26, 28, 27, 29, 32],
  amount: [45600, 52000, 38400, 67800, 58900, 78400, 72100, 89500, 95600, 87300, 98700, 105000, 102300, 112000, 125600],
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

const statsFromLeads = () => ({
  pending: leads.filter(l => l.status === 'pending').length,
  processing: leads.filter(l => l.status === 'processing').length,
  confirmed: leads.filter(l => l.status === 'confirmed').length,
  quoting: leads.filter(l => l.status === 'quoting').length,
  quoted: leads.filter(l => l.status === 'quoted').length,
  won: leads.filter(l => l.status === 'won').length,
  lost: leads.filter(l => l.status === 'lost').length,
  anomaly: leads.filter(l => l.status === 'anomaly').length,
})

const makeQuotationFromParse = (leadId: string, parseResult: ParseResult) => ({
  leadId,
  products: [
    {
      name: parseResult.spec || parseResult.category || '待确认产品',
      quantity: Number(parseResult.quantity?.value || 1),
      unit: parseResult.quantity?.unit || '台',
      unitPrice: 0,
    },
  ],
  delivery: parseResult.delivery || '待确认',
  payment: parseResult.payment || '待确认',
  validUntil: '15天',
  note: '',
})

export const inquiryDataStore = {
  getInquiryList: () => ({
    items: clone(leads),
    total: leads.length,
    stats: statsFromLeads(),
  }),

  getInquiryDetail: (id: string) => clone(leads.find(lead => lead.id === id) || null),

  parseInquiry: async (text: string, options?: { isManual?: boolean; source?: string }) => {
    const pipeline = await runPipeline(text)
    const parsed = generateParseResult(text)
    const leadId = `IQ-${Date.now()}`
    const customer = options?.isManual ? '手动录入用户' : '新线索客户'
    const company = options?.isManual ? '手动录入公司' : '待补充公司'
    const newLead: InquiryLead = {
      id: leadId,
      source: options?.source || '手动录入',
      customer,
      company,
      contact: '待补充',
      summary: text.length > 40 ? `${text.slice(0, 40)}...` : text,
      full_text: text,
      status: 'processing',
      priority: 'medium',
      created_at: '刚刚',
      parse_result: parsed,
    }
    leads.unshift(newLead)
    return {
      ...clone(parsed),
      leadId,
      engine: pipeline.engine,
      pipeline: pipeline.stages.map((stage) => ({ name: stage.name, duration: stage.duration })),
      totalDuration: pipeline.totalDuration,
    }
  },

  batchTransform: (ids: string[]) => {
    leads.forEach((lead) => {
      if (ids.includes(lead.id) && lead.status === 'pending') {
        lead.status = 'processing'
      }
    })
    return { total: ids.length, message: `已创建${ids.length}个AI转化任务` }
  },

  classifyInquiry: () => clone(generateClassificationResult()),

  getSimilarInquiries: () => clone(generateSimilarInquiries()),

  confirmInquiry: (leadId: string, classification: ClassificationResult, parseResult?: ParseResult) => {
    const lead = leads.find(item => item.id === leadId)
    if (!lead) {
      return { message: '线索不存在' }
    }
    lead.status = 'confirmed'
    lead.classification = classification
    if (parseResult) {
      lead.parse_result = parseResult
    }
    lead.quotation = lead.quotation || makeQuotationFromParse(leadId, parseResult || lead.parse_result || {})
    return { message: '归类已确认，线索已更新' }
  },

  getFollowUps: (leadId: string) => ({
    items: clone(followUps.filter(item => item.leadId === leadId)),
  }),

  addFollowUp: (leadId: string, payload: { content: string; type?: string }) => {
    const record: FollowUpRecord = {
      id: `FU-${Date.now()}`,
      leadId,
      content: payload.content,
      created_at: '刚刚',
      type: payload.type || 'follow_up',
    }
    followUps.unshift(record)
    return { message: '跟进记录已添加', record: clone(record) }
  },

  getQuotationHistory: (leadId: string) => ({
    versions: clone(quotationHistories[leadId] || []),
  }),

  getSimilarQuotations: () => ({
    similar: clone(similarQuotations),
  }),

  saveQuotation: (leadId: string, quotation: QuotationInfo) => {
    const lead = leads.find(item => item.id === leadId)
    if (!lead) {
      return { message: '线索不存在' }
    }
    lead.quotation = clone(quotation)
    lead.status = 'quoted'
    const total = (quotation.products || []).reduce((sum: number, item: QuotationProduct) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0)
    const versions = quotationHistories[leadId] || []
    const version = versions.length + 1
    versions.unshift({
      version,
      created_at: version === 1 ? '刚刚' : '刚刚',
      total,
      delivery: quotation.delivery || '待确认',
      payment: quotation.payment || '待确认',
      products: (quotation.products || []).length,
      note: quotation.note,
    })
    quotationHistories[leadId] = versions
    followUps.unshift({
      id: `FU-${Date.now()}`,
      leadId,
      content: version === 1 ? '首次报价已发送给客户' : `第${version}版报价已发送给客户`,
      created_at: '刚刚',
      type: version === 1 ? 'quotation' : 'revision',
    })
    return { message: '报价已保存并发送', quotation: clone(quotation) }
  },

  markResult: (leadId: string, result: 'won' | 'lost', reason?: string, amount?: number) => {
    const lead = leads.find(item => item.id === leadId)
    if (!lead) {
      return { message: '线索不存在' }
    }
    lead.status = result
    lead.result_reason = reason
    lead.result_amount = amount
    followUps.unshift({
      id: `FU-${Date.now()}`,
      leadId,
      content: result === 'won' ? `已标记成单：${reason || '成交'}` : `已标记丢单：${reason || '未成交'}`,
      created_at: '刚刚',
      type: 'result',
    })
    return { message: result === 'won' ? '已标记为成单' : '已标记为丢单' }
  },

  getAttributionFunnel: () => clone(attributionFunnel),
  getAttributionSource: () => ({ sources: clone(attributionSources) }),
  getAttributionCategory: () => ({ categories: clone(attributionCategories) }),
  getKnowledgeBase: () => ({ items: clone(knowledgeBase) }),
  getAttributionTrend: () => ({ trend: clone(attributionTrend) }),
}
