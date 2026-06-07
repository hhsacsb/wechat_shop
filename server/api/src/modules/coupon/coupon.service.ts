import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { UserCoupon } from './entities/user-coupon.entity';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(UserCoupon)
    private userCouponRepository: Repository<UserCoupon>,
  ) {}

  // ========== 后台管理接口 ==========

  /** 后台：分页列表 */
  async getAdminList(params: { page?: number; page_size?: number; status?: number }) {
    const { page = 1, page_size = 10, status } = params;
    const qb = this.couponRepository.createQueryBuilder('coupon');

    if (status !== undefined && status !== null) {
      qb.andWhere('coupon.status = :status', { status });
    }

    const [list, total] = await qb
      .orderBy('coupon.created_at', 'DESC')
      .skip((page - 1) * page_size)
      .take(page_size)
      .getManyAndCount();

    return { list, page, page_size, total, has_more: total > page * page_size };
  }

  /** 后台：详情 */
  async getDetail(id: number) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('优惠券不存在');
    return coupon;
  }

  /** 后台：创建 */
  async create(data: {
    name: string;
    type: number;
    amount: number;
    min_amount: number;
    start_time: string;
    end_time: string;
    total_count: number;
    status?: number;
  }) {
    const coupon = this.couponRepository.create({
      name: data.name,
      type: data.type,
      amount: data.amount,
      min_amount: data.min_amount,
      start_time: data.start_time,
      end_time: data.end_time,
      total_count: data.total_count,
      status: data.status ?? 1,
    });
    return this.couponRepository.save(coupon);
  }

  /** 后台：更新 */
  async update(id: number, data: {
    name?: string;
    type?: number;
    amount?: number;
    min_amount?: number;
    start_time?: string;
    end_time?: string;
    total_count?: number;
    status?: number;
  }) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('优惠券不存在');
    await this.couponRepository.update(id, data);
    return this.couponRepository.findOne({ where: { id } });
  }

  /** 后台：删除 */
  async delete(id: number) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('优惠券不存在');
    await this.couponRepository.delete(id);
    return { message: '删除成功' };
  }

  // ========== 用户端接口 ==========

  /** 用户端：获取待领取的优惠券列表（未过期、有剩余、未领过） */
  async getAvailableList(userId: number) {
    const now = new Date();
    const allCoupons = await this.couponRepository.find({
      where: { status: 1 },
      order: { created_at: 'DESC' },
    });

    // 过滤已过期的
    const validCoupons = allCoupons.filter(
      (c) => new Date(c.start_time) <= now && new Date(c.end_time) >= now,
    );

    // 查询用户已领取的 coupon_id 列表
    const userCouponRecords = await this.userCouponRepository
      .createQueryBuilder('uc')
      .select('uc.coupon_id')
      .where('uc.user_id = :userId', { userId })
      .getMany();
    const claimedIds = new Set(userCouponRecords.map((uc) => uc.coupon_id));

    return validCoupons
      .filter((c) => !claimedIds.has(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        amount: c.amount,
        min_amount: c.min_amount,
        start_time: c.start_time,
        end_time: c.end_time,
        description: this.getDescription(c),
        total_count: c.total_count,
        used_count: c.used_count,
        left_count: c.total_count - c.used_count,
        status: c.status,
      }));
  }

  /** 用户端：领取优惠券 */
  async claim(userId: number, couponId: number) {
    const coupon = await this.couponRepository.findOne({ where: { id: couponId } });
    if (!coupon) throw new NotFoundException('优惠券不存在');
    if (coupon.status !== 1) throw new BadRequestException('优惠券已停用');

    const now = new Date();
    if (new Date(coupon.start_time) > now) throw new BadRequestException('优惠券尚未开始');
    if (new Date(coupon.end_time) < now) throw new BadRequestException('优惠券已过期');

    // 检查剩余数量
    if (coupon.total_count > 0 && coupon.used_count >= coupon.total_count) {
      throw new BadRequestException('优惠券已领完');
    }

    // 检查是否已领取
    const existing = await this.userCouponRepository.findOne({
      where: { user_id: userId, coupon_id: couponId },
    });
    if (existing) throw new BadRequestException('已领取过该优惠券');

    // 领取
    const uc = this.userCouponRepository.create({ user_id: userId, coupon_id: couponId });
    await this.userCouponRepository.save(uc);

    // 更新已使用数量
    await this.couponRepository.increment({ id: couponId }, 'used_count', 1);

    return { message: '领取成功' };
  }

  /** 用户端：获取我的优惠券（已领取的） */
  async getUserCoupons(userId: number) {
    const userCoupons = await this.userCouponRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });

    if (userCoupons.length === 0) return [];

    const couponIds = userCoupons.map((uc) => uc.coupon_id);
    const coupons = await this.couponRepository.findBy({ id: In(couponIds) });
    const couponMap = new Map(coupons.map((c) => [c.id, c]));

    const now = new Date();

    return userCoupons
      .map((uc) => {
        const coupon = couponMap.get(uc.coupon_id);
        if (!coupon) return null;

        // 如果优惠券已过期但用户状态还是"未使用"，自动更新
        if (uc.status === 0 && new Date(coupon.end_time) < now) {
          this.userCouponRepository.update(uc.id, { status: 2 });
          uc.status = 2;
        }

        return {
          id: uc.id,
          coupon_id: coupon.id,
          name: coupon.name,
          type: coupon.type,
          amount: coupon.amount,
          min_amount: coupon.min_amount,
          start_time: coupon.start_time,
          end_time: coupon.end_time,
          description: this.getDescription(coupon),
          status: uc.status, // 用户优惠券状态
          received_at: uc.created_at,
        };
      })
      .filter(Boolean);
  }

  /** 用户端：可用于订单的优惠券列表（未使用+未过期+满足最低消费） */
  async getUsableCoupons(userId: number, totalAmount: number) {
    const userCoupons = await this.userCouponRepository.find({
      where: { user_id: userId, status: 0 },
    });

    if (userCoupons.length === 0) return [];

    const couponIds = userCoupons.map((uc) => uc.coupon_id);
    const coupons = await this.couponRepository.findBy({
      id: In(couponIds),
      status: 1,
    });
    const couponMap = new Map(coupons.map((c) => [c.id, c]));

    const now = new Date();

    return userCoupons
      .map((uc) => {
        const coupon = couponMap.get(uc.coupon_id);
        if (!coupon) return null;

        // 检查过期
        if (new Date(coupon.end_time) < now) {
          this.userCouponRepository.update(uc.id, { status: 2 });
          return null;
        }

        // 检查最低消费
        if (totalAmount < Number(coupon.min_amount)) return null;

        return {
          user_coupon_id: uc.id,
          coupon_id: coupon.id,
          name: coupon.name,
          type: coupon.type,
          amount: Number(coupon.amount),
          min_amount: Number(coupon.min_amount),
          description: this.getDescription(coupon),
          end_time: coupon.end_time,
        };
      })
      .filter(Boolean);
  }

  /** 根据优惠券计算折扣 */
  async calculateDiscount(userId: number, userCouponId: number, totalAmount: number) {
    const uc = await this.userCouponRepository.findOne({
      where: { id: userCouponId, user_id: userId, status: 0 },
    });
    if (!uc) throw new BadRequestException('优惠券不可用');

    const coupon = await this.couponRepository.findOne({ where: { id: uc.coupon_id, status: 1 } });
    if (!coupon) throw new BadRequestException('优惠券已失效');

    const now = new Date();
    if (new Date(coupon.end_time) < now) {
      await this.userCouponRepository.update(uc.id, { status: 2 });
      throw new BadRequestException('优惠券已过期');
    }

    if (totalAmount < Number(coupon.min_amount)) {
      throw new BadRequestException('未达到最低消费金额');
    }

    return {
      coupon_id: coupon.id,
      user_coupon_id: uc.id,
      name: coupon.name,
      amount: Number(coupon.amount),
      description: this.getDescription(coupon),
    };
  }

  /** 使用优惠券（下单成功后调用） */
  async useCoupon(userCouponId: number) {
    const uc = await this.userCouponRepository.findOne({ where: { id: userCouponId, status: 0 } });
    if (!uc) return;
    await this.userCouponRepository.update(uc.id, { status: 1, used_at: new Date() });
  }

  /** 获取优惠券描述 */
  private getDescription(coupon: Coupon): string {
    if (coupon.type === 1) {
      return `满${Number(coupon.min_amount)}减${Number(coupon.amount)}`;
    }
    if (coupon.type === 2) {
      return `满${Number(coupon.min_amount)}享${Number(coupon.amount)}折`;
    }
    return `立减${Number(coupon.amount)}元`;
  }

  // ========== 原有接口（兼容） ==========

  /** 获取所有可用优惠券列表（原有接口，保留兼容） */
  async getList(userId: number) {
    const coupons = await this.couponRepository.find({
      where: { status: 1 },
      order: { amount: 'DESC' },
    });
    return coupons.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      amount: c.amount,
      min_amount: c.min_amount,
      start_time: c.start_time,
      end_time: c.end_time,
      description: this.getDescription(c),
      status: c.status,
    }));
  }
}