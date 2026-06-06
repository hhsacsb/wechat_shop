import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,
  ) {}

  /** 获取已上架的轮播图（小程序端使用，按排序升序） */
  async getActiveList() {
    const banners = await this.bannerRepository.find({
      where: { status: 1 },
      order: { sort: 'ASC', id: 'ASC' },
    });
    return banners.map((b) => ({
      id: b.id,
      image: b.image_url,
      link_type: b.link_type,
      link_value: b.link_value,
    }));
  }

  /** 管理端：获取全部轮播图（含下架） */
  async getList() {
    const banners = await this.bannerRepository.find({
      order: { sort: 'ASC', id: 'DESC' },
    });
    return banners;
  }

  /** 获取单条详情 */
  async getDetail(id: number) {
    return this.bannerRepository.findOne({ where: { id } });
  }

  /** 创建轮播图 */
  async create(data: {
    image_url: string;
    link_type?: string;
    link_value?: string;
    sort?: number;
    status?: number;
  }) {
    const banner = this.bannerRepository.create({
      image_url: data.image_url,
      link_type: data.link_type || 'none',
      link_value: data.link_value || '',
      sort: data.sort ?? 0,
      status: data.status ?? 1,
    });
    const saved = await this.bannerRepository.save(banner);
    return { id: saved.id, message: '创建成功' };
  }

  /** 更新轮播图 */
  async update(data: {
    id: number;
    image_url?: string;
    link_type?: string;
    link_value?: string;
    sort?: number;
    status?: number;
  }) {
    const { id, ...updateData } = data;
    const existing = await this.bannerRepository.findOne({ where: { id } });
    if (!existing) {
      throw new Error('轮播图不存在');
    }
    await this.bannerRepository.update({ id }, updateData);
    return { message: '更新成功' };
  }

  /** 删除轮播图 */
  async delete(id: number) {
    const existing = await this.bannerRepository.findOne({ where: { id } });
    if (!existing) {
      throw new Error('轮播图不存在');
    }
    await this.bannerRepository.delete({ id });
    return { message: '删除成功' };
  }

  /** 切换上下架状态 */
  async toggleStatus(id: number, status: number) {
    const existing = await this.bannerRepository.findOne({ where: { id } });
    if (!existing) {
      throw new Error('轮播图不存在');
    }
    await this.bannerRepository.update({ id }, { status });
    return { message: '状态更新成功' };
  }
}
