import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, message, Popconfirm, Select, Modal, Descriptions } from 'antd'

interface AfterSaleItem {
  id: number
  user_id: number
  order_id: number
  order_item_id: number
  type: string
  reason: string
  description: string
  images: string[]
  amount: number
  status: number
  created_at: string
}

const TYPE_MAP: Record<string, string> = { refund: '仅退款', return_refund: '退货退款' }
const STATUS_MAP: Record<number, { color: string; text: string }> = {
  0: { color: 'orange', text: '待审核' },
  1: { color: 'green', text: '已通过' },
  2: { color: 'red', text: '已拒绝' },
  3: { color: 'blue', text: '已退款' },
  4: { color: 'default', text: '已完成' },
}

const AfterSaleListPage: React.FC = () => {
  const [dataSource, setDataSource] = useState<AfterSaleItem[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<number | undefined>()
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailData, setDetailData] = useState<AfterSaleItem | null>(null)

  const fetchList = async () => {
    setLoading(true)
    try {
      let url = `/api/after-sale/admin/list?page=1&page_size=100`
      if (statusFilter !== undefined) url += `&status=${statusFilter}`
      const res = await fetch(url)
      const json = await res.json()
      if (json.code === 0) setDataSource(json.data?.list || [])
    } catch { message.error('加载失败') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchList() }, [statusFilter])

  /** 审核 */
  const handleReview = async (id: number, status: number) => {
    try {
      const res = await fetch('/api/after-sale/admin/review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const json = await res.json()
      if (json.code === 0) { message.success(json.message); fetchList() }
      else message.error(json.message || '操作失败')
    } catch { message.error('网络请求失败') }
  }

  /** 查看详情 */
  const showDetail = (record: AfterSaleItem) => {
    setDetailData(record)
    setDetailVisible(true)
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '用户ID', dataIndex: 'user_id', width: 90 },
    { title: '订单ID', dataIndex: 'order_id', width: 90 },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (v: string) => <Tag>{TYPE_MAP[v] || v}</Tag>,
    },
    { title: '原因', dataIndex: 'reason', ellipsis: true },
    { title: '金额', dataIndex: 'amount', width: 100, render: (v: number) => `¥${Number(v).toFixed(2)}` },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: number) => <Tag color={STATUS_MAP[v]?.color}>{STATUS_MAP[v]?.text}</Tag>,
    },
    { title: '申请时间', dataIndex: 'created_at', width: 180 },
    {
      title: '操作',
      width: 240,
      render: (_: any, record: AfterSaleItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => showDetail(record)}>详情</Button>
          {record.status === 0 && (
            <>
              <Popconfirm title="确认通过" onConfirm={() => handleReview(record.id, 1)} okText="确认" cancelText="取消">
                <Button type="link" size="small" style={{ color: '#52c41a' }}>通过</Button>
              </Popconfirm>
              <Popconfirm title="确认拒绝" onConfirm={() => handleReview(record.id, 2)} okText="确认" cancelText="取消">
                <Button type="link" size="small" danger>拒绝</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>售后管理</h2>
        <Select
          placeholder="状态筛选"
          allowClear
          style={{ width: 120 }}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { label: '待审核', value: 0 },
            { label: '已通过', value: 1 },
            { label: '已拒绝', value: 2 },
            { label: '已退款', value: 3 },
          ]}
        />
      </div>

      <Table columns={columns} dataSource={dataSource} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />

      <Modal
        title="售后详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {detailData && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="售后单ID">{detailData.id}</Descriptions.Item>
            <Descriptions.Item label="用户ID">{detailData.user_id}</Descriptions.Item>
            <Descriptions.Item label="订单ID">{detailData.order_id}</Descriptions.Item>
            <Descriptions.Item label="类型">{TYPE_MAP[detailData.type] || detailData.type}</Descriptions.Item>
            <Descriptions.Item label="原因">{detailData.reason}</Descriptions.Item>
            {detailData.description && <Descriptions.Item label="描述">{detailData.description}</Descriptions.Item>}
            <Descriptions.Item label="金额">¥{Number(detailData.amount).toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={STATUS_MAP[detailData.status]?.color}>{STATUS_MAP[detailData.status]?.text}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="申请时间">{detailData.created_at}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  )
}

export default AfterSaleListPage
