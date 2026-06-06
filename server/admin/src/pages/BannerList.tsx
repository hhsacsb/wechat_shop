import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, message, Popconfirm, Image } from 'antd'
import { useNavigate } from 'react-router-dom'

interface BannerItem {
  id: number
  image_url: string
  link_type: string
  link_value: string
  sort: number
  status: number
}

const linkTypeMap: Record<string, string> = {
  none: '无跳转',
  product: '商品',
  category: '分类',
  url: '外部链接',
}

const BannerListPage: React.FC = () => {
  const navigate = useNavigate()
  const [dataSource, setDataSource] = useState<BannerItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/banner/list')
      const json = await res.json()
      if (json.code === 0) {
        setDataSource(json.data || [])
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
    fetchBanners()
  }, [])

  const handleToggleStatus = async (record: BannerItem) => {
    const newStatus = record.status === 1 ? 0 : 1
    try {
      const res = await fetch('/api/banner/toggle-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: record.id, status: newStatus }),
      })
      const json = await res.json()
      if (json.code === 0) {
        message.success(newStatus === 1 ? '上架成功' : '下架成功')
        fetchBanners()
      } else {
        message.error(json.message || '操作失败')
      }
    } catch {
      message.error('网络请求失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch('/api/banner/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (json.code === 0) {
        message.success('删除成功')
        fetchBanners()
      } else {
        message.error(json.message || '删除失败')
      }
    } catch {
      message.error('网络请求失败')
    }
  }

  const columns = [
    {
      title: '排序',
      dataIndex: 'sort',
      width: 70,
    },
    {
      title: '预览图',
      dataIndex: 'image_url',
      width: 120,
      render: (url: string) => (
        <Image src={url} width={80} height={40} style={{ objectFit: 'cover' }} fallback="/placeholder.png" />
      ),
    },
    {
      title: '跳转类型',
      dataIndex: 'link_type',
      width: 100,
      render: (v: string) => linkTypeMap[v] || v,
    },
    {
      title: '跳转值',
      dataIndex: 'link_value',
      ellipsis: true,
      render: (v: string) => v || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v: number) => <Tag color={v === 1 ? 'green' : 'red'}>{v === 1 ? '上架' : '下架'}</Tag>,
    },
    {
      title: '操作',
      width: 220,
      render: (_: any, record: BannerItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/banners/edit/${record.id}`)}>
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
        <h2 style={{ margin: 0 }}>轮播图管理</h2>
        <Button type="primary" onClick={() => navigate('/banners/add')}>
          新增轮播图
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        pagination={false}
        loading={loading}
      />
    </>
  )
}

export default BannerListPage
