import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, message, Popconfirm, Select, Input } from 'antd'
import { useNavigate } from 'react-router-dom'

interface OrderItem {
  id: number
  order_no: string
  user_id: number
  total_amount: number
  discount_amount: number
  pay_amount: number
  order_status: number
  pay_status: number
  remark: string
  created_at: string
}

const STATUS_MAP: Record<number, { color: string; text: string }> = {
  0: { color: 'orange', text: '待付款' },
  1: { color: 'blue', text: '待发货' },
  2: { color: 'purple', text: '待收货' },
  3: { color: 'green', text: '已完成' },
  5: { color: 'default', text: '已取消' },
}

const OrderListPage: React.FC = () => {
  const navigate = useNavigate()
  const [dataSource, setDataSource] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<number | undefined>()
  const [keyword, setKeyword] = useState('')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let url = `/api/order/admin/list?page=1&page_size=100`
      if (statusFilter !== undefined) url += `&status=${statusFilter}`
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
      const res = await fetch(url)
      const json = await res.json()
      if (json.code === 0) {
        setDataSource(json.data?.list || [])
      }
    } catch {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [statusFilter])

  /** 发货 */
  const handleShip = async (record: OrderItem) => {
    try {
      const res = await fetch('/api/order/admin/ship', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: record.id }),
      })
      const json = await res.json()
      if (json.code === 0) {
        message.success('已发货')
        fetchOrders()
      } else {
        message.error(json.message || '操作失败')
      }
    } catch {
      message.error('网络请求失败')
    }
  }

  /** 取消订单 */
  const handleCancel = async (id: number) => {
    try {
      const res = await fetch('/api/order/admin/cancel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: id }),
      })
      const json = await res.json()
      if (json.code === 0) {
        message.success('订单已取消')
        fetchOrders()
      } else {
        message.error(json.message || '操作失败')
      }
    } catch {
      message.error('网络请求失败')
    }
  }

  const columns = [
    { title: '订单号', dataIndex: 'order_no', width: 200, ellipsis: true },
    { title: '用户ID', dataIndex: 'user_id', width: 90 },
    { title: '总金额', dataIndex: 'total_amount', width: 110, render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: '实付金额', dataIndex: 'pay_amount', width: 110, render: (v: number) => `¥${Number(v).toFixed(2)}` },
    {
      title: '状态',
      dataIndex: 'order_status',
      width: 100,
      render: (v: number) => <Tag color={STATUS_MAP[v]?.color}>{STATUS_MAP[v]?.text}</Tag>,
    },
    { title: '创建时间', dataIndex: 'created_at', width: 180 },
    {
      title: '操作',
      width: 220,
      render: (_: any, record: OrderItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/orders/${record.id}`)}>详情</Button>
          {record.order_status === 1 && (
            <Popconfirm title="确认发货" onConfirm={() => handleShip(record)} okText="确认" cancelText="取消">
              <Button type="link" size="small">发货</Button>
            </Popconfirm>
          )}
          {[0, 1].includes(record.order_status) && (
            <Popconfirm title="确认取消" onConfirm={() => handleCancel(record.id)} okText="确认" cancelText="取消">
              <Button type="link" size="small" danger>取消</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>订单管理</h2>
        <Space>
          <Input.Search
            placeholder="搜索订单号"
            allowClear
            style={{ width: 200 }}
            onSearch={(val) => { setKeyword(val); setTimeout(fetchOrders, 100) }}
          />
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 120 }}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { label: '待付款', value: 0 },
              { label: '待发货', value: 1 },
              { label: '待收货', value: 2 },
              { label: '已完成', value: 3 },
              { label: '已取消', value: 5 },
            ]}
          />
        </Space>
      </div>

      <Table columns={columns} dataSource={dataSource} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
    </>
  )
}

export default OrderListPage
