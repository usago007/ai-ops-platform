import { demoApi } from './demoApi'
import { ruleDataStore } from './ruleData'

interface RulePayload {
  name?: string
  condition?: string
  action?: string
  status?: string
  [key: string]: unknown
}

export const ruleService = {
  getRuleList: () => demoApi.get(ruleDataStore.getRules(), 250),
  importRules: () => demoApi.post(ruleDataStore.importRules(), 450),
  createRule: (payload: RulePayload) => demoApi.post(ruleDataStore.createRule(payload), 300),
  updateRule: (id: string, payload: RulePayload) => demoApi.post(ruleDataStore.updateRule(id, payload), 300),
  toggleRule: (id: string) => demoApi.post(ruleDataStore.toggleRule(id), 250),
  checkConflicts: () => demoApi.post(ruleDataStore.checkConflict(), 300),
  getRuleVersions: (id: string) => demoApi.get(ruleDataStore.getVersions(id), 250),
}
