import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductSku } from './product-sku.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category_id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 255, nullable: true })
  subtitle: string;

  @Column({ length: 255 })
  cover_image: string;

  @Column({ type: 'text', nullable: true, comment: '商品图片列表(JSON数组)' })
  images: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  original_price: number;

  @Column({ type: 'int', default: 0 })
  sales_count: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ProductSku, (sku) => sku.product)
  skus: ProductSku[];
}
