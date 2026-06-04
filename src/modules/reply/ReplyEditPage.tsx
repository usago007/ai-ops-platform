/**
 * ReplyEditPage — 回复草稿编辑（强流程驱动）
 *
 * 流程：审查 AI 草稿 → 编辑 → 批准 → 发送 → 推进 Lead.status 到 sent
 */
import React, { useState, useEffect } from 'react'
import { Card, Button, Tag, Space, Typography, Input, Empty, Alert, message } from 'antd'
import { useParams, Link } from 'react-router-dom'
import {
  EditOutlined, CheckCircleOutlined,
  SendOutlined, CloseCircleOutlined,
} from '@/iconMap'
import { mockReplyDraftAdapter, mockLeadAdapter } from '../../adapters'
import { advanceLead } from '../../domain'
import { PageShell } from '../shared/SharedUI'
import { DetailHeader } from '../shared/DetailHeader'
import sharedStyles from '../shared/SharedUI.module.css'
import type { ReplyDraft, Lead } from '../../contracts'

const { Text, Paragraph } = Typography
const { TextArea } = Input

export const ReplyEditPage: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>()
  const [replies, setReplies] = useState<ReplyDraft[]>([])
  const [lead, setLead] = useState<Lead | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const loadData = async () => {
    if (!leadId) { setLoading(false); return }
    const [replyList, l] = await Promise.all([
      mockReplyDraftAdapter.getByLeadId(leadId),
      mockLeadAdapter.getById(leadId),
    ])
    setReplies(replyList)
    setLead(l || null)
    setLoading(false)
  }

  useEffect(() => {
    if (!leadId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId])

  const startEdit = (reply: ReplyDraft) => {
    if (reply.status === 'sent') return
    setEditingId(reply.id)
    setEditContent(reply.draftContent)
  }

  const saveEdit = async () => {
    if (!editingId) return
    await mockReplyDraftAdapter.update(editingId, { draftContent: editContent, status: 'edited' })
    setEditingId(null)
    await loadData()
    message.success('草稿已保存')
  }

  const cancelEdit = () => setEditingId(null)

  const approveReply = async (id: string) => {
    await mockReplyDraftAdapter.approve(id)
    await loadData()
    message.success('已批准')
  }

  // ── SEND: advance reply status + Lead.status → sent ──
  const handleSend = async (reply: ReplyDraft) => {
    if (!lead) return
    setSending(true)
    await mockReplyDraftAdapter.send(reply.id)
    const result = advanceLead(lead, 'sent')
    if (result.success) {
      await mockLeadAdapter.transition(lead.id, 'sent')
    }
    await loadData()
    message.success('回复已发送，Lead 已进入 sent 状态')
    setSending(false)
  }

  const allSent = replies.length > 0 && replies.every(r => r.status === 'sent')

  if (loading) return <PageShell loading />
  if (replies.length === 0) return <PageShell><Empty description="暂无回复草稿" /></PageShell>

  return (
    <PageShell>
      <DetailHeader
        backTo={{ label: '返回线索', path: `/leads/${leadId}` }}
        title={<>回复编辑 — {lead?.id}</>}
      />
      {!allSent && (
        <Alert
          type="info"
          showIcon
          className={sharedStyles.sectionBottomMd}
          title="操作流程"
          description="编辑 AI 草稿 → 批准 → 发送。发送后 Lead 将进入 sent 状态。"
        />
      )}

      {allSent && (
        <Alert
          type="success"
          showIcon
          className={sharedStyles.sectionBottomMd}
          title="全部回复已发送"
          description="Lead 已进入 sent 状态。下一步：跟进客户反馈并记录结果。"
          action={
            <Link to={`/leads/${leadId}/outcome`}>
              <Button type="primary" icon={<CheckCircleOutlined />}>进入结果记录 →</Button>
            </Link>
          }
        />
      )}

      {replies.map(reply => (
        <Card
          key={reply.id}
          className={sharedStyles.sectionBottomMd}
          title={
            <Space>
              <Text strong>{reply.replyScenario === 'initial_response' ? '初次回复' : reply.replyScenario}</Text>
              <Tag color={reply.status === 'sent' ? 'green' : reply.status === 'approved' ? 'blue' : 'orange'}>
                {reply.status === 'sent' ? '已发送' : reply.status === 'approved' ? '已批准' : reply.status === 'edited' ? '已编辑' : '草稿'}
              </Tag>
            </Space>
          }
          extra={
            <Space>
              {editingId === reply.id ? (
                <>
                  <Button onClick={cancelEdit} icon={<CloseCircleOutlined />}>取消</Button>
                  <Button type="primary" onClick={saveEdit} icon={<CheckCircleOutlined />}>保存修改</Button>
                </>
              ) : (
                <Button icon={<EditOutlined />} onClick={() => startEdit(reply)} disabled={reply.status === 'sent'}>
                  编辑
                </Button>
              )}
              {reply.status !== 'sent' && reply.status !== 'approved' && editingId !== reply.id && (
                <Button icon={<CheckCircleOutlined />} onClick={() => approveReply(reply.id)}>
                  批准
                </Button>
              )}
              {reply.status === 'approved' && editingId !== reply.id && (
                <Button type="primary" icon={<SendOutlined />} loading={sending} onClick={() => handleSend(reply)}>
                  发送
                </Button>
              )}
            </Space>
          }
        >
          {editingId === reply.id ? (
            <TextArea value={editContent} onChange={e => setEditContent(e.target.value)} rows={12} />
          ) : (
            <Paragraph className={sharedStyles.preWrap}>{reply.draftContent}</Paragraph>
          )}
          {reply.riskWarnings.length > 0 && (
            <Alert type="warning" title="风险提示" description={reply.riskWarnings.join('；')} showIcon className={sharedStyles.sectionTopMd} />
          )}
          {reply.editHistory.length > 0 && (
            <div className={sharedStyles.sectionTopMd}>
              <Text type="secondary">修改痕迹：</Text>
              {reply.editHistory.map((h, i) => (
                <Tag key={i} className={sharedStyles.sectionTopSm}>
                  {h.editedBy} {h.changeDescription}
                </Tag>
              ))}
            </div>
          )}
          {reply.status === 'sent' && (
            <Tag color="green" className={sharedStyles.sectionTopSm}>已发送 — AI建议{reply.finalContent ? '经人工修改' : '被采纳'}</Tag>
          )}
        </Card>
      ))}
    </PageShell>
  )
}

export default ReplyEditPage
