import type { ProductAsset } from '../../contracts'

export function generateProductAssets(): ProductAsset[] {
  return [
    {
      id: 'prod-001',
      sku: 'SKU-1001',
      name: 'PLC控制器 FX3U-64MT',
      brand: '三菱 (MITSUBISHI)',
      category: 'PLC控制器',
      model: 'FX3U-64MT',
      specs: [
        { key: 'io_points', label: 'I/O点数', value: '64', unit: '点' },
        { key: 'output_type', label: '输出类型', value: '晶体管', unit: '' },
        { key: 'power', label: '工作电压', value: 'DC 24V', unit: '' },
        { key: 'dimensions', label: '尺寸', value: '208×87×75', unit: 'mm' },
        { key: 'weight', label: '重量', value: '0.7', unit: 'kg' },
      ],
      baseAttributes: [
        { name: '品牌', value: '三菱(MITSUBISHI)', confidence: 0.98, status: 'confirmed', source: 'erp' },
        { name: '型号', value: 'FX3U-64MT', confidence: 0.96, status: 'confirmed', source: 'erp' },
        { name: 'I/O点数', value: '64点', confidence: 0.95, status: 'confirmed', source: 'erp' },
        { name: '输出类型', value: '晶体管输出', confidence: 0.93, status: 'confirmed', source: 'erp' },
        { name: '通信接口', value: '以太网/RJ45', confidence: 0.89, status: 'confirmed', source: 'erp' },
      ],
      applicationScenarios: [
        '小型产线自动化控制',
        '包装机械控制',
        '物料搬运系统',
        '楼宇自动化',
      ],
      sellingPoints: [
        '运算速度较上代提升40%，响应更快',
        '64点I/O灵活配置，覆盖多数工业场景',
        '内置以太网接口，编程和通信更高效',
        '支持多种扩展模块，灵活升级',
      ],
      faqItems: [
        { question: 'FX3U-64MT支持哪些编程软件？', answer: '支持GX Works2和GX Works3，推荐使用GX Works3。', tags: ['编程', '软件'] },
        { question: '扩展模块如何选型？', answer: 'FX3U系列支持数字量扩展、模拟量扩展、通信扩展等多种模块，需根据实际I/O需求选择。', tags: ['扩展', '选型'] },
      ],
      alternativeModels: ['FX3U-80MT', 'FX5U-64MT', '西门子 S7-1200 1214C'],
      bundleRecommendations: [
        { productId: 'prod-010', productName: '编程电缆 USB-SC09', reason: 'PLC编程必备配件' },
        { productId: 'prod-011', productName: '扩展模块 FX2N-16EX', reason: '扩展I/O点数，满足更多控制需求' },
      ],
      riskNotes: [
        '确认客户使用的是晶体管输出型还是继电器输出型，应用场景不同',
      ],
      complianceNotes: ['符合CE、UL认证', 'RoHS合规'],
      historicalWinRate: 0.72,
      historicalLossReasons: ['价格偏高', '交期不满意', '客户改用国产替代'],
      contentAssets: [
        { type: 'image', url: '/mock/fx3u-64mt.jpg', title: 'FX3U-64MT 产品图', description: '正面视图' },
        { type: 'document', url: '/mock/fx3u-datasheet.pdf', title: 'FX3U系列数据手册' },
      ],
      lastUpdatedAt: '2025-01-10T08:00:00',
    },
    {
      id: 'prod-002',
      sku: 'SKU-2001',
      name: '温度传感器 PT100',
      brand: '欧姆龙 (OMRON)',
      category: '传感器',
      model: 'PT100',
      specs: [
        { key: 'range', label: '测温范围', value: '-50~200', unit: '°C' },
        { key: 'accuracy', label: '精度', value: '±0.15', unit: '°C' },
        { key: 'output', label: '输出信号', value: '4-20mA', unit: '' },
        { key: 'probe_material', label: '探头材质', value: '不锈钢304', unit: '' },
      ],
      baseAttributes: [
        { name: '品牌', value: '欧姆龙(OMRON)', confidence: 0.99, status: 'confirmed', source: 'erp' },
        { name: '型号', value: 'PT100', confidence: 0.99, status: 'confirmed', source: 'erp' },
        { name: '测温范围', value: '-50~200°C', confidence: 0.95, status: 'confirmed', source: 'erp' },
      ],
      applicationScenarios: [
        '工业炉温监测',
        'HVAC温度控制',
        '食品加工温控',
        '化工反应釜监测',
      ],
      sellingPoints: [
        '高精度±0.15°C，满足精密控温需求',
        '不锈钢304探头，耐腐蚀寿命长',
        '标准4-20mA输出，兼容主流PLC',
        '1000+现货库存，即订即发',
      ],
      faqItems: [
        { question: 'PT100和热电偶有什么区别？', answer: 'PT100是铂电阻温度传感器，精度高、稳定性好，适合中低温测量；热电偶适合高温测量。', tags: ['选型', '对比'] },
      ],
      alternativeModels: ['PT1000', 'K型热电偶', 'E型热电偶'],
      bundleRecommendations: [
        { productId: 'prod-020', productName: '温度变送器模块', reason: '将PT100信号转换为标准4-20mA输出' },
      ],
      riskNotes: ['注意安装方式，探头不可浸入腐蚀性液体'],
      complianceNotes: ['符合IEC 60751标准', 'CE认证'],
      historicalWinRate: 0.85,
      historicalLossReasons: ['价格敏感客户选择了国产品牌'],
      contentAssets: [
        { type: 'image', url: '/mock/pt100.jpg', title: 'PT100 产品图' },
        { type: 'document', url: '/mock/pt100-datasheet.pdf', title: 'PT100 技术手册' },
      ],
      lastUpdatedAt: '2025-01-12T10:00:00',
    },
    {
      id: 'prod-003',
      sku: 'SKU-3001',
      name: '变频器 ACS580-01-062A-4',
      brand: 'ABB',
      category: '变频器',
      model: 'ACS580-01-062A-4',
      specs: [
        { key: 'power', label: '功率', value: '30', unit: 'kW' },
        { key: 'voltage', label: '电压', value: '380-480', unit: 'V' },
        { key: 'current', label: '额定电流', value: '62', unit: 'A' },
        { key: 'protection', label: '防护等级', value: 'IP21', unit: '' },
      ],
      baseAttributes: [
        { name: '品牌', value: 'ABB', confidence: 0.99, status: 'confirmed', source: 'erp' },
        { name: '型号', value: 'ACS580-01-062A-4', confidence: 0.99, status: 'confirmed', source: 'erp' },
        { name: '功率', value: '30kW', confidence: 0.98, status: 'confirmed', source: 'erp' },
      ],
      applicationScenarios: [
        '恒压供水系统',
        '风机水泵控制',
        '传送带调速',
        '压缩机控制',
      ],
      sellingPoints: [
        '内置能效优化算法，节电最高达30%',
        '支持Profibus/Profinet等多种现场总线',
        '直观的控制面板，调试简便',
        '全球联保，售后无忧',
      ],
      faqItems: [
        { question: 'ACS580通讯模块如何选型？', answer: 'ACS580支持Profibus DP、Profinet IO、EtherNet/IP等多种通讯模块，根据客户上位系统选择对应的适配器型号。', tags: ['通讯', '选型'] },
      ],
      alternativeModels: ['ACS880-01-062A-4', '西门子 G120'],
      bundleRecommendations: [
        { productId: 'prod-030', productName: 'Profibus适配器 FPBA-01', reason: 'Profibus通讯必需模块' },
        { productId: 'prod-031', productName: '制动电阻', reason: '急停或快速减速时保护变频器' },
      ],
      riskNotes: [
        '带Profibus模块的版本库存较少，需提前确认交期',
        '客户如需户外使用，需升级防护等级至IP54',
      ],
      complianceNotes: ['符合IEC 61800标准', 'CE、UL认证'],
      historicalWinRate: 0.68,
      historicalLossReasons: ['交期过长', '品牌锁定改用西门子方案'],
      contentAssets: [
        { type: 'image', url: '/mock/acs580.jpg', title: 'ACS580 产品图' },
        { type: 'document', url: '/mock/acs580-manual.pdf', title: 'ACS580 用户手册' },
      ],
      lastUpdatedAt: '2025-01-08T14:00:00',
    },
  ]
}

export function getProductAssetById(id: string): ProductAsset | undefined {
  return generateProductAssets().find(p => p.id === id)
}
