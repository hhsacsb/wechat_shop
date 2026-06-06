import React, { useEffect, useState } from 'react'
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Space,
  message,
  Radio,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'

const BannerFormPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit && id) {
      fetchBannerDetail(Number(id))
    }
  }, [id])

  const fetchBannerDetail = async (bannerId: number) => {
    try {
      const res = await fetch(`/api/banner/detail?id=${bannerId}`)
      const json = await res.json()
      if (json.code === 0) {
        const data = json.data
        form.setFieldsValue({
          image_url: data.image_url,
          link_type: data.link_type || 'none',
          link_value: data.link_value || '',
          sort: data.sort ?? 0,
          status: data.status ?? 1,
        })
      }
    } catch {
      message.error('加载详情失败')
    }
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const url = isEdit ? '/api/banner/update' : '/api/banner/create'
      const method = isEdit ? 'PUT' : 'POST'

      const payload = { ...values }
      if (isEdit) {
        payload.id = Number(id)
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (json.code === 0) {
        message.success(isEdit ? '更新成功' : '创建成功')
        navigate('/banners')
      } else {
        message.error(json.message || '操作失败')
      }
    } catch {
      message.error('网络请求失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>{isEdit ? '编辑轮播图' : '新增轮播图'}</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
        <Card title="基本信息" style={{ marginBottom: 24 }}>
          <Form.Item
            name="image_url"
            label="图片URL"
            rules={[{ required: true, message: '请输入图片URL' }]}
          >
            <Input placeholder="https://cdn.xxx.com/banner/xxx.jpg" />
          </Form.Item>

          <Form.Item name="link_type" label="跳转类型" initialValue="none">
            <Select
              options={[
                { label: '无跳转', value: 'none' },
                { label: '跳转到商品', value: 'product' },
                { label: '跳转到分类', value: 'category' },
                { label: '外部链接', value: 'url' },
              ]}
            />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.link_type !== cur.link_type}>
            {({ getFieldValue }) =>
              getFieldValue('link_type') !== 'none' ? (
                <Form.Item
                  name="link_value"
                  label={
                    getFieldValue('link_type') === 'url'
                      ? '链接地址'
                      : getFieldValue('link_type') === 'product'
                        ? '商品ID'
                        : '分类ID'
                  }
                  rules={[{ required: true, message: '请输入跳转目标' }]}
                >
                  <Input
                    placeholder={
                      getFieldValue('link_type') === 'url'
                        ? 'https://...'
                        : getFieldValue('link_type') === 'product'
                          ? '输入商品ID（数字）'
                          : '输入分类ID（数字）'
                    }
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item name="sort" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: 200 }} placeholder="数字越小越靠前" />
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

        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? '保存修改' : '立即创建'}
          </Button>
          <Button onClick={() => navigate('/banners')}>取消</Button>
        </Space>
      </Form>
    </div>
  )
}

export default BannerFormPage
