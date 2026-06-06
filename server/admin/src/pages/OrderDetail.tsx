import React, { useEffect, useState } from 'react'
import { Card, Descriptions, Table, Tag, Button, Space, message, Popconfirm, Spin } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'

interface OrderDetail {
  id: number
  order_no: string
  user_id: number
  total_amount: number
  discount_amount: number
  pay_amount: number
  order_status: number
  pay_status: number
  remark: string
  address_snapshot: any
  created_at: string
  items?: OrderItemRow[]
}

interface OrderItemRow {
  id: number
  product_id: number
  product_name: string
  sku_desc: string
  price: number
  quantity: number
  amount: number
}

const STATUS_MAP: Record<number, { color: string; text: string }> = {
  0: { color: 'orange', text: '待付款' },
  1: { color: 'blue', text: '待发货' },
  2: { color: 'purple', text: '待收货' },
  3: { color: 'green', text: '已完成' },
  5: { color: 'default', text: '已取消' },
}

const OrderDetailPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/order/admin/detail?order_id=${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.code === 0) setData(json.data)
        else message.error(json.message || '加载失败')
      })
      .catch(() => message.error('网络请求失败'))
      .finally(() => setLoading(false))
  }, [id])

  /** 发货 */
  const handleShip = async () => {
    try {
      const res = await fetch('/api/order/admin/ship', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: Number(id) }),
      })
      const json = await res.json()
      if (json.code === 0) { message.success('已发货'); window.location.reload() }
      else message.error(json.message || '操作失败')
    } catch { message.error('网络请求失败') }
  }

  /** 取消订单 */
  const handleCancel = async () => {
    try {
      const res = await fetch('/api/order/admin/cancel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: Number(id) }),
      })
      const json = await res.json()
      if (json.code === 0) { message.success('订单已取消'); window.location.reload() }
      else message.error(json.message || '操作失败')
    } catch { message.error('网络请求失败') }
  }

  if (loading) return <Spin style={{ display: 'block', margin: '100px auto' }} />
  if (!data) return <div>订单不存在</div>

  const addr = data.address_snapshot || {}
  const itemColumns = [
    { title: '商品名称', dataIndex: 'product_name' },
    { title: '规格', dataIndex: 'sku_desc', width: 120 },
    { title: '单价', dataIndex: 'price', render: (v: number) => `¥${Number(v).toFixed(2)}`, width: 100 },
    { title: '数量', dataIndex: 'quantity', width: 80 },
    { title: '小计', dataIndex: 'amount', render: (v: number) => `¥${Number(v).toFixed(2)}`, width: 100 },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>订单详情 - {data.order_no}</h2>
        <Space>
          <Button onClick={() => navigate('/orders')}>返回列表</Button>
          {data.order_status === 1 && (
            <Popconfirm title="确认发货" onConfirm={handleShip} okText="确认" cancelText="取消">
              <Button type="primary">发货</Button>
            </Popconfirm>
          )}
          {[0, 1].includes(data.order_status) && (
            <Popconfirm title="确认取消" onConfirm={handleCancel} okText="确认" cancelText="取消">
              <Button danger>取消订单</Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="订单号">{data.order_no}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={STATUS_MAP[data.order_status]?.color}>{STATUS_MAP[data.order_status]?.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="用户ID">{data.user_id}</Descriptions.Item>
          <Descriptions.Item label="支付状态">
            <Tag color={data.pay_status === 1 ? 'green' : 'orange'}>{data.pay_status === 1 ? '已支付' : '未支付'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="总金额">¥{Number(data.total_amount).toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="优惠金额">¥{Number(data.discount_amount).toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="实付金额">
            <span style={{ fontWeight: 'bold', color: '#f5222d' }}>¥{Number(data.pay_amount).toFixed(2)}</span>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{data.created_at}</Descriptions.Item>
          {addr.consignee && (
            <>
              <Descriptions.Item label="收货人" span={2}>
                {addr.consignee} / {addr.mobile}
              </Descriptions.Item>
              <Descriptions.Item label="收货地址" span={2}>
                {addr.province}{addr.city}{addr.district}{addr.detail_address}
              </Descriptions.Item>
            </>
          )}
          {data.remark && <Descriptions.Item label="备注" span={2}>{data.remark}</Descriptions.Item>}
        </Descriptions>
      </Card>

      <Card title="商品明细">
        <Table columns={itemColumns} dataSource={data.items || []} rowKey="id" pagination={false} />
      </Card>
    </div>
  )
}

export default OrderDetailPage
