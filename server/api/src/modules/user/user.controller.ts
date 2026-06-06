import { Controller, Get, Put, Body, Query, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ========== 用户端接口（需登录）==========

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.userService.findOne(req.user.userId);
    if (!user) throw new Error('用户不存在');
    return {
      user_id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      mobile: user.mobile,
      member_level: '普通会员',
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() data: { nickname?: string; avatar?: string; mobile?: string }) {
    const user = await this.userService.update(req.user.userId, data);
    if (!user) throw new Error('用户不存在');
    return {
      user_id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      mobile: user.mobile,
    };
  }

  // ========== 后台管理接口 ==========

  /** 后台：用户列表 */
  @Get('admin/list')
  getAdminList(@Query() query: { keyword?: string; status?: number; page?: number; page_size?: number }) {
    return this.userService.getAdminList(query);
  }

  /** 后台：更新用户状态 */
  @Put('admin/status')
  updateUserStatus(@Body() body: { id: number; status: number }) {
    return this.userService.updateUserStatus(body.id, body.status);
  }
}
