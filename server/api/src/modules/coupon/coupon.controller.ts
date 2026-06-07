import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  // ========== 后台管理接口 ==========

  /** 后台：分页列表 */
  @Get('admin/list')
  getAdminList(@Query() query: { page?: number; page_size?: number; status?: number }) {
    return this.couponService.getAdminList(query);
  }

  /** 后台：详情 */
  @Get('admin/detail')
  getAdminDetail(@Query('id') id: number) {
    return this.couponService.getDetail(id);
  }

  /** 后台：创建 */
  @Post('admin/create')
  create(@Body() body: {
    name: string;
    type: number;
    amount: number;
    min_amount: number;
    start_time: string;
    end_time: string;
    total_count: number;
    status?: number;
  }) {
    return this.couponService.create(body);
  }

  /** 后台：更新 */
  @Put('admin/update')
  update(@Body() body: {
    id: number;
    name?: string;
    type?: number;
    amount?: number;
    min_amount?: number;
    start_time?: string;
    end_time?: string;
    total_count?: number;
    status?: number;
  }) {
    const { id, ...data } = body;
    return this.couponService.update(id, data);
  }

  /** 后台：删除 */
  @Delete('admin/delete')
  delete(@Body() body: { id: number }) {
    return this.couponService.delete(body.id);
  }

  // ========== 用户端接口（需登录）==========

  /** 获取待领取的优惠券列表 */
  @Get('available')
  @UseGuards(JwtAuthGuard)
  getAvailableList(@Request() req) {
    return this.couponService.getAvailableList(req.user.userId);
  }

  /** 领取优惠券 */
  @Post('claim')
  @UseGuards(JwtAuthGuard)
  claim(@Request() req, @Body() body: { coupon_id: number }) {
    return this.couponService.claim(req.user.userId, body.coupon_id);
  }

  /** 获取我的优惠券（已领取的） */
  @Get('user/list')
  @UseGuards(JwtAuthGuard)
  getUserCoupons(@Request() req) {
    return this.couponService.getUserCoupons(req.user.userId);
  }

  /** 获取可用于订单的优惠券 */
  @Get('usable')
  @UseGuards(JwtAuthGuard)
  getUsableCoupons(@Request() req, @Query('total_amount') totalAmount: number) {
    return this.couponService.getUsableCoupons(req.user.userId, totalAmount);
  }

  /** 计算优惠券折扣 */
  @Get('calculate')
  @UseGuards(JwtAuthGuard)
  calculateDiscount(
    @Request() req,
    @Query('user_coupon_id') userCouponId: number,
    @Query('total_amount') totalAmount: number,
  ) {
    return this.couponService.calculateDiscount(req.user.userId, userCouponId, totalAmount);
  }

  // ========== 原有接口（兼容） ==========

  @Get('list')
  @UseGuards(JwtAuthGuard)
  getList(@Request() req) {
    return this.couponService.getList(req.user.userId);
  }
}