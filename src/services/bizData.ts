const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

const stats = {
  processed: 1245,
  avg_latency: 1200,
  accuracy: 94.2,
  time_saved: 68,
  today_processed: 23,
  total_products: 1245,
  structured_products: 986,
  quality_score: 87.5,
}

const cases = [
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
]

export const bizDataStore = {
  getOverviewStats: () => clone(stats),
  getCases: () => ({ cases: clone(cases) }),
}
