/**
 * PageLoader — 统一加载态（AI pulse 图标）
 *
 * 三段竖向 pulse bar 替代默认四点 Spin，文案不折行。
 * 场景文案：
 *  - 默认（页面懒加载）：思考中...
 *  - 数据加载：读取数据中...
 *  - 会话加载：读取会话中...
 */
import React from 'react'
import styles from './PageLoader.module.css'

interface PageLoaderProps {
  description?: string
  variant?: 'page' | 'inline'
}

/** 三段竖向 pulse bar — 纯 CSS 动画，不新增依赖 */
const PulseBars: React.FC = () => (
  <div className={styles.pulse}>
    <div className={styles.pulseBar} />
    <div className={styles.pulseBar} />
    <div className={styles.pulseBar} />
  </div>
)

export const PageLoader: React.FC<PageLoaderProps> = ({
  description = '思考中...',
  variant = 'page',
}) => {
  return (
    <div className={variant === 'inline' ? styles.loaderInline : styles.loader}>
      <PulseBars />
      <span className={styles.text}>{description}</span>
    </div>
  )
}

export default PageLoader
