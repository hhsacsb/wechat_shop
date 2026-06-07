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
import { AddressService } from './address.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/address')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('detail')
  getDetail(@Request() req, @Query('id') id: string) {
    return this.addressService.getDetail(req.user.userId, Number(id));
  }

  @Get('list')
  getList(@Request() req) {
    return this.addressService.getList(req.user.userId);
  }

  @Post('create')
  create(@Request() req, @Body() body: {
    consignee: string;
    mobile: string;
    province: string;
    city: string;
    district: string;
    detail_address: string;
    is_default?: number;
  }) {
    return this.addressService.create(req.user.userId, body);
  }

  @Put('update')
  update(@Request() req, @Body() body: {
    id: number;
    consignee: string;
    mobile: string;
    province: string;
    city: string;
    district: string;
    detail_address: string;
    is_default?: number;
  }) {
    const { id, ...data } = body;
    return this.addressService.update(req.user.userId, id, data);
  }

  @Delete('delete')
  delete(@Request() req, @Body() body: { id: number }) {
    return this.addressService.delete(req.user.userId, body.id);
  }
}
