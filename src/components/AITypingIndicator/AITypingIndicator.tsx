import React from 'react'
import { RobotOutlined } from '@/iconMap'
import styles from './AITypingIndicator.module.css'

interface AITypingIndicatorProps {
  visible?: boolean
  text?: string
  speed?: number
}

export const AITypingIndicator: React.FC<AITypingIndicatorProps> = ({ visible = false, text = 'AI 正在思考...', speed = 80 }) => {
  const [displayText, setDisplayText] = React.useState('')
  const [done, setDone] = React.useState(false)
  const intervalRef = React.useRef<ReturnType<typeof setInterval>>()

  /* eslint-disable react-hooks/set-state-in-effect --
   * Animation component requires synchronous state reset in effect to restart
   * the typing animation when visibility or text changes. This is a known safe
   * pattern for imperative animation sequences. */
  React.useEffect(() => {
    setDisplayText('')
    setDone(false)

    if (!visible) return

    let i = 0
    intervalRef.current = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
        setDone(true)
      }
    }, speed)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
      }
    }
  }, [visible, text, speed])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!visible && !done) return null

  return (
    <div className={styles.container}>
      <span className={styles.icon}><RobotOutlined /></span>
      <span className={styles.text}>{displayText}</span>
      {!done && visible && <span className={styles.cursor}>|</span>}
    </div>
  )
}
