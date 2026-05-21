import { http, HttpResponse, delay } from 'msw'
import { successResponse } from '../utils'

export const overviewHandlers = [
  http.get('/api/v1/biz/overview/stats', async () => {
    await delay(500)
    return successResponse({
      processed: 1245,
      avg_latency: 1200,
      accuracy: 94.2,
      time_saved: 68,
      today_processed: 23,
      total_products: 1245,
      structured_products: 986,
      quality_score: 87.5,
    })
  }),

  http.get('/api/v1/biz/overview/cases', async () => {
    await delay(300)
    return successResponse({
      cases: [
        {
          id: 'CASE-001',
          title: '工业自动化设备询价',
          difficulty: 'medium',
          description: '包含PLC控制器、变频器等多品类询价，文本混杂规格参数和交期要求',
          original_text: '需要采购西门子PLC控制器S7-1200系列，CPU1214C DC/DC/DC 10台，V90伺服驱动器3台，要求30天内交货到上海松江，付款方式月结60天，请报价。',
          parse_result: {
            category: '工业自动化',
            spec: 'PLC控制器 S7-1200 / V90伺服驱动器',
            quantity: { value: 13, unit: '台' },
            delivery: '30天内',
            region: '上海松江',
            payment: '月结60天',
            confidence: 0.95,
          },
          classify_result: {
            level1: '工业控制设备',
            level2: 'PLC可编程控制器',
            level1_confidence: 0.97,
            level2_confidence: 0.94,
          },
        },
        {
          id: 'CASE-002',
          title: '电子元器件批量询价',
          difficulty: 'hard',
          description: '超过50种不同型号的电子元器件，包含大量专业缩写和参数规格',
          original_text: '批量采购：STM32F103C8T6 x500, LM317T x200, 100uF/25V电解电容 x1000, 10K 0805贴片电阻 x5000, IRLZ44N MOS管 x300。要求原装正品，需提供RoHS证书，深圳交货。',
          parse_result: {
            category: '电子元器件',
            spec: 'STM32F103C8T6 / LM317T / 电解电容 / 贴片电阻 / MOS管',
            quantity: { value: 7000, unit: '件' },
            delivery: '需确认',
            region: '深圳',
            payment: '需确认',
            confidence: 0.88,
          },
          classify_result: {
            level1: '电子元器件',
            level2: '集成电路/MCU',
            level1_confidence: 0.98,
            level2_confidence: 0.92,
          },
        },
        {
          id: 'CASE-003',
          title: '化工原料紧急采购',
          difficulty: 'easy',
          description: '标准化工原料采购，信息清晰完整，交期紧急',
          original_text: '紧急采购工业级乙醇500kg，纯度≥99.7%，要求本周内交货到苏州工业园区，含税运价格。',
          parse_result: {
            category: '化工原料',
            spec: '工业级乙醇 纯度≥99.7%',
            quantity: { value: 500, unit: 'kg' },
            delivery: '本周内',
            region: '苏州工业园区',
            payment: '含税运',
            confidence: 0.97,
          },
          classify_result: {
            level1: '化工产品',
            level2: '有机化工原料',
            level1_confidence: 0.96,
            level2_confidence: 0.95,
          },
        },
        {
          id: 'CASE-004',
          title: '机械零部件定制加工',
          difficulty: 'hard',
          description: '非标零部件定制，包含图纸要求和材质说明',
          original_text: '定制加工45号钢齿轮轴，模数3，齿数28，总长185mm，调质处理HRC28-32，表面镀铬0.02-0.03mm，需提供材质报告，20件，15天交货到宁波北仑。',
          parse_result: {
            category: '机械零部件',
            spec: '45号钢齿轮轴 模数3 齿数28',
            quantity: { value: 20, unit: '件' },
            delivery: '15天',
            region: '宁波北仑',
            payment: '需确认',
            confidence: 0.91,
          },
          classify_result: {
            level1: '机械零部件',
            level2: '传动件/齿轮',
            level1_confidence: 0.95,
            level2_confidence: 0.93,
          },
        },
      ],
    })
  }),

  http.get('/api/v1/mkt/overview/stats', async () => {
    await delay(500)
    return successResponse({
      generated: 856,
      avg_latency: 3500,
      compliance_rate: 97,
      ctr_lift: 50,
      today_generated: 34,
      templates_used: 156,
      ab_tests_running: 3,
    })
  }),

  http.get('/api/v1/mkt/overview/templates', async () => {
    await delay(300)
    return successResponse({
      templates: [
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
      ],
    })
  }),

  http.get('/api/v1/mkt/overview/trend', async () => {
    await delay(400)
    return successResponse({
      trend: {
        dates: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
        ctr: [3.2, 3.3, 3.1, 3.4, 3.2, 3.5, 3.3, 3.2],
        cvr: [1.8, 1.9, 1.7, 2.0, 1.9, 2.1, 2.0, 1.9],
        ai_ctr: [3.5, 3.8, 4.2, 4.5, 4.8, 5.1, 5.3, 5.5],
        ai_cvr: [2.0, 2.2, 2.5, 2.8, 3.0, 3.2, 3.4, 3.6],
      },
    })
  }),

  http.get('/api/v1/mkt/attribution', async () => {
    await delay(400)
    return successResponse({
      items: [
        { name: '春季工业自动化促销', channel: '落地页', impressions: 12500, ctr: 4.8, cvr: 3.2, ai_assisted: true, amount: 45600 },
        { name: 'PLC控制器新品推广', channel: '短信', impressions: 8900, ctr: 5.2, cvr: 2.8, ai_assisted: true, amount: 28900 },
        { name: '元器件清仓特卖', channel: 'Push', impressions: 15600, ctr: 6.1, cvr: 4.5, ai_assisted: true, amount: 67800 },
        { name: '机器人售后服务宣传', channel: '社交媒体', impressions: 5200, ctr: 3.5, cvr: 1.8, ai_assisted: true, amount: 15600 },
        { name: '变频器限时折扣', channel: '落地页', impressions: 9800, ctr: 4.2, cvr: 2.5, ai_assisted: false, amount: 0 },
        { name: '传感器产品推介', channel: '短信', impressions: 6700, ctr: 3.8, cvr: 2.1, ai_assisted: false, amount: 0 },
      ],
    })
  }),
]
