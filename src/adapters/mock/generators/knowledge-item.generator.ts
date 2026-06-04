/**
 * KnowledgeItem generator — 35-45 knowledge items from outcomes.
 */
import type { SeededRng } from './seeded-random'
import type { KnowledgeItem } from '../../../contracts'
import type { Outcome } from '../../../contracts'

const KNOWLEDGE_TEMPLATES: Record<string, Array<{ title: string; summary: string; content: string }>> = {
  pricing_strategy: [
    {
      title: '{category}产品最佳定价区间分析',
      summary: '基于{won_count}个赢单案例，{category}产品的最优报价区间为¥{min}-{max}，成交率{pct}%。',
      content: '通过分析近期成交数据，{category}类产品的价格敏感区间为...建议标准报价策略：首次报价取中位线上浮10%，留10-15%议价空间。',
    },
    {
      title: '竞品价格对比——{brand}系列',
      summary: '{brand}品牌{category}产品与主要竞品的价格差异分析，覆盖3个常用型号。',
      content: '经过多轮比价发现，{brand}产品在中等功率段具有15-20%的价格优势...但在高端市场的品牌溢价能力较弱。',
    },
  ],
  loss_analysis: [
    {
      title: '丢单复盘——{company}案',
      summary: '客户{company}丢单原因：{reason}。损失金额约¥{amount}。',
      content: '客户主要流失原因为价格超出预算20%。竞品（某国产品牌）以低于我方15%的价格中标...建议对该客户持续跟进，提供替代方案。',
    },
    {
      title: '{category}品类流失模式分析',
      summary: '近{months}个月内{category}品类流失{count}单，主因为{top_reason}。',
      content: '分析发现，{category}产品的丢单集中在价格敏感型客户（占比{price_pct}%）和交期不满足客户（占比{delivery_pct}%）。建议优化供应链和增加中低端产品线。',
    },
  ],
  reply_pattern: [
    {
      title: '高效议价话术模板——{scenario}场景',
      summary: '总结{count}条经过验证的高效议价话术，适用于{scenario}场景。',
      content: '话术核心原则：1)先确认客户真实需求再报价 2)突出差异化价值而非低价 3)捆绑方案提升客单价 4)适当让步换长期合作。',
    },
  ],
  faq: [
    {
      title: '{category}选型常见问题汇总',
      summary: '整理{count}个{category}产品选型过程中的高频问题及标准答复。',
      content: 'FAQ覆盖：选型参数确认、兼容性判断、安装调试要点、售后服务政策等{A}个方面。建议CS团队熟记并在回复中使用。',
    },
  ],
  product_note: [
    {
      title: '{product}产品知识卡片',
      summary: '{product}的核心参数、适用场景、常见替代型号一览。',
      content: '该产品最佳适用场景为{scenario}，建议搭配{bundle}形成完整方案。注意：{risk_note}。',
    },
  ],
}

export function generateKnowledgeItems(
  rng: SeededRng,
  outcomes: Outcome[],
): KnowledgeItem[] {
  const items: KnowledgeItem[] = []
  let kiIdx = 0

  for (const outcome of outcomes) {
    // Each outcome generates at least 1 knowledge item
    const numItems = rng.nextInt(1, 2)
    for (let k = 0; k < numItems; k++) {
      kiIdx++
      const id = `ki-${String(kiIdx).padStart(3, '0')}`

      const typeWeights: Array<[KnowledgeItem['type'], number]> = outcome.resultType === 'won'
        ? [['pricing_strategy', 40], ['reply_pattern', 25], ['faq', 20], ['product_note', 10], ['loss_analysis', 5]]
        : outcome.resultType === 'lost'
          ? [['loss_analysis', 50], ['pricing_strategy', 25], ['product_note', 15], ['faq', 10]]
          : [['faq', 35], ['product_note', 30], ['reply_pattern', 20], ['pricing_strategy', 15]]

      const type = rng.weighted(typeWeights)
      const templates = KNOWLEDGE_TEMPLATES[type] || KNOWLEDGE_TEMPLATES['faq']
      const template = rng.pick(templates)

      const title = template.title
        .replace('{category}', rng.pick(['PLC', '变频器', '伺服', '传感器', 'HMI']))
        .replace('{brand}', rng.pick(['三菱', '西门子', 'ABB', '欧姆龙', '台达']))
        .replace('{company}', rng.pick(['某汽车零部件厂', '某电子制造商', '某化工厂']))
        .replace('{reason}', outcome.reasonDetail)
        .replace('{scenario}', rng.pick(['价格谈判', '技术答疑', '售后跟进']))
        .replace('{product}', rng.pick(['FX5U PLC', 'S7-1200', 'ACS580', 'MR-J5伺服']))
        .replace('{count}', String(rng.nextInt(5, 20)))

      const summary = template.summary
        .replace('{category}', rng.pick(['PLC', '变频器', '伺服']))
        .replace('{brand}', rng.pick(['三菱', '西门子', 'ABB']))
        .replace('{company}', '客户')
        .replace('{won_count}', String(rng.nextInt(5, 20)))
        .replace('{min}', String(rng.nextInt(1000, 10000)))
        .replace('{max}', String(rng.nextInt(20000, 100000)))
        .replace('{pct}', String(rng.nextInt(55, 85)) + '%')
        .replace('{reason}', outcome.reasonDetail)
        .replace('{months}', String(rng.nextInt(2, 6)))
        .replace('{count}', String(rng.nextInt(3, 10)))
        .replace('{top_reason}', outcome.reasonDetail)

      const statusWeights: Array<[KnowledgeItem['status'], number]> = [
        ['published', 60], ['draft', 25], ['archived', 15],
      ]

      items.push({
        id,
        sourceOutcomeId: outcome.id,
        type,
        title,
        summary,
        content: template.content
          .replace('{category}', rng.pick(['PLC', '变频器', '伺服']))
          .replace('{brand}', rng.pick(['三菱', '西门子', 'ABB']))
          .replace('{scenario}', rng.pick(['自动化产线', '过程控制', '机器人工作站']))
          .replace('{bundle}', rng.pick(['触摸屏+通讯模块', '传感器+电缆', '变频器+制动电阻']))
          .replace('{risk_note}', rng.pick(['注意兼容性', '需确认供电电压', '高温环境需降额']))
          .replace('{amount}', String(outcome.finalAmount || rng.nextInt(10000, 200000)))
          .replace('{price_pct}', String(rng.nextInt(40, 70)) + '%')
          .replace('{delivery_pct}', String(rng.nextInt(15, 35)) + '%'),
        relatedProductIds: outcome.relatedProductIds,
        relatedLeadIds: [outcome.leadId],
        tags: rng.shuffle([type, outcome.resultType, 'AI生成']).slice(0, rng.nextInt(2, 4)),
        status: rng.weighted(statusWeights),
        createdBy: rng.weighted([['ai' as const, 85], ['manual' as const, 15]]),
        createdAt: new Date(2025, 0, rng.nextInt(70, 150)).toISOString(),
        updatedAt: new Date(2025, 0, rng.nextInt(80, 150)).toISOString(),
      })
    }
  }

  return items
}
