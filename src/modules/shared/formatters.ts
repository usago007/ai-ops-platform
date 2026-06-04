/**
 * formatters — 全局统一格式化函数
 */

/**
 * 格式化日期时间为统一中文格式：YYYY年 M月D日 HH:mm:ss
 * 示例：2025年 1月1日 18:00:00
 * 无效输入返回 "—"
 */
export function formatDateTime(value?: string | number | Date | null): string {
  if (value == null || value === '') return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '—'
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${year}年 ${month}月${day}日 ${hh}:${mm}:${ss}`
}
