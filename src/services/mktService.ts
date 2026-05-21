import { demoApi } from './demoApi'
import { mktDataStore } from './mktData'

export const mktService = {
  getStats: () =>
    demoApi.get(mktDataStore.getStats(), 300),

  getTemplates: () =>
    demoApi.get(mktDataStore.getTemplates(), 300),

  getTrend: () =>
    demoApi.get(mktDataStore.getTrend(), 300),

  getAttribution: () =>
    demoApi.get(mktDataStore.getAttribution(), 300),
}
