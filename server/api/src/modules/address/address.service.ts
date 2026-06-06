import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  async getList(userId: number) {
    return this.addressRepository.find({
      where: { user_id: userId },
      order: { is_default: 'DESC', created_at: 'DESC' },
    });
  }

  async create(userId: number, data: Partial<Address>) {
    if (data.is_default === 1) {
      await this.addressRepository.update({ user_id: userId }, { is_default: 0 });
    }
    const address = this.addressRepository.create({ ...data, user_id: userId });
    return this.addressRepository.save(address);
  }

  async update(userId: number, id: number, data: Partial<Address>) {
    if (data.is_default === 1) {
      await this.addressRepository.update({ user_id: userId }, { is_default: 0 });
    }
    await this.addressRepository.update({ id, user_id: userId }, data);
    return this.addressRepository.findOne({ where: { id } });
  }

  async delete(userId: number, id: number) {
    await this.addressRepository.delete({ id, user_id: userId });
    return { message: '地址已删除' };
  }
}
