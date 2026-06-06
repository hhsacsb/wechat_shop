import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/user')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('wx-login')
  async wxLogin(
    @Body() body: { code: string; nickname?: string; avatar?: string },
  ) {
    return this.authService.wxLogin(body.code, body.nickname, body.avatar);
  }
}
