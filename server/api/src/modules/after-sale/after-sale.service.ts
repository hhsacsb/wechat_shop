import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AfterSale } from './entities/after-sale.entity';

@Injectable()
export class AfterSaleService {
  constructor(
    @InjectRepository(AfterSale)
    private afterSaleRepository: Repository<AfterSale>,
  ) {}

  /** 用户端：申请售后 */
  async apply(userId: number, data: {
    order_id: number;
    order_item_id?: number;
    type: string;
    reason: string;
    description?: string;
    images?: string[];
    amount: number;
  }) {
    const afterSale = this.afterSaleRepository.create({
      user_id: userId,
      ...data,
      status: 0, // pending_review
    });
    return this.afterSaleRepository.save(afterSale);
  }

  /** 用户端：售后列表 */
  async getUserList(userId: number, page = 1, page_size = 10) {
    const [list, total] = await this.afterSaleRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * page_size,
      take: page_size,
    });

    return {
      list,
      page,
      page_size,
      total,
      has_more: total > page * page_size,
    };
  }

  /** 用户端：售后详情 */
  async getUserDetail(userId: number, afterSaleId: number) {
    return this.afterSaleRepository.findOne({
      where: { id: afterSaleId, user_id: userId },
    });
  }

  // ========== 后台管理接口 ==========

  /** 后台：获取所有售后列表 */
  async getAdminList(params: { status?: number; page?: number; page_size?: number }) {
    const { status, page = 1, page_size = 10 } = params;
    let where: any = {};
    if (status !== undefined && status !== null) {
      where.status = status;
    }

    const [list, total] = await this.afterSaleRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * page_size,
      take: page_size,
    });

    return {
      list,
      page,
      page_size,
      total,
      has_more: total > page * page_size,
    };
  }

  /** 后台：审核售后（通过/拒绝） */
  async adminReview(id: number, data: { status: number; remark?: string }) {
    const existing = await this.afterSaleRepository.findOne({ where: { id } });
    if (!existing) throw new Error('售后单不存在');
    if (existing.status !== 0) throw new Error('当前状态不允许操作');

    await this.afterSaleRepository.update({ id }, {
      status: data.status,
    });
    return { message: data.status === 1 ? '已通过' : '已拒绝' };
  }

  /** 后台：售后详情 */
  async getAdminDetail(id: number) {
    return this.afterSaleRepository.findOne({ where: { id } });
  }
}
