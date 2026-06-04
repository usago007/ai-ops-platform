import type { ReplyDraft } from '../../contracts'

export function generateReplyDrafts(): ReplyDraft[] {
  return [
    {
      id: 'reply-001',
      leadId: 'lead-001',
      conversationId: 'conv-001',
      replyScenario: 'initial_response',
      draftContent: `张工您好！

感谢您的询价。关于您所需的FX3U-64MT PLC控制器，我们为您提供以下信息：

**现货情况**：FX3U-64MT目前库存充足，50台可立即安排。
**参考单价**：¥2,560/台（未税），批量50台可申请95折优惠。
**交期**：预计7-10个工作日可发货。
**技术支持**：附赠GX Works3编程指导，我们的技术工程师可提供远程支持。

另外，我想了解一下：
1. 贵司对支付方式有偏好吗？（月结/现结）
2. 除了PLC主机，是否需要配套的编程电缆和扩展模块？

期待您的回复！

此致
AI Ops 客服团队`,
      finalContent: null,
      tone: 'professional',
      basedOnRecommendations: ['sol-001'],
      riskWarnings: [
        '客户未明确支付方式，报价中已包含月结和现结两种方案参考',
        '建议在正式报价前确认客户的税率要求（含税/未税）',
      ],
      editable: true,
      approvedBy: null,
      editHistory: [],
      status: 'generated',
      createdAt: '2025-01-15T10:42:00',
      updatedAt: '2025-01-15T10:42:00',
    },
    {
      id: 'reply-002',
      leadId: 'lead-001',
      conversationId: 'conv-001',
      replyScenario: 'price_quote',
      draftContent: `张工您好！

关于FX3U-64MT（50台）的正式报价如下：

| 项目 | 规格 | 数量 | 单价 | 金额 |
|------|------|------|------|------|
| PLC控制器 | FX3U-64MT | 50台 | ¥2,560 | ¥128,000 |
| 编程电缆 | USB-SC09 | 5根 | ¥180 | ¥900 |
| **合计** | | | | **¥128,900** |

交期：7-10个工作日
支付：月结30天 / 现结（97折）
质保：原厂18个月

如有疑问，欢迎随时沟通！`,
      finalContent: null,
      tone: 'professional',
      basedOnRecommendations: ['sol-001'],
      riskWarnings: [
        '价格基于当前库存和汇率，有效期至2025-01-30',
      ],
      editable: true,
      approvedBy: null,
      editHistory: [],
      status: 'generated',
      createdAt: '2025-01-15T10:43:00',
      updatedAt: '2025-01-15T10:43:00',
    },
  ]
}

export function getReplyDraftById(id: string): ReplyDraft | undefined {
  return generateReplyDrafts().find(r => r.id === id)
}

export function getReplyDraftsByLeadId(leadId: string): ReplyDraft[] {
  return generateReplyDrafts().filter(r => r.leadId === leadId)
}
