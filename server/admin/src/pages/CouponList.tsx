import React from 'react'
import { Table, Button, Space, Tag } from 'antd'

const CouponListPage: React.FC = () => {
  const typeMap: Record<number, string> = {
    1: '满减券',
    2: '折扣券',
    3: '无门槛券',
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '优惠券名称', dataIndex: 'name' },
    { title: '类型', dataIndex: 'type', render: (v: number) => typeMap[v] },
    { title: '优惠金额', dataIndex: 'amount', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: '最低消费', dataIndex: 'min_amount', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: number) => <Tag color={v === 1 ? 'green' : 'red'}>{v === 1 ? '生效中' : '已停用'}</Tag>,
    },
    { title: '发放总量', dataIndex: 'total_count' },
    {
      title: '操作',
      render: () => (
        <Space>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small" danger>删除</Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>营销管理 - 优惠券</h2>
        <Button type="primary">新增优惠券</Button>
      </div>
      <Table columns={columns} dataSource={[]} rowKey="id" pagination={{ pageSize: 10 }} />
    </>
  )
}

export default CouponListPage
