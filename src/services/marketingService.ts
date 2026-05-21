import { demoApi } from './demoApi'
import { marketingDataStore } from './marketingData'

export const marketingService = {
  generate: (data: any) =>
    demoApi.post(marketingDataStore.generate(data), 800),

  getMaterials: () =>
    demoApi.get(marketingDataStore.getMaterials(), 300),

  complianceCheck: (data: { content: string }) =>
    demoApi.post(marketingDataStore.complianceCheck(data), 500),

  getSellingPoints: (productId?: string) =>
    demoApi.get(marketingDataStore.getSellingPoints(productId), 500),

  getConversionFunnel: () =>
    demoApi.get(marketingDataStore.getConversionFunnel(), 450),

  getLandingPagePreview: (source?: string) =>
    demoApi.get(marketingDataStore.getLandingPagePreview(source), 250),
}
