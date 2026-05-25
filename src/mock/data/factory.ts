/* Mock data factory for AI platform demo */

export const generateInquiries = () => {
  const categories = ['工业自动化', '传感器', 'PLC控制器', '变频器', '工业机器人', '工业视觉']
  const products = ['PLC控制器 FX3U-64MT', '温度传感器 PT100', '变频器 ACS580', '伺服电机 MR-J4', '工业相机 acA2500', '人机界面 KTP700']
  const statuses = ['待处理', '处理中', '已完成', '已关闭']
  const inquiries = []
  for (let i = 1; i <= 25; i++) {
    inquiries.push({
      id: `IQ-2024-${String(i).padStart(4, '0')}`,
      title: `关于${products[i % products.length]}的询价`,
      content: `我司需要采购${products[i % products.length]}，请提供详细报价和技术参数。`,
      category: categories[i % categories.length],
      status: statuses[i % statuses.length],
      priority: i % 3 === 0 ? '高' : i % 3 === 1 ? '中' : '低',
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      customer: `客户${String.fromCharCode(64 + (i % 26))}`,
    })
  }
  return inquiries
}

export const generateParseResult = (text: string) => {
  const products = ['PLC控制器 FX3U-64MT', '温度传感器 PT100', '变频器 ACS580-01', '伺服电机 MR-J4-70A']
  return {
    category: '工业自动化',
    spec: products[Math.floor(Math.random() * products.length)],
    quantity: { value: Math.floor(Math.random() * 100) + 10, unit: '台' },
    delivery: '30天内',
    region: '华东地区',
    payment: '月结30天',
    confidence: Number((0.88 + Math.random() * 0.1).toFixed(2)),
    risk_level: Math.random() < 0.1 ? 'high' : Math.random() < 0.3 ? 'medium' : 'low',
    risk_reasons: Math.random() < 0.1 ? ['价格偏离历史均价30%', '交期要求异常紧迫'] : [],
  }
}

export const generateClassificationResult = () => {
  const level2Options = ['PLC控制器', '传感器', '变频器', '伺服系统', '工业相机']
  return {
    level1: '工业自动化',
    level2: level2Options[Math.floor(Math.random() * level2Options.length)],
    level1_confidence: Number((0.92 + Math.random() * 0.07).toFixed(2)),
    level2_confidence: Number((0.88 + Math.random() * 0.1).toFixed(2)),
  }
}

export const generateSimilarInquiries = () => [
  { id: 'IQ-2024-0892', title: 'PLC控制器批量采购询价', similarity: 0.92, status: '成交', amount: '¥128,000' },
  { id: 'IQ-2024-0756', title: '工业自动化产品询价', similarity: 0.87, status: '成交', amount: '¥115,000' },
  { id: 'IQ-2024-0612', title: 'FX3U系列控制器询价', similarity: 0.81, status: '失效', amount: null },
]

export const generateProducts = () => {
  const names = [
    'PLC控制器 FX3U-64MT', '温度传感器 PT100', '变频器 ACS580-01',
    '伺服电机 MR-J4-70A', '工业相机 acA2500-14cm', '人机界面 KTP700 Basic',
    '接近传感器 NBB10-30GM50', '继电器模块 RM48', '通信模块 CM1243-5',
    '执行器 VAT216', '数据采集器 7LM3310', '安全继电器 SRB240E',
  ]
  return names.map((name, i) => ({
    id: `SKU-${String(1000 + i)}`,
    name,
    completenessScore: Math.floor(40 + Math.random() * 55),
    category: ['工业自动化', '传感器', '电气元件'][i % 3],
    price: Math.floor(500 + Math.random() * 15000),
    status: i % 5 === 0 ? '待审核' : '正常',
    missingFields: ['材质', '重量', '认证标准'].slice(0, Math.floor(Math.random() * 3)),
  }))
}

export const generateStructuredProduct = () => ({
  sku: 'SKU-1000',
  name: 'PLC控制器 FX3U-64MT',
  original_text: '三菱FX3U系列PLC，64个I/O点，晶体管输出，支持以太网通信',
  attributes: [
    { name: '品牌', value: '三菱(MITSUBISHI)', confidence: 0.98, status: 'confirmed', source: 'text' },
    { name: '型号', value: 'FX3U-64MT', confidence: 0.96, status: 'confirmed', source: 'text' },
    { name: 'I/O点数', value: '64点', confidence: 0.95, status: 'confirmed', source: 'text' },
    { name: '输出类型', value: '晶体管输出', confidence: 0.93, status: 'pending', source: 'text' },
    { name: '通信接口', value: '以太网/RJ45', confidence: 0.89, status: 'pending', source: 'text' },
    { name: '工作电压', value: 'DC 24V', confidence: 0.85, status: 'suggested', source: 'ai' },
    { name: '尺寸', value: '208×87×75mm', confidence: 0.72, status: 'suggested', source: 'ocr' },
    { name: '重量', value: '0.7kg', confidence: 0.68, status: 'suggested', source: 'ai' },
  ],
  quality_score: 78,
})

export const generateQualityScore = () => ({
  score: Math.floor(55 + Math.random() * 40),
  maxScore: 100,
  issues: [
    { field: '材质', severity: 'warning', message: '缺少必填属性' },
    { field: '认证标准', severity: 'error', message: '缺少认证信息' },
  ],
})

export const generateRules = () => {
  const ruleNames = [
    '询报价自动归类规则', '高风险询价预警规则', '价格异常检测规则',
    '交期合理性校验规则', '客户信用评级规则', '供应商匹配规则',
    '合同条款审核规则', '发票类型匹配规则', '物流方式选择规则',
  ]
  return ruleNames.map((name, i) => ({
    id: `RULE-${String(100 + i)}`,
    name,
    condition: `IF 询价类别 = "${['工业自动化', '传感器', '电气元件'][i % 3]}"`,
    action: `THEN 路由至 "${['自动化组', '传感器组', '电气组'][i % 3]}"`,
    status: i % 4 === 0 ? 'disabled' : 'active',
    version: `v${1 + Math.floor(i / 3)}.${i % 3}`,
    createdAt: new Date(Date.now() - i * 86400000 * 7).toISOString(),
    conflictWith: i === 2 ? 'RULE-100' : null,
  }))
}

export const generateCSMessages = () => [
  { id: 'msg-1', role: 'customer', content: '你好，我想咨询一下PLC控制器的价格', timestamp: '10:30', intent: '询价' },
  { id: 'msg-2', role: 'agent', content: '您好！请问您需要什么型号的PLC控制器？', timestamp: '10:31' },
  { id: 'msg-3', role: 'customer', content: 'FX3U-64MT，需要50台', timestamp: '10:32', intent: '明确需求' },
  { id: 'msg-4', role: 'agent', content: '好的，FX3U-64MT目前单价约¥2,560/台，50台可以享受批量折扣。', timestamp: '10:33' },
  { id: 'msg-5', role: 'customer', content: '交期多久？能便宜点吗？', timestamp: '10:35', intent: '议价' },
]

export const generateReplySuggestions = () => [
  '关于交期，FX3U-64MT常规库存充足，预计7-10个工作日可发货。',
  '50台批量采购可申请95折优惠，我帮您提交特批申请。',
  '建议您同时采购编程电缆和扩展模块，可以一起享受优惠。',
  '我们有技术工程师可以提供免费的编程指导，需要为您安排吗？',
]

export const generateMarketingContent = () => ({
  versions: [
    {
      id: 'v1',
      title: '工业自动化新纪元——FX3U系列PLC控制器',
      subtitle: '高效、稳定、智能，助力产业升级',
      body: '三菱FX3U系列PLC控制器，采用先进处理芯片，运算速度提升40%，支持多种通信协议，满足复杂工业场景需求。',
      style: '专业',
    },
    {
      id: 'v2',
      title: '选PLC，就选FX3U！',
      subtitle: '64个I/O点，一台搞定',
      body: '还在为产线控制烦恼？FX3U-64MT，64点I/O、以太网直连、编程简单，工程师的好帮手！',
      style: '活泼',
    },
    {
      id: 'v3',
      title: 'FX3U PLC · 智造未来',
      subtitle: '精密控制，值得信赖',
      body: '25年工业验证，全球超过100万台的信赖之选。FX3U系列，为您的产线提供稳定可靠的控制核心。',
      style: '正式',
    },
  ],
  compliance: {
    passed: true,
    violations: [],
  },
})

export const generateSellingPoints = () => ({
  core: [
    { text: '运算速度提升40%，响应更快', support: '采用新一代处理芯片', ctr_impact: '+12%' },
    { text: '64点I/O，覆盖多数工业场景', support: '32入/32出灵活配置', ctr_impact: '+8%' },
    { text: '以太网直连，编程更高效', support: '内置RJ45接口', ctr_impact: '+15%' },
  ],
  secondary: [
    '支持多种扩展模块', '全球联保，售后无忧', '兼容FX系列老程序',
    '体积小巧，安装便捷', '低功耗设计，节能环保',
  ],
  ctr_comparison: { with_ai: 4.8, without_ai: 3.2, improvement: '+47.2%' },
})

export const generateFunnelData = () => ({
  stages: [
    { name: '展现', count: 125000, rate: 100 },
    { name: '点击', count: 38500, rate: 30.8 },
    { name: '加购', count: 8200, rate: 6.56 },
    { name: '成交', count: 3100, rate: 2.48 },
  ],
  ab_test: {
    version_a: { name: '原版', conversion: 2.1, data: [1.8, 1.9, 2.0, 2.1, 2.1] },
    version_b: { name: 'AI优化版', conversion: 3.4, data: [2.8, 3.0, 3.2, 3.3, 3.4] },
    significant: true,
    winner: 'version_b',
  },
})

export const generateLandingPageConfig = (source = 'default') => {
  const configs: Record<string, any> = {
    search: {
      title: 'PLC控制器 FX3U-64MT 价格/参数/现货',
      subtitle: '三菱正品 · 现货速发 · 技术支持',
      main_image: 'https://picsum.photos/seed/factory-product/600/400',
      cta: '立即询价',
    },
    ad: {
      title: '限时特惠！FX3U PLC 批量采购95折',
      subtitle: '工业级品质 · 25年验证 · 百万台信赖',
      main_image: 'https://picsum.photos/seed/factory-promo/600/400',
      cta: '抢占优惠',
    },
    direct: {
      title: '三菱FX3U系列PLC控制器官方授权',
      subtitle: '正品保障 · 全国联保 · 专业技术支持',
      main_image: 'https://picsum.photos/seed/factory-official/600/400',
      cta: '了解详情',
    },
  }
  return configs[source] || configs.direct
}

export const generateTemplates = () => [
  { id: 'tpl-1', name: '节日促销', description: '春节/中秋/双11等节日营销模板', category: '促销', image: '🎉' },
  { id: 'tpl-2', name: '新品发布', description: '新品上市推广文案模板', category: '发布', image: '🚀' },
  { id: 'tpl-3', name: '限时秒杀', description: '倒计时+紧迫感营销模板', category: '促销', image: '⚡' },
  { id: 'tpl-4', name: '会员专属', description: 'VIP会员特权营销模板', category: '会员', image: '👑' },
  { id: 'tpl-5', name: '清仓处理', description: '库存清仓降价促销模板', category: '促销', image: '📦' },
  { id: 'tpl-6', name: '品牌故事', description: '品牌历史与价值观宣传模板', category: '品牌', image: '📖' },
]

export const generateMarketingSessions = () => [
  { id: 'cs-mkt-1', customer: '陈先生', product: 'PLC控制器 FX3U', campaign: '春季促销', status: 'active', intent: '价格咨询' },
  { id: 'cs-mkt-2', customer: '林女士', product: '温度传感器 PT100', campaign: '新品推广', status: 'waiting', intent: '技术对比' },
]

export const generateMarketingRecommendations = () => [
  { product: 'PLC控制器 FX3U-64MT', reason: '客户已浏览3次，意向度高', price: '¥2,560/台', discount: '批量95折', urgency: '库存紧张' },
  { product: '编程电缆 USB-SC09', reason: '与PLC配套必购配件', price: '¥180/根', discount: '组合购9折', urgency: null },
]

export const productCategories = [
  {
    id: 'cat-1', name: '工业自动化', level: 1, children: [
      { id: 'cat-1-1', name: 'PLC控制器', level: 2, brand: '三菱', productCount: 12, inquiryCount: 89 },
      { id: 'cat-1-2', name: 'PLC控制器', level: 2, brand: '西门子', productCount: 8, inquiryCount: 67 },
      { id: 'cat-1-3', name: '变频器', level: 2, brand: 'ABB', productCount: 15, inquiryCount: 45 },
      { id: 'cat-1-4', name: '伺服系统', level: 2, brand: '安川', productCount: 6, inquiryCount: 34 },
    ],
  },
  {
    id: 'cat-2', name: '传感器', level: 1, children: [
      { id: 'cat-2-1', name: '温度传感器', level: 2, brand: '欧姆龙', productCount: 20, inquiryCount: 56 },
      { id: 'cat-2-2', name: '接近传感器', level: 2, brand: '倍加福', productCount: 18, inquiryCount: 42 },
      { id: 'cat-2-3', name: '压力传感器', level: 2, brand: 'SMC', productCount: 14, inquiryCount: 38 },
    ],
  },
  {
    id: 'cat-3', name: '电气元件', level: 1, children: [
      { id: 'cat-3-1', name: '继电器', level: 2, brand: '施耐德', productCount: 25, inquiryCount: 78 },
      { id: 'cat-3-2', name: '断路器', level: 2, brand: 'ABB', productCount: 10, inquiryCount: 23 },
    ],
  },
  {
    id: 'cat-4', name: '驱动系统', level: 1, children: [
      { id: 'cat-4-1', name: '伺服驱动器', level: 2, brand: '安川', productCount: 9, inquiryCount: 31 },
      { id: 'cat-4-2', name: '步进驱动器', level: 2, brand: '雷赛', productCount: 7, inquiryCount: 19 },
    ],
  },
  {
    id: 'cat-5', name: '仪器仪表', level: 1, children: [
      { id: 'cat-5-1', name: '温度变送器', level: 2, brand: '横河', productCount: 11, inquiryCount: 27 },
      { id: 'cat-5-2', name: '流量计', level: 2, brand: 'E+H', productCount: 8, inquiryCount: 22 },
    ],
  },
]

export const generatePendingProducts = (inquiryLeads: any[]) => {
  return inquiryLeads
    .filter(lead => lead.status === 'confirmed' || lead.status === 'quoting' || lead.status === 'quoted')
    .map(lead => {
      const text = lead.full_text || lead.summary || ''
      const categoryMatch = text.match(/(PLC|变频器|传感器|伺服|继电器|断路器|机器人)/)
      const brandMatch = text.match(/(西门子|三菱|ABB|欧姆龙|施耐德|安川|SMC)/)
      const quantityMatch = text.match(/(\d+)\s*(台|个|件|套)/)

      const category = categoryMatch ? (
        categoryMatch[1] === 'PLC' ? 'PLC控制器' :
        categoryMatch[1] === '变频器' ? '变频器' :
        categoryMatch[1] === '传感器' ? '传感器' :
        categoryMatch[1] === '伺服' ? '伺服系统' :
        categoryMatch[1] === '继电器' ? '继电器' :
        categoryMatch[1] === '机器人' ? '工业机器人' : '其他'
      ) : '待识别'

      const brand = brandMatch ? brandMatch[1] : '待识别'
      const modelMatch = text.match(/([A-Z0-9-]{3,20})/)
      const model = modelMatch ? modelMatch[1] : '待识别'

      return {
        id: `SKU-PENDING-${lead.id}`,
        name: `${brand} ${category} ${model}`,
        category,
        brand,
        model,
        original_text: text,
        source_inquiry: lead.id,
        source: 'text',
        completenessScore: 30 + Math.floor(Math.random() * 20),
        status: '待结构化',
        attributes: [
          { name: '品牌', value: brand, confidence: brand === '待识别' ? 0.3 : 0.9, status: brand === '待识别' ? 'suggested' : 'confirmed', source: 'text' },
          { name: '品类', value: category, confidence: category === '待识别' ? 0.2 : 0.85, status: category === '待识别' ? 'suggested' : 'pending', source: 'ai' },
          { name: '型号', value: model, confidence: model === '待识别' ? 0.3 : 0.88, status: model === '待识别' ? 'suggested' : 'pending', source: 'text' },
          { name: '数量', value: quantityMatch ? `${quantityMatch[1]}${quantityMatch[2]}` : '待确认', confidence: 0.7, status: 'suggested', source: 'text' },
        ],
        created_at: lead.created_at,
      }
    })
}
