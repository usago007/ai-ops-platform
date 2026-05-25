import React, { useEffect, useState } from 'react'
import { Card, Table, Tabs, Tag, Checkbox, Row, Col, Spin, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Empty } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { systemService } from '../../services'
import styles from './UserManagementPage.module.css'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastLogin: string
}

interface Permission {
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

interface RolePermission {
  id: string
  name: string
  permissions: Record<string, Permission>
}

const roleColors: Record<string, string> = {
  admin: 'red',
  operator: 'blue',
  viewer: 'default',
}

const roleLabels: Record<string, string> = {
  admin: '管理员',
  operator: '操作员',
  viewer: '只读用户',
}

export const UserManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<RolePermission[]>([])
  const [userModalVisible, setUserModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userForm] = Form.useForm()
  const [editForm] = Form.useForm()

  useEffect(() => {
    Promise.all([
      systemService.getUsers(),
      systemService.getRoles(),
    ])
      .then(([usersRes, rolesRes]) => {
        setUsers(usersRes.data.items || [])
        setRoles(rolesRes.data || [])
      })
      .catch((error) => {
        console.error(error)
        setUsers([])
        setRoles([])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleAddUser = () => {
    userForm.validateFields().then(values => {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: values.name,
        email: values.email,
        role: values.role,
        status: 'active',
        lastLogin: '-',
      }
      setUsers(prev => [...prev, newUser])
      message.success(`用户 ${values.name} 已添加`)
      setUserModalVisible(false)
      userForm.resetFields()
    })
  }

  const handleEditUser = (record: User) => {
    setCurrentUser(record)
    editForm.setFieldsValue(record)
    setEditModalVisible(true)
  }

  const handleSaveEdit = () => {
    editForm.validateFields().then(values => {
      setUsers(prev =>
        prev.map(u =>
          u.id === currentUser?.id ? { ...u, ...values } : u
        )
      )
      message.success('用户信息已更新')
      setEditModalVisible(false)
    })
  }

  const handleToggleUserStatus = (record: User) => {
    const newStatus = record.status === 'active' ? 'inactive' : 'active'
    setUsers(prev =>
      prev.map(u =>
        u.id === record.id ? { ...u, status: newStatus } : u
      )
    )
    message.success(`用户 ${record.name} 已${newStatus === 'active' ? '启用' : '停用'}`)
  }

  const handleDeleteUser = (record: User) => {
    setUsers(prev => prev.filter(u => u.id !== record.id))
    message.success(`用户 ${record.name} 已删除`)
  }

  const userColumns: ColumnsType<User> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '活跃' : '停用'}
        </Tag>
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: User) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditUser(record)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={record.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={() => handleToggleUserStatus(record)}
          >
            {record.status === 'active' ? '停用' : '启用'}
          </Button>
          <Popconfirm
            title="确定删除此用户？"
            onConfirm={() => handleDeleteUser(record)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  if (loading) {
    return <Spin size="large" className={styles.loading} />
  }

  return (
    <div className={styles.container}>
      <Card>
        <Tabs
          defaultActiveKey="users"
          items={[
            {
              key: 'users',
              label: '用户列表',
              children: (
                <>
                  <div className={styles.addUserActions}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setUserModalVisible(true)}>
                      添加用户
                    </Button>
                  </div>
                  {users.length === 0 ? (
                    <Empty description="暂无用户数据" />
                  ) : (
                    <Table
                      dataSource={users}
                      columns={userColumns}
                      rowKey="id"
                      pagination={false}
                    />
                  )}
                </>
              ),
            },
            {
              key: 'roles',
              label: '角色权限矩阵',
              children: (
                roles.length === 0 ? (
                  <Empty description="暂无角色数据" />
                ) : (
                  <div className={styles.roleMatrix}>
                    {roles.map(role => (
                      <Card key={role.id} title={role.name} className={styles.roleCard}>
                        {Object.entries(role.permissions).map(([module, perms]) => (
                          <div key={module} className={styles.modulePerms}>
                            <h4>{module}</h4>
                            <Row gutter={8}>
                              <Col>
                                <Checkbox checked={perms.create}>创建</Checkbox>
                              </Col>
                              <Col>
                                <Checkbox checked={perms.read}>读取</Checkbox>
                              </Col>
                              <Col>
                                <Checkbox checked={perms.update}>更新</Checkbox>
                              </Col>
                              <Col>
                                <Checkbox checked={perms.delete}>删除</Checkbox>
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </Card>
                    ))}
                  </div>
                )
              ),
            },
          ]}
        />
      </Card>

      {/* 添加用户 Modal */}
      <Modal
        title="添加用户"
        open={userModalVisible}
        onOk={handleAddUser}
        onCancel={() => setUserModalVisible(false)}
      >
        <Form form={userForm} layout="vertical">
          <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入用户姓名" />
          </Form.Item>
          <Form.Item label="邮箱" name="email" rules={[{ required: true, message: '请输入邮箱' }]}>
            <Input placeholder="user@company.com" />
          </Form.Item>
          <Form.Item label="角色" name="role" rules={[{ required: true, message: '请选择角色' }]}>
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="operator">操作员</Select.Option>
              <Select.Option value="viewer">只读用户</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑用户 Modal */}
      <Modal
        title="编辑用户"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => setEditModalVisible(false)}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="邮箱" name="email" rules={[{ required: true, message: '请输入邮箱' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="角色" name="role" rules={[{ required: true, message: '请选择角色' }]}>
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="operator">操作员</Select.Option>
              <Select.Option value="viewer">只读用户</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
