import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, message, Popconfirm, Switch } from 'antd'
import { useNavigate } from 'react-router-dom'

interface CouponItem {
  id: number
  name: string
  type: number
  amount: number
  min_amount: number
  start_time: string
  end_time: string
  total_count: number
  used_count: number
  status: number
  created_at: string
}

const typeMap: Record<number, string> = {
  1: '满减券',
  2: '折扣券',
  3: '无门槛券',
}

const CouponListPage: React.FC = () => {
  const navigate = useNavigate()
  const [dataSource, setDataSource] = useState<CouponItem[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, page_size: 10, total: 0 })

  const fetchList = async (page = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/coupon/admin/list?page=${page}&page_size=${pagination.page_size}`)
      const json = await res.json()
      if (json.code === 0) {
        setDataSource(json.data.list || [])
        setPagination((prev) => ({
          ...prev,
          page: json.data.page,
          total: json.data.total,
        }))
      } else {
        message.error(json.message || '加载失败')
      }
    } catch {
      message.error('网络请求失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch('/api/coupon/admin/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (json.code === 0) {
        message.success('删除成功')
        fetchList(pagination.page)
      } else {
        message.error(json.message || '删除失败')
      }
    } catch {
      message.error('网络请求失败')
    }
  }

  const handleToggleStatus = async (record: CouponItem) => {
    const newStatus = record.status === 1 ? 0 : 1
    try {
      const res = await fetch('/api/coupon/admin/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: record.id, status: newStatus }),
      })
      const json = await res.json()
      if (json.code === 0) {
        message.success(newStatus === 1 ? '已启用' : '已停用')
        fetchList(pagination.page)
      } else {
        message.error(json.message || '操作失败')
      }
    } catch {
      message.error('网络请求失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '优惠券名称', dataIndex: 'name', width: 160 },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (v: number) => typeMap[v] || v,
    },
    {
      title: '优惠',
      dataIndex: 'amount',
      width: 100,
      render: (v: number, record: CouponItem) =>
        record.type === 2 ? `${v}折` : `¥${Number(v).toFixed(2)}`,
    },
    {
      title: '最低消费',
      dataIndex: 'min_amount',
      width: 100,
      render: (v: number) => (v > 0 ? `¥${Number(v).toFixed(2)}` : '无门槛'),
    },
    {
      title: '有效期',
      width: 240,
      render: (_: any, record: CouponItem) =>
        `${record.start_time.slice(0, 10)} ~ ${record.end_time.slice(0, 10)}`,
    },
    {
      title: '发放/已用',
      width: 120,
      render: (_: any, record: CouponItem) =>
        `${record.total_count || '不限'} / ${record.used_count}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: number, record: CouponItem) => (
        <Switch
          checked={v === 1}
          checkedChildren="启用"
          unCheckedChildren="停用"
          size="small"
          onChange={() => handleToggleStatus(record)}
        />
      ),
    },
    {
      title: '操作',
      width: 180,
      render: (_: any, record: CouponItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/coupons/edit/${record.id}`)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="删除后不可恢复，是否继续？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>营销管理 - 优惠券</h2>
        <Button type="primary" onClick={() => navigate('/coupons/add')}>
          新增优惠券
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.page_size,
          total: pagination.total,
          onChange: (page) => fetchList(page),
          showTotal: (total) => `共 ${total} 条`,
          showSizeChanger: false,
        }}
      />
    </>
  )
}

export default CouponListPage