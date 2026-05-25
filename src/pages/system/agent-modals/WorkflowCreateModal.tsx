import React from 'react'
import { Modal, Form, Input, InputNumber, Select, Divider, Row, Col, Button, Switch } from 'antd'
import type { FormInstance } from 'antd/es/form'
import styles from '../AgentOrchestrationPage.module.css'

const { TextArea } = Input

interface WorkflowCreateModalProps {
  open: boolean
  form: FormInstance
  onFinish: (values: Record<string, unknown>) => void
  onCancel: () => void
}

export const WorkflowCreateModal: React.FC<WorkflowCreateModalProps> = ({ open, form, onFinish, onCancel }) => {
  return (
    <Modal
      title="新增工作流"
      open={open}
      onCancel={onCancel}
      width={800}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Divider orientation="left">基础配置</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="工作流名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
              <Input placeholder="如：询报价归类流程" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="引擎类型" name="type" rules={[{ required: true, message: '请选择类型' }]}>
              <Select>
                <Select.Option value="dify">Dify</Select.Option>
                <Select.Option value="coze">Coze</Select.Option>
                <Select.Option value="n8n">n8n</Select.Option>
                <Select.Option value="custom">Custom</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="版本" name="version" initialValue="v1.0.0">
              <Input placeholder="v1.0.0" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="描述说明" name="description">
          <TextArea rows={2} placeholder="工作流的功能描述" />
        </Form.Item>
        <Form.Item label="端点地址" name="endpoint" rules={[{ required: true, message: '请输入端点地址' }]}>
          <Input placeholder="https://dify.example.com/v1" />
        </Form.Item>

        <Divider orientation="left">连接配置</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="API Key" name="apiKey">
              <Input.Password placeholder="sk-xxxx-xxxx" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="连接超时(秒)" name="connectTimeout" initialValue={10}>
              <InputNumber min={1} max={60} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="请求超时(秒)" name="requestTimeout" initialValue={60}>
              <InputNumber min={1} max={300} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="最大并发数" name="maxConcurrency" initialValue={10}>
              <InputNumber min={1} max={100} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="重试次数" name="retryCount" initialValue={3}>
              <InputNumber min={0} max={10} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="重试间隔(秒)" name="retryInterval" initialValue={2}>
              <InputNumber min={1} max={30} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">运行配置</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="日志级别" name="logLevel" initialValue="INFO">
              <Select>
                <Select.Option value="DEBUG">DEBUG</Select.Option>
                <Select.Option value="INFO">INFO</Select.Option>
                <Select.Option value="WARN">WARN</Select.Option>
                <Select.Option value="ERROR">ERROR</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="超时策略" name="timeoutStrategy" initialValue="retry">
              <Select>
                <Select.Option value="terminate">终止</Select.Option>
                <Select.Option value="continue">继续</Select.Option>
                <Select.Option value="warn">告警</Select.Option>
                <Select.Option value="retry">重试</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="最大执行时间(秒)" name="maxExecutionTime" initialValue={120}>
              <InputNumber min={1} max={600} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="错误处理策略" name="errorStrategy" initialValue="retry">
              <Select>
                <Select.Option value="skip">跳过</Select.Option>
                <Select.Option value="terminate">终止</Select.Option>
                <Select.Option value="retry">重试</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">关联配置</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="关联 Prompt 版本" name="promptVersion">
              <Input placeholder="v1.0.0" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="关联 RAG 索引" name="ragIndex">
              <Input placeholder="idx-xxx" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="关联规则集" name="ruleSet">
              <Input placeholder="RULE-100" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="数据源" name="dataSource">
          <Input placeholder="MySQL-Primary / API / 文件路径" />
        </Form.Item>

        <Divider orientation="left">安全配置</Divider>
        <Form.Item label="IP 白名单" name="ipWhitelist">
          <TextArea rows={2} placeholder="每行一个 IP 或 IP 段" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="请求鉴权" name="authEnabled" valuePropName="checked" initialValue={true}>
              <Switch checkedChildren="开" unCheckedChildren="关" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="数据加密" name="encryptionEnabled" valuePropName="checked">
              <Switch checkedChildren="开" unCheckedChildren="关" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="审计日志" name="auditEnabled" valuePropName="checked">
              <Switch checkedChildren="开" unCheckedChildren="关" />
            </Form.Item>
          </Col>
        </Row>

        <div className={styles.formFooter}>
          <Button onClick={onCancel} className={styles.cancelButton}>取消</Button>
          <Button type="primary" htmlType="submit">创建工作流</Button>
        </div>
      </Form>
    </Modal>
  )
}
