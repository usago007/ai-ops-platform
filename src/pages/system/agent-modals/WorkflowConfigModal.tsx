import React from 'react'
import { Modal, Form, Input, InputNumber, Select, Divider, Row, Col, Button, Switch, Alert, Card, Space, Tag, Empty, message } from 'antd'
import { WarningOutlined } from '@/iconMap'
import type { WorkflowEngine, BusinessMapping, PromptVersion } from '../AgentOrchestrationPage.types'
import styles from '../AgentOrchestrationPage.module.css'

const { TextArea } = Input

interface WorkflowConfigModalProps {
  open: boolean
  selectedEngineForConfig: WorkflowEngine | null
  businessMappings: BusinessMapping[]
  promptVersions: PromptVersion[]
  onSave: (values: Record<string, unknown>) => void
  onCancel: () => void
}

function getWorkflowImpactInfo(engine: WorkflowEngine, businessMappings: BusinessMapping[]) {
  const modules = businessMappings.filter(m => m.workflowId === engine.id)
  return {
    moduleCount: modules.length,
    moduleNames: modules.map(m => m.moduleName),
    dailyCalls: engine?.activeFlows || 0,
    successRate: engine?.status === 'running' ? '96.5%' : 'N/A',
  }
}

export const WorkflowConfigModal: React.FC<WorkflowConfigModalProps> = ({
  open,
  selectedEngineForConfig,
  businessMappings,
  promptVersions,
  onSave,
  onCancel,
}) => {
  return (
    <Modal
      title={`配置工作流：${selectedEngineForConfig?.name || ''}`}
      open={open}
      onOk={() => {
        const formValues = (document.getElementById('wf-config-form') as HTMLFormElement)
        if (formValues) formValues.requestSubmit()
      }}
      onCancel={onCancel}
      width={800}
      okText="保存配置"
      cancelText="取消"
    >
      <Form
        layout="vertical"
        initialValues={selectedEngineForConfig ? {
          name: selectedEngineForConfig.name,
          type: selectedEngineForConfig.type,
          endpoint: selectedEngineForConfig.endpoint,
          version: selectedEngineForConfig.version,
          description: selectedEngineForConfig.description,
          apiKey: selectedEngineForConfig.apiKey,
          connectTimeout: selectedEngineForConfig.connectTimeout,
          requestTimeout: selectedEngineForConfig.requestTimeout,
          maxConcurrency: selectedEngineForConfig.maxConcurrency,
          retryCount: selectedEngineForConfig.retryCount,
          retryInterval: selectedEngineForConfig.retryInterval,
          logLevel: selectedEngineForConfig.logLevel,
          timeoutStrategy: selectedEngineForConfig.timeoutStrategy,
          maxExecutionTime: selectedEngineForConfig.maxExecutionTime,
          errorStrategy: selectedEngineForConfig.errorStrategy,
          promptVersion: selectedEngineForConfig.promptVersion,
          ragIndex: selectedEngineForConfig.ragIndex,
          ruleSet: selectedEngineForConfig.ruleSet,
          dataSource: selectedEngineForConfig.dataSource,
          ipWhitelist: selectedEngineForConfig.ipWhitelist?.join('\n'),
          authEnabled: selectedEngineForConfig.authEnabled,
          encryptionEnabled: selectedEngineForConfig.encryptionEnabled,
          auditEnabled: selectedEngineForConfig.auditEnabled,
        } : {}}
        onFinish={onSave}
        id="wf-config-form"
      >
        {selectedEngineForConfig && (
          <Alert
            message="参数变更影响范围"
            description={
              <div className={styles.impactAlertContent}>
                <div>影响业务模块：{getWorkflowImpactInfo(selectedEngineForConfig, businessMappings).moduleNames.join('、') || '无'}</div>
                <div>每日调用量：~{getWorkflowImpactInfo(selectedEngineForConfig, businessMappings).dailyCalls * 50} 次</div>
                <div>当前成功率：{getWorkflowImpactInfo(selectedEngineForConfig, businessMappings).successRate}</div>
              </div>
            }
            type="warning"
            icon={<WarningOutlined />}
            showIcon
            className={styles.alertMargin}
          />
        )}

        <Card title="关联业务模块" size="small" className={styles.modalSubCard}>
          <Space direction="vertical" size="small" className={styles.fullWidth}>
            {selectedEngineForConfig && businessMappings
              .filter(m => m.workflowId === selectedEngineForConfig.id)
              .map(mapping => (
                <div key={mapping.moduleId} className={styles.modalRelatedModule}>
                  <Space>
                    <span>{mapping.icon}</span>
                    <strong>{mapping.moduleId}</strong>
                    <span>{mapping.moduleName}</span>
                    <Tag color="blue" className={styles.modalRouteTag}>{mapping.routePath}</Tag>
                  </Space>
                  <div className={styles.modalRelatedModuleDetail}>
                    使用 Prompt: {promptVersions.find(p => p.id === mapping.promptId)?.name || '-'} | 
                    RAG 索引: {mapping.ragIndexId || '-'}
                  </div>
                </div>
              ))
            }
            {selectedEngineForConfig && businessMappings.filter(m => m.workflowId === selectedEngineForConfig.id).length === 0 && (
              <Empty description="暂无关联业务模块" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Space>
        </Card>

        <Divider orientation="left">基础配置</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="工作流名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="引擎类型" name="type">
              <Select disabled>
                <Select.Option value="dify">Dify</Select.Option>
                <Select.Option value="coze">Coze</Select.Option>
                <Select.Option value="n8n">n8n</Select.Option>
                <Select.Option value="custom">Custom</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="版本" name="version">
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

        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
          {({ getFieldValue }) =>
            getFieldValue('type') === 'dify' && (
              <>
                <Divider orientation="left">Dify 专用配置</Divider>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Dify 工作流 ID" name="difyWorkflowId" rules={[{ required: true, message: '请输入 Dify 工作流 ID' }]}>
                      <Input placeholder="wf-inquiry-classification" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="响应模式" name="responseMode" initialValue="blocking">
                      <Select>
                        <Select.Option value="blocking">同步（阻塞等待结果）</Select.Option>
                        <Select.Option value="streaming">流式（实时返回中间结果）</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="用户上下文前缀" name="userContextPrefix" initialValue="prod_">
                      <Input placeholder="prod_" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="文件上传支持" name="fileUploadEnabled" valuePropName="checked" initialValue={false}>
                      <Switch checkedChildren="开" unCheckedChildren="关" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )
          }
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
          {({ getFieldValue }) =>
            getFieldValue('type') === 'coze' && (
              <>
                <Divider orientation="left">Coze 专用配置</Divider>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Coze 工作流 ID" name="cozeWorkflowId" rules={[{ required: true, message: '请输入 Coze 工作流 ID' }]}>
                      <Input placeholder="wf_123456789" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Coze 应用 ID" name="cozeAppId" rules={[{ required: true, message: '请输入 Coze 应用 ID' }]}>
                      <Input placeholder="app_987654321" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="执行模式" name="cozeExecuteMode" initialValue="RELEASE">
                      <Select>
                        <Select.Option value="RELEASE">正式环境</Select.Option>
                        <Select.Option value="DEBUG">调试模式</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="渠道 ID" name="cozeConnectorId" initialValue="1024">
                      <Input placeholder="1024" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="参数格式" name="parametersFormat" initialValue="json_string">
                      <Select>
                        <Select.Option value="json_string">JSON 字符串</Select.Option>
                        <Select.Option value="json_object">JSON 对象</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="智能体 ID (ChatFlow 需要)" name="cozeBotId">
                  <Input placeholder="bot_001 (可选)" />
                </Form.Item>
              </>
            )
          }
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
          {({ getFieldValue }) =>
            getFieldValue('type') === 'n8n' && (
              <>
                <Divider orientation="left">n8n 专用配置</Divider>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="n8n 工作流 ID" name="n8nWorkflowId" rules={[{ required: true, message: '请输入 n8n 工作流 ID' }]}>
                      <Input placeholder="abc123def456" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Webhook 路径" name="n8nWebhookPath" rules={[{ required: true, message: '请输入 Webhook 路径' }]}>
                      <Input placeholder="/webhook/workflow-xxx" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="认证方式" name="n8nAuthMethod" initialValue="none">
                  <Select>
                    <Select.Option value="none">无认证</Select.Option>
                    <Select.Option value="basic">Basic 认证</Select.Option>
                    <Select.Option value="header">Header 认证</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.n8nAuthMethod !== curr.n8nAuthMethod}>
                  {({ getFieldValue }) =>
                    getFieldValue('n8nAuthMethod') === 'basic' && (
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="用户名" name="n8nAuthUsername">
                            <Input placeholder="api-user" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="密码" name="n8nAuthPassword">
                            <Input.Password placeholder="****" />
                          </Form.Item>
                        </Col>
                      </Row>
                    )
                  }
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.n8nAuthMethod !== curr.n8nAuthMethod}>
                  {({ getFieldValue }) =>
                    getFieldValue('n8nAuthMethod') === 'header' && (
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="Header 名称" name="n8nAuthHeaderName">
                            <Input placeholder="X-API-KEY" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Header 值" name="n8nAuthHeaderValue">
                            <Input.Password placeholder="****" />
                          </Form.Item>
                        </Col>
                      </Row>
                    )
                  }
                </Form.Item>
              </>
            )
          }
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
          {({ getFieldValue }) =>
            getFieldValue('type') === 'custom' && (
              <>
                <Divider orientation="left">Custom 专用配置</Divider>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="HTTP 方法" name="customRequestMethod" initialValue="POST">
                      <Select>
                        <Select.Option value="GET">GET</Select.Option>
                        <Select.Option value="POST">POST</Select.Option>
                        <Select.Option value="PUT">PUT</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="请求格式" name="customRequestFormat" initialValue="json">
                      <Select>
                        <Select.Option value="json">JSON</Select.Option>
                        <Select.Option value="xml">XML</Select.Option>
                        <Select.Option value="form">Form</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="响应格式" name="customResponseFormat" initialValue="json">
                      <Select>
                        <Select.Option value="json">JSON</Select.Option>
                        <Select.Option value="xml">XML</Select.Option>
                        <Select.Option value="text">Text</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="自定义请求头 (JSON 格式)" name="customHeaders">
                  <TextArea rows={2} placeholder='{"X-Tenant-ID": "default"}' />
                </Form.Item>
                <Form.Item label="请求体模板" name="customRequestBodyTemplate">
                  <TextArea rows={3} placeholder='{"rules": ["{{ruleSet}}"], "data": {{inputData}}}' />
                </Form.Item>
              </>
            )
          }
        </Form.Item>

        <Divider orientation="left">连接配置</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="API Key" name="apiKey">
              <Input.Password placeholder="sk-xxxx-xxxx" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="连接超时(秒)" name="connectTimeout">
              <InputNumber min={1} max={60} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="请求超时(秒)" name="requestTimeout">
              <InputNumber min={1} max={300} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="最大并发数" name="maxConcurrency">
              <InputNumber min={1} max={100} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="重试次数" name="retryCount">
              <InputNumber min={0} max={10} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="重试间隔(秒)" name="retryInterval">
              <InputNumber min={1} max={30} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">运行配置</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="日志级别" name="logLevel">
              <Select>
                <Select.Option value="DEBUG">DEBUG</Select.Option>
                <Select.Option value="INFO">INFO</Select.Option>
                <Select.Option value="WARN">WARN</Select.Option>
                <Select.Option value="ERROR">ERROR</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="超时策略" name="timeoutStrategy">
              <Select>
                <Select.Option value="terminate">终止</Select.Option>
                <Select.Option value="continue">继续</Select.Option>
                <Select.Option value="warn">告警</Select.Option>
                <Select.Option value="retry">重试</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="最大执行时间(秒)" name="maxExecutionTime">
              <InputNumber min={1} max={600} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="错误处理策略" name="errorStrategy">
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
            <Form.Item label="请求鉴权" name="authEnabled" valuePropName="checked">
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
      </Form>
    </Modal>
  )
}
