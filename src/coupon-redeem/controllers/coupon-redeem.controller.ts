import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CouponRedeemDto } from '../dto/coupon-redeem.dto';
import { CouponRedeemService } from '../providers/coupon-redeem.service';

@Controller('/coupon-redeem')
export class CouponRedeemController {
  constructor(private readonly couponRedeemService: CouponRedeemService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async redeemCoupon(@Body() couponRedeemDto: CouponRedeemDto) {
    return this.couponRedeemService.redeemCoupon(couponRedeemDto);
  }
}
