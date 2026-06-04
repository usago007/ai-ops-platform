import type { KnowledgeItem } from '../../contracts'

export function generateKnowledgeItems(): KnowledgeItem[] {
  return [
    {
      id: 'ki-001',
      sourceOutcomeId: 'outcome-001',
      type: 'pricing_strategy',
      title: 'FX3U系列批量折扣策略优化',
      summary: '50台FX3U-64MT的成交显示：批量折扣从95折调整到93折（经特批）可有效促进成交，建议更新批量采购折扣阶梯。',
      content: `## 现状
当前FX3U系列的批量折扣阶梯为：
- 10-30台：98折
- 31-50台：95折
- 50台以上：待定

## 发现
Lead-001（苏州智汇自动化，50台）成交价为93折（经经理特批），说明95折在竞品压力下可能不够有竞争力。

## 建议
更新折扣阶梯：
- 10-30台：98折 → 维持
- 31-50台：95折 → 调整为93折
- 50台以上：新增92折`,
      relatedProductIds: ['prod-001'],
      relatedLeadIds: ['lead-001'],
      tags: ['定价', '折扣', 'PLC'],
      status: 'published',
      createdBy: 'ai',
      createdAt: '2025-01-16T16:30:00',
      updatedAt: '2025-01-16T16:30:00',
    },
    {
      id: 'ki-002',
      sourceOutcomeId: 'outcome-002',
      type: 'loss_analysis',
      title: 'FX3U面对国产替代的流失分析',
      summary: 'Lead-003流失原因：客户因预算选择了国产H3U替代方案（价格低40%）。建议针对价格敏感客户提前准备"差异化价值说明"话术。',
      content: `## 案例
Lead-003（客户选择了国产H3U-64MT替代FX3U-64MT），核心流失原因：价格差约40%。

## 分析
AI在推荐中已提供了国产替代方案对比，但客户仍选择了竞品。说明：
1. 客户对价格极度敏感
2. 我们对FX3U的差异化价值（稳定性、生态、售后）传达不够有力

## 建议话术
"我们完全理解您对成本的关注。FX3U虽然前期投入稍高，但三菱PLC的平均无故障时间是国产品牌的2-3倍，综合使用成本其实更低。而且我们提供18个月质保+终身技术支持，您不用担心后期维护问题。"`,
      relatedProductIds: ['prod-001'],
      relatedLeadIds: ['lead-003'],
      tags: ['流失分析', '竞品', '话术'],
      status: 'published',
      createdBy: 'ai',
      createdAt: '2025-01-14T11:30:00',
      updatedAt: '2025-01-14T11:30:00',
    },
    {
      id: 'ki-003',
      sourceOutcomeId: 'outcome-001',
      type: 'reply_pattern',
      title: '批量采购询价的标准化回复模板',
      summary: '从Lead-001的成功回复中提取批量询价回复模板，包含现货确认→报价→交期→追问的完整流程。',
      content: `## 模板结构
1. 感谢询价 + 确认需求
2. 现货/库存情况
3. 参考价格 + 批量折扣说明
4. 交期承诺
5. 追问（支付方式、是否需要配件）
6. 联系方式

## 关键要素
- 回复速度：<15分钟（客户明确表扬）
- 主动推荐配件（编程电缆）
- 提供多个支付方案`,
      relatedProductIds: [],
      relatedLeadIds: ['lead-001'],
      tags: ['话术', '模板', '回复'],
      status: 'published',
      createdBy: 'ai',
      createdAt: '2025-01-16T17:00:00',
      updatedAt: '2025-01-16T17:00:00',
    },
  ]
}

export function getKnowledgeItemById(id: string): KnowledgeItem | undefined {
  return generateKnowledgeItems().find(k => k.id === id)
}

export function getKnowledgeItemsByOutcomeId(outcomeId: string): KnowledgeItem[] {
  return generateKnowledgeItems().filter(k => k.sourceOutcomeId === outcomeId)
}
