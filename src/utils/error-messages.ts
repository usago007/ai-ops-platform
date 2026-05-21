const errorMessages: Record<string, string> = {
  'NETWORK_ERROR': '网络连接失败，请检查网络设置后重试',
  'AUTH_EXPIRED': '登录已过期，请重新登录',
  'AUTH_FORBIDDEN': '您没有权限执行此操作',
  'NOT_FOUND': '请求的资源不存在',
  'SERVER_ERROR': '服务器内部错误，请稍后重试',
  'TIMEOUT': '请求超时，请稍后重试',
  'RATE_LIMIT': '操作过于频繁，请稍后再试',
  'INVALID_INPUT': '输入数据格式不正确',
  'VALIDATION_ERROR': '数据验证失败，请检查输入内容',
  'FILE_TOO_LARGE': '文件大小超出限制',
  'FILE_TYPE_ERROR': '不支持的文件类型',
  'PRODUCT_NOT_FOUND': '商品不存在',
  'RULE_CONFLICT': '检测到规则冲突，请先解决冲突',
  'CONVERSION_DATA_ERROR': '转化数据异常，请联系管理员',
}

const defaultErrorMessage = '操作失败，请稍后重试'

function extractErrorCode(error: unknown): string | null {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>
    if ('code' in obj) return String(obj.code)
    if ('errorCode' in obj) return String(obj.errorCode)
    if ('error_code' in obj) return String(obj.error_code)
    if ('message' in obj) return String(obj.message)
  }
  return null
}

export function getFriendlyErrorMessage(error: unknown): string {
  const code = extractErrorCode(error)
  if (code && errorMessages[code]) {
    return errorMessages[code]
  }
  return defaultErrorMessage
}
