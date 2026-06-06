import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async wxLogin(code: string, nickname?: string, avatar?: string) {
    // In production, use code to exchange openid via WeChat API
    // For now, simulate with a mock openid
    const openid = `mock_openid_${code}`;

    let user = await this.userService.findByOpenid(openid);
    const isNewUser = !user;

    if (!user) {
      user = await this.userService.create({
        openid,
        nickname: nickname || '微信用户',
        avatar: avatar || '',
      });
    }

    const payload = { userId: user.id, openid: user.openid };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user_id: user.id,
      openid: user.openid,
      is_new_user: isNewUser,
    };
  }
}
