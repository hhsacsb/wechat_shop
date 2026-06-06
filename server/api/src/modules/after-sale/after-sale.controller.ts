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
import { AfterSaleService } from './after-sale.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/after-sale')
export class AfterSaleController {
  constructor(private readonly afterSaleService: AfterSaleService) {}

  // ========== 用户端接口（需登录）==========

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  apply(
    @Request() req,
    @Body() body: {
      order_id: number;
      order_item_id?: number;
      type: string;
      reason: string;
      description?: string;
      images?: string[];
      amount: number;
    },
  ) {
    return this.afterSaleService.apply(req.user.userId, body);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  getUserList(@Request() req, @Query('page') page?: number, @Query('page_size') page_size?: number) {
    return this.afterSaleService.getUserList(req.user.userId, page, page_size);
  }

  @Get('detail')
  @UseGuards(JwtAuthGuard)
  getUserDetail(@Request() req, @Query('after_sale_id') afterSaleId: number) {
    return this.afterSaleService.getUserDetail(req.user.userId, afterSaleId);
  }

  // ========== 后台管理接口（无需JWT，后续可加admin guard）==========

  /** 后台：售后列表 */
  @Get('admin/list')
  getAdminList(@Query() query: { status?: number; page?: number; page_size?: number }) {
    return this.afterSaleService.getAdminList(query);
  }

  /** 后台：审核售后 */
  @Put('admin/review')
  adminReview(@Body() body: { id: number; status: number; remark?: string }) {
    return this.afterSaleService.adminReview(body.id, body);
  }

  /** 后台：售后详情 */
  @Get('admin/detail')
  getAdminDetail(@Query('id') id: number) {
    return this.afterSaleService.getAdminDetail(id);
  }
}
