import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductSku } from '../product/entities/product-sku.entity';
import { Product } from '../product/entities/product.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { UserCoupon } from '../coupon/entities/user-coupon.entity';
import { Address } from '../address/entities/address.entity';

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
    @InjectRepository(ProductSku)
    private skuRepository: Repository<ProductSku>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(UserCoupon)
    private userCouponRepository: Repository<UserCoupon>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
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
    user_coupon_id?: number;
    remark?: string;
    cart_ids?: number[];
    product_id?: number;
    sku_id?: number;
    quantity?: number;
  }) {
    const orderNo = `SO${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;

    // 1. 根据 source 类型计算订单金额和商品明细
    const items: Array<{
      product_id: number;
      sku_id: number;
      product_name: string;
      sku_desc: string;
      price: number;
      quantity: number;
      amount: number;
    }> = [];
    let totalAmount = 0;

    if (data.source === 'buy_now') {
      // 立即购买：查询 SKU 和商品信息
      if (!data.sku_id || !data.product_id || !data.quantity) {
        throw new BadRequestException('缺少商品信息');
      }

      const sku = await this.skuRepository.findOne({ where: { id: data.sku_id } });
      if (!sku) throw new BadRequestException('SKU 不存在');

      const product = await this.productRepository.findOne({ where: { id: data.product_id } });
      if (!product) throw new BadRequestException('商品不存在');

      const amount = Number(sku.price) * data.quantity;
      totalAmount = amount;

      items.push({
        product_id: data.product_id,
        sku_id: data.sku_id,
        product_name: product.name,
        sku_desc: sku.spec_value,
        price: Number(sku.price),
        quantity: data.quantity,
        amount,
      });
    } else if (data.source === 'cart') {
      // 购物车结算：查询购物车商品
      if (!data.cart_ids?.length) {
        throw new BadRequestException('请选择要结算的商品');
      }

      const cartItems = await this.cartRepository.find({
        where: { id: In(data.cart_ids), user_id: userId },
      });

      if (!cartItems.length) {
        throw new BadRequestException('购物车商品不存在');
      }

      // 批量查询 SKU 和商品信息
      const skuIds = cartItems.map((c) => c.sku_id);
      const productIds = cartItems.map((c) => c.product_id);
      const skuMap = new Map(
        (await this.skuRepository.findBy({ id: In(skuIds) })).map((s) => [s.id, s]),
      );
      const productMap = new Map(
        (await this.productRepository.findBy({ id: In(productIds) })).map((p) => [p.id, p]),
      );

      for (const cart of cartItems) {
        const sku = skuMap.get(cart.sku_id);
        const product = productMap.get(cart.product_id);
        const amount = Number(cart.price) * cart.quantity;
        totalAmount += amount;

        items.push({
          product_id: cart.product_id,
          sku_id: cart.sku_id,
          product_name: product?.name || '',
          sku_desc: sku?.spec_value || '',
          price: Number(cart.price),
          quantity: cart.quantity,
          amount,
        });
      }
    } else {
      throw new BadRequestException('无效的订单来源');
    }

    // 2. 计算优惠金额
    let discountAmount = 0;
    let actualCouponId: number | undefined;
    let actualUserCouponId: number | undefined;

    if (data.user_coupon_id) {
      const uc = await this.userCouponRepository.findOne({
        where: { id: data.user_coupon_id, user_id: userId, status: 0 },
      });
      if (uc) {
        const coupon = await this.couponRepository.findOne({ where: { id: uc.coupon_id } });
        if (coupon && coupon.status === 1 && totalAmount >= Number(coupon.min_amount)) {
          discountAmount = Number(coupon.amount);
          actualCouponId = coupon.id;
          actualUserCouponId = uc.id;
        }
      }
    } else if (data.coupon_id) {
      const coupon = await this.couponRepository.findOne({ where: { id: data.coupon_id } });
      if (coupon && totalAmount >= Number(coupon.min_amount)) {
        discountAmount = Number(coupon.amount);
        actualCouponId = coupon.id;
      }
    }

    const payAmount = totalAmount - discountAmount;

    // 3. 获取地址快照
    const address = await this.addressRepository.findOne({ where: { id: data.address_id } });
    const addressSnapshot = address
      ? {
          consignee: address.consignee,
          mobile: address.mobile,
          province: address.province,
          city: address.city,
          district: address.district,
          detailAddress: address.detail_address,
        }
      : {};

    // 4. 创建订单
    const order = this.orderRepository.create({
      order_no: orderNo,
      user_id: userId,
      total_amount: totalAmount,
      discount_amount: discountAmount,
      pay_amount: payAmount,
      order_status: ORDER_STATUS.PENDING_PAYMENT,
      pay_status: 0,
      coupon_id: actualCouponId,
      user_coupon_id: actualUserCouponId,
      remark: data.remark,
      address_snapshot: addressSnapshot as object,
    });

    const savedOrder = await this.orderRepository.save(order);

    // 5. 保存订单商品明细
    if (items.length > 0) {
      const orderItems = items.map((item) =>
        this.orderItemRepository.create({ order_id: savedOrder.id, ...item }),
      );
      await this.orderItemRepository.save(orderItems);
    }

    // 6. 标记优惠券已使用
    if (actualUserCouponId) {
      await this.userCouponRepository.update(actualUserCouponId, { status: 1, used_at: new Date() });
    }

    // 7. 购物车结算后清除已购商品
    if (data.source === 'cart' && data.cart_ids?.length) {
      await this.cartRepository.delete({ id: In(data.cart_ids), user_id: userId });
    }

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
