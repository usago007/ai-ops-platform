export interface MktStats {
  generated: number
  avg_latency: number
  compliance_rate: number
  ctr_lift: number
  today_generated: number
  templates_used: number
  ab_tests_running: number
}

export interface MktTemplate {
  id: string
  name: string
  scene: string
  style: string
  channels: string[]
  description: string
  expected_ctr: string
}

export interface MktTrend {
  dates: string[]
  ctr: number[]
  cvr: number[]
  ai_ctr: number[]
  ai_cvr: number[]
}

export interface MktAttributionItem {
  name: string
  channel: string
  impressions: number
  ctr: number
  cvr: number
  ai_assisted: boolean
  amount: number
}

const stats: MktStats = {
  generated: 856,
  avg_latency: 3500,
  compliance_rate: 97,
  ctr_lift: 50,
  today_generated: 34,
  templates_used: 156,
  ab_tests_running: 3,
}

const templates: MktTemplate[] = [
  {
    id: 'TPL-001',
    name: '双11大促',
    scene: 'promotion',
    style: 'urgent',
    channels: ['landing', 'sms'],
    description: '适用于双11、618等大型促销活动，强调限时优惠和紧迫感',
    expected_ctr: '4.5%~6.2%',
  },
  {
    id: 'TPL-002',
    name: '新品首发',
    scene: 'launch',
    style: 'professional',
    channels: ['landing', 'push'],
    description: '适用于新产品发布，突出核心卖点和技术优势',
    expected_ctr: '3.8%~5.5%',
  },
  {
    id: 'TPL-003',
    name: '会员专属福利',
    scene: 'vip',
    style: 'friendly',
    channels: ['sms', 'push'],
    description: '面向VIP会员的专属营销，强调身份尊贵和专属优惠',
    expected_ctr: '5.0%~7.8%',
  },
  {
    id: 'TPL-004',
    name: '限时秒杀',
    scene: 'flash_sale',
    style: 'urgent',
    channels: ['push', 'sms'],
    description: '限时限量秒杀活动，制造紧迫感和稀缺性',
    expected_ctr: '5.2%~8.5%',
  },
  {
    id: 'TPL-005',
    name: '节日问候营销',
    scene: 'promotion',
    style: 'friendly',
    channels: ['sms'],
    description: '结合节日祝福进行软性营销，适合中秋、春节等传统节日',
    expected_ctr: '2.8%~4.2%',
  },
  {
    id: 'TPL-006',
    name: '清仓特卖',
    scene: 'promotion',
    style: 'urgent',
    channels: ['landing', 'sms', 'push'],
    description: '季末清仓、库存清理，突出折扣力度和数量有限',
    expected_ctr: '4.0%~6.0%',
  },
]

const trend: MktTrend = {
  dates: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
  ctr: [3.2, 3.3, 3.1, 3.4, 3.2, 3.5, 3.3, 3.2],
  cvr: [1.8, 1.9, 1.7, 2.0, 1.9, 2.1, 2.0, 1.9],
  ai_ctr: [3.5, 3.8, 4.2, 4.5, 4.8, 5.1, 5.3, 5.5],
  ai_cvr: [2.0, 2.2, 2.5, 2.8, 3.0, 3.2, 3.4, 3.6],
}

const attribution: MktAttributionItem[] = [
  { name: '春季工业自动化促销', channel: '落地页', impressions: 12500, ctr: 4.8, cvr: 3.2, ai_assisted: true, amount: 45600 },
  { name: 'PLC控制器新品推广', channel: '短信', impressions: 8900, ctr: 5.2, cvr: 2.8, ai_assisted: true, amount: 28900 },
  { name: '元器件清仓特卖', channel: 'Push', impressions: 15600, ctr: 6.1, cvr: 4.5, ai_assisted: true, amount: 67800 },
  { name: '机器人售后服务宣传', channel: '社交媒体', impressions: 5200, ctr: 3.5, cvr: 1.8, ai_assisted: true, amount: 15600 },
  { name: '变频器限时折扣', channel: '落地页', impressions: 9800, ctr: 4.2, cvr: 2.5, ai_assisted: false, amount: 0 },
  { name: '传感器产品推介', channel: '短信', impressions: 6700, ctr: 3.8, cvr: 2.1, ai_assisted: false, amount: 0 },
]

export const mktDataStore = {
  getStats: () => ({ ...stats }),
  getTemplates: () => ({ templates: templates.map(item => ({ ...item })) }),
  getTrend: () => ({ trend: { ...trend, dates: [...trend.dates], ctr: [...trend.ctr], cvr: [...trend.cvr], ai_ctr: [...trend.ai_ctr], ai_cvr: [...trend.ai_cvr] } }),
  getAttribution: () => ({ items: attribution.map(item => ({ ...item })) }),
}
