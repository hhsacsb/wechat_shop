import { Controller, Get, Post, Put, Delete, Body, Query } from '@nestjs/common';
import { BannerService } from './banner.service';

@Controller('api/banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  /** 小程序端：获取已上架轮播图 */
  @Get('active')
  getActiveList() {
    return this.bannerService.getActiveList();
  }

  /** 管理端：获取全部轮播图 */
  @Get('list')
  getList() {
    return this.bannerService.getList();
  }

  /** 获取单条详情 */
  @Get('detail')
  getDetail(@Query('id') id: number) {
    return this.bannerService.getDetail(id);
  }

  /** 创建轮播图 */
  @Post('create')
  create(@Body() body: any) {
    return this.bannerService.create(body);
  }

  /** 更新轮播图 */
  @Put('update')
  update(@Body() body: any) {
    return this.bannerService.update(body);
  }

  /** 删除轮播图 */
  @Delete('delete')
  delete(@Body() body: { id: number }) {
    return this.bannerService.delete(body.id);
  }

  /** 切换上下架 */
  @Put('toggle-status')
  toggleStatus(@Body() body: { id: number; status: number }) {
    return this.bannerService.toggleStatus(body.id, body.status);
  }
}
