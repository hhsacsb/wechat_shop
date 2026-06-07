import { Controller, Get, Post, Put, Delete, Body, Query } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('api/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /** 获取分类树（小程序用） */
  @Get('tree')
  getTree() {
    return this.categoryService.getTree();
  }

  /** 获取所有分类列表（后台管理用） */
  @Get('list')
  getList(@Query() query: { status?: number }) {
    return this.categoryService.getList(query);
  }

  /** 新增分类 */
  @Post('create')
  create(@Body() body: { parent_id?: number; name: string; icon?: string; sort?: number; status?: number }) {
    return this.categoryService.create(body);
  }

  /** 编辑分类 */
  @Put('update')
  update(@Body() body: { id: number; name?: string; icon?: string; sort?: number; status?: number }) {
    return this.categoryService.update(body);
  }

  /** 删除分类 */
  @Delete('delete')
  delete(@Body() body: { id: number }) {
    return this.categoryService.delete(body.id);
  }
}
