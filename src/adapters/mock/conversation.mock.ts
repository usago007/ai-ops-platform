import type { Conversation, RawMessage } from '../../contracts'

const sampleMessages: RawMessage[][] = [
  [
    { id: 'msg-1', role: 'customer', content: '你好，我想咨询一下PLC控制器的价格', timestamp: '2025-01-15T10:30:00' },
    { id: 'msg-2', role: 'agent', content: '您好！请问您需要什么型号的PLC控制器？', timestamp: '2025-01-15T10:31:00' },
    { id: 'msg-3', role: 'customer', content: 'FX3U-64MT，需要50台，交期多久？', timestamp: '2025-01-15T10:32:00' },
    { id: 'msg-4', role: 'agent', content: '好的，FX3U-64MT目前有现货，我来帮您查询报价。', timestamp: '2025-01-15T10:33:00' },
  ],
  [
    { id: 'msg-5', role: 'customer', content: '我需要一批温度传感器 PT100，数量大概200个，请报价', timestamp: '2025-01-15T09:15:00' },
    { id: 'msg-6', role: 'agent', content: '收到！PT100我们有多个品牌的库存，请问有品牌偏好吗？另外请问您的交货地址在哪里？', timestamp: '2025-01-15T09:16:00' },
    { id: 'msg-7', role: 'customer', content: '欧姆龙的，发到上海仓库，含税价格', timestamp: '2025-01-15T09:18:00' },
  ],
  [
    { id: 'msg-8', role: 'customer', content: '变频器 ACS580-01-062A-4 询价，3台', timestamp: '2025-01-15T11:00:00' },
    { id: 'msg-9', role: 'agent', content: '收到询价，请问是需要带什么通讯模块的版本？', timestamp: '2025-01-15T11:01:00' },
    { id: 'msg-10', role: 'customer', content: '带Profibus的，用在恒压供水上', timestamp: '2025-01-15T11:02:00' },
  ],
  [
    { id: 'msg-11', role: 'customer', content: '伺服电机 MR-J4-70A，10套，急用！最快多久能到？', timestamp: '2025-01-15T14:00:00' },
    { id: 'msg-12', role: 'agent', content: '我帮您查一下库存情况，MR-J4-70A是常用型号，应该很快。', timestamp: '2025-01-15T14:01:00' },
  ],
]

export function generateConversations(): Conversation[] {
  return [
    {
      id: 'conv-001',
      channel: 'im',
      customerName: '张工',
      companyName: '苏州智汇自动化有限公司',
      contactInfo: 'zhang@zhihuiauto.cn',
      rawMessages: sampleMessages[0],
      attachments: [],
      receivedAt: '2025-01-15T10:30:00',
      ownerUserId: 'user-1',
      status: 'active',
      latestIntent: 'PLC控制器询价',
      linkedLeadId: 'lead-001',
      linkedDraftId: 'draft-001',
    },
    {
      id: 'conv-002',
      channel: 'email',
      customerName: '李经理',
      companyName: '深圳鹏飞传感器科技有限公司',
      contactInfo: 'li@pengfei-sensor.com',
      rawMessages: sampleMessages[1],
      attachments: [],
      receivedAt: '2025-01-15T09:15:00',
      ownerUserId: 'user-1',
      status: 'active',
      latestIntent: '温度传感器批量采购',
      linkedLeadId: 'lead-002',
      linkedDraftId: null,
    },
    {
      id: 'conv-003',
      channel: 'wechat',
      customerName: '王总',
      companyName: '杭州恒达电气有限公司',
      contactInfo: 'wang@hd-electric.cn',
      rawMessages: sampleMessages[2],
      attachments: [
        { id: 'att-1', fileName: '规格要求.pdf', fileType: 'application/pdf', url: '/mock/att-1.pdf', sizeBytes: 245000 },
      ],
      receivedAt: '2025-01-15T11:00:00',
      ownerUserId: 'user-2',
      status: 'new',
      latestIntent: null,
      linkedLeadId: null,
      linkedDraftId: null,
    },
    {
      id: 'conv-004',
      channel: 'phone_summary',
      customerName: '赵工',
      companyName: '成都精工智造有限公司',
      contactInfo: 'zhao@jinggong.cn',
      rawMessages: sampleMessages[3],
      attachments: [],
      receivedAt: '2025-01-15T14:00:00',
      ownerUserId: 'user-1',
      status: 'parsing',
      latestIntent: null,
      linkedLeadId: null,
      linkedDraftId: null,
    },
  ]
}

export function getConversationById(id: string): Conversation | undefined {
  return generateConversations().find(c => c.id === id)
}
