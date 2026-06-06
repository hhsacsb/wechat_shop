import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByOpenid(openid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { openid } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, data);
    return this.findOne(id);
  }

  // ========== 后台管理方法 ==========

  /** 后台：用户列表 */
  async getAdminList(params: { keyword?: string; status?: number; page?: number; page_size?: number }) {
    const { keyword, status, page = 1, page_size = 10 } = params;
    const qb = this.userRepository.createQueryBuilder('user');

    if (keyword) {
      qb.andWhere('(user.nickname LIKE :keyword OR user.mobile LIKE :keyword OR user.openid LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }
    if (status !== undefined && status !== null) {
      qb.andWhere('user.status = :status', { status });
    }

    const [list, total] = await qb
      .orderBy('user.created_at', 'DESC')
      .skip((page - 1) * page_size)
      .take(page_size)
      .getManyAndCount();

    return { list, page, page_size, total, has_more: total > page * page_size };
  }

  /** 后台：更新用户状态（禁用/启用） */
  async updateUserStatus(id: number, status: number) {
    await this.userRepository.update({ id }, { status });
    return { message: status === 1 ? '已启用' : '已禁用' };
  }
}
