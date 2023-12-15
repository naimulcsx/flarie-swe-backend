import { Test } from '@nestjs/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { CouponRedeemService } from './coupon-redeem.service';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Player } from '../entities/Player';
import { Reward } from '../entities/Reward';
import { PlayerCoupon } from '../entities/PlayerCoupon';
import { CouponRedeemDto } from '../dto/coupon-redeem.dto';
import { BadRequestException } from '@nestjs/common';

describe('CouponRedeemService', () => {
  let couponRedeemService: CouponRedeemService;
  let playerRepository: DeepMocked<Repository<Player>>;
  let rewardRepository: DeepMocked<Repository<Reward>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CouponRedeemService,
        { provide: DataSource, useValue: {} },
        {
          provide: getRepositoryToken(Player),
          useValue: createMock<Repository<Player>>(),
        },
        {
          provide: getRepositoryToken(Reward),
          useValue: createMock<Repository<Reward>>(),
        },
        {
          provide: getRepositoryToken(PlayerCoupon),
          useValue: createMock<Repository<PlayerCoupon>>(),
        },
      ],
    }).compile();
    couponRedeemService = module.get<CouponRedeemService>(CouponRedeemService);
    playerRepository = module.get(getRepositoryToken(Player));
    rewardRepository = module.get(getRepositoryToken(Reward));

    jest.useFakeTimers();
  });

  it('SHOULD be defined', () => {
    expect(couponRedeemService).toBeDefined();
  });

  describe('redeemCoupon', () => {
    it('SHOULD have a redeemCoupon method', () => {
      expect(typeof couponRedeemService.redeemCoupon).toBe('function');
    });

    it('SHOULD throw BadRequestException for invalid playerId', async () => {
      playerRepository.findOne.mockReturnValue(Promise.resolve(null));

      const invalidPlayerId = 999;
      const couponRedeemDto: CouponRedeemDto = {
        playerId: invalidPlayerId,
        rewardId: 1,
      };

      try {
        await couponRedeemService.redeemCoupon(couponRedeemDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('Invalid playerId');
      }
    });

    it('SHOULD throw BadRequestException for invalid rewardId', async () => {
      playerRepository.findOne.mockReturnValue(
        Promise.resolve({
          id: 1,
          name: 'Naimul Haque',
        }),
      );
      rewardRepository.findOne.mockReturnValue(Promise.resolve(null));

      const invalidRewardId = 999;
      const couponRedeemDto: CouponRedeemDto = {
        playerId: 1,
        rewardId: invalidRewardId,
      };
      try {
        await couponRedeemService.redeemCoupon(couponRedeemDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('Invalid rewardId');
      }
    });

    it('SHOULD throw BadRequestException when reward is expired', async () => {
      playerRepository.findOne.mockReturnValue(
        Promise.resolve({
          id: 1,
          name: 'Naimul Haque',
        }),
      );
      rewardRepository.findOne.mockReturnValue(
        Promise.resolve({
          id: 5,
          name: 'Apple Watch SE',
          startDate: new Date('2023-12-14'), // Dec 14, 2023
          endDate: new Date('2023-12-31'), // Dec 31, 2023
          perDayLimit: 1,
          totalLimit: 10,
        }),
      );

      jest.setSystemTime(new Date('2023-12-12T00:00:00Z'));
      expect(new Date().toISOString()).toBe('2023-12-12T00:00:00.000Z'); // Dec 12, 2023 (expired)

      const couponRedeemDto: CouponRedeemDto = {
        playerId: 1,
        rewardId: 5,
      };

      try {
        await couponRedeemService.redeemCoupon(couponRedeemDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('Reward expired');
      }
    });

    it('SHOULD throw BadRequestException when daily limit is exceeded', async () => {
      playerRepository.findOne.mockReturnValue(
        Promise.resolve({
          id: 1,
          name: 'Naimul Haque',
        }),
      );
      rewardRepository.findOne.mockReturnValue(
        Promise.resolve({
          id: 5,
          name: 'Apple Watch SE',
          startDate: new Date('2023-12-14'), // Dec 14, 2023
          endDate: new Date('2023-12-31'), // Dec 31, 2023
          perDayLimit: 1,
          totalLimit: 10,
        }),
      );

      jest
        .spyOn(couponRedeemService, 'exceedsPerDayLimit')
        .mockResolvedValue(Promise.resolve(true));

      jest.setSystemTime(new Date('2023-12-15T00:00:00Z'));
      expect(new Date().toISOString()).toBe('2023-12-15T00:00:00.000Z'); // Dec 15, 2023

      const couponRedeemDto: CouponRedeemDto = {
        playerId: 1,
        rewardId: 5,
      };
      try {
        await couponRedeemService.redeemCoupon(couponRedeemDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('Daily limit exceeded');
      }
    });

    it('SHOULD throw BadRequestException when total limit is exceeded', async () => {
      playerRepository.findOne.mockReturnValue(
        Promise.resolve({
          id: 1,
          name: 'Naimul Haque',
        }),
      );
      rewardRepository.findOne.mockReturnValue(
        Promise.resolve({
          id: 5,
          name: 'Apple Watch SE',
          startDate: new Date('2023-12-14'), // Dec 14, 2023
          endDate: new Date('2023-12-31'), // Dec 31, 2023
          perDayLimit: 1,
          totalLimit: 10,
        }),
      );

      jest
        .spyOn(couponRedeemService, 'exceedsPerDayLimit')
        .mockResolvedValue(Promise.resolve(false));

      jest
        .spyOn(couponRedeemService, 'exceedsTotalLimit')
        .mockResolvedValue(Promise.resolve(true));

      jest.setSystemTime(new Date('2023-12-15T00:00:00Z'));
      expect(new Date().toISOString()).toBe('2023-12-15T00:00:00.000Z'); // Dec 15, 2023

      const couponRedeemDto: CouponRedeemDto = {
        playerId: 1,
        rewardId: 5,
      };
      try {
        await couponRedeemService.redeemCoupon(couponRedeemDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('Total limit exceeded');
      }
    });

    it('SHOULD redeem a coupon when everything is OK', async () => {
      playerRepository.findOne.mockReturnValue(
        Promise.resolve({
          id: 1,
          name: 'Naimul Haque',
        }),
      );
      rewardRepository.findOne.mockReturnValue(
        Promise.resolve({
          id: 5,
          name: 'Apple Watch SE',
          startDate: new Date('2023-12-14'), // Dec 14, 2023
          endDate: new Date('2023-12-31'), // Dec 31, 2023
          perDayLimit: 1,
          totalLimit: 10,
        }),
      );

      jest
        .spyOn(couponRedeemService, 'exceedsPerDayLimit')
        .mockResolvedValue(Promise.resolve(false));

      jest
        .spyOn(couponRedeemService, 'exceedsTotalLimit')
        .mockResolvedValue(Promise.resolve(false));

      jest.spyOn(couponRedeemService, 'createCoupon').mockResolvedValue(
        Promise.resolve({
          id: 1,
          value: 'HHRsf89FMKk0frZyPt1Lk',
        }),
      );

      jest.setSystemTime(new Date('2023-12-15T00:00:00Z'));
      expect(new Date().toISOString()).toBe('2023-12-15T00:00:00.000Z'); // Dec 15, 2023

      const couponRedeemDto: CouponRedeemDto = {
        playerId: 1,
        rewardId: 5,
      };
      const couponRedeemResponse =
        await couponRedeemService.redeemCoupon(couponRedeemDto);
      expect(couponRedeemResponse).toStrictEqual({
        id: 1,
        value: 'HHRsf89FMKk0frZyPt1Lk',
      });
    });
  });

  describe('isExpired', () => {
    it('SHOULD return false for a reward with a future start date', () => {
      const reward: Reward = {
        id: 5,
        name: 'Apple Watch SE',
        startDate: new Date('2024-01-01'), // Dec 14, 2023
        endDate: new Date('2024-01-31'), // Dec 31, 2023
        perDayLimit: 2,
        totalLimit: 10,
      };
      jest.setSystemTime(new Date('2023-12-14T00:00:00Z')); // Dec 14, 2023
      expect(couponRedeemService.isExpired(reward)).toBe(true);
    });

    it('SHOULD return false for a reward with a past end date', () => {
      const reward: Reward = {
        id: 5,
        name: 'Apple Watch SE',
        startDate: new Date('2022-12-14'), // Dec 14, 2023
        endDate: new Date('2022-12-31'), // Dec 31, 2023
        perDayLimit: 1,
        totalLimit: 10,
      };
      jest.setSystemTime(new Date('2023-12-12T00:00:00Z')); // Dec 12, 2023
      expect(couponRedeemService.isExpired(reward)).toBe(true);
    });

    it('SHOULD return true for a reward with current date between the start date and end date', () => {
      const reward: Reward = {
        id: 5,
        name: 'Apple Watch SE',
        startDate: new Date('2023-12-14'), // Dec 14, 2023
        endDate: new Date('2023-12-31'), // Dec 31, 2023
        perDayLimit: 1,
        totalLimit: 10,
      };
      jest.setSystemTime(new Date('2023-12-15T00:00:00Z')); // Dec 15, 2023
      expect(couponRedeemService.isExpired(reward)).toBe(false);
    });
  });
});
