import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

/** 订单状态枚举 */
const ORDER_STATUS = {
  PENDING_PAYMENT: 0,    // 待付款
  PENDING_SHIPMENT: 1,   // 待发货
  PENDING_RECEIVE: 2,    // 待收货
  COMPLETED: 3,          // 已完成
  CANCELLED: 5,          // 已取消
};

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  // ========== 用户端方法 ==========

  async preview(userId: number, data: { source: string; cart_ids?: number[]; coupon_id?: number; address_id?: number }) {
    return {
      products: [],
      total_amount: 0,
      discount_amount: 0,
      freight_amount: 0,
      pay_amount: 0,
    };
  }

  async createOrder(userId: number, data: {
    source: string;
    address_id: number;
    coupon_id?: number;
    remark?: string;
    cart_ids?: number[];
    product_id?: number;
    sku_id?: number;
    quantity?: number;
  }) {
    const orderNo = `SO${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;

    const order = this.orderRepository.create({
      order_no: orderNo,
      user_id: userId,
      total_amount: 0,
      discount_amount: 0,
      pay_amount: 0,
      order_status: ORDER_STATUS.PENDING_PAYMENT,
      pay_status: 0,
      remark: data.remark,
      address_snapshot: {},
    });

    const savedOrder = await this.orderRepository.save(order);

    return {
      order_id: savedOrder.id,
      order_no: savedOrder.order_no,
      pay_amount: savedOrder.pay_amount,
      order_status: 'pending_payment',
    };
  }

  async getUserList(userId: number, params: { status?: number; page?: number; page_size?: number }) {
    const { status, page = 1, page_size = 10 } = params;
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .where('order.user_id = :userId', { userId });

    if (status !== undefined) {
      queryBuilder.andWhere('order.order_status = :status', { status });
    }

    const [list, total] = await queryBuilder
      .orderBy('order.created_at', 'DESC')
      .skip((page - 1) * page_size)
      .take(page_size)
      .getManyAndCount();

    return { list, page, page_size, total, has_more: total > page * page_size };
  }

  async getUserDetail(userId: number, orderId: number) {
    return this.orderRepository.findOne({
      where: { id: orderId, user_id: userId },
      relations: { items: true },
    });
  }

  async cancelOrder(userId: number, orderId: number) {
    await this.orderRepository.update(
      { id: orderId, user_id: userId, order_status: ORDER_STATUS.PENDING_PAYMENT },
      { order_status: ORDER_STATUS.CANCELLED },
    );
    return { message: '订单已取消' };
  }

  async confirmReceipt(userId: number, orderId: number) {
    await this.orderRepository.update(
      { id: orderId, user_id: userId, order_status: ORDER_STATUS.PENDING_RECEIVE },
      { order_status: ORDER_STATUS.COMPLETED },
    );
    return { message: '已确认收货' };
  }

  async pay(orderId: number) {
    return {
      timeStamp: String(Math.floor(Date.now() / 1000)),
      nonceStr: 'd8f7a6bc1234',
      package: 'prepay_id=wx1234567890',
      signType: 'RSA',
      paySign: 'ABCDE1234567890',
    };
  }

  // ========== 后台管理方法 ==========

  /** 后台：获取所有订单列表 */
  async getAdminList(params: { status?: number; keyword?: string; page?: number; page_size?: number }) {
    const { status, keyword, page = 1, page_size = 10 } = params;
    const qb = this.orderRepository.createQueryBuilder('order');

    if (status !== undefined && status !== null) {
      qb.andWhere('order.order_status = :status', { status });
    }
    if (keyword) {
      qb.andWhere('(order.order_no LIKE :keyword OR order.id = :id)', {
        keyword: `%${keyword}%`,
        id: isNaN(Number(keyword)) ? -1 : Number(keyword),
      });
    }

    const [list, total] = await qb
      .orderBy('order.created_at', 'DESC')
      .skip((page - 1) * page_size)
      .take(page_size)
      .getManyAndCount();

    return { list, page, page_size, total, has_more: total > page * page_size };
  }

  /** 后台：订单详情（含商品明细） */
  async getAdminDetail(orderId: number) {
    return this.orderRepository.findOne({
      where: { id: orderId },
      relations: { items: true },
    });
  }

  /** 后台：发货 */
  async shipOrder(orderId: number, data: { express_company?: string; express_no?: string }) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new Error('订单不存在');
    if (order.order_status !== ORDER_STATUS.PENDING_SHIPMENT) throw new Error('当前状态不允许发货');

    await this.orderRepository.update({ id: orderId }, {
      order_status: ORDER_STATUS.PENDING_RECEIVE,
      address_snapshot: {
        ...order.address_snapshot,
        express_company: data.express_company || '',
        express_no: data.express_no || '',
        shipped_at: new Date(),
      } as any,
    });

    return { message: '已发货' };
  }

  /** 后台：取消订单（管理员操作） */
  async adminCancelOrder(orderId: number) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new Error('订单不存在');
    if ([ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(order.order_status)) {
      throw new Error('当前状态不允许取消');
    }

    await this.orderRepository.update({ id: orderId }, {
      order_status: ORDER_STATUS.CANCELLED,
    });
    return { message: '订单已取消' };
  }

  /** 后台：订单统计概览 */
  async getStats() {
    const [total, pendingPayment, pendingShipment, completed, cancelled] = await Promise.all([
      this.orderRepository.count(),
      this.orderRepository.count({ where: { order_status: ORDER_STATUS.PENDING_PAYMENT } }),
      this.orderRepository.count({ where: { order_status: ORDER_STATUS.PENDING_SHIPMENT } }),
      this.orderRepository.count({ where: { order_status: ORDER_STATUS.COMPLETED } }),
      this.orderRepository.count({ where: { order_status: ORDER_STATUS.CANCELLED } }),
    ]);

    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.pay_amount), 0)', 'total')
      .where('order.pay_status = 1 AND order.order_status IN (:...statuses)', {
        statuses: [ORDER_STATUS.PENDING_SHIPMENT, ORDER_STATUS.PENDING_RECEIVE, ORDER_STATUS.COMPLETED],
      })
      .getRawOne();

    return {
      total_orders: total,
      pending_payment: pendingPayment,
      pending_shipment: pendingShipment,
      completed,
      cancelled,
      total_revenue: parseFloat(revenueResult?.total || '0'),
    };
  }
}
