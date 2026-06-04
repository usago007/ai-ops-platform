/**
 * ProductAsset generator — 60 industrial automation products across 5 categories.
 * Products are independent of all other domain objects (generated first).
 */
import type { SeededRng } from './seeded-random'
import type { ProductAsset } from '../../../contracts'

// ── Product templates ──

interface ProductTemplate {
  sku: string
  name: string
  brand: string
  category: string
  model: string
  specs: Array<{ key: string; label: string; value: string; unit?: string }>
  basePrice: number
  scenarios: string[]
  sellingPoints: string[]
  faqTemplate: Array<{ q: string; a: string }>
  riskNotes: string[]
  complianceNotes: string[]
  altModels: string[]
}

const PRODUCT_TEMPLATES: ProductTemplate[] = [
  // ── PLC Controllers (15) ──
  {
    sku: 'PLC-MIT-FX3U-64MT', name: 'FX3U-64MT PLC控制器', brand: 'Mitsubishi', category: 'PLC控制器', model: 'FX3U-64MT',
    specs: [
      { key: 'io_points', label: 'I/O点数', value: '64', unit: '点' },
      { key: 'program_capacity', label: '程序容量', value: '64000', unit: '步' },
      { key: 'input_type', label: '输入类型', value: 'DC24V/继电器', unit: '' },
      { key: 'output_type', label: '输出类型', value: '晶体管/MOSFET', unit: '' },
      { key: 'comm_port', label: '通讯接口', value: 'RS-485/以太网', unit: '' },
      { key: 'scan_time', label: '扫描周期', value: '0.065', unit: 'μs' },
    ],
    basePrice: 3200, scenarios: ['自动化产线', '包装机械', '物流分拣'],
    sellingPoints: ['全球最畅销PLC系列', '64点I/O满足中型产线', '丰富的FB/FC库支持', '支持CC-Link现场总线'],
    faqTemplate: [
      { q: 'FX3U与FX5U有什么区别？', a: 'FX5U是新一代产品，支持Ethernet/IP和更高处理速度，FX3U性价比更高，适合传统产线。' },
      { q: '编程软件用哪个版本？', a: '推荐使用GX Works3，支持结构化梯形图和SFC编程。' },
    ],
    riskNotes: ['停产预警：FX3U系列预计2027年停产，建议新项目优先选FX5U'], complianceNotes: ['CE/UL/KC认证', 'RoHS合规'],
    altModels: ['FX5U-64MT', 'Q03UDECPU', 'KV-8000'],
  },
  {
    sku: 'PLC-MIT-FX5U-80MT', name: 'FX5U-80MT PLC控制器', brand: 'Mitsubishi', category: 'PLC控制器', model: 'FX5U-80MT',
    specs: [
      { key: 'io_points', label: 'I/O点数', value: '80', unit: '点' },
      { key: 'program_capacity', label: '程序容量', value: '128000', unit: '步' },
      { key: 'input_type', label: '输入类型', value: 'DC24V', unit: '' },
      { key: 'output_type', label: '输出类型', value: '晶体管漏型', unit: '' },
      { key: 'comm_port', label: '通讯接口', value: 'Ethernet/IP,CC-Link IE', unit: '' },
      { key: 'scan_time', label: '扫描周期', value: '0.034', unit: 'μs' },
    ],
    basePrice: 4800, scenarios: ['智能制造产线', '数据采集系统', '机器人工作站'],
    sellingPoints: ['新一代iQ-F系列', '内置Ethernet双端口', '支持SLMP无缝通讯', '内置定位功能(4轴)'],
    faqTemplate: [
      { q: 'FX5U能替代Q系列吗？', a: 'FX5U定位中大型机，适合200点以内；超过200点建议选iQ-R系列。' },
    ],
    riskNotes: [], complianceNotes: ['CE/UL/KC认证', 'RoHS/REACH合规'],
    altModels: ['FX5U-64MT', 'R08CPU', 'NJ501-1500'],
  },
  {
    sku: 'PLC-SIE-S7-1200', name: 'S7-1200 PLC控制器', brand: 'Siemens', category: 'PLC控制器', model: 'S7-1215C',
    specs: [
      { key: 'io_points', label: 'I/O点数', value: '14DI/10DO/2AI/2AO', unit: '点' },
      { key: 'program_capacity', label: '工作存储器', value: '125', unit: 'KB' },
      { key: 'input_type', label: '输入类型', value: 'DC24V', unit: '' },
      { key: 'output_type', label: '输出类型', value: '晶体管/继电器', unit: '' },
      { key: 'comm_port', label: '通讯接口', value: 'PROFINET/以太网', unit: '' },
      { key: 'scan_time', label: '位操作', value: '0.04', unit: 'μs' },
    ],
    basePrice: 5600, scenarios: ['过程自动化', '楼宇控制', '水处理'],
    sellingPoints: ['TIA Portal全集成', 'PROFINET工业以太网', '内置Web Server', 'OPC UA原生支持'],
    faqTemplate: [
      { q: 'S7-1200与S7-1500区别？', a: 'S7-1200适合紧凑型应用(≤8模块)，S7-1500适合中大型系统，处理速度更快。' },
    ],
    riskNotes: ['固件V4.5以下存在安全漏洞，建议升级'], complianceNotes: ['CE/UL/ATEX', 'IEC 61131-3'],
    altModels: ['S7-1500', 'ET200SP CPU', 'MELSEC iQ-F'],
  },
  {
    sku: 'PLC-SIE-S7-1500', name: 'S7-1500 PLC控制器', brand: 'Siemens', category: 'PLC控制器', model: 'S7-1516-3PN',
    specs: [
      { key: 'io_points', label: '最大I/O', value: '8192', unit: '点' },
      { key: 'program_capacity', label: '工作存储器', value: '1', unit: 'MB' },
      { key: 'input_type', label: '输入类型', value: '模块化扩展', unit: '' },
      { key: 'output_type', label: '输出类型', value: '模块化扩展', unit: '' },
      { key: 'comm_port', label: '通讯接口', value: 'PROFINET x3', unit: '' },
      { key: 'scan_time', label: '位操作', value: '0.01', unit: 'μs' },
    ],
    basePrice: 12500, scenarios: ['大型产线控制', '过程工业', '汽车制造'],
    sellingPoints: ['旗舰级性能', '三端口PROFINET', '集成运动控制', '系统冗余支持'],
    faqTemplate: [
      { q: 'S7-1500能做冗余吗？', a: 'S7-1500H支持CPU冗余，S7-1500R支持软件冗余，适合高可用场景。' },
    ],
    riskNotes: ['芯片供应周期较长(12-16周)', '价格波动较大'], complianceNotes: ['CE/UL/ATEX/IECEx', 'IEC 61131-3'],
    altModels: ['S7-1518-4PN', '1756-L85E', 'iQ-R R08CPU'],
  },
  {
    sku: 'PLC-ABB-AC500', name: 'AC500 PLC控制器', brand: 'ABB', category: 'PLC控制器', model: 'PM573-ETH',
    specs: [
      { key: 'io_points', label: '最大I/O', value: '4096', unit: '点' },
      { key: 'program_capacity', label: '用户存储器', value: '512', unit: 'KB' },
      { key: 'input_type', label: '输入类型', value: '模块化', unit: '' },
      { key: 'output_type', label: '输出类型', value: '模块化', unit: '' },
      { key: 'comm_port', label: '通讯接口', value: '以太网/串口/CANopen', unit: '' },
      { key: 'scan_time', label: '指令处理', value: '0.02', unit: 'μs' },
    ],
    basePrice: 7800, scenarios: ['过程控制', '能源管理', '楼宇自动化'],
    sellingPoints: ['ABB Automation Builder', 'PLC+Safety集成', '支持IEC 61131-3五种语言', '内置Web可视化'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL', 'IEC 61131-3'],
    altModels: ['PM583-ETH', 'S7-1500', 'M580'],
  },
  {
    sku: 'PLC-DEL-AS300', name: 'AS300系列PLC', brand: 'Delta', category: 'PLC控制器', model: 'AS332T-A',
    specs: [
      { key: 'io_points', label: '最大I/O', value: '1024', unit: '点' },
      { key: 'program_capacity', label: '程序容量', value: '256', unit: 'KB' },
      { key: 'input_type', label: '输入类型', value: 'DC24V', unit: '' },
      { key: 'output_type', label: '输出类型', value: '晶体管', unit: '' },
      { key: 'comm_port', label: '通讯接口', value: 'Ethernet/RS-485/CANopen', unit: '' },
      { key: 'scan_time', label: '基本指令', value: '0.025', unit: 'μs' },
    ],
    basePrice: 2200, scenarios: ['电子制造', '包装设备', '物流输送'],
    sellingPoints: ['高性价比', 'CODESYS平台开发', '支持EtherCAT总线', '国产品牌供货稳定'],
    faqTemplate: [
      { q: 'AS300编程用哪个软件？', a: '使用DIADesigner（基于CODESYS），或直接使用CODESYS V3.5。' },
    ],
    riskNotes: ['海外认证覆盖较少', '高频应用下散热需关注'], complianceNotes: ['CE', 'RoHS'],
    altModels: ['AS500', 'NX1P2', 'FX5U'],
  },
  {
    sku: 'PLC-OMR-NX1P2', name: 'NX1P2 PLC控制器', brand: 'Omron', category: 'PLC控制器', model: 'NX1P2-1140DT',
    specs: [
      { key: 'io_points', label: 'I/O点数', value: '40', unit: '点' },
      { key: 'program_capacity', label: '程序容量', value: '1.5', unit: 'MB' },
      { key: 'input_type', label: '输入类型', value: 'DC24V', unit: '' },
      { key: 'output_type', label: '输出类型', value: '晶体管NPN', unit: '' },
      { key: 'comm_port', label: '通讯接口', value: 'EtherCAT/EtherNet/IP', unit: '' },
      { key: 'scan_time', label: 'LD指令', value: '0.0025', unit: 'μs' },
    ],
    basePrice: 4200, scenarios: ['小型自动化', '机器人控制', '视觉检测'],
    sellingPoints: ['Sysmac Studio一体化', '内置EtherCAT主站', '运动控制功能块丰富', 'OPC UA Server内置'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL/KC', 'RoHS'],
    altModels: ['NJ501-1500', 'FX5U-80MT'],
  },
  {
    sku: 'PLC-SCH-M241', name: 'Modicon M241 PLC', brand: 'Schneider', category: 'PLC控制器', model: 'TM241CE40T',
    specs: [
      { key: 'io_points', label: 'I/O点数', value: '40', unit: '点' },
      { key: 'program_capacity', label: '程序容量', value: '8', unit: 'MB' },
      { key: 'input_type', label: '输入类型', value: 'DC24V', unit: '' },
      { key: 'output_type', label: '输出类型', value: '晶体管', unit: '' },
      { key: 'comm_port', label: '通讯接口', value: 'Ethernet/串行/CANopen', unit: '' },
      { key: 'scan_time', label: '基本指令', value: '0.03', unit: 'μs' },
    ],
    basePrice: 3500, scenarios: ['包装机械', '物料搬运', '暖通空调'],
    sellingPoints: ['EcoStruxure Machine Expert', '双以太网口', 'SD卡数据记录', '内置FTP/Web服务器'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL/CSA', 'IEC 61131-3'],
    altModels: ['TM241CE24R', 'S7-1200', 'FX5U'],
  },
  {
    sku: 'PLC-ROCK-CLX', name: 'ControlLogix 5580 PLC', brand: 'Rockwell', category: 'PLC控制器', model: '1756-L85E',
    specs: [
      { key: 'io_points', label: '最大I/O', value: '128000', unit: '点' },
      { key: 'program_capacity', label: '用户存储器', value: '40', unit: 'MB' },
      { key: 'input_type', label: '输入类型', value: '模块化', unit: '' },
      { key: 'output_type', label: '输出类型', value: '模块化', unit: '' },
      { key: 'comm_port', label: '通讯接口', value: 'EtherNet/IP x2', unit: '' },
      { key: 'scan_time', label: '扫描周期', value: '0.02', unit: 'ms' },
    ],
    basePrice: 18000, scenarios: ['汽车制造', '食品饮料', '石油化工'],
    sellingPoints: ['Studio 5000全集成环境', '128K I/O最大容量', '千兆EtherNet/IP', '冗余控制器支持'],
    faqTemplate: [],
    riskNotes: ['价格高端', '供货周期较长(约16周)'], complianceNotes: ['CE/UL/ATEX', 'ISA-88'],
    altModels: ['1756-L84E', 'S7-1518', 'iQ-R R120CPU'],
  },
  {
    sku: 'PLC-PAN-FPXH', name: 'FPXH系列PLC', brand: 'Panasonic', category: 'PLC控制器', model: 'AFPXHC60T',
    specs: [
      { key: 'io_points', label: 'I/O点数', value: '60', unit: '点' },
      { key: 'program_capacity', label: '程序容量', value: '64', unit: 'K步' },
      { key: 'input_type', label: '输入类型', value: 'DC24V', unit: '' },
      { key: 'output_type', label: '输出类型', value: '晶体管', unit: '' },
      { key: 'comm_port', label: '通讯接口', value: 'EtherNet/IP,RS-485', unit: '' },
      { key: 'scan_time', label: '基本指令', value: '0.02', unit: 'μs' },
    ],
    basePrice: 2800, scenarios: ['电子组装', '小型产线', '检测设备'],
    sellingPoints: ['小巧紧凑', '内置定位功能(6轴)', '松下伺服无缝连接', '高性价比'],
    faqTemplate: [],
    riskNotes: ['海外市场支持有限'], complianceNotes: ['CE', 'RoHS'],
    altModels: ['FPXHC30T', 'FX5U', 'NX1P2'],
  },
  {
    sku: 'PLC-MIT-R08', name: 'iQ-R系列PLC', brand: 'Mitsubishi', category: 'PLC控制器', model: 'R08CPU',
    specs: [
      { key: 'io_points', label: '最大I/O', value: '4096', unit: '点' },
      { key: 'program_capacity', label: '程序容量', value: '160', unit: 'K步' },
      { key: 'input_type', label: '输入类型', value: '模块化', unit: '' },
      { key: 'output_type', label: '输出类型', value: '模块化', unit: '' },
      { key: 'comm_port', label: '通讯接口', value: 'CC-Link IE/GbE', unit: '' },
      { key: 'scan_time', label: 'LD指令', value: '0.00098', unit: 'μs' },
    ],
    basePrice: 9500, scenarios: ['大型自动化', '半导体设备', 'FPD产线'],
    sellingPoints: ['iQ-R高端平台', '高速1ns指令处理', 'CC-Link IE TSN支持', '内置C语言编程'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL/KC', 'RoHS'],
    altModels: ['R16CPU', 'S7-1516', '1756-L85E'],
  },
  // More PLCs (11-15)
  {
    sku: 'PLC-OMR-CJ2M', name: 'CJ2M PLC控制器', brand: 'Omron', category: 'PLC控制器', model: 'CJ2M-CPU35',
    specs: [
      { key: 'io_points', label: '最大I/O', value: '2560', unit: '点' },
      { key: 'program_capacity', label: '程序容量', value: '40', unit: 'K步' },
      { key: 'input_type', label: '输入类型', value: '模块化', unit: '' },
      { key: 'output_type', label: '输出类型', value: '模块化', unit: '' },
      { key: 'comm_port', label: '通讯接口', value: 'EtherNet/IP,串行', unit: '' },
      { key: 'scan_time', label: 'LD指令', value: '0.016', unit: 'μs' },
    ],
    basePrice: 6000, scenarios: ['包装产线', '装配自动化', '检测系统'],
    sellingPoints: ['成熟稳定平台', '丰富的模块生态', 'CX-One编程套件', '全球服务网络'],
    faqTemplate: [],
    riskNotes: ['CJ2系列已进入成熟期', '新项目建议评估NX系列'], complianceNotes: ['CE/UL', 'RoHS'],
    altModels: ['NX701', 'S7-1200', 'M241'],
  },
  {
    sku: 'PLC-DEL-AS500', name: 'AS500系列PLC', brand: 'Delta', category: 'PLC控制器', model: 'AS524MT-A',
    specs: [
      { key: 'io_points', label: '最大I/O', value: '2048', unit: '点' },
      { key: 'program_capacity', label: '程序容量', value: '512', unit: 'KB' },
      { key: 'input_type', label: '输入类型', value: '模块化', unit: '' },
      { key: 'output_type', label: '输出类型', value: '模块化', unit: '' },
      { key: 'comm_port', label: '通讯接口', value: 'EtherCAT/Ethernet/OPC UA', unit: '' },
      { key: 'scan_time', label: '指令处理', value: '0.015', unit: 'μs' },
    ],
    basePrice: 3500, scenarios: ['中大型设备', '生产线控制', '机器人集成'],
    sellingPoints: ['CODESYS全功能', 'OPC UA原生支持', 'EtherCAT 100轴控制', '国产替代首选'],
    faqTemplate: [],
    riskNotes: ['新平台生态仍在完善中'], complianceNotes: ['CE', 'RoHS'],
    altModels: ['AS332T', 'NX701', 'S7-1511'],
  },
  {
    sku: 'PLC-SCH-M580', name: 'Modicon M580 PLC', brand: 'Schneider', category: 'PLC控制器', model: 'BMEP584040',
    specs: [
      { key: 'io_points', label: '最大I/O', value: '16384', unit: '点' },
      { key: 'program_capacity', label: '程序容量', value: '16', unit: 'MB' },
      { key: 'input_type', label: '输入类型', value: '模块化', unit: '' },
      { key: 'output_type', label: '输出类型', value: '模块化', unit: '' },
      { key: 'comm_port', label: '通讯接口', value: '以太网x3', unit: '' },
      { key: 'scan_time', label: '基本指令', value: '0.002', unit: 'μs' },
    ],
    basePrice: 11000, scenarios: ['过程自动化', '电厂控制', '水处理'],
    sellingPoints: ['ePAC网络安全', '原生冗余架构', '以太网背板', 'IEC 61508 SIL3安全'],
    faqTemplate: [],
    riskNotes: ['需使用Control Expert(Unity Pro)编程'], complianceNotes: ['CE/UL/ATEX', 'IEC 61508'],
    altModels: ['S7-1518', '1756-L85E', 'AC500'],
  },
  {
    sku: 'PLC-PAN-FP0H', name: 'FP0H系列PLC', brand: 'Panasonic', category: 'PLC控制器', model: 'AFPE224305',
    specs: [
      { key: 'io_points', label: 'I/O点数', value: '24', unit: '点' },
      { key: 'program_capacity', label: '程序容量', value: '8', unit: 'K步' },
      { key: 'input_type', label: '输入类型', value: 'DC24V', unit: '' },
      { key: 'output_type', label: '输出类型', value: '晶体管', unit: '' },
      { key: 'comm_port', label: '通讯接口', value: 'RS-485/USB', unit: '' },
      { key: 'scan_time', label: '基本指令', value: '0.04', unit: 'μs' },
    ],
    basePrice: 1200, scenarios: ['小型设备', '仪表控制', '教学平台'],
    sellingPoints: ['超紧凑设计', '性价比极高', '松下小型PLC经典系列', '编程简单易学'],
    faqTemplate: [],
    riskNotes: ['I/O扩展能力有限', '不支持以太网'], complianceNotes: ['CE', 'RoHS'],
    altModels: ['FX3U-32MT', 'S7-1211C'],
  },

  // ── Temperature Sensors (10) ──
  {
    sku: 'SEN-OMR-PT100', name: 'PT100温度传感器', brand: 'Omron', category: '温度传感器', model: 'E52-PT100',
    specs: [
      { key: 'range', label: '测温范围', value: '-50~250', unit: '°C' },
      { key: 'accuracy', label: '精度', value: '±0.15', unit: '°C' },
      { key: 'rtd_type', label: 'RTD类型', value: 'PT100 Class A', unit: '' },
      { key: 'probe_dia', label: '探头直径', value: '3.2', unit: 'mm' },
      { key: 'probe_len', label: '探头长度', value: '150', unit: 'mm' },
      { key: 'response', label: '响应时间', value: '0.5', unit: 's' },
    ],
    basePrice: 280, scenarios: ['工业炉温控', '热风道监测', '注塑机温控'],
    sellingPoints: ['Class A高精度', '不锈钢护套', '快速响应', '日本品质稳定可靠'],
    faqTemplate: [
      { q: 'PT100与热电偶怎么选？', a: 'PT100精度高、线性好，适合中低温(-50~250°C)；热电偶量程宽适合高温(>600°C)。' },
    ],
    riskNotes: ['引线长度超过10m需要补偿导线'], complianceNotes: ['IEC 60751', 'CE'],
    altModels: ['E52-THERMOCOUPLE', 'SA1-PT100', 'TR30'],
  },
  {
    sku: 'SEN-SIE-TR30', name: 'TR30温度传感器', brand: 'Siemens', category: '温度传感器', model: 'TR30-PT1000',
    specs: [
      { key: 'range', label: '测温范围', value: '-50~200', unit: '°C' },
      { key: 'accuracy', label: '精度', value: '±0.1', unit: '°C' },
      { key: 'rtd_type', label: 'RTD类型', value: 'PT1000 Class AA', unit: '' },
      { key: 'probe_dia', label: '探头直径', value: '6', unit: 'mm' },
      { key: 'probe_len', label: '探头长度', value: '200', unit: 'mm' },
      { key: 'response', label: '响应时间', value: '0.8', unit: 's' },
    ],
    basePrice: 420, scenarios: ['HVAC系统', '楼宇自控', '洁净室温控'],
    sellingPoints: ['Class AA超高精度', 'SIPROM集成管理', '快速接头设计', '可与S7-1200无缝对接'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['IEC 60751 Class AA', 'CE/UL'],
    altModels: ['E52-PT100', 'TST310'],
  },
  {
    sku: 'SEN-ABB-TST310', name: 'TST310温度传感器', brand: 'ABB', category: '温度传感器', model: 'TST310-PT100',
    specs: [
      { key: 'range', label: '测温范围', value: '-200~600', unit: '°C' },
      { key: 'accuracy', label: '精度', value: '±0.2', unit: '°C' },
      { key: 'rtd_type', label: 'RTD类型', value: 'PT100 Class A', unit: '' },
      { key: 'probe_dia', label: '探头直径', value: '3', unit: 'mm' },
      { key: 'probe_len', label: '探头长度', value: '250', unit: 'mm' },
      { key: 'response', label: '响应时间', value: '0.3', unit: 's' },
    ],
    basePrice: 380, scenarios: ['高温炉窑', '化工反应釜', '发电机组'],
    sellingPoints: ['宽温区-200~600°C', '快速响应0.3s', '隔爆认证可选', 'ABB过程工业经验'],
    faqTemplate: [],
    riskNotes: ['高温端(>400°C)需定期校准'], complianceNotes: ['IEC 60751', 'ATEX可选'],
    altModels: ['E52-PT100', 'TR30'],
  },
  {
    sku: 'SEN-DEL-DTC2000', name: 'DTC2000数字温度传感器', brand: 'Delta', category: '温度传感器', model: 'DTC2000-NPN',
    specs: [
      { key: 'range', label: '测温范围', value: '-40~150', unit: '°C' },
      { key: 'accuracy', label: '精度', value: '±0.5', unit: '°C' },
      { key: 'rtd_type', label: '传感器类型', value: '数字IC(NPN输出)', unit: '' },
      { key: 'probe_dia', label: '探头直径', value: '8', unit: 'mm' },
      { key: 'probe_len', label: '探头长度', value: '100', unit: 'mm' },
      { key: 'response', label: '响应时间', value: '1.0', unit: 's' },
    ],
    basePrice: 120, scenarios: ['电子设备散热', '配电柜测温', '通用温控'],
    sellingPoints: ['数字信号直出', '无需变送器', '性价比极高', '适合大批量使用'],
    faqTemplate: [],
    riskNotes: ['精度较低不适合精密控温', '探头的耐腐蚀性一般'], complianceNotes: ['CE', 'RoHS'],
    altModels: ['E52-PT100', 'LM35'],
  },
  {
    sku: 'SEN-OMR-E52-TC', name: 'E52热电偶温度传感器', brand: 'Omron', category: '温度传感器', model: 'E52-CA2A',
    specs: [
      { key: 'range', label: '测温范围', value: '-40~1100', unit: '°C' },
      { key: 'accuracy', label: '精度', value: '±1.5', unit: '°C' },
      { key: 'rtd_type', label: '热电偶类型', value: 'K型(Cr/Al)', unit: '' },
      { key: 'probe_dia', label: '探头直径', value: '4.8', unit: 'mm' },
      { key: 'probe_len', label: '探头长度', value: '300', unit: 'mm' },
      { key: 'response', label: '响应时间', value: '0.2', unit: 's' },
    ],
    basePrice: 350, scenarios: ['热处理炉', '锅炉测温', '金属熔炼'],
    sellingPoints: ['高温1100°C量程', '快速响应0.2s', 'K型热电偶通用性强', '陶瓷绝缘可选'],
    faqTemplate: [],
    riskNotes: ['需配合温控器使用', '冷端补偿不可忽略'], complianceNotes: ['IEC 60584', 'CE'],
    altModels: ['TST310', 'J型热电偶'],
  },
  {
    sku: 'SEN-SCH-XBTR', name: 'XBTR温度传感器', brand: 'Schneider', category: '温度传感器', model: 'XBTR4P2PT100',
    specs: [
      { key: 'range', label: '测温范围', value: '-20~120', unit: '°C' },
      { key: 'accuracy', label: '精度', value: '±0.3', unit: '°C' },
      { key: 'rtd_type', label: 'RTD类型', value: 'PT100', unit: '' },
      { key: 'probe_dia', label: '探头直径', value: '4', unit: 'mm' },
      { key: 'probe_len', label: '探头长度', value: '100', unit: 'mm' },
      { key: 'response', label: '响应时间', value: '1.2', unit: 's' },
    ],
    basePrice: 200, scenarios: ['暖通空调', '楼宇自控', '机房环控'],
    sellingPoints: ['经济实用', '紧凑设计', 'IP65防护', 'EcoStruxure兼容'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['IEC 60751', 'CE', 'IP65'],
    altModels: ['E52-PT100', 'TR30'],
  },
  {
    sku: 'SEN-OMR-E52-TH', name: 'E52温湿度传感器', brand: 'Omron', category: '温度传感器', model: 'E52-TH4B',
    specs: [
      { key: 'range_t', label: '测温范围', value: '-20~80', unit: '°C' },
      { key: 'range_h', label: '测湿范围', value: '0~95', unit: '%RH' },
      { key: 'accuracy_t', label: '温度精度', value: '±0.3', unit: '°C' },
      { key: 'accuracy_h', label: '湿度精度', value: '±2', unit: '%RH' },
      { key: 'output', label: '输出类型', value: '4-20mA', unit: '' },
      { key: 'response', label: '响应时间', value: '2', unit: 's' },
    ],
    basePrice: 450, scenarios: ['洁净室监测', '仓库环控', '温室大棚'],
    sellingPoints: ['温度+湿度二合一', '4-20mA标准输出', 'IP65防尘防水', '长期稳定性好'],
    faqTemplate: [],
    riskNotes: ['高湿环境(>90%RH)需定期校准'], complianceNotes: ['CE', 'IP65', 'RoHS'],
    altModels: ['SHT30', 'HMP110'],
  },
  {
    sku: 'SEN-PAN-LM35', name: 'LM35温度传感器模组', brand: 'Panasonic', category: '温度传感器', model: 'LM35DZ-PAN',
    specs: [
      { key: 'range', label: '测温范围', value: '0~100', unit: '°C' },
      { key: 'accuracy', label: '精度', value: '±0.5', unit: '°C' },
      { key: 'rtd_type', label: '输出类型', value: '模拟电压10mV/°C', unit: '' },
      { key: 'probe_dia', label: '封装类型', value: 'TO-92模组', unit: '' },
      { key: 'supply', label: '供电电压', value: '4-30', unit: 'VDC' },
      { key: 'response', label: '响应时间', value: '5', unit: 's' },
    ],
    basePrice: 45, scenarios: ['消费电子', '教学实验', '简易温控'],
    sellingPoints: ['极致低价', '线性输出无需校准', '宽电压供电', '适合嵌入式场景'],
    faqTemplate: [],
    riskNotes: ['精度较低', '不防水'], complianceNotes: ['RoHS'],
    altModels: ['DS18B20', 'DTC2000'],
  },
  {
    sku: 'SEN-SIE-SITRANS', name: 'SITRANS TS500温度传感器', brand: 'Siemens', category: '温度传感器', model: 'TS500-PT100',
    specs: [
      { key: 'range', label: '测温范围', value: '-50~400', unit: '°C' },
      { key: 'accuracy', label: '精度', value: '±0.1', unit: '°C' },
      { key: 'rtd_type', label: 'RTD类型', value: 'PT100 Class AA', unit: '' },
      { key: 'probe_dia', label: '探头直径', value: '6', unit: 'mm' },
      { key: 'probe_len', label: '探头长度', value: '300', unit: 'mm' },
      { key: 'response', label: '响应时间', value: '0.6', unit: 's' },
    ],
    basePrice: 550, scenarios: ['过程工业', '食品制药', '精细化工'],
    sellingPoints: ['Class AA顶级精度', '全焊接不锈钢', '卫生型可选', 'SITRANS全系列配套'],
    faqTemplate: [],
    riskNotes: ['卫生型需要CIP/SIP兼容'], complianceNotes: ['IEC 60751', 'FDA(卫生型)', 'EHEDG(卫生型)'],
    altModels: ['TST310', 'TR30'],
  },
  {
    sku: 'SEN-ROCK-842E', name: '842E温度变送器', brand: 'Rockwell', category: '温度传感器', model: '842E-CM-PT100',
    specs: [
      { key: 'range', label: '测温范围', value: '-50~300', unit: '°C' },
      { key: 'accuracy', label: '精度', value: '±0.15', unit: '°C' },
      { key: 'rtd_type', label: 'RTD类型', value: 'PT100', unit: '' },
      { key: 'probe_dia', label: '接头类型', value: 'M12连接器', unit: '' },
      { key: 'output', label: '输出', value: 'IO-Link 1.1', unit: '' },
      { key: 'response', label: '响应时间', value: '0.4', unit: 's' },
    ],
    basePrice: 520, scenarios: ['汽车装配', '自动化产线', '机器人工作站'],
    sellingPoints: ['IO-Link数字通讯', 'M12快速安装', '集成诊断功能', 'Allen-Bradley生态'],
    faqTemplate: [],
    riskNotes: ['需要IO-Link主站支持'], complianceNotes: ['CE/UL', 'IEC 60751'],
    altModels: ['TS500', 'TST310'],
  },

  // ── VFDs / Inverters (10) ──
  {
    sku: 'VFD-ABB-ACS580', name: 'ACS580通用变频器', brand: 'ABB', category: '变频器', model: 'ACS580-01-062A-4',
    specs: [
      { key: 'power', label: '功率', value: '30', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '380-480', unit: 'VAC' },
      { key: 'current', label: '额定电流', value: '62', unit: 'A' },
      { key: 'freq', label: '输出频率', value: '0-500', unit: 'Hz' },
      { key: 'ip_rating', label: '防护等级', value: 'IP21', unit: '' },
      { key: 'comm', label: '通讯', value: 'Modbus/Profibus', unit: '' },
    ],
    basePrice: 8500, scenarios: ['泵类驱动', '风机控制', '输送带调速'],
    sellingPoints: ['ABB全球旗舰通用型', '内置EMC滤波器', '能效等级IE4', '兼容所有主流电机'],
    faqTemplate: [
      { q: 'ACS580与ACS880怎么选？', a: 'ACS580适合通用泵/风机，ACS880适合高性能矢量控制和伺服级应用。' },
    ],
    riskNotes: ['IP21不能用于粉尘环境', '高海拔(>2000m)需降额使用'], complianceNotes: ['CE/UL/cUL', 'IEC 61800-3'],
    altModels: ['ACS880', 'V20', 'FR-E800'],
  },
  {
    sku: 'VFD-SIE-V20', name: 'SINAMICS V20变频器', brand: 'Siemens', category: '变频器', model: 'V20-6SL3210',
    specs: [
      { key: 'power', label: '功率', value: '7.5', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '380-480', unit: 'VAC' },
      { key: 'current', label: '额定电流', value: '16', unit: 'A' },
      { key: 'freq', label: '输出频率', value: '0-550', unit: 'Hz' },
      { key: 'ip_rating', label: '防护等级', value: 'IP20', unit: '' },
      { key: 'comm', label: '通讯', value: 'USS/Modbus RTU', unit: '' },
    ],
    basePrice: 2800, scenarios: ['小型泵', '风机', '压缩机'],
    sellingPoints: ['经济实用型', '快速调试向导', 'ECO节能模式', '宽电压范围设计'],
    faqTemplate: [],
    riskNotes: ['IO点数有限', '不支持矢量控制'], complianceNotes: ['CE/UL', 'IEC 61800-3'],
    altModels: ['G120', 'ACS580'],
  },
  {
    sku: 'VFD-MIT-FR-E800', name: 'FR-E800变频器', brand: 'Mitsubishi', category: '变频器', model: 'FR-E840-0030',
    specs: [
      { key: 'power', label: '功率', value: '1.5', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '380-480', unit: 'VAC' },
      { key: 'current', label: '额定电流', value: '3.0', unit: 'A' },
      { key: 'freq', label: '输出频率', value: '0-590', unit: 'Hz' },
      { key: 'ip_rating', label: '防护等级', value: 'IP20', unit: '' },
      { key: 'comm', label: '通讯', value: 'CC-Link IE/Modbus TCP', unit: '' },
    ],
    basePrice: 1500, scenarios: ['小型传送带', '搅拌机', '包装机'],
    sellingPoints: ['高性能小功率', '内置PLC功能', 'CC-Link无缝集成', '紧凑尺寸节省空间'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL', 'RoHS'],
    altModels: ['FR-A800', 'V20', 'ACS380'],
  },
  {
    sku: 'VFD-SCH-ATV320', name: 'ATV320变频器', brand: 'Schneider', category: '变频器', model: 'ATV320U22N4B',
    specs: [
      { key: 'power', label: '功率', value: '2.2', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '380-500', unit: 'VAC' },
      { key: 'current', label: '额定电流', value: '5.5', unit: 'A' },
      { key: 'freq', label: '输出频率', value: '0-599', unit: 'Hz' },
      { key: 'ip_rating', label: '防护等级', value: 'IP20', unit: '' },
      { key: 'comm', label: '通讯', value: 'CANopen/Modbus/EtherNet/IP', unit: '' },
    ],
    basePrice: 1800, scenarios: ['包装机械', '物料搬运', '纺织机械'],
    sellingPoints: ['书本型紧凑设计', '丰富的通讯协议', '安全转矩关断STO', 'SoMove调试软件'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL/CSA', 'IEC 61800-5-2(STO)'],
    altModels: ['ATV630', 'V20', 'FR-E800'],
  },
  {
    sku: 'VFD-DEL-C2000', name: 'C2000系列变频器', brand: 'Delta', category: '变频器', model: 'VFD-C2000-022',
    specs: [
      { key: 'power', label: '功率', value: '22', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '380-480', unit: 'VAC' },
      { key: 'current', label: '额定电流', value: '45', unit: 'A' },
      { key: 'freq', label: '输出频率', value: '0-600', unit: 'Hz' },
      { key: 'ip_rating', label: '防护等级', value: 'IP20', unit: '' },
      { key: 'comm', label: '通讯', value: 'Modbus/CANopen/EtherCAT', unit: '' },
    ],
    basePrice: 4500, scenarios: ['注塑机', '空压机', '挤出机'],
    sellingPoints: ['高性能矢量控制', '感应/永磁电机兼容', '内置PLC(10K步)', 'STO安全功能'],
    faqTemplate: [],
    riskNotes: ['大功率安装需注意散热'], complianceNotes: ['CE/UL', 'IEC 61800-5-2'],
    altModels: ['ACS580', 'ATV630'],
  },
  {
    sku: 'VFD-ABB-ACS880', name: 'ACS880工业变频器', brand: 'ABB', category: '变频器', model: 'ACS880-01-087A-3',
    specs: [
      { key: 'power', label: '功率', value: '45', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '380-500', unit: 'VAC' },
      { key: 'current', label: '额定电流', value: '87', unit: 'A' },
      { key: 'freq', label: '输出频率', value: '0-500', unit: 'Hz' },
      { key: 'ip_rating', label: '防护等级', value: 'IP21', unit: '' },
      { key: 'comm', label: '通讯', value: 'Profibus/Modbus/EtherNet/IP', unit: '' },
    ],
    basePrice: 16000, scenarios: ['起重机', '造纸机', '大型压缩机'],
    sellingPoints: ['直接转矩控制DTC', '工业级矢量控制', '内置安全功能', '支持多种编码器'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL/cUL', 'IEC 61800-5-2 SIL3'],
    altModels: ['ACS580', 'G120'],
  },
  {
    sku: 'VFD-SIE-G120', name: 'SINAMICS G120变频器', brand: 'Siemens', category: '变频器', model: 'G120-CU250S',
    specs: [
      { key: 'power', label: '功率', value: '11', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '380-480', unit: 'VAC' },
      { key: 'current', label: '额定电流', value: '26', unit: 'A' },
      { key: 'freq', label: '输出频率', value: '0-650', unit: 'Hz' },
      { key: 'ip_rating', label: '防护等级', value: 'IP20', unit: '' },
      { key: 'comm', label: '通讯', value: 'PROFINET/EtherNet/IP', unit: '' },
    ],
    basePrice: 5200, scenarios: ['输送系统', '泵站', '搅拌设备'],
    sellingPoints: ['模块化设计', 'Safety Integrated', 'PROFIenergy节能', 'TIA Portal全集成'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL', 'IEC 61800-5-2 SIL3'],
    altModels: ['ACS580', 'ATV630'],
  },
  {
    sku: 'VFD-MIT-FR-A800', name: 'FR-A800变频器', brand: 'Mitsubishi', category: '变频器', model: 'FR-A840-00380',
    specs: [
      { key: 'power', label: '功率', value: '15', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '380-500', unit: 'VAC' },
      { key: 'current', label: '额定电流', value: '38', unit: 'A' },
      { key: 'freq', label: '输出频率', value: '0-590', unit: 'Hz' },
      { key: 'ip_rating', label: '防护等级', value: 'IP20', unit: '' },
      { key: 'comm', label: '通讯', value: 'CC-Link IE TSN', unit: '' },
    ],
    basePrice: 7500, scenarios: ['机床主轴', '卷绕机', '测试台'],
    sellingPoints: ['Advanced vector control', '内置PLC功能', 'CC-Link IE TSN高速通讯', '功率范围宽(0.4-500kW)'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL', 'RoHS'],
    altModels: ['ACS880', 'G120'],
  },
  {
    sku: 'VFD-DEL-MH300', name: 'MH300系列变频器', brand: 'Delta', category: '变频器', model: 'VFD-MH300-075',
    specs: [
      { key: 'power', label: '功率', value: '75', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '380-480', unit: 'VAC' },
      { key: 'current', label: '额定电流', value: '150', unit: 'A' },
      { key: 'freq', label: '输出频率', value: '0-400', unit: 'Hz' },
      { key: 'ip_rating', label: '防护等级', value: 'IP00(模块型)', unit: '' },
      { key: 'comm', label: '通讯', value: 'Modbus/CANopen', unit: '' },
    ],
    basePrice: 12000, scenarios: ['大型风机', '水泵', '中央空调'],
    sellingPoints: ['大功率性价比之王', '感应/永磁双模式', '内置直流电抗器', '谐波抑制设计'],
    faqTemplate: [],
    riskNotes: ['需配柜安装', '模块型需另配散热'], complianceNotes: ['CE', 'IEC 61800-3'],
    altModels: ['ACS580-01-145A', 'FR-A840-01160'],
  },
  {
    sku: 'VFD-SCH-ATV630', name: 'ATV630变频器', brand: 'Schneider', category: '变频器', model: 'ATV630U40N4',
    specs: [
      { key: 'power', label: '功率', value: '4', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '380-480', unit: 'VAC' },
      { key: 'current', label: '额定电流', value: '9.5', unit: 'A' },
      { key: 'freq', label: '输出频率', value: '0-500', unit: 'Hz' },
      { key: 'ip_rating', label: '防护等级', value: 'IP20', unit: '' },
      { key: 'comm', label: '通讯', value: 'EtherNet/IP/Modbus TCP', unit: '' },
    ],
    basePrice: 3200, scenarios: ['泵类', '风机', '物料搬运'],
    sellingPoints: ['EcoStruxure ready', 'Web服务器内置', '能效监测功能', 'STO SIL3安全'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL/CSA', 'IEC 61800-5-2'],
    altModels: ['ACS580', 'G120'],
  },

  // ── Servo Systems (10) ──
  {
    sku: 'SRV-MIT-MR-J4', name: 'MR-J4-A伺服驱动器', brand: 'Mitsubishi', category: '伺服系统', model: 'MR-J4-200A',
    specs: [
      { key: 'power', label: '功率', value: '2', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '200-230', unit: 'VAC' },
      { key: 'torque', label: '额定扭矩', value: '6.37', unit: 'Nm' },
      { key: 'speed', label: '额定转速', value: '3000', unit: 'rpm' },
      { key: 'encoder', label: '编码器', value: '22位绝对式', unit: '' },
      { key: 'comm', label: '通讯', value: 'SSCNET III/H', unit: '' },
    ],
    basePrice: 6800, scenarios: ['数控机床', '机器人关节', '电子组装'],
    sellingPoints: ['22位高分辨率编码器', 'SSCNET III/H光通讯', '一键式自动调谐', '振动抑制控制'],
    faqTemplate: [
      { q: 'MR-J4和MR-J5有什么区别？', a: 'MR-J5是最新一代，支持CC-Link IE TSN，速度频率响应3.5kHz(MR-J4为2.5kHz)。' },
    ],
    riskNotes: ['MR-J4已进入成熟期，新设计建议评估MR-J5'], complianceNotes: ['CE/UL/KC', 'SEMI S2'],
    altModels: ['MR-J5', 'SGD7S', 'ASDA-A3'],
  },
  {
    sku: 'SRV-SIE-S210', name: 'SINAMICS S210伺服驱动器', brand: 'Siemens', category: '伺服系统', model: 'S210-1S',
    specs: [
      { key: 'power', label: '功率', value: '1', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '200-240', unit: 'VAC' },
      { key: 'torque', label: '额定扭矩', value: '3.18', unit: 'Nm' },
      { key: 'speed', label: '额定转速', value: '3000', unit: 'rpm' },
      { key: 'encoder', label: '编码器', value: '22位多圈绝对式', unit: '' },
      { key: 'comm', label: '通讯', value: 'PROFINET IRT', unit: '' },
    ],
    basePrice: 5500, scenarios: ['包装机械', '印刷机械', '搬运机器人'],
    sellingPoints: ['PROFINET IRT同步', 'Web Server调试', 'Safety Integrated', '单电缆技术OCC'],
    faqTemplate: [],
    riskNotes: ['需要TIA Portal V15以上版本'], complianceNotes: ['CE/UL', 'IEC 61800-5-2'],
    altModels: ['S120', 'MR-J5', 'AKD'],
  },
  {
    sku: 'SRV-OMR-1S', name: '1S系列伺服驱动器', brand: 'Omron', category: '伺服系统', model: 'R88D-1SN02H-ECT',
    specs: [
      { key: 'power', label: '功率', value: '2', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '200-230', unit: 'VAC' },
      { key: 'torque', label: '额定扭矩', value: '6.37', unit: 'Nm' },
      { key: 'speed', label: '额定转速', value: '3000', unit: 'rpm' },
      { key: 'encoder', label: '编码器', value: '23位无电池绝对式', unit: '' },
      { key: 'comm', label: '通讯', value: 'EtherCAT', unit: '' },
    ],
    basePrice: 6200, scenarios: ['电子制造', '锂电设备', '半导体封装'],
    sellingPoints: ['无电池绝对编码器', 'EtherCAT高速同步', 'Sysmac Studio一体化', '振动抑制算法'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL/KC', 'SEMI S2'],
    altModels: ['MR-J5', 'SGD7S'],
  },
  {
    sku: 'SRV-DEL-ASDA-A3', name: 'ASDA-A3伺服驱动器', brand: 'Delta', category: '伺服系统', model: 'ASDA-A3-2023',
    specs: [
      { key: 'power', label: '功率', value: '2', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '200-230', unit: 'VAC' },
      { key: 'torque', label: '额定扭矩', value: '6.37', unit: 'Nm' },
      { key: 'speed', label: '额定转速', value: '3000', unit: 'rpm' },
      { key: 'encoder', label: '编码器', value: '20位增量式', unit: '' },
      { key: 'comm', label: '通讯', value: 'CANopen/Modbus', unit: '' },
    ],
    basePrice: 2800, scenarios: ['包装机', '送料机', '纺织机械'],
    sellingPoints: ['国产品牌性价比', '3KHz速度响应', '内置定位功能', '兼容主流PLC'],
    faqTemplate: [],
    riskNotes: ['高端应用(CNC)精度不如日系品牌'], complianceNotes: ['CE', 'RoHS'],
    altModels: ['ASDA-B3', 'MR-J4', 'SGD7S'],
  },
  {
    sku: 'SRV-YAS-SGD7S', name: 'SGD7S伺服驱动器', brand: 'Yaskawa', category: '伺服系统', model: 'SGD7S-200A',
    specs: [
      { key: 'power', label: '功率', value: '2', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '200-230', unit: 'VAC' },
      { key: 'torque', label: '额定扭矩', value: '6.37', unit: 'Nm' },
      { key: 'speed', label: '额定转速', value: '3000', unit: 'rpm' },
      { key: 'encoder', label: '编码器', value: '24位绝对式', unit: '' },
      { key: 'comm', label: '通讯', value: 'MECHATROLINK-III', unit: '' },
    ],
    basePrice: 7200, scenarios: ['CNC加工', '芯片封装', '精密定位'],
    sellingPoints: ['24位最高精度编码器', '行业标杆性能', '免调整功能', '振动抑制领先'],
    faqTemplate: [],
    riskNotes: ['MECHATROLINK生态受限', '供货周期长'], complianceNotes: ['CE/UL/KC', 'SEMI S2'],
    altModels: ['MR-J5', '1S系列', 'AKD2G'],
  },
  {
    sku: 'SRV-PAN-MINAS', name: 'MINAS A6伺服驱动器', brand: 'Panasonic', category: '伺服系统', model: 'MADLN15SE',
    specs: [
      { key: 'power', label: '功率', value: '1.5', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '200-230', unit: 'VAC' },
      { key: 'torque', label: '额定扭矩', value: '4.77', unit: 'Nm' },
      { key: 'speed', label: '额定转速', value: '3000', unit: 'rpm' },
      { key: 'encoder', label: '编码器', value: '23位绝对式', unit: '' },
      { key: 'comm', label: '通讯', value: 'RTEX/EtherCAT', unit: '' },
    ],
    basePrice: 4200, scenarios: ['3C电子制造', '小型机器人', '贴片机'],
    sellingPoints: ['RTEX高速总线', '小型化设计', '23位高精度', '松下PLC无缝对接'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL', 'RoHS'],
    altModels: ['ASDA-A3', 'MR-J4', 'S210'],
  },
  {
    sku: 'SRV-ABB-MICROFLEX', name: 'MicroFlex e190伺服驱动器', brand: 'ABB', category: '伺服系统', model: 'e190-200',
    specs: [
      { key: 'power', label: '功率', value: '2', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '200-240', unit: 'VAC' },
      { key: 'torque', label: '额定扭矩', value: '6.4', unit: 'Nm' },
      { key: 'speed', label: '额定转速', value: '3000', unit: 'rpm' },
      { key: 'encoder', label: '编码器', value: '多协议编码器', unit: '' },
      { key: 'comm', label: '通讯', value: 'EtherCAT/EtherNet/IP', unit: '' },
    ],
    basePrice: 5800, scenarios: ['包装', '物料搬运', '机器人辅助轴'],
    sellingPoints: ['双协议EtherCAT+EIP', 'Automation Builder编程', '灵活的编码器接口', '紧凑尺寸'],
    faqTemplate: [],
    riskNotes: ['ABB伺服市场份额较小'], complianceNotes: ['CE/UL', 'IEC 61800-5-2'],
    altModels: ['SGD7S', 'S210'],
  },
  {
    sku: 'SRV-SCH-LXM32', name: 'Lexium 32伺服驱动器', brand: 'Schneider', category: '伺服系统', model: 'LXM32MD18N4',
    specs: [
      { key: 'power', label: '功率', value: '1.8', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '208-480', unit: 'VAC' },
      { key: 'torque', label: '额定扭矩', value: '5.7', unit: 'Nm' },
      { key: 'speed', label: '额定转速', value: '3000', unit: 'rpm' },
      { key: 'encoder', label: '编码器', value: '单圈/多圈绝对式', unit: '' },
      { key: 'comm', label: '通讯', value: 'CANopen/Modbus', unit: '' },
    ],
    basePrice: 4800, scenarios: ['包装设备', '食品机械', '纺织设备'],
    sellingPoints: ['宽电压输入', 'SoMachine编程', '集成安全STO', '书本型紧凑设计'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL/CSA', 'IEC 61800-5-2'],
    altModels: ['LXM52', 'ASDA-A3', 'S210'],
  },
  {
    sku: 'SRV-KOL-AKD', name: 'AKD2G伺服驱动器', brand: 'Kollmorgen', category: '伺服系统', model: 'AKD2G-200',
    specs: [
      { key: 'power', label: '功率', value: '2', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '200-240', unit: 'VAC' },
      { key: 'torque', label: '额定扭矩', value: '6.4', unit: 'Nm' },
      { key: 'speed', label: '额定转速', value: '3000', unit: 'rpm' },
      { key: 'encoder', label: '编码器', value: 'SFD/Hiperface/EnDat', unit: '' },
      { key: 'comm', label: '通讯', value: 'EtherCAT FSoE', unit: '' },
    ],
    basePrice: 8500, scenarios: ['高端机床', '半导体设备', '医疗设备'],
    sellingPoints: ['双轴设计节省空间', '顶级性能', 'FSoE功能安全', '开放编码器生态'],
    faqTemplate: [],
    riskNotes: ['价格高端', '交期较长'], complianceNotes: ['CE/UL', 'IEC 61800-5-2 SIL3'],
    altModels: ['SGD7S', 'S120'],
  },
  {
    sku: 'SRV-MIT-MR-J5', name: 'MR-J5伺服驱动器', brand: 'Mitsubishi', category: '伺服系统', model: 'MR-J5-200A',
    specs: [
      { key: 'power', label: '功率', value: '2', unit: 'kW' },
      { key: 'voltage', label: '输入电压', value: '200-230', unit: 'VAC' },
      { key: 'torque', label: '额定扭矩', value: '6.37', unit: 'Nm' },
      { key: 'speed', label: '额定转速', value: '3000', unit: 'rpm' },
      { key: 'encoder', label: '编码器', value: '26位无电池绝对式', unit: '' },
      { key: 'comm', label: '通讯', value: 'CC-Link IE TSN', unit: '' },
    ],
    basePrice: 7500, scenarios: ['锂电设备', '半导体制造', '高端数控'],
    sellingPoints: ['26位顶级编码器', 'CC-Link IE TSN工业5G', 'AI预测维护', '3.5kHz速度响应'],
    faqTemplate: [],
    riskNotes: ['需要CC-Link IE TSN主站'], complianceNotes: ['CE/UL/KC', 'SEMI S2'],
    altModels: ['SGD7S', '1S系列', 'AKD2G'],
  },

  // ── HMI & Communication (15) ──
  {
    sku: 'HMI-SIE-TP700', name: 'SIMATIC TP700触摸屏', brand: 'Siemens', category: 'HMI/通讯', model: 'TP700 Comfort',
    specs: [
      { key: 'size', label: '屏幕尺寸', value: '7', unit: '英寸' },
      { key: 'resolution', label: '分辨率', value: '800x480', unit: 'px' },
      { key: 'type', label: '触控类型', value: '电阻式', unit: '' },
      { key: 'memory', label: '用户内存', value: '12', unit: 'MB' },
      { key: 'comm', label: '通讯接口', value: 'PROFINET/MPI/USB', unit: '' },
      { key: 'ip', label: '防护等级', value: 'IP65(前面板)', unit: '' },
    ],
    basePrice: 4800, scenarios: ['设备操作面板', '产线监控', '楼宇控制'],
    sellingPoints: ['TIA Portal集成', 'Comfort Panel顶级画质', '脚本功能丰富', '归档/报表内置'],
    faqTemplate: [
      { q: 'Comfort与Basic Panel区别？', a: 'Comfort Panel支持脚本(VBScript)、归档、报表、Web Server，Basic Panel仅基础画面。' },
    ],
    riskNotes: ['电阻屏不支持多点触控'], complianceNotes: ['CE/UL', 'IP65'],
    altModels: ['KTP700 Basic', 'GOT2000', 'NS-series'],
  },
  {
    sku: 'HMI-MIT-GOT27', name: 'GOT2000触摸屏', brand: 'Mitsubishi', category: 'HMI/通讯', model: 'GT2712-STBA',
    specs: [
      { key: 'size', label: '屏幕尺寸', value: '12.1', unit: '英寸' },
      { key: 'resolution', label: '分辨率', value: '1024x768', unit: 'px' },
      { key: 'type', label: '触控类型', value: '电容式多点', unit: '' },
      { key: 'memory', label: '用户内存', value: '128', unit: 'MB' },
      { key: 'comm', label: '通讯接口', value: 'CC-Link IE/以太网', unit: '' },
      { key: 'ip', label: '防护等级', value: 'IP67F', unit: '' },
    ],
    basePrice: 9500, scenarios: ['大型设备操作台', '产线中控', 'FA系统'],
    sellingPoints: ['大屏高清显示', '全IP67F防护', 'MELSOFT GT Works3', '动画/配方/日志全支持'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL/KC', 'IP67F'],
    altModels: ['GT2715', 'TP1500', 'NA5'],
  },
  {
    sku: 'HMI-OMR-NA5', name: 'NA5系列触摸屏', brand: 'Omron', category: 'HMI/通讯', model: 'NA5-15W101S',
    specs: [
      { key: 'size', label: '屏幕尺寸', value: '15.4', unit: '英寸' },
      { key: 'resolution', label: '分辨率', value: '1366x768', unit: 'px' },
      { key: 'type', label: '触控类型', value: '电容式', unit: '' },
      { key: 'memory', label: '用户内存', value: '256', unit: 'MB' },
      { key: 'comm', label: '通讯接口', value: 'EtherNet/IP,EtherCAT', unit: '' },
      { key: 'ip', label: '防护等级', value: 'IP65', unit: '' },
    ],
    basePrice: 12000, scenarios: ['生产线中控', '过程监控', '半导体设备'],
    sellingPoints: ['Sysmac Studio全集成', 'HTML5/JavaScript支持', '大屏宽屏16:9', '数据库直连SQL'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL', 'IP65'],
    altModels: ['GOT2000', 'TP1500', 'cMT3162X'],
  },
  {
    sku: 'HMI-WEI-cMT', name: 'cMT X系列触摸屏', brand: 'Weintek', category: 'HMI/通讯', model: 'cMT3162X',
    specs: [
      { key: 'size', label: '屏幕尺寸', value: '15.6', unit: '英寸' },
      { key: 'resolution', label: '分辨率', value: '1920x1080', unit: 'px' },
      { key: 'type', label: '触控类型', value: '电容式多点', unit: '' },
      { key: 'memory', label: '用户内存', value: '4', unit: 'GB' },
      { key: 'comm', label: '通讯接口', value: 'Ethernet/WiFi/4G', unit: '' },
      { key: 'ip', label: '防护等级', value: 'IP65(前框)', unit: '' },
    ],
    basePrice: 6500, scenarios: ['IoT数据看板', '设备远程监控', 'MES终端'],
    sellingPoints: ['全高清1080P', '4G/WiFi云连接', 'EasyAccess 2.0远程', 'MQTT/OPC UA原生支持'],
    faqTemplate: [],
    riskNotes: ['二线品牌售后网络有限'], complianceNotes: ['CE/FCC', 'IP65'],
    altModels: ['TP1500', 'NA5'],
  },
  {
    sku: 'HMI-SCH-HMIGTO', name: 'Harmony GTU触摸屏', brand: 'Schneider', category: 'HMI/通讯', model: 'HMIGTO6310',
    specs: [
      { key: 'size', label: '屏幕尺寸', value: '10.4', unit: '英寸' },
      { key: 'resolution', label: '分辨率', value: '800x600', unit: 'px' },
      { key: 'type', label: '触控类型', value: '电阻式', unit: '' },
      { key: 'memory', label: '用户内存', value: '64', unit: 'MB' },
      { key: 'comm', label: '通讯接口', value: 'Ethernet/串行', unit: '' },
      { key: 'ip', label: '防护等级', value: 'IP65', unit: '' },
    ],
    basePrice: 5200, scenarios: ['设备HMI', '水处理监控', '配电监控'],
    sellingPoints: ['EcoStruxure Operator', 'OPC UA Client/Server', 'WebGate远程访问', '多协议驱动'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL/ATEX', 'IP65'],
    altModels: ['GOT2000', 'TP700', 'MT8071iE'],
  },
  {
    sku: 'HMI-DEL-DOP', name: 'DOP-100系列触摸屏', brand: 'Delta', category: 'HMI/通讯', model: 'DOP-110WS',
    specs: [
      { key: 'size', label: '屏幕尺寸', value: '10.1', unit: '英寸' },
      { key: 'resolution', label: '分辨率', value: '1024x600', unit: 'px' },
      { key: 'type', label: '触控类型', value: '电容式', unit: '' },
      { key: 'memory', label: '用户内存', value: '256', unit: 'MB' },
      { key: 'comm', label: '通讯接口', value: 'Ethernet/RS-485', unit: '' },
      { key: 'ip', label: '防护等级', value: 'IP65', unit: '' },
    ],
    basePrice: 1800, scenarios: ['小型设备HMI', '环境监控', '输送线控制'],
    sellingPoints: ['高性价比', '宽屏设计', 'DIAScreen免费编程', '主流PLC驱动齐全'],
    faqTemplate: [],
    riskNotes: ['编程软件体验不如日系品牌'], complianceNotes: ['CE', 'IP65', 'RoHS'],
    altModels: ['MT8071iE', 'KTP700'],
  },
  {
    sku: 'HMI-ROCK-PVP', name: 'PanelView Plus 7', brand: 'Rockwell', category: 'HMI/通讯', model: '2711P-T10C22D9P',
    specs: [
      { key: 'size', label: '屏幕尺寸', value: '10.4', unit: '英寸' },
      { key: 'resolution', label: '分辨率', value: '800x600', unit: 'px' },
      { key: 'type', label: '触控类型', value: '电容式多点', unit: '' },
      { key: 'memory', label: '用户内存', value: '512', unit: 'MB' },
      { key: 'comm', label: '通讯接口', value: 'EtherNet/IP', unit: '' },
      { key: 'ip', label: '防护等级', value: 'IP65', unit: '' },
    ],
    basePrice: 8500, scenarios: ['汽车产线', '食品饮料生产', '石化监控'],
    sellingPoints: ['FactoryTalk View ME', 'EtherNet/IP原生', 'ActiveX/.NET控件', '数据采集/趋势分析'],
    faqTemplate: [],
    riskNotes: ['需FactoryTalk View Studio授权'], complianceNotes: ['CE/UL/ATEX', 'IP65'],
    altModels: ['GOT2000', 'TP700'],
  },
  // More HMI (8-10)
  {
    sku: 'HMI-SIE-TP1500', name: 'SIMATIC TP1500触摸屏', brand: 'Siemens', category: 'HMI/通讯', model: 'TP1500 Comfort',
    specs: [
      { key: 'size', label: '屏幕尺寸', value: '15.4', unit: '英寸' },
      { key: 'resolution', label: '分辨率', value: '1280x800', unit: 'px' },
      { key: 'type', label: '触控类型', value: '电容式多点', unit: '' },
      { key: 'memory', label: '用户内存', value: '24', unit: 'MB' },
      { key: 'comm', label: '通讯接口', value: 'PROFINET/MPI/USB/音频', unit: '' },
      { key: 'ip', label: '防护等级', value: 'IP65', unit: '' },
    ],
    basePrice: 9800, scenarios: ['产线中控台', '过程监控', '制药设备'],
    sellingPoints: ['大屏宽屏16:10', '多点触控手势', 'TIA Portal集成', 'Sm@rtServer远程访问'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/UL', 'IP65', 'FDA(制药可选项)'],
    altModels: ['GOT2712', 'NA5', 'cMT3162X'],
  },
  {
    sku: 'HMI-MIT-GS21', name: 'GS21系列触摸屏', brand: 'Mitsubishi', category: 'HMI/通讯', model: 'GS2110-WTBD',
    specs: [
      { key: 'size', label: '屏幕尺寸', value: '10', unit: '英寸' },
      { key: 'resolution', label: '分辨率', value: '800x480', unit: 'px' },
      { key: 'type', label: '触控类型', value: '电阻式', unit: '' },
      { key: 'memory', label: '用户内存', value: '15', unit: 'MB' },
      { key: 'comm', label: '通讯接口', value: '以太网/RS-422/485', unit: '' },
      { key: 'ip', label: '防护等级', value: 'IP65', unit: '' },
    ],
    basePrice: 2800, scenarios: ['经济型HMI方案', '小型设备面板', '温控器替代'],
    sellingPoints: ['经济实惠', '与三菱PLC直连', '基本画面+报警+配方', '紧凑尺寸'],
    faqTemplate: [],
    riskNotes: ['功能简单不适合复杂画面'], complianceNotes: ['CE/UL', 'IP65'],
    altModels: ['GT2107', 'KTP700', 'DOP-107'],
  },
  {
    sku: 'COM-MOXA-5150', name: 'NPort 5150串口服务器', brand: 'Moxa', category: 'HMI/通讯', model: 'NPort 5150',
    specs: [
      { key: 'ports', label: '串口数量', value: '1', unit: '口RS-232/422/485' },
      { key: 'lan', label: '网口', value: '10/100M', unit: '' },
      { key: 'baud', label: '波特率', value: '50~921.6', unit: 'kbps' },
      { key: 'proto', label: '协议支持', value: 'TCP/UDP/Telnet/COM', unit: '' },
      { key: 'power', label: '供电', value: '9-48VDC', unit: '' },
      { key: 'temp', label: '工作温度', value: '0~60', unit: '°C' },
    ],
    basePrice: 680, scenarios: ['串口设备联网', 'PLC远程监控', 'SCADA数据采集'],
    sellingPoints: ['工业级可靠性', 'Real COM/TCP多种模式', '15kV ESD保护', '导轨安装'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/FCC', 'IEC 61000-4'],
    altModels: ['NPort 5450', 'UPort 1150', 'tGW-715'],
  },
  {
    sku: 'COM-ADV-USB4716', name: 'USB-4716数据采集卡', brand: 'Advantech', category: 'HMI/通讯', model: 'USB-4716',
    specs: [
      { key: 'ai', label: '模拟输入', value: '16单端/8差分', unit: '通道' },
      { key: 'ao', label: '模拟输出', value: '2', unit: '通道' },
      { key: 'dio', label: '数字IO', value: '8DI/8DO', unit: '通道' },
      { key: 'res', label: '分辨率', value: '16', unit: 'bit' },
      { key: 'rate', label: '采样率', value: '200', unit: 'kS/s' },
      { key: 'comm', label: '接口', value: 'USB 2.0', unit: '' },
    ],
    basePrice: 2800, scenarios: ['实验室数据采集', '测试台', '振动监测'],
    sellingPoints: ['USB即插即用', '16位高分辨率', 'DAQNavi轻松编程', '多种触发模式'],
    faqTemplate: [],
    riskNotes: ['不适用于工业现场长期运行'], complianceNotes: ['CE/FCC'],
    altModels: ['PCI-1716', 'NI USB-6009'],
  },
  {
    sku: 'COM-SIE-SCALC', name: 'SCALANCE XB008交换机', brand: 'Siemens', category: 'HMI/通讯', model: 'XB008',
    specs: [
      { key: 'ports', label: '端口', value: '8x 10/100M RJ45', unit: '' },
      { key: 'type', label: '管理类型', value: '非管理型', unit: '' },
      { key: 'power', label: '供电', value: '24VDC', unit: '' },
      { key: 'ip', label: '防护等级', value: 'IP20', unit: '' },
      { key: 'temp', label: '工作温度', value: '-10~60', unit: '°C' },
      { key: 'mtbf', label: 'MTBF', value: '>100', unit: '年' },
    ],
    basePrice: 1200, scenarios: ['小型产线网络', '设备联网', '控制柜安装'],
    sellingPoints: ['工业级可靠性', 'SIMATIC设计风格', '即插即用', 'DIN导轨安装'],
    faqTemplate: [],
    riskNotes: ['非管理型，无VLAN/环网'], complianceNotes: ['CE/UL', 'IEC 61850-3'],
    altModels: ['XB208', 'FL SWITCH 1008N', 'EDS-208'],
  },
  {
    sku: 'COM-MOXA-EDS408', name: 'EDS-408网管型交换机', brand: 'Moxa', category: 'HMI/通讯', model: 'EDS-408A-MM-ST',
    specs: [
      { key: 'ports', label: '端口', value: '6电+2光(多模)', unit: '' },
      { key: 'type', label: '管理类型', value: '网管型', unit: '' },
      { key: 'proto', label: '环网协议', value: 'Turbo Ring(<20ms恢复)', unit: '' },
      { key: 'power', label: '供电', value: '24VDC双电源', unit: '' },
      { key: 'temp', label: '工作温度', value: '-40~75', unit: '°C' },
      { key: 'ip', label: '防护等级', value: 'IP40', unit: '' },
    ],
    basePrice: 3800, scenarios: ['环网冗余', '户外设备联网', '视频监控网络'],
    sellingPoints: ['Turbo Ring<20ms恢复', '宽温-40~75°C', '双电源冗余', '光纤长距离传输'],
    faqTemplate: [],
    riskNotes: [], complianceNotes: ['CE/FCC/UL', 'IEC 61850-3'],
    altModels: ['SCALANCE XC208', 'FL SWITCH 2008'],
  },
  {
    sku: 'HMI-SIE-KTP700', name: 'SIMATIC KTP700 Basic', brand: 'Siemens', category: 'HMI/通讯', model: 'KTP700 Basic PN',
    specs: [
      { key: 'size', label: '屏幕尺寸', value: '7', unit: '英寸' },
      { key: 'resolution', label: '分辨率', value: '800x480', unit: 'px' },
      { key: 'type', label: '触控类型', value: '电阻式+按键', unit: '' },
      { key: 'memory', label: '用户内存', value: '10', unit: 'MB' },
      { key: 'comm', label: '通讯接口', value: 'PROFINET', unit: '' },
      { key: 'ip', label: '防护等级', value: 'IP65', unit: '' },
    ],
    basePrice: 2800, scenarios: ['小型设备面板', '风机/泵控制', '入门级HMI'],
    sellingPoints: ['经济实惠', 'TIA Portal Basic编程', '按键+触控双模', 'PROFINET直连'],
    faqTemplate: [],
    riskNotes: ['不支持脚本', '无归档功能'], complianceNotes: ['CE/UL', 'IP65'],
    altModels: ['TP700 Comfort', 'GS2110', 'DOP-107'],
  },
  {
    sku: 'COM-PHE-PLCTAP', name: 'PLC-TAP协议转换器', brand: 'Phoenix Contact', category: 'HMI/通讯', model: 'PLC-TAP-ETH',
    specs: [
      { key: 'proto_in', label: '输入协议', value: 'Modbus RTU/TCP', unit: '' },
      { key: 'proto_out', label: '输出协议', value: 'PROFINET IO Device', unit: '' },
      { key: 'ports', label: '接口', value: 'RS-485 + 以太网', unit: '' },
      { key: 'power', label: '供电', value: '24VDC', unit: '' },
      { key: 'temp', label: '工作温度', value: '-25~60', unit: '°C' },
      { key: 'ip', label: '防护等级', value: 'IP20', unit: '' },
    ],
    basePrice: 3200, scenarios: ['老旧设备联网改造', 'Modbus->PROFINET升级', '多品牌PLC互联'],
    sellingPoints: ['Modbus转PROFINET无缝', 'DIN导轨安装', 'Web配置界面', 'Phoenix工业品质'],
    faqTemplate: [],
    riskNotes: ['配置需了解Modbus寄存器映射'], complianceNotes: ['CE', 'IEC 61158'],
    altModels: ['Anybus Communicator', 'TAP-ETH'],
  },
]

// ── Bundle recommendation templates ──
const BUNDLE_TEMPLATES: Array<{ category: string; pairs: [number, number, string][] }> = [
  {
    category: 'PLC控制器',
    pairs: [
      [1, 16, 'PLC+HMI组合方案：统一品牌减少集成成本'],  // FX5U + KTP700
      [0, 17, 'PLC+伺服组合：同一品牌运动控制最优'],
      [2, 20, 'S7-1200+SCALANCE交换机：工业网络一站配齐'],
    ],
  },
  {
    category: '变频器',
    pairs: [
      [20, 2, '变频器+PLC组合：自动化+驱动打包方案'],
      [21, 17, '变频器+传感器：闭环温控/压力方案'],
    ],
  },
  {
    category: '伺服系统',
    pairs: [
      [30, 0, '伺服+PLC组合：运动控制全方案'],
      [32, 46, '伺服+HMI：设备操作面板整体方案'],
    ],
  },
]

// ── Generator ──

export function generateProductAssets(rng: SeededRng): ProductAsset[] {
  const products: ProductAsset[] = []

  for (let i = 0; i < PRODUCT_TEMPLATES.length; i++) {
    const t = PRODUCT_TEMPLATES[i]
    const id = `prod-${String(i + 1).padStart(3, '0')}`

    // Vary the win rate randomly per product
    const winRate = Math.round((0.55 + rng.next() * 0.4) * 100) / 100

    // Generate alternative models that reference other products
    const altModels = t.altModels.length > 0 ? t.altModels : rng.pickN(
      PRODUCT_TEMPLATES.filter(pt => pt.category === t.category && pt.sku !== t.sku).map(pt => pt.model),
      Math.min(2, PRODUCT_TEMPLATES.filter(pt => pt.category === t.category && pt.sku !== t.sku).length),
    )

    // Generate bundle recommendations
    const bundles: ProductAsset['bundleRecommendations'] = []
    const catBundles = BUNDLE_TEMPLATES.filter(bt => bt.category === t.category)
    for (const cb of catBundles) {
      for (const [fromIdx, toIdx, reason] of cb.pairs) {
        if (i === fromIdx && toIdx < PRODUCT_TEMPLATES.length) {
          const target = PRODUCT_TEMPLATES[toIdx]
          bundles.push({ productId: `prod-${String(toIdx + 1).padStart(3, '0')}`, productName: target.name, reason })
        }
      }
    }

    // Vary selling points (pick 3-5)
    const numSellingPoints = rng.nextInt(3, Math.min(5, t.sellingPoints.length))
    const sellingPoints = rng.shuffle(t.sellingPoints).slice(0, numSellingPoints)

    // Vary FAQ items
    const faqItems = t.faqTemplate.map(f => ({
      question: f.q,
      answer: f.a,
      tags: [t.category, t.brand],
    }))

    // Content assets (placeholder images/docs)
    const contentAssets = [
      { type: 'image' as const, url: `/assets/products/${t.sku}.png`, title: `${t.name}产品图` },
      { type: 'document' as const, url: `/assets/datasheets/${t.sku}.pdf`, title: `${t.name}规格书` },
      ...(rng.next() > 0.5
        ? [{ type: 'document' as const, url: `/assets/manuals/${t.sku}-manual.pdf`, title: `${t.name}用户手册` }]
        : []),
    ]

    const product: ProductAsset = {
      id,
      sku: t.sku,
      name: t.name,
      brand: t.brand,
      category: t.category,
      model: t.model,
      specs: t.specs.map(s => ({ key: s.key, label: s.label, value: s.value, unit: s.unit })),
      baseAttributes: [
        { name: '品牌', value: t.brand, confidence: 1.0, status: 'confirmed', source: 'erp' },
        { name: '品类', value: t.category, confidence: 1.0, status: 'confirmed', source: 'erp' },
        { name: '型号', value: t.model, confidence: 1.0, status: 'confirmed', source: 'erp' },
      ],
      applicationScenarios: t.scenarios,
      sellingPoints,
      faqItems,
      alternativeModels: altModels,
      bundleRecommendations: bundles,
      riskNotes: t.riskNotes,
      complianceNotes: t.complianceNotes,
      historicalWinRate: winRate,
      historicalLossReasons: winRate < 0.7
        ? rng.shuffle(['价格偏高', '交期不满足', '客户已有其他品牌', '技术支持不足', '竞品功能更强']).slice(0, rng.nextInt(1, 3))
        : [],
      contentAssets,
      lastUpdatedAt: new Date(2025, 0, rng.nextInt(1, 15)).toISOString(),
    }

    products.push(product)
  }

  return products
}
