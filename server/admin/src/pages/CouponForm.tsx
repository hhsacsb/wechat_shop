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
  DatePicker,
  Radio,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'

const typeOptions = [
  { label: '满减券', value: 1 },
  { label: '折扣券', value: 2 },
  { label: '无门槛券', value: 3 },
]

const CouponFormPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [typeValue, setTypeValue] = useState<number>(1)

  useEffect(() => {
    if (isEdit && id) {
      fetchDetail(Number(id))
    }
  }, [id])

  const fetchDetail = async (couponId: number) => {
    try {
      const res = await fetch(`/api/coupon/admin/detail?id=${couponId}`)
      const json = await res.json()
      if (json.code === 0) {
        const data = json.data
        form.setFieldsValue({
          name: data.name,
          type: data.type,
          amount: data.amount,
          min_amount: data.min_amount,
          start_time: data.start_time ? dayjs(data.start_time) : null,
          end_time: data.end_time ? dayjs(data.end_time) : null,
          total_count: data.total_count,
          status: data.status,
        })
        setTypeValue(data.type)
      } else {
        message.error(json.message || '加载失败')
      }
    } catch {
      message.error('网络请求失败')
    }
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const payload = {
        ...values,
        start_time: values.start_time.format('YYYY-MM-DD HH:mm:ss'),
        end_time: values.end_time.format('YYYY-MM-DD HH:mm:ss'),
      }

      const url = isEdit ? '/api/coupon/admin/update' : '/api/coupon/admin/create'
      const method = isEdit ? 'PUT' : 'POST'

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
        navigate('/coupons')
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
      <h2 style={{ marginBottom: 24 }}>{isEdit ? '编辑优惠券' : '新增优惠券'}</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        initialValues={{ type: 1, status: 1, total_count: 0 }}
      >
        <Card title="基本信息" style={{ marginBottom: 24 }}>
          <Form.Item
            name="name"
            label="优惠券名称"
            rules={[{ required: true, message: '请输入优惠券名称' }]}
          >
            <Input placeholder="如：新人专享券" />
          </Form.Item>

          <Form.Item
            name="type"
            label="优惠券类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select options={typeOptions} onChange={(v) => setTypeValue(v)} />
          </Form.Item>

          <Form.Item
            name="amount"
            label={typeValue === 2 ? '折扣（如打 8 折填 8）' : '优惠金额'}
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <InputNumber
              min={0}
              max={typeValue === 2 ? 10 : undefined}
              step={typeValue === 2 ? 0.1 : 0.01}
              precision={typeValue === 2 ? 1 : 2}
              style={{ width: 200 }}
              placeholder={typeValue === 2 ? '1~10，如8.5' : '0.00'}
              addonBefore={typeValue === 2 ? '' : '¥'}
              addonAfter={typeValue === 2 ? '折' : ''}
            />
          </Form.Item>

          {typeValue !== 3 && (
            <Form.Item name="min_amount" label="最低消费金额" initialValue={0}>
              <InputNumber
                min={0}
                precision={2}
                style={{ width: 200 }}
                placeholder="最低消费金额"
                addonBefore="¥"
              />
            </Form.Item>
          )}

          <Space size={16}>
            <Form.Item
              name="start_time"
              label="生效时间"
              rules={[{ required: true, message: '请选择生效时间' }]}
            >
              <DatePicker showTime placeholder="选择生效时间" />
            </Form.Item>

            <Form.Item
              name="end_time"
              label="失效时间"
              rules={[{ required: true, message: '请选择失效时间' }]}
            >
              <DatePicker showTime placeholder="选择失效时间" />
            </Form.Item>
          </Space>

          <Form.Item
            name="total_count"
            label="发放总量（0 表示不限量）"
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: 200 }} placeholder="0 表示不限量" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value={1}>启用</Radio>
              <Radio value={0}>停用</Radio>
            </Radio.Group>
          </Form.Item>
        </Card>

        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? '保存修改' : '立即创建'}
          </Button>
          <Button onClick={() => navigate('/coupons')}>取消</Button>
        </Space>
      </Form>
    </div>
  )
}

export default CouponFormPage