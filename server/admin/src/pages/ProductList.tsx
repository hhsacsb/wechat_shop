import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, message, Popconfirm } from 'antd'
import { useNavigate } from 'react-router-dom'

interface ProductItem {
  id: number
  name: string
  price: number
  sales_count: number
  status: number
}

const ProductListPage: React.FC = () => {
  const navigate = useNavigate()
  const [dataSource, setDataSource] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/product/list?page=1&page_size=100')
      const json = await res.json()
      if (json.code === 0) {
        setDataSource(json.data.list || [])
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
    fetchProducts()
  }, [])

  const handleToggleStatus = async (record: ProductItem) => {
    const newStatus = record.status === 1 ? 0 : 1
    try {
      const res = await fetch('/api/product/toggle-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: record.id, status: newStatus }),
      })
      const json = await res.json()
      if (json.code === 0) {
        message.success(newStatus === 1 ? '上架成功' : '下架成功')
        fetchProducts()
      } else {
        message.error(json.message || '操作失败')
      }
    } catch {
      message.error('网络请求失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch('/api/product/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (json.code === 0) {
        message.success('删除成功')
        fetchProducts()
      } else {
        message.error(json.message || '删除失败')
      }
    } catch {
      message.error('网络请求失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '商品名称', dataIndex: 'name' },
    { title: '价格', dataIndex: 'price', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: '销量', dataIndex: 'sales_count' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: number) => <Tag color={v === 1 ? 'green' : 'red'}>{v === 1 ? '上架' : '下架'}</Tag>,
    },
    {
      title: '操作',
      render: (_: any, record: ProductItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/products/edit/${record.id}`)}>
            编辑
          </Button>
          <Button type="link" size="small" onClick={() => handleToggleStatus(record)}>
            {record.status === 1 ? '下架' : '上架'}
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
        <h2 style={{ margin: 0 }}>商品管理</h2>
        <Button type="primary" onClick={() => navigate('/products/add')}>
          新增商品
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={loading}
      />
    </>
  )
}

export default ProductListPage
