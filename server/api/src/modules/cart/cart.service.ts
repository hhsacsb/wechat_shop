import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { ProductSku } from '../product/entities/product-sku.entity';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(ProductSku)
    private skuRepository: Repository<ProductSku>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getList(userId: number) {
    const items = await this.cartRepository.find({ where: { user_id: userId } });

    if (items.length === 0) {
      return { list: [], total_amount: 0, checked_count: 0 };
    }

    // 批量查询商品和 SKU 信息
    const productIds = [...new Set(items.map((i) => i.product_id))];
    const skuIds = [...new Set(items.map((i) => i.sku_id))];
    const products = await this.productRepository.findBy({ id: In(productIds) });
    const skus = await this.skuRepository.findBy({ id: In(skuIds) });
    const productMap = new Map(products.map((p) => [p.id, p]));
    const skuMap = new Map(skus.map((s) => [s.id, s]));

    const list = items.map((item) => {
      const product = productMap.get(item.product_id);
      const sku = skuMap.get(item.sku_id);
      return {
        ...item,
        product_name: product?.name || '',
        sku_desc: sku?.spec_value || '',
        cover_image: product?.cover_image || '',
        stock: sku?.stock || 0,
      };
    });

    const checkedItems = list.filter((i) => i.checked === 1);
    const totalAmount = checkedItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

    return {
      list,
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

    // 查询 SKU 获取价格
    const sku = await this.skuRepository.findOne({ where: { id: sku_id } });
    if (!sku) {
      throw new BadRequestException('SKU 不存在');
    }

    const cart = this.cartRepository.create({
      user_id: userId,
      product_id,
      sku_id,
      price: sku.price,
      quantity,
    });
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
