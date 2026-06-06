import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('banner')
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  image_url: string;

  @Column({ length: 20, default: 'none' })
  link_type: string; // none(无跳转) | product(商品) | category(分类) | url(外部链接)

  @Column({ length: 255, nullable: true })
  link_value: string; // 根据 link_type 存储 id 或 url

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 0=下架 1=上架

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
