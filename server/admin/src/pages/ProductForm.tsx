import React, { useEffect, useState } from 'react'
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Space,
  Table,
  message,
  Radio,
} from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'

interface SkuItem {
  id?: number
  sku_code?: string
  spec_value: string
  price: number
  stock: number
  image?: string
}

interface Category {
  id: number
  name: string
  children?: { id: number; name: string }[]
}

const ProductFormPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const [form] = Form.useForm()
  const [skuList, setSkuList] = useState<SkuItem[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      // 先加载分类，再加载商品详情（保证下拉选项就绪后再回填值）
      fetchCategories().then(() => {
        fetchProductDetail(Number(id))
      })
    } else {
      fetchCategories()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/category/list')
      const json = await res.json()
      if (json.code === 0) {
        setCategories(json.data || [])
      }
    } catch {
      message.error('分类加载失败')
    }
  }

  const fetchProductDetail = async (productId: number) => {
    try {
      const res = await fetch(`/api/product/detail?id=${productId}`)
      const json = await res.json()
      if (json.code === 0) {
        const data = json.data
        form.setFieldsValue({
          category_id: data.category_id,
          name: data.name,
          subtitle: data.subtitle,
          cover_image: data.cover_image,
          content: data.detail_html,
          price: data.price,
          original_price: data.original_price,
          status: data.status,
        })
        // 加载商品图片列表
        if (data.images && Array.isArray(data.images)) {
          setImageUrls(data.images)
        }
        if (data.sku_list) {
          setSkuList(
            data.sku_list.map((s: any) => ({
              id: s.sku_id,
              sku_code: s.sku_code,
              spec_value: s.spec_value,
              price: s.price,
              stock: s.stock,
              image: s.image,
            })),
          )
        }
      }
    } catch {
      message.error('商品详情加载失败')
    }
  }

  const handleAddSku = () => {
    setSkuList([...skuList, { spec_value: '', price: 0, stock: 0 }])
  }

  const handleRemoveSku = (index: number) => {
    const list = [...skuList]
    list.splice(index, 1)
    setSkuList(list)
  }

  const handleSkuChange = (index: number, field: keyof SkuItem, value: any) => {
    const list = [...skuList]
    list[index] = { ...list[index], [field]: value }
    setSkuList(list)
  }

  // 图片管理
  const handleAddImage = () => {
    setImageUrls([...imageUrls, ''])
  }

  const handleRemoveImage = (index: number) => {
    const list = [...imageUrls]
    list.splice(index, 1)
    setImageUrls(list)
  }

  const handleImageChange = (index: number, value: string) => {
    const list = [...imageUrls]
    list[index] = value
    setImageUrls(list)
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      // 过滤空图片 URL
      const validImages = imageUrls.filter((url) => url.trim())

      const payload = {
        ...values,
        images: validImages.length > 0 ? validImages : null,
        sku_list: skuList.map((s) => ({
          id: s.id,
          sku_code: s.sku_code,
          spec_value: s.spec_value,
          price: s.price,
          stock: s.stock,
          image: s.image,
        })),
      }

      if (isEdit) {
        payload.id = Number(id)
      }

      const url = isEdit ? '/api/product/update' : '/api/product/create'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (json.code === 0) {
        message.success(isEdit ? '商品更新成功' : '商品创建成功')
        navigate('/products')
      } else {
        message.error(json.message || '操作失败')
      }
    } catch {
      message.error('网络请求失败')
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = categories.map((cat: any) => ({
    label: cat.parent_id !== 0 ? `　${cat.name}` : cat.name,
    value: cat.id,
  }))

  const skuColumns = [
    {
      title: '规格值',
      dataIndex: 'spec_value',
      render: (_: any, __: any, index: number) => (
        <Input
          value={skuList[index].spec_value}
          onChange={(e) => handleSkuChange(index, 'spec_value', e.target.value)}
          placeholder="如：5斤装"
        />
      ),
    },
    {
      title: 'SKU编码',
      dataIndex: 'sku_code',
      render: (_: any, __: any, index: number) => (
        <Input
          value={skuList[index].sku_code}
          onChange={(e) => handleSkuChange(index, 'sku_code', e.target.value)}
          placeholder="可选"
        />
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      render: (_: any, __: any, index: number) => (
        <InputNumber
          min={0}
          precision={2}
          value={skuList[index].price}
          onChange={(v) => handleSkuChange(index, 'price', v)}
          style={{ width: 120 }}
        />
      ),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      render: (_: any, __: any, index: number) => (
        <InputNumber
          min={0}
          precision={0}
          value={skuList[index].stock}
          onChange={(v) => handleSkuChange(index, 'stock', v)}
          style={{ width: 120 }}
        />
      ),
    },
    {
      title: '操作',
      render: (_: any, __: any, index: number) => (
        <Button type="link" danger onClick={() => handleRemoveSku(index)}>
          删除
        </Button>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>{isEdit ? '编辑商品' : '新增商品'}</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Card title="基本信息" style={{ marginBottom: 24 }}>
          <Form.Item
            name="category_id"
            label="商品分类"
            rules={[{ required: true, message: '请选择商品分类' }]}
          >
            <Select options={categoryOptions} placeholder="请选择分类" />
          </Form.Item>

          <Form.Item
            name="name"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input maxLength={200} placeholder="请输入商品名称" />
          </Form.Item>

          <Form.Item name="subtitle" label="副标题">
            <Input maxLength={255} placeholder="请输入副标题" />
          </Form.Item>

          <Form.Item
            name="cover_image"
            label="封面图URL"
            rules={[{ required: true, message: '请输入封面图URL' }]}
          >
            <Input placeholder="https://cdn.xxx.com/product/xxx.jpg" />
          </Form.Item>

          {/* 商品图片列表（支持多图轮播） */}
          <Card
            size="small"
            title="商品图片列表"
            style={{ marginBottom: 16, background: '#fafafa' }}
            extra={
              <Button type="link" size="small" icon={<PlusOutlined />} onClick={handleAddImage}>
                添加图片
              </Button>
            }
          >
            {imageUrls.length === 0 ? (
              <div style={{ color: '#999', textAlign: 'center', padding: '12px 0' }}>
                暂无图片，点击上方"添加图片"按钮添加
              </div>
            ) : (
              imageUrls.map((url, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <Input
                    value={url}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder={`图片 ${index + 1} URL`}
                    style={{ flex: 1 }}
                  />
                  {index > 0 && (
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => handleRemoveImage(index)}
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </div>
              ))
            )}
            <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
              提示：第一张图将作为主图显示，支持多张图片用于小程序轮播展示
            </div>
          </Card>

          <Form.Item name="content" label="商品详情">
            <Input.TextArea rows={6} placeholder="支持HTML格式" />
          </Form.Item>

          <Form.Item
            name="price"
            label="售价"
            rules={[{ required: true, message: '请输入售价' }]}
          >
            <InputNumber min={0} precision={2} style={{ width: 200 }} placeholder="0.00" />
          </Form.Item>

          <Form.Item name="original_price" label="原价">
            <InputNumber min={0} precision={2} style={{ width: 200 }} placeholder="0.00" />
          </Form.Item>

          <Form.Item
            name="status"
            label="上架状态"
            initialValue={1}
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value={1}>上架</Radio>
              <Radio value={0}>下架</Radio>
            </Radio.Group>
          </Form.Item>
        </Card>

        <Card
          title="SKU规格"
          style={{ marginBottom: 24 }}
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSku}>
              添加SKU
            </Button>
          }
        >
          <Table
            columns={skuColumns}
            dataSource={skuList}
            rowKey={(_, index) => index!.toString()}
            pagination={false}
            bordered
          />
        </Card>

        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? '保存修改' : '立即创建'}
          </Button>
          <Button onClick={() => navigate('/products')}>取消</Button>
        </Space>
      </Form>
    </div>
  )
}

export default ProductFormPage
