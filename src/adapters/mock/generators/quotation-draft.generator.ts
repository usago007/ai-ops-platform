/**
 * QuotationDraft generator — 40-60 quotation drafts for leads in draft_ready+ status.
 */
import type { SeededRng } from './seeded-random'
import type { QuotationDraft } from '../../../contracts'
import type { Lead } from '../../../contracts'
import type { ProductAsset } from '../../../contracts'

export function generateQuotationDrafts(
  rng: SeededRng,
  leads: Lead[],
  productAssets: ProductAsset[],
): QuotationDraft[] {
  const quotations: QuotationDraft[] = []
  let quotIdx = 0

  const eligibleLeads = leads.filter(l =>
    ['draft_ready', 'sent', 'following_up', 'won', 'lost', 'closed_looped'].includes(l.status),
  )

  for (const lead of eligibleLeads) {
    // ~80% of eligible get quotations
    if (rng.next() > 0.8 && quotIdx >= 25) continue
    quotIdx++
    const id = `quot-${String(quotIdx).padStart(3, '0')}`

    // Products for quotation
    const leadProducts = productAssets.filter(p => lead.relatedProductIds.includes(p.id))
    const products: QuotationDraft['products'] = (leadProducts.length > 0 ? leadProducts : rng.pickN(productAssets, rng.nextInt(1, 3))).map(p => {
      const qty = rng.nextInt(1, 50)
      const price = rng.nextInt(p.sku.startsWith('PLC') ? 2000 : p.sku.startsWith('VFD') ? 3000 : p.sku.startsWith('SRV') ? 2500 : 500, 50000)
      return {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        quantity: qty,
        unit: '台',
        unitPrice: price,
        totalPrice: price * qty,
        notes: rng.next() > 0.6 ? rng.pick(['含一年质保', '不含运费', '含安装调试']) : undefined,
      }
    })

    const subtotal = products.reduce((sum, p) => sum + p.totalPrice, 0)
    const shipping = rng.nextInt(200, 3000)
    const tax = Math.round(subtotal * 0.13)
    const discount = rng.next() > 0.5 ? -Math.round(subtotal * rng.nextFloat(0.02, 0.1)) : 0
    const totalAmount = subtotal + shipping + tax + discount

    const paymentTermsOptions: QuotationDraft['paymentTerms'][] = ['advance', 'cod', 'net30', 'net60', 'net90', 'l/c', 'tt']

    quotations.push({
      id,
      leadId: lead.id,
      products,
      priceItems: [
        { label: '产品小计', amount: subtotal, type: 'product' },
        { label: '运费', amount: shipping, type: 'shipping' },
        { label: '增值税(13%)', amount: tax, type: 'tax' },
        ...(discount !== 0 ? [{ label: '折扣', amount: discount, type: 'discount' as const }] : []),
      ],
      totalAmount,
      currency: 'CNY',
      deliveryTerms: rng.pick(['2-4周', '4-6周', '6-8周', '现货1周', '分批4-8周']),
      paymentTerms: rng.pick(paymentTermsOptions),
      validUntil: new Date(2025, rng.nextInt(2, 5), rng.nextInt(1, 28)).toISOString(),
      quotationNotes: rng.pick([
        '以上价格含13%增值税。报价有效期30天。', '量大可议，请与销售经理联系。',
        '此报价基于当前原材料价格，如有大幅波动将另行通知。',
      ]),
      riskAlerts: lead.riskLevel === 'high'
        ? [{ type: '价格风险', severity: 'high', description: '原材料价格波动较大，建议客户尽快确认' }]
        : [],
      referenceCases: rng.next() > 0.4
        ? [{ caseId: `case-${String(rng.nextInt(1, 100)).padStart(3, '0')}`, title: rng.pick(['某汽车零部件项目', '电子厂产线项目', '化工厂改造项目']), relevance: '同类产品，相似规模' }]
        : [],
      approvedBy: rng.next() > 0.4 ? rng.pick(['张工', '李经理', '王工']) : null,
      editHistory: [],
      status: rng.weighted([['generated' as const, 45], ['sent' as const, 30], ['edited' as const, 15], ['approved' as const, 10]]),
      createdAt: new Date(2025, 0, rng.nextInt(50, 145)).toISOString(),
      updatedAt: new Date(2025, 0, rng.nextInt(60, 150)).toISOString(),
    })
  }

  return quotations
}
