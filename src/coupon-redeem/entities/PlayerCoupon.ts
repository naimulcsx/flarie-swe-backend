import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Player } from './Player';
import { Coupon } from './Coupon';

@Entity()
export class PlayerCoupon {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player)
  Player: Player;

  @ManyToOne(() => Coupon)
  Coupon: Coupon;

  @CreateDateColumn()
  redeemedAt: Date;
}
