import React, { useState, useEffect } from 'react'
import { Card, List, Input, Button, Space, Tag, Avatar, Badge, Spin, Typography, Empty, Segmented } from 'antd'
import { SendOutlined, RobotOutlined, UserOutlined, CustomerServiceOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { csService } from '../../services'
import styles from './CSWorkspacePage.module.css'

const { Text } = Typography
type SceneMode = 'general' | 'marketing'

export const CSWorkspacePage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const scene = searchParams.get('scene') === 'marketing' ? 'marketing' : 'general'
  const [sessions, setSessions] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  useEffect(() => { loadSessions() }, [scene])

  const isMarketingScene = scene === 'marketing'
  const suggestionTitle = isMarketingScene ? '营销推荐' : '推荐话术'

  const loadSessions = async () => {
    setLoading(true)
    setMessages([])
    setSuggestions([])
    setActiveSession(null)
    try {
      const response = isMarketingScene
        ? await csService.getMarketingSessions()
        : await csService.getSessions()
      const result = response
      if (result.success) {
        setSessions(result.data.sessions)
        if (result.data.sessions.length > 0) {
          selectSession(result.data.sessions[0].id)
        }
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const selectSession = async (id: string) => {
    setActiveSession(id)
    try {
      const result = await csService.getMessages(id)
      if (result.success) setMessages(result.data.messages)
      loadSuggestions(id)
    } catch (e) { console.error(e) }
  }

  const loadSuggestions = async (sessionId: string) => {
    setSuggestionsLoading(true)
    try {
      const result = isMarketingScene
        ? await csService.getMarketingRecommendations()
        : await csService.getReplySuggestions(sessionId, 'last_message')
      if (result.success) {
        const data: any = result.data
        const list = data.suggestions || data.recommendations?.map((item: any) => `${item.product}｜${item.reason}`) || []
        setSuggestions(list)
      }
    } catch (e) { console.error(e) }
    finally { setSuggestionsLoading(false) }
  }

  const handleSend = () => {
    if (!inputText.trim() || !activeSession) return
    setMessages([...messages, { id: `new-${Date.now()}`, role: 'agent', content: inputText, timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }])
    setInputText('')
  }

  const useSuggestion = (text: string) => {
    setInputText(text)
  }

  const getIntentColor = (intent: string) => {
    const map: Record<string, string> = { '询价': 'blue', '催单': 'orange', '议价': 'red', '技术咨询': 'green', '投诉': 'magenta' }
    return map[intent] || 'default'
  }

  const handleSceneChange = (value: string | number) => {
    const nextScene = value as SceneMode
    navigate(nextScene === 'marketing' ? '/cs/workspace?scene=marketing' : '/cs/workspace')
  }

  return (
    <div className={styles.workspace}>
      <div className={styles.sessionList}>
        <h3 className={styles.sidebarTitle}>会话列表</h3>
        {loading ? <Spin /> : (
          sessions.length === 0 ? (
            <Empty description="暂无活跃会话" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              dataSource={sessions}
              renderItem={(s) => (
                <List.Item className={`${styles.sessionItem} ${activeSession === s.id ? styles.active : ''}`}
                  onClick={() => selectSession(s.id)}>
                  <Badge count={s.unread} offset={[5, 5]}>
                    <Avatar icon={<UserOutlined />} />
                  </Badge>
                  <div className={styles.sessionInfo}>
                    <div className={styles.sessionName}>{s.customer}</div>
                    <div className={styles.sessionLast}>{s.lastMessage}</div>
                  </div>
                </List.Item>
              )}
            />
          )
        )}
      </div>

      <div className={styles.chatArea}>
        <div className={styles.chatHeader}>
          <div>
            <Space align="center" wrap>
              <Text strong>客服工作台</Text>
              <Tag color={isMarketingScene ? 'magenta' : 'blue'}>
                {isMarketingScene ? '营销转化场景' : '通用客服场景'}
              </Tag>
            </Space>
            {activeSession && (
              <Space wrap className={styles.marginTopSm}>
                <Text strong>{sessions.find(s => s.id === activeSession)?.customer}</Text>
                <Tag>{sessions.find(s => s.id === activeSession)?.company}</Tag>
              </Space>
            )}
          </div>
          <Segmented
            options={[
              { label: '通用客服', value: 'general' },
              { label: '营销转化', value: 'marketing' },
            ]}
            value={scene}
            onChange={handleSceneChange}
          />
        </div>
        <div className={styles.messageList}>
          {messages.length === 0 ? <Empty description="暂无会话消息" /> : messages.map((msg) => (
            <div key={msg.id} className={`${styles.message} ${msg.role === 'customer' ? styles.customerMsg : styles.agentMsg}`}>
              <Avatar size="small" icon={msg.role === 'customer' ? <UserOutlined /> : <CustomerServiceOutlined />} />
              <div className={styles.messageContent}>
                <div className={styles.messageText}>{msg.content}</div>
                <div className={styles.messageMeta}>
                  <span>{msg.timestamp}</span>
                  {msg.intent && <Tag color={getIntentColor(msg.intent)}>{msg.intent}</Tag>}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.inputArea}>
          <Input.TextArea rows={2} value={inputText} onChange={(e) => setInputText(e.target.value)}
            onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="输入回复内容..." />
          <Button type="primary" icon={<SendOutlined />} onClick={handleSend} className={styles.sendBtn}>发送</Button>
        </div>
      </div>

      <div className={styles.aiPanel}>
        <h3 className={styles.sidebarTitle}><RobotOutlined /> AI 辅助</h3>
        <div className={styles.section}>
          <Text type="secondary" className={styles.sectionTitle}>{suggestionTitle}</Text>
          {suggestionsLoading ? <Spin size="small" /> : (
            suggestions.length === 0 ? (
              <Empty description="暂无推荐话术" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Space direction="vertical" className={styles.fullWidth}>
                {suggestions.map((s, i) => (
                  <Card key={i} size="small" className={styles.suggestionCard} hoverable onClick={() => useSuggestion(s)}>
                    <div className={styles.suggestionText}>{s}</div>
                    <div className={styles.suggestionHint}>点击使用</div>
                  </Card>
                ))}
              </Space>
            )
          )}
        </div>
        <div className={styles.section}>
          <Text type="secondary" className={styles.sectionTitle}>关联单据</Text>
          <Card size="small">
            <div>ORD-2024-0892 - PLC控制器 ×50</div>
            <div><Tag color="green">已发货</Tag></div>
          </Card>
        </div>
      </div>
    </div>
  )
}
