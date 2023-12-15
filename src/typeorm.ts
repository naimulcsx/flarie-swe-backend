import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Player } from './coupon-redeem/entities/Player';
import { Reward } from './coupon-redeem/entities/Reward';
import { Coupon } from './coupon-redeem/entities/Coupon';
import { PlayerCoupon } from './coupon-redeem/entities/PlayerCoupon';

dotenvConfig({ path: '.env' });

const config = {
  type: 'mysql',
  host: `${process.env.TYPEORM_HOST}`,
  port: `${process.env.TYPEORM_PORT}`,
  username: `${process.env.TYPEORM_USERNAME}`,
  password: `${process.env.TYPEORM_PASSWORD}`,
  database: `${process.env.TYPEORM_DATABASE}`,
  entities: [Player, Reward, Coupon, PlayerCoupon],
  migrations: process.env.typeorm === 'true' ? ['migrations/*.ts'] : [],
  autoLoadEntities: true,
  synchronize: false,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
