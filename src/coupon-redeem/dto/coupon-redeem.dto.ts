import { IsNumber } from 'class-validator';

export class CouponRedeemDto {
  @IsNumber()
  playerId: number;

  @IsNumber()
  rewardId: number;
}
