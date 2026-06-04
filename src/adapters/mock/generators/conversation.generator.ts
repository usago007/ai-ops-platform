/**
 * Conversation generator — 120 conversations with varied channels and message content.
 */
import type { SeededRng } from './seeded-random'
import type { Conversation } from '../../../contracts'

// ── Company name pool (80 B2B companies) ──
const COMPANIES = [
  '深圳华星光电科技有限公司', '北京中科曙光信息产业', '上海振华重工集团', '广州数控设备有限公司',
  '杭州海康威视数字技术', '武汉华中数控股份', '成都飞机工业集团', '南京埃斯顿自动化',
  '苏州汇川技术有限公司', '东莞拓斯达科技', '天津中环半导体', '重庆长安汽车股份',
  '青岛海尔智能装备', '厦门宏发电声', '大连机床集团', '郑州宇通客车',
  '长沙中联重科', '合肥美亚光电', '西安西电集团', '济南二机床集团',
  '无锡信捷电气', '佛山美的集团', '宁波均胜电子', '福州福大自动化',
  '珠海格力智能装备', '常州铭赛机器人', '沈阳新松机器人', '烟台杰瑞集团',
  '昆山华恒焊接', '嘉兴敏实集团', '泉州南方路面机械', '长春一汽集团',
  '贵阳中航工业', '兰州兰石集团', '柳州五菱汽车', '潍坊潍柴动力',
  '南通中远船务', '唐山曹妃甸工业', '洛阳中信重工', '襄阳东风汽车',
  '宜昌兴发集团', '镇江大全集团', '湖州德马科技', '宝鸡石油机械',
  '大庆油田装备', '温州正泰电器', '芜湖奇瑞汽车', '绵阳长虹集团',
  '连云港中复连众', '黄石东贝集团', '马鞍山马钢集团', '鞍山鞍钢集团',
  '秦皇岛中信戴卡', '德阳东方电机', '宜宾五粮液集团', '盐城东风悦达起亚',
  '九江巨石集团', '衡阳特变电工', '桂林啄木鸟医疗', '赣州金力永磁',
  '菏泽步长制药', '临沂金锣集团', '保定长城汽车', '廊坊新奥集团',
  '株洲中车时代', '湘潭吉利汽车', '岳阳巴陵石化', '泰州扬子江药业',
  '宁德时代新能源', '龙岩龙净环保', '中山大洋电机', '惠州TCL集团',
  '韶关钢铁', '湛江宝钢', '茂名石化', '揭阳巨轮智能',
  '常州天合光能', '徐州徐工集团', '宜春赣锋锂业', '景德镇华意压缩',
]

// ── Customer names ──
const FIRST_NAMES = ['张', '李', '王', '陈', '刘', '黄', '赵', '周', '吴', '孙', '朱', '马', '胡', '林', '何', '高', '罗', '郭', '杨', '梁']
const LAST_NAMES = ['工', '经理', '总', '主任', '工程师', '主管', '部长', '师傅', '先生']

// ── Message templates per channel and intent ──
const MESSAGE_TEMPLATES: Record<string, string[][]> = {
  im: [
    ['你好，我想咨询一下你们有没有PLC控制器', '能发一下型号和参数吗', '我们这边产线需要改造升级'],
    ['报价请发我一份，型号见附件', '数量大概20台', '交期需要确认'],
    ['技术支持在吗？设备报故障码E021', '之前用的AB的，想换国产试试', '有没有兼容替代方案'],
    ['你们的产品和西门子的比怎么样', '主要看稳定性和售后', '价格差多少'],
    ['我们有个项目需要选型', '用在包装设备上的', '方便电话沟通吗'],
  ],
  email: [
    ['尊敬的供应商：我司现有一批设备采购需求，请协助提供技术方案及报价。', '附件为设备清单。'],
    ['感谢回复。关于PT100的技术参数，我方还有一个疑问...', '请确认该型号是否支持Modbus协议。'],
    ['关于报价单，管理层审批已通过。请尽快安排发货。', '收货地址：深圳市南山区科技园...'],
  ],
  wechat: [
    ['王总好，上次那个PLC方案客户那边反馈不错', '下一步可以推进报价了'],
    ['[图片]这个设备铭牌能帮我看看吗', '不知道还有没有配件'],
    ['李工，产线又报警了，方便远程看下吗', '急！生产停线了...'],
  ],
  phone_summary: [
    ['客户来电咨询伺服系统选型——用于CNC改造——需求3轴联动——预算30万左右——要求日本品牌'],
    ['工地现场报修变频器故障——型号ACS580——报故障码F001——需紧急上门处理'],
    ['客户来电询价——量大——年需求约200台——要求一级代理价——希望长期合作'],
  ],
  form: [
    ['产品类型：PLC | 数量：5 | 品牌偏好：西门子 | 预算：10万以内 | 交期：2周'],
    ['申请样品测试——型号MR-J4-200A——公司：深圳华星光电——项目：新产线建设'],
  ],
}

// ── Generator ──

export function generateConversations(rng: SeededRng): Conversation[] {
  const conversations: Conversation[] = []
  const totalCount = 120

  // Channel distribution
  const channelWeights: Array<[Conversation['channel'], number]> = [
    ['im', 48], ['email', 30], ['wechat', 24], ['phone_summary', 12], ['form', 6],
  ]

  for (let i = 0; i < totalCount; i++) {
    const id = `conv-${String(i + 1).padStart(3, '0')}`
    const channel = rng.weighted(channelWeights)
    const company = rng.pick(COMPANIES)
    const customerName = rng.pick(FIRST_NAMES) + rng.pick(LAST_NAMES)

    // Generate messages
    const templates = MESSAGE_TEMPLATES[channel] || MESSAGE_TEMPLATES['im']
    const numMessages = rng.nextInt(3, 8)
    const rawMessages: Conversation['rawMessages'] = []

    // Start date: Jan 2025, spread over 5 months
    const baseDate = new Date(2025, 0, rng.nextInt(1, 150))
    for (let m = 0; m < numMessages; m++) {
      const msgDate = new Date(baseDate.getTime() + m * rng.nextInt(5, 240) * 60000)
      const isCustomer = rng.next() > 0.2 // 80% customer messages
      rawMessages.push({
        id: `msg-${id}-${m + 1}`,
        role: isCustomer ? 'customer' : (m > 1 && rng.next() > 0.5 ? 'agent' : 'system'),
        content: rng.pick(rng.pick(templates)),
        timestamp: msgDate.toISOString(),
        intent: m < numMessages - 1 ? rng.pick(['询价', '技术支持', '投诉', '售后', '合作咨询']) : undefined,
      })
    }

    // Status distribution: most are active
    const statusWeights: Array<[Conversation['status'], number]> = [
      ['active', 60], ['archived', 25], ['parsing', 20], ['new', 15],
    ]
    const status = rng.weighted(statusWeights)

    conversations.push({
      id,
      channel,
      customerName,
      companyName: company,
      contactInfo: `${rng.nextInt(130, 199)}${String(rng.nextInt(1000, 9999)).padStart(4, '0')}${String(rng.nextInt(1000, 9999)).padStart(4, '0')}`,
      rawMessages,
      attachments: rng.next() > 0.6
        ? [{
          id: `att-${id}-1`,
          fileName: rng.pick(['技术规格书.pdf', '现场照片.jpg', '设备清单.xlsx', '报价对比表.xlsx', '合同草案.pdf']),
          fileType: rng.pick(['pdf', 'jpg', 'xlsx']),
          url: `/assets/attachments/${id}-1`,
          sizeBytes: rng.nextInt(50000, 5000000),
        }]
        : [],
      receivedAt: baseDate.toISOString(),
      ownerUserId: rng.pick(['user-001', 'user-002', 'user-003', 'user-004', 'user-005']),
      status,
      latestIntent: status !== 'new' ? rng.pick(['询价-选型确认', '技术支持-故障排查', '补货订单', '新品试用申请', '合同续签', '投诉-品质异常']) : null,
      linkedLeadId: null,    // Set later by lead generator integration
      linkedDraftId: null,   // Set later by inquiry draft generator integration
    })
  }

  return conversations
}
