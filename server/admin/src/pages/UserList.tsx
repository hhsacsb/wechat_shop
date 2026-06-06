import React, { useEffect, useState } from 'react'
import { Table, Tag, message, Button, Popconfirm, Input } from 'antd'

interface UserItem {
  id: number
  nickname: string
  avatar: string
  mobile: string
  openid: string
  status: number
  created_at: string
}

const UserListPage: React.FC = () => {
  const [dataSource, setDataSource] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      let url = `/api/user/admin/list?page=1&page_size=100`
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
      const res = await fetch(url)
      const json = await res.json()
      if (json.code === 0) setDataSource(json.data?.list || [])
    } catch { message.error('加载失败') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  /** 切换用户状态 */
  const handleToggleStatus = async (record: UserItem) => {
    const newStatus = record.status === 1 ? 0 : 1
    try {
      const res = await fetch('/api/user/admin/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: record.id, status: newStatus }),
      })
      const json = await res.json()
      if (json.code === 0) { message.success(json.message); fetchUsers() }
      else message.error(json.message || '操作失败')
    } catch { message.error('网络请求失败') }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '昵称', dataIndex: 'nickname' },
    { title: '手机号', dataIndex: 'mobile', width: 130 },
    { title: 'OpenID', dataIndex: 'openid', width: 180, ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: number) => <Tag color={v === 1 ? 'green' : 'red'}>{v === 1 ? '正常' : '禁用'}</Tag>,
    },
    { title: '注册时间', dataIndex: 'created_at', width: 180 },
    {
      title: '操作',
      width: 140,
      render: (_: any, record: UserItem) => (
        <Popconfirm
          title={record.status === 1 ? '确认禁用？' : '确认启用？'}
          onConfirm={() => handleToggleStatus(record)}
          okText="确认"
          cancelText="取消"
        >
          <Button type="link" size="small" danger={record.status === 1}>
            {record.status === 1 ? '禁用' : '启用'}
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>用户管理</h2>
        <Input.Search
          placeholder="搜索昵称/手机号"
          allowClear
          style={{ width: 220 }}
          onSearch={(val) => { setKeyword(val); setTimeout(fetchUsers, 100) }}
        />
      </div>
      <Table columns={columns} dataSource={dataSource} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
    </>
  )
}

export default UserListPage
