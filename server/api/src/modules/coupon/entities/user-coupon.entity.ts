import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_coupon')
export class UserCoupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  coupon_id: number;

  /** 0=未使用 1=已使用 2=已过期 */
  @Column({ type: 'tinyint', default: 0 })
  status: number;

  @Column({ type: 'datetime', nullable: true })
  used_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}