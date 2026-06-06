import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Spin } from 'antd'

interface StatsData {
  total_orders: number
  pending_payment: number
  pending_shipment: number
  completed: number
  cancelled: number
  total_revenue: number
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/order/admin/stats').then(r => r.json()),
      fetch('/api/product/list?page=1&page_size=1').then(r => r.json()),
      fetch('/api/user/admin/list?page=1&page_size=1').then(r => r.json()),
    ]).then(([orderRes, productRes, userRes]) => {
      const data: any = { productTotal: 0, userTotal: 0 }
      if (orderRes.code === 0) setStats(orderRes.data)
      if (productRes.code === 0) data.productTotal = productRes.data?.total || 0
      if (userRes.code === 0) data.userTotal = userRes.data?.total || 0
      setProductUser(data)
    }).finally(() => setLoading(false))
  }, [])

  const [productUser, setProductUser] = useState<{ productTotal: number; userTotal: number }>({ productTotal: 0, userTotal: 0 })

  return (
    <>
      <h2 style={{ marginBottom: 24 }}>数据看板</h2>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic title="总订单数" value={stats?.total_orders || 0} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="待发货" value={stats?.pending_shipment || 0} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="已完成" value={stats?.completed || 0} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="总收入" value={stats?.total_revenue || 0} prefix="¥" precision={2} valueStyle={{ color: '#f5222d' }} />
            </Card>
          </Col>

          <Col span={4}>
            <Card size="small">
              <Statistic title="待付款" value={stats?.pending_payment || 0} valueStyle={{ color: '#fa8c16' }} />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small">
              <Statistic title="已取消" value={stats?.cancelled || 0} />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic title="商品总数" value={productUser.productTotal || 0} />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic title="用户总数" value={productUser.userTotal || 0} />
            </Card>
          </Col>
        </Row>
      </Spin>
    </>
  )
}

export default DashboardPage
