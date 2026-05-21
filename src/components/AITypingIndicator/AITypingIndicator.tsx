import React from 'react'
import styles from './AITypingIndicator.module.css'

interface AITypingIndicatorProps {
  visible?: boolean
  text?: string
  speed?: number
}

export const AITypingIndicator: React.FC<AITypingIndicatorProps> = ({ visible = false, text = 'AI 正在思考...', speed = 80 }) => {
  const [displayText, setDisplayText] = React.useState('')
  const [done, setDone] = React.useState(false)

  React.useEffect(() => {
    if (!visible) {
      setDisplayText('')
      setDone(false)
      return
    }

    setDone(false)
    setDisplayText('')
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setTimeout(() => setDone(true), 1000)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [visible, text, speed])

  if (!visible && !done) return null

  return (
    <div className={styles.container}>
      <span className={styles.icon}>🤖</span>
      <span className={styles.text}>{displayText}</span>
      {!done && visible && <span className={styles.cursor}>|</span>}
    </div>
  )
}
