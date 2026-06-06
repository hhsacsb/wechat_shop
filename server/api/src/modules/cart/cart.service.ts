import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async getList(userId: number) {
    const items = await this.cartRepository.find({ where: { user_id: userId } });
    const checkedItems = items.filter((i) => i.checked === 1);
    const totalAmount = checkedItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

    return {
      list: items,
      total_amount: totalAmount,
      checked_count: checkedItems.reduce((sum, i) => sum + i.quantity, 0),
    };
  }

  async addItem(userId: number, product_id: number, sku_id: number, quantity: number) {
    const existing = await this.cartRepository.findOne({
      where: { user_id: userId, product_id, sku_id },
    });

    if (existing) {
      existing.quantity += quantity;
      return this.cartRepository.save(existing);
    }

    const cart = this.cartRepository.create({ user_id: userId, product_id, sku_id, quantity });
    return this.cartRepository.save(cart);
  }

  async updateItem(userId: number, cart_id: number, data: { quantity?: number; checked?: number }) {
    await this.cartRepository.update({ id: cart_id, user_id: userId }, data);
    return this.getList(userId);
  }

  async deleteItems(userId: number, cart_ids: number[]) {
    await this.cartRepository.delete({ id: In(cart_ids), user_id: userId });
    return this.getList(userId);
  }
}
