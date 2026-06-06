import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/coupon')
@UseGuards(JwtAuthGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get('list')
  getList(@Request() req) {
    return this.couponService.getList(req.user.userId);
  }
}
