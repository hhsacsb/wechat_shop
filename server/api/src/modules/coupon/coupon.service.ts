import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
  ) {}

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
      description: `满${c.min_amount}减${c.amount}`,
      status: c.status,
    }));
  }
}
