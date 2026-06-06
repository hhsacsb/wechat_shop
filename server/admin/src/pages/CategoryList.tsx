import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Tag, message, Popconfirm, Modal, Form, Input, InputNumber, Select } from 'antd'

interface CategoryItem {
  id: number
  parent_id: number
  name: string
  sort: number
  status: number
}

const CategoryListPage: React.FC = () => {
  const [dataSource, setDataSource] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/category/list')
      const json = await res.json()
      if (json.code === 0) {
        setDataSource(json.data || [])
      }
    } catch {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchList() }, [])

  /** 打开新增弹窗 */
  const handleAdd = (parentId?: number) => {
    setEditingId(null)
    form.resetFields()
    form.setFieldValue('parent_id', parentId ?? 0)
    setModalVisible(true)
  }

  /** 打开编辑弹窗 */
  const handleEdit = (record: CategoryItem) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  /** 提交表单 */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const url = editingId ? '/api/category/update' : '/api/category/create'
      const body = editingId ? { id: editingId, ...values } : values

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.code === 0) {
        message.success(editingId ? '更新成功' : '创建成功')
        setModalVisible(false)
        fetchList()
      } else {
        message.error(json.message || '操作失败')
      }
    } catch {
      // 表单校验失败，不处理
    }
  }

  /** 删除 */
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch('/api/category/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (json.code === 0) {
        message.success('删除成功')
        fetchList()
      } else {
        message.error(json.message || '删除失败')
      }
    } catch {
      message.error('网络请求失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '分类名称', dataIndex: 'name' },
    { title: '父级ID', dataIndex: 'parent_id', width: 80 },
    { title: '排序', dataIndex: 'sort', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: number) => <Tag color={v === 1 ? 'green' : 'red'}>{v === 1 ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '操作',
      width: 240,
      render: (_: any, record: CategoryItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" onClick={() => handleAdd(record.id)}>添加子分类</Button>
          <Popconfirm title="确认删除" description="将同时删除所有子分类" onConfirm={() => handleDelete(record.id)} okText="确认" cancelText="取消">
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>分类管理</h2>
        <Button type="primary" onClick={() => handleAdd()}>新增分类</Button>
      </div>

      <Table columns={columns} dataSource={dataSource} rowKey="id" loading={loading} pagination={false} />

      <Modal
        title={editingId ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="parent_id" label="父级分类">
            <Select placeholder="无则不选（顶级分类）">
              <Select.Option value={0}>顶级分类</Select.Option>
              {dataSource.filter(d => d.parent_id === 0).map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select defaultValue={1}>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default CategoryListPage
