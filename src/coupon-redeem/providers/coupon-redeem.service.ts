import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Player } from '../entities/Player';
import { Reward } from '../entities/Reward';
import { CouponRedeemDto } from '../dto/coupon-redeem.dto';
import { Coupon } from '../entities/Coupon';
import { PlayerCoupon } from '../entities/PlayerCoupon';
import { nanoid } from 'nanoid';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

@Injectable()
export class CouponRedeemService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(PlayerCoupon)
    private readonly playerCouponRepository: Repository<PlayerCoupon>,
  ) {}

  async redeemCoupon(couponRedeemDto: CouponRedeemDto) {
    const player = await this.playerRepository.findOne({
      where: { id: couponRedeemDto.playerId },
    });
    if (!player) {
      throw new BadRequestException('Invalid playerId');
    }
    const reward = await this.rewardRepository.findOne({
      where: { id: couponRedeemDto.rewardId },
    });
    if (!reward) {
      throw new BadRequestException('Invalid rewardId');
    }

    // Checks if the reward is expired (campaign ended)
    if (this.isExpired(reward)) {
      throw new BadRequestException('Reward expired');
    }

    // Checks if the player exceeds the daily limit of the Reward
    const exceedsPerDayLimit = await this.exceedsPerDayLimit(player.id, reward);
    if (exceedsPerDayLimit) {
      throw new BadRequestException('Daily limit exceeded');
    }

    // Checks if the player exceeds the total limit of the Reward
    const exceedsTotalLimit = await this.exceedsTotalLimit(player.id, reward);
    if (exceedsTotalLimit) {
      throw new BadRequestException('Total limit exceeded');
    }

    // Create the coupon
    const coupon = await this.createCoupon({ player, reward });

    return coupon;
  }

  /**
   * Check if a reward is expired or not
   * @param reward The reward object
   * @param date The date to check against
   */
  isExpired(reward: Reward, date = new Date()) {
    return date < reward.startDate || date > reward.endDate;
  }

  /**
   * Checks if playerId exceeded his daily limit of reward
   * @param playerId the id of the player
   * @param reward the reward object
   */
  async exceedsPerDayLimit(playerId: number, reward: Reward) {
    const results = await this.playerCouponRepository
      .createQueryBuilder('pc')
      .where(`DATE(pc.redeemedAt) = :date`, {
        date: dayjs.utc().format('YYYY-MM-DD'),
      })
      .andWhere('pc.playerId = :playerId', { playerId })
      .getCount();
    if (results === reward.perDayLimit) {
      return true;
    }
    return false;
  }

  /**
   * Checks if playerId exceeded total limit of a reward
   * @param playerId the id of the player
   * @param reward the reward object
   */
  async exceedsTotalLimit(playerId: number, reward: Reward) {
    const results = await this.playerCouponRepository
      .createQueryBuilder('pc')
      .where('pc.playerId = :playerId', { playerId })
      .getCount();
    if (results === reward.totalLimit) {
      return true;
    }
    return false;
  }

  /**
   * Creates Coupon and PlayerCoupon in a transaction
   */
  async createCoupon({ player, reward }: { player: Player; reward: Reward }) {
    let coupon = new Coupon();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      coupon = await queryRunner.manager.save(Coupon, {
        value: nanoid(),
        Reward: reward,
      });
      await queryRunner.manager.save(PlayerCoupon, {
        Coupon: coupon,
        Player: player,
      });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return {
      id: coupon.id,
      value: coupon.value,
    };
  }
}
