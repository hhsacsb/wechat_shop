import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('list')
  getList(@Request() req) {
    return this.cartService.getList(req.user.userId);
  }

  @Post('add')
  addItem(
    @Request() req,
    @Body() body: { product_id: number; sku_id: number; quantity: number },
  ) {
    return this.cartService.addItem(req.user.userId, body.product_id, body.sku_id, body.quantity);
  }

  @Put('update')
  updateItem(
    @Request() req,
    @Body() body: { cart_id: number; quantity?: number; checked?: number },
  ) {
    return this.cartService.updateItem(req.user.userId, body.cart_id, body);
  }

  @Delete('delete')
  deleteItems(@Request() req, @Body() body: { cart_ids: number[] }) {
    return this.cartService.deleteItems(req.user.userId, body.cart_ids);
  }
}
