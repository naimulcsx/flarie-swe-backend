import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './../src/coupon-redeem/entities/Player';
import { Reward } from './../src/coupon-redeem/entities/Reward';
import { Coupon } from './../src/coupon-redeem/entities/Coupon';
import { PlayerCoupon } from './../src/coupon-redeem/entities/PlayerCoupon';
import { CouponRedeemModule } from './../src/coupon-redeem/coupon-redeem.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { Seeder } from '../src/seeder';

describe('Coupon Redeem (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: Seeder;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CouponRedeemModule,
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3308,
          username: 'root',
          password: 'password',
          database: 'player',
          entities: [Player, Reward, Coupon, PlayerCoupon],
          migrations: process.env.typeorm === 'true' ? ['migrations/*.ts'] : [],
          autoLoadEntities: true,
          synchronize: true,
          keepConnectionAlive: false,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    seeder = new Seeder(dataSource);
  });

  it('/coupon-redeem (POST) - SHOULD handle invalid playerId with a 400 Bad Request', async () => {
    await seeder.reset();
    await seeder.seed();

    const couponRedeemDto = {
      playerId: 999,
      rewardId: 1,
    };

    const response = await request(app.getHttpServer())
      .post('/coupon-redeem')
      .send(couponRedeemDto)
      .expect(400);

    expect(response.body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid playerId',
    });
  });

  it('/coupon-redeem (POST) - SHOULD handle invalid rewardId with a 400 Bad Request', async () => {
    await seeder.reset();
    await seeder.seed();

    const couponRedeemDto = {
      playerId: 1,
      rewardId: 999,
    };

    const response = await request(app.getHttpServer())
      .post('/coupon-redeem')
      .send(couponRedeemDto)
      .expect(400);

    expect(response.body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid rewardId',
    });
  });

  it('/coupon-redeem (POST) - SHOULD handle expired reward with a 400 Bad Request', async () => {
    await seeder.reset();
    await seeder.seed();

    const couponRedeemDto = {
      playerId: 1,
      rewardId: 1,
    };

    const response = await request(app.getHttpServer())
      .post('/coupon-redeem')
      .send(couponRedeemDto)
      .expect(400);

    expect(response.body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Reward expired',
    });
  });

  it('/coupon-redeem (POST) - SHOULD handle daily limit exceeded with a 400 Bad Request', async () => {
    await seeder.reset();
    await seeder.seed();

    const couponRedeemDto = {
      playerId: 1,
      rewardId: 5,
    };

    const REWARD_DAILY_LIMIT = 3;
    for (let i = 1; i <= REWARD_DAILY_LIMIT; i++) {
      const response = await request(app.getHttpServer())
        .post('/coupon-redeem')
        .send(couponRedeemDto)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('value');
    }

    const errorResponse = await request(app.getHttpServer())
      .post('/coupon-redeem')
      .send(couponRedeemDto)
      .expect(400);

    expect(errorResponse.body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Daily limit exceeded',
    });
  });

  it('/coupon-redeem (POST) - SHOULD handle total limit exceeded with a 400 Bad Request', async () => {
    await seeder.reset();
    await seeder.seed();

    const couponRedeemDto = {
      playerId: 1,
      rewardId: 4,
    };

    const REWARD_TOTAL_LIMIT = 14;
    for (let i = 1; i <= REWARD_TOTAL_LIMIT; i++) {
      const response = await request(app.getHttpServer())
        .post('/coupon-redeem')
        .send(couponRedeemDto)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('value');
    }

    const errorResponse = await request(app.getHttpServer())
      .post('/coupon-redeem')
      .send(couponRedeemDto)
      .expect(400);

    expect(errorResponse.body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Daily limit exceeded',
    });
  });

  it('/coupon-redeem (POST) - SHOULD successfully redeem a coupon', async () => {
    await seeder.reset();
    await seeder.seed();

    const couponRedeemDto = {
      playerId: 1,
      rewardId: 5,
    };

    const response = await request(app.getHttpServer())
      .post('/coupon-redeem')
      .send(couponRedeemDto)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('value');
  });

  afterAll(async () => {
    await app.close();
  });
});
