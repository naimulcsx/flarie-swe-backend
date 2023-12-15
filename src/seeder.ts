import { DataSource } from 'typeorm';
import { Player } from './coupon-redeem/entities/Player';
import { Reward } from './coupon-redeem/entities/Reward';
import { PlayerCoupon } from './coupon-redeem/entities/PlayerCoupon';
import { Coupon } from './coupon-redeem/entities/Coupon';

export const SEEDER_TOKEN = 'SEEDER';

export class Seeder {
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

export const playersList: Player[] = [
  {
    id: 1,
    name: 'Naimul Haque',
  },
  {
    id: 2,
    name: 'John Doe',
  },
  {
    id: 3,
    name: 'Jane Smith',
  },
  {
    id: 4,
    name: 'Michael Johnson',
  },
  {
    id: 5,
    name: 'Emily Davis',
  },
];

export const rewardsList: Reward[] = [
  {
    id: 1,
    name: 'Nike Shoes',
    startDate: new Date('2023-02-01'), // Feb 01, 2023
    endDate: new Date('2023-03-01'), //  Mar 01, 2023
    perDayLimit: 5,
    totalLimit: 30,
  },
  {
    id: 2,
    name: 'Headphones',
    startDate: new Date('2023-04-01'), // Apr 01, 2023
    endDate: new Date('2023-04-07'), // Apr 07, 2023
    perDayLimit: 3,
    totalLimit: 10,
  },
  {
    id: 3,
    name: 'Gift Card',
    startDate: new Date('2023-05-01'), // May 01, 2023
    endDate: new Date('2023-05-07'), // May 07, 2023
    perDayLimit: 4,
    totalLimit: 20,
  },
  {
    id: 4,
    name: 'Airline Ticket',
    startDate: new Date('2023-12-07'), // Dec 07, 2023
    endDate: new Date('2023-12-31'), // Dec 21, 2023
    perDayLimit: 14,
    totalLimit: 14,
  },
  {
    id: 5,
    name: 'Apple Watch SE',
    startDate: new Date('2023-12-14'), // Dec 14, 2023
    endDate: new Date('2023-12-31'), // Dec 31, 2023
    perDayLimit: 3,
    totalLimit: 10,
  },
];
