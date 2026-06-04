/**
 * PipelineBoard — 漏斗/管道可视化面板
 */
import React from 'react'

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
    <div style={{ border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 16, background: 'var(--bg-surface)' }}>
      {title && <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>{title}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {stages.map((stage, i) => {
          const width = Math.max(Number(stage.value) / max * 100, 2)
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 90, fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', textAlign: 'right', flexShrink: 0 }}>{stage.label}</div>
              <div style={{ flex: 1, height: 28, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '100%', width: `${width}%`, background: `linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))`, borderRadius: 'var(--radius-sm)', opacity: 0.85 - i * 0.12, transition: 'width var(--transition-slow)', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-on-brand)' }}>{stage.value}</span>
                </div>
              </div>
              {stage.fraction != null && (
                <div style={{ width: 50, fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{Math.round(stage.fraction * 100)}%</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PipelineBoard
