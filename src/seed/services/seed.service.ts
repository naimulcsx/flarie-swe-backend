import { Injectable } from '@nestjs/common';
import { Player } from '../../coupon-redeem/entities/Player';
import { Reward } from '../../coupon-redeem/entities/Reward';
import { DataSource } from 'typeorm';
import { rewards as rewardsList } from '../data/rewards';
import { players as playersList } from '../data/players';
import { PlayerCoupon } from '../../coupon-redeem/entities/PlayerCoupon';
import { Coupon } from '../../coupon-redeem/entities/Coupon';

@Injectable()
export class SeedService {
  constructor(private readonly dataSource: DataSource) {}

  async reset() {
    const playerCoupons = await this.dataSource
      .getRepository(PlayerCoupon)
      .find();
    await this.dataSource.getRepository(PlayerCoupon).remove(playerCoupons);

    const coupons = await this.dataSource.getRepository(Coupon).find();
    await this.dataSource.getRepository(Coupon).remove(coupons);

    const players = await this.dataSource.getRepository(Player).find();
    await this.dataSource.getRepository(Player).remove(players);

    const rewards = await this.dataSource.getRepository(Reward).find();
    await this.dataSource.getRepository(Reward).remove(rewards);
  }

  async seed() {
    const playerRepository = this.dataSource.getRepository(Player);
    const players = playerRepository.create(playersList);
    await playerRepository.save(players);

    const rewardsRepository = this.dataSource.getRepository(Reward);
    const rewards = rewardsRepository.create(rewardsList);
    await rewardsRepository.save(rewards);
  }
}
