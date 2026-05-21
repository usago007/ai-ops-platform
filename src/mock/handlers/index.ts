import { inquiryHandlers } from './inquiry'
import { productHandlers } from './product'
import { rulesHandlers } from './rules'
import { csHandlers } from './cs'
import { marketingHandlers } from './marketing'
import { systemHandlers } from './system'
import { overviewHandlers } from './overview'

export const handlers = [
  ...inquiryHandlers,
  ...productHandlers,
  ...rulesHandlers,
  ...csHandlers,
  ...marketingHandlers,
  ...systemHandlers,
  ...overviewHandlers,
]

export {
  logAICall,
  getCallLogs,
  getCallLogsSummary,
  clearCallLogs,
} from '../ai-log'

export type { AICallLogEntry } from '../ai-log'
