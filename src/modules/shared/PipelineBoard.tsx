/**
 * PipelineBoard — 漏斗/管道可视化面板
 */
import React from 'react'
import styles from './SharedUI.module.css'

interface PipelineStage {
  label: string
  value: string | number
  fraction?: number
}

interface PipelineBoardProps {
  title?: string
  stages: PipelineStage[]
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({ title, stages }) => {
  const max = Math.max(...stages.map(s => Number(s.value)), 1)

  return (
    <div className={styles.pipelineBoard}>
      {title && <div className={styles.pipelineBoardTitle}>{title}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {stages.map((stage, i) => {
          const width = Math.max(Number(stage.value) / max * 100, 2)
          return (
            <div key={i} className={styles.pipelineStageRow}>
              <div className={styles.pipelineStageLabel}>{stage.label}</div>
              <div className={styles.pipelineBarTrack}>
                <div className={styles.pipelineBarFill} style={{ width: `${width}%`, background: `linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))`, opacity: 0.85 - i * 0.12 }}>
                  <span className={styles.pipelineBarValue}>{stage.value}</span>
                </div>
              </div>
              {stage.fraction != null && (
                <div className={styles.pipelineFraction}>{Math.round(stage.fraction * 100)}%</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PipelineBoard
