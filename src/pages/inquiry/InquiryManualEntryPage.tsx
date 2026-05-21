import React, { useState, useRef } from 'react'
import { Card, Input, Button, Upload, Space, message, Typography, Tag } from 'antd'
import { InboxOutlined, SendOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { inquiryService } from '../../services'
import styles from './InquiryManualEntryPage.module.css'

const { Title, Text } = Typography

export const InquiryManualEntryPage: React.FC = () => {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async () => {
    if (!text.trim()) {
      message.warning('请输入询价内容')
      return
    }

    try {
      const result = await inquiryService.parseInquiry(text, { isManual: true, source: '手动录入' })
      if (result.success) {
        navigate('/inquiry/result', {
          state: {
            parseResult: result.data,
            leadId: result.data.leadId,
            engineType: result.data.engine || 'rule_engine',
            totalDuration: result.data.totalDuration || 800,
            isManual: true,
          },
        })
      } else {
        message.error(result.message || '解析失败')
      }
    } catch {
      message.error('解析失败')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/inquiry/list')} style={{ padding: 0 }}>
          返回线索池
        </Button>
        <Title level={3} style={{ margin: '8px 0 4px' }}>手动录入询价</Title>
        <Text type="secondary">粘贴或输入询价文本，AI 将自动解析并归类</Text>
      </div>

      <Card>
        <Input.TextArea
          ref={textareaRef}
          rows={10}
          placeholder="请粘贴或输入询价内容...&#10;&#10;例如：需要采购西门子PLC控制器S7-1200系列，CPU1214C DC/DC/DC 10台，要求30天内交货到上海，请报价。"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={styles.textarea}
          autoFocus
        />

        <div className={styles.uploadArea}>
          <Upload.Dragger maxCount={5} showUploadList={false}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域</p>
            <p className="ant-upload-hint">支持 PDF、Word、Excel、图片等格式</p>
          </Upload.Dragger>
        </div>

        <div className={styles.actions}>
          <Button type="primary" icon={<SendOutlined />} size="large" onClick={handleSubmit} disabled={!text.trim()}>
            立即解析
          </Button>
        </div>
      </Card>

      <Card title="填写提示" size="small" className={styles.tipsCard}>
        <ul className={styles.tipsList}>
          <li>询价文本越完整，AI 解析准确率越高</li>
          <li>建议包含：品类、规格型号、数量、交期、地区、付款方式</li>
          <li>支持中英文混合输入</li>
          <li>单次最大处理 5000 字</li>
        </ul>
      </Card>
    </div>
  )
}
