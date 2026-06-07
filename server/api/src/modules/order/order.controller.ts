import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ========== 用户端接口（需登录）==========

  @Post('preview')
  @UseGuards(JwtAuthGuard)
  preview(@Request() req, @Body() body: { source: string; cart_ids?: number[]; coupon_id?: number; address_id?: number }) {
    return this.orderService.preview(req.user.userId, body);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  createOrder(@Request() req, @Body() body: {
    source: string;
    address_id: number;
    coupon_id?: number;
    user_coupon_id?: number;
    remark?: string;
    cart_ids?: number[];
    product_id?: number;
    sku_id?: number;
    quantity?: number;
  }) {
    return this.orderService.createOrder(req.user.userId, body);
  }

  @Post('pay')
  @UseGuards(JwtAuthGuard)
  pay(@Body() body: { order_id: number }) {
    return this.orderService.pay(body.order_id);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  getUserList(@Request() req, @Query() query: { status?: number; page?: number; page_size?: number }) {
    return this.orderService.getUserList(req.user.userId, query);
  }

  @Get('detail')
  @UseGuards(JwtAuthGuard)
  getUserDetail(@Request() req, @Query('order_id') orderId: number) {
    return this.orderService.getUserDetail(req.user.userId, orderId);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  cancelOrder(@Request() req, @Body() body: { order_id: number }) {
    return this.orderService.cancelOrder(req.user.userId, body.order_id);
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  confirmReceipt(@Request() req, @Body() body: { order_id: number }) {
    return this.orderService.confirmReceipt(req.user.userId, body.order_id);
  }

  // ========== 后台管理接口 ==========

  /** 后台：订单列表（全部） */
  @Get('admin/list')
  getAdminList(@Query() query: { status?: number; keyword?: string; page?: number; page_size?: number }) {
    return this.orderService.getAdminList(query);
  }

  /** 后台：订单详情 */
  @Get('admin/detail')
  getAdminDetail(@Query('order_id') orderId: number) {
    return this.orderService.getAdminDetail(orderId);
  }

  /** 后台：发货 */
  @Put('admin/ship')
  shipOrder(@Body() body: { order_id: number; express_company?: string; express_no?: string }) {
    return this.orderService.shipOrder(body.order_id, body);
  }

  /** 后台：取消订单 */
  @Put('admin/cancel')
  adminCancelOrder(@Body() body: { order_id: number }) {
    return this.orderService.adminCancelOrder(body.order_id);
  }

  /** 后台：订单统计概览 */
  @Get('admin/stats')
  getStats() {
    return this.orderService.getStats();
  }
}
