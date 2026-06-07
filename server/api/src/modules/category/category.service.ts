import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  /** 获取分类树（小程序用，只返回启用状态） */
  async getTree() {
    const categories = await this.categoryRepository.find({
      where: { status: 1 },
      order: { sort: 'ASC' },
    });

    const parentCategories = categories.filter((c) => c.parent_id === 0);
    return parentCategories.map((parent) => ({
      id: parent.id,
      parent_id: parent.parent_id,
      name: parent.name,
      icon: parent.icon,
      sort: parent.sort,
      status: parent.status,
      children: categories
        .filter((child) => child.parent_id === parent.id)
        .map((child) => ({ id: child.id, name: child.name, icon: child.icon })),
    }));
  }

  /** 获取所有分类列表（后台管理用） */
  async getList(params: { status?: number }) {
    let where: any = {};
    if (params.status !== undefined && params.status !== null) {
      where = { ...where, status: params.status };
    }

    const list = await this.categoryRepository.find({
      where,
      order: { sort: 'ASC', id: 'ASC' },
    });
    return list;
  }

  /** 新增分类 */
  async create(data: { parent_id?: number; name: string; icon?: string; sort?: number; status?: number }) {
    const category = this.categoryRepository.create({
      parent_id: data.parent_id ?? 0,
      name: data.name,
      icon: data.icon ?? '',
      sort: data.sort ?? 0,
      status: data.status ?? 1,
    });
    await this.categoryRepository.save(category);
    return { id: category.id, message: '创建成功' };
  }

  /** 编辑分类 */
  async update(data: { id: number; name?: string; icon?: string; sort?: number; status?: number }) {
    const { id, ...updateData } = data;
    const existing = await this.categoryRepository.findOne({ where: { id } });
    if (!existing) throw new Error('分类不存在');

    await this.categoryRepository.update({ id }, updateData);
    return { message: '更新成功' };
  }

  /** 删除分类（同时删除子分类） */
  async delete(id: number) {
    // 先检查是否有子分类
    const children = await this.categoryRepository.find({ where: { parent_id: id } });
    if (children.length > 0) {
      await this.categoryRepository.delete(children.map((c) => c.id));
    }
    await this.categoryRepository.delete({ id });
    return { message: '删除成功' };
  }
}
