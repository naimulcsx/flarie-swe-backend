import { Module } from '@nestjs/common';
import { CouponRedeemController } from './controllers/coupon-redeem.controller';
import { CouponRedeemService } from './providers/coupon-redeem.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './entities/Player';
import { Coupon } from './entities/Coupon';
import { Reward } from './entities/Reward';
import { PlayerCoupon } from './entities/PlayerCoupon';

@Module({
  imports: [TypeOrmModule.forFeature([Player, Coupon, PlayerCoupon, Reward])],
  controllers: [CouponRedeemController],
  providers: [CouponRedeemService],
})
export class CouponRedeemModule {}
