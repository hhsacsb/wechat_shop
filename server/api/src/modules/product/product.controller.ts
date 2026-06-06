import { Controller, Get, Post, Put, Delete, Body, Query, Inject, forwardRef } from '@nestjs/common';
import { ProductService } from './product.service';
import { CategoryService } from '../category/category.service';

@Controller('api/product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,
  ) {}

  @Get('home-list')
  getHomeData() {
    return this.productService.getHomeData();
  }

  @Get('list')
  getList(@Query() query: { category_id?: number; keyword?: string; sort?: string; page?: number; page_size?: number; status?: number }) {
    return this.productService.getList(query);
  }

  @Get('detail')
  getDetail(@Query('id') id: number) {
    return this.productService.getDetail(id);
  }

  @Get('search')
  search(@Query('keyword') keyword: string, @Query('page') page?: number, @Query('page_size') page_size?: number) {
    return this.productService.search(keyword, page, page_size);
  }

  /** 向后兼容：分类列表（小程序端使用） */
  @Get('category-list')
  getCategoryList() {
    return this.categoryService.getTree();
  }

  @Post('create')
  create(@Body() body: {
    category_id: number;
    name: string;
    subtitle?: string;
    cover_image: string;
    content?: string;
    price: number;
    original_price?: number;
    status?: number;
    sku_list?: { sku_code?: string; spec_value: string; price: number; stock: number; image?: string }[];
  }) {
    return this.productService.create(body);
  }

  @Put('update')
  update(@Body() body: {
    id: number;
    category_id?: number;
    name?: string;
    subtitle?: string;
    cover_image?: string;
    content?: string;
    price?: number;
    original_price?: number;
    status?: number;
    sku_list?: { id?: number; sku_code?: string; spec_value: string; price: number; stock: number; image?: string }[];
  }) {
    return this.productService.update(body);
  }

  @Delete('delete')
  delete(@Body() body: { id: number }) {
    return this.productService.delete(body.id);
  }

  @Put('toggle-status')
  toggleStatus(@Body() body: { id: number; status: number }) {
    return this.productService.toggleStatus(body.id, body.status);
  }
}
