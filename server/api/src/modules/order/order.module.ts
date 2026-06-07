import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductSku } from '../product/entities/product-sku.entity';
import { Product } from '../product/entities/product.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { UserCoupon } from '../coupon/entities/user-coupon.entity';
import { Address } from '../address/entities/address.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, ProductSku, Product, Cart, Coupon, UserCoupon, Address])],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
