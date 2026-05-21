import { demoApi } from './demoApi'
import { ruleDataStore } from './ruleData'

export const ruleService = {
  getRuleList: () => demoApi.get(ruleDataStore.getRules(), 250),
  importRules: () => demoApi.post(ruleDataStore.importRules(), 450),
  createRule: (payload: any) => demoApi.post(ruleDataStore.createRule(payload), 300),
  updateRule: (id: string, payload: any) => demoApi.post(ruleDataStore.updateRule(id, payload), 300),
  toggleRule: (id: string) => demoApi.post(ruleDataStore.toggleRule(id), 250),
  checkConflicts: (id?: string) => demoApi.post(ruleDataStore.checkConflict(), 300),
  getRuleVersions: (id: string) => demoApi.get(ruleDataStore.getVersions(id), 250),
}
