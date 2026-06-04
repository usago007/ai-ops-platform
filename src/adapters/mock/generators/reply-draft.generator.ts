/**
 * ReplyDraft generator — 60-80 reply drafts for leads in recommending+ status.
 */
import type { SeededRng } from './seeded-random'
import type { ReplyDraft } from '../../../contracts'
import type { Lead } from '../../../contracts'
import type { Conversation } from '../../../contracts'

const REPLY_TEMPLATES: Record<string, string[]> = {
  initial_response: [
    '尊敬的{customer}您好，感谢贵司{company}对我司{product}产品的关注。根据贵司需求，我司推荐{product}方案，详细技术参数和报价请见附件。如有疑问欢迎随时联系，我司技术团队可安排现场交流。',
    '{customer}总您好，已收到贵司的询价需求。{product}产品目前有现货，交期约2周。附件为产品规格书和参考报价，请查收。',
  ],
  price_quote: [
    '您好，根据贵司需求，{product}产品报价如下：单价¥{price}/台，{qty}台合计¥{total}（含税）。报价有效期30天，量大可议。如需订购请回复确认。',
    '报价已更新——{product}方案，总金额¥{total}，含运输费和安装调试费。付款方式：30%预付+70%发货前。',
  ],
  technical_answer: [
    '关于贵司提出的{product}通讯协议兼容性问题：该产品支持Modbus TCP、EtherNet/IP、PROFINET三种协议，可与西门子、三菱、欧姆龙等主流PLC直接通讯。建议使用以太网方式对接。',
    '技术回复：{product}的工作温度范围为-20~60°C，防护等级IP65，可在贵司所述现场环境下正常使用。附上规格书第3页的环境参数表供参考。',
  ],
  follow_up: [
    '{customer}总您好，上次沟通的{product}方案不知贵司内部讨论结果如何？如果有任何疑问或需要调整，我可以安排技术团队做进一步方案细化。期待您的回复。',
    '温馨提醒：上次报价中的{product}产品近期价格可能调整，建议贵司尽快确认。我司可提供免费样品测试。',
  ],
  complaint_handling: [
    '非常抱歉给贵司带来不便！关于{product}产品的质量问题，我司已启动紧急处理流程。建议：1)立即安排技术工程师上门检测；2)确认原因后免费更换或维修。请问明天上午方便安排工程师上门吗？',
    '收到贵司投诉，我们高度重视。我司质量部门已介入调查，预计24小时内给出初步分析报告。同时我们会安排备用设备确保贵司生产不受影响。',
  ],
  negotiation: [
    '感谢贵司的反馈。关于价格问题，我司可以提供以下方案：1)数量增加到{min_qty}台可享受9折；2)签订年度框架协议可锁定当前价格；3)延长质保期至3年。请考虑。',
    '议价方案如下：如果贵司同时采购{product}和{bundle}，总价可优惠{pct}%。另外我们可以提供免费的技术培训和2年质保。',
  ],
}

export function generateReplyDrafts(
  rng: SeededRng,
  leads: Lead[],
  conversations: Conversation[],
): ReplyDraft[] {
  const replies: ReplyDraft[] = []
  let replyIdx = 0

  const eligibleLeads = leads.filter(l =>
    ['recommending', 'draft_ready', 'sent', 'following_up', 'won', 'lost', 'closed_looped'].includes(l.status),
  )

  for (const lead of eligibleLeads) {
    // 60-80% of eligible leads get 1-3 replies
    const numReplies = rng.nextInt(1, lead.followUpCount > 2 ? 3 : 2)
    for (let r = 0; r < numReplies; r++) {
      if (rng.next() > 0.85 && replyIdx >= 40) continue // ~85% coverage
      replyIdx++
      const id = `reply-${String(replyIdx).padStart(3, '0')}`
      const conv = conversations.find(c => c.id === lead.sourceConversationId)

      const scenarioWeights: Array<[ReplyDraft['replyScenario'], number]> = [
        ['initial_response', 25], ['price_quote', 25], ['technical_answer', 15],
        ['follow_up', 15], ['complaint_handling', 10], ['negotiation', 10],
      ]
      const replyScenario = rng.weighted(scenarioWeights)

      const templates = REPLY_TEMPLATES[replyScenario] || REPLY_TEMPLATES['initial_response']
      const template = rng.pick(templates)
      const productName = rng.pick(['三菱FX5U PLC', '西门子S7-1200', 'ABB ACS580变频器', '欧姆龙PT100传感器', '台达ASDA-A3伺服'])
      const draftContent = template
        .replace(/\{customer\}/g, conv?.customerName || '客户')
        .replace(/\{company\}/g, lead.companyName)
        .replace(/\{product\}/g, productName)
        .replace(/\{price\}/g, String(rng.nextInt(800, 50000)))
        .replace(/\{qty\}/g, String(rng.nextInt(1, 50)))
        .replace(/\{total\}/g, String(rng.nextInt(5000, 300000).toLocaleString()))
        .replace(/\{min_qty\}/g, String(rng.nextInt(10, 100)))
        .replace(/\{bundle\}/g, rng.pick(['触摸屏', '传感器', '通讯模块', '电缆']))
        .replace(/\{pct\}/g, String(rng.nextInt(5, 15)))

      const toneWeights: Array<[ReplyDraft['tone'], number]> = [
        ['professional', 50], ['friendly', 25], ['formal', 15], ['concise', 10],
      ]

      const statusWeights: Array<[ReplyDraft['status'], number]> = [
        ['generated', 40], ['sent', 30], ['edited', 15], ['approved', 15],
      ]

      replies.push({
        id,
        leadId: lead.id,
        conversationId: lead.sourceConversationId,
        replyScenario,
        draftContent,
        finalContent: rng.next() > 0.5 ? draftContent : null,
        tone: rng.weighted(toneWeights),
        basedOnRecommendations: lead.selectedSolutionId ? [lead.selectedSolutionId] : [],
        riskWarnings: lead.riskLevel === 'high'
          ? [rng.pick(['信用风险：客户账期较长', '价格风险：竞品报价低15%', '交期风险：需加急排产'])]
          : [],
        editable: true,
        approvedBy: rng.next() > 0.5 ? rng.pick(['张工', '李经理', '王工']) : null,
        editHistory: rng.next() > 0.6
          ? [{ editedBy: rng.pick(['张工', '李经理']), editedAt: new Date(2025, 0, rng.nextInt(50, 150)).toISOString(), changeDescription: '调整价格和交期' }]
          : [],
        status: rng.weighted(statusWeights),
        createdAt: new Date(2025, 0, rng.nextInt(40, 145)).toISOString(),
        updatedAt: new Date(2025, 0, rng.nextInt(50, 150)).toISOString(),
      })
    }
  }

  return replies
}
