import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductSku } from './entities/product-sku.entity';
import { BannerService } from '../banner/banner.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductSku)
    private skuRepository: Repository<ProductSku>,
    private bannerService: BannerService,
  ) {}

  async getHomeData() {
    // 从数据库获取已上架的轮播图
    const banners = await this.bannerService.getActiveList();

    const hotProducts = await this.productRepository.find({
      where: { status: 1 },
      order: { sales_count: 'DESC' },
      take: 10,
    });

    const newProducts = await this.productRepository.find({
      where: { status: 1 },
      order: { created_at: 'DESC' },
      take: 10,
    });

    return {
      banners,
      hot_products: hotProducts.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        cover_image: p.cover_image,
      })),
      new_products: newProducts.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        cover_image: p.cover_image,
      })),
    };
  }

  async getList(params: { category_id?: number; keyword?: string; sort?: string; page?: number; page_size?: number; status?: number }) {
    const { category_id, keyword, sort, page = 1, page_size = 10, status } = params;
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (status !== undefined && status !== null) {
      queryBuilder.where('product.status = :status', { status });
    }

    if (category_id) {
      queryBuilder.andWhere('product.category_id = :category_id', { category_id });
    }
    if (keyword) {
      queryBuilder.andWhere('product.name LIKE :keyword', { keyword: `%${keyword}%` });
    }

    if (sort === 'price_asc') {
      queryBuilder.orderBy('product.price', 'ASC');
    } else if (sort === 'price_desc') {
      queryBuilder.orderBy('product.price', 'DESC');
    } else if (sort === 'sales') {
      queryBuilder.orderBy('product.sales_count', 'DESC');
    } else {
      queryBuilder.orderBy('product.created_at', 'DESC');
    }

    const [list, total] = await queryBuilder
      .skip((page - 1) * page_size)
      .take(page_size)
      .getManyAndCount();

    return {
      list: list.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        original_price: p.original_price,
        sales_count: p.sales_count,
        cover_image: p.cover_image,
        status: p.status,
      })),
      page,
      page_size,
      total,
      has_more: total > page * page_size,
    };
  }

  async getDetail(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new Error('商品不存在');
    }

    const skus = await this.skuRepository.find({ where: { product_id: id } });

    // 解析 images JSON，如果没有则用 cover_image 作为默认图
    let imageList: string[] = [];
    if (product.images) {
      try {
        const parsed = JSON.parse(product.images);
        imageList = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        imageList = [];
      }
    }
    if (imageList.length === 0 && product.cover_image) {
      imageList = [product.cover_image];
    }

    return {
      id: product.id,
      category_id: product.category_id,
      name: product.name,
      subtitle: product.subtitle,
      price: product.price,
      original_price: product.original_price,
      stock: skus.reduce((sum, sku) => sum + sku.stock, 0),
      sales_count: product.sales_count,
      cover_image: product.cover_image,
      images: imageList,
      content: product.content,
      skus: skus.map((sku) => ({
        id: sku.id,
        sku_code: sku.sku_code,
        spec_value: sku.spec_value,
        price: sku.price,
        stock: sku.stock,
        image: sku.image || '',
      })),
    };
  }

  async search(keyword: string, page = 1, page_size = 10) {
    return this.getList({ keyword, page, page_size });
  }

  async create(data: {
    category_id: number;
    name: string;
    subtitle?: string;
    cover_image: string;
    content?: string;
    price: number;
    original_price?: number;
    status?: number;
    images?: string;
    sku_list?: { sku_code?: string; spec_value: string; price: number; stock: number; image?: string }[];
  }) {
    const product = this.productRepository.create({
      category_id: data.category_id,
      name: data.name,
      subtitle: data.subtitle || '',
      cover_image: data.cover_image,
      content: data.content || '',
      price: data.price,
      original_price: data.original_price || data.price,
      status: data.status ?? 1,
      sales_count: 0,
      images: data.images ? JSON.stringify(data.images) : undefined,
    });

    const savedProduct = await this.productRepository.save(product);

    if (data.sku_list && data.sku_list.length > 0) {
      const skus = data.sku_list.map((sku) =>
        this.skuRepository.create({
          product_id: (savedProduct as any).id || savedProduct[0]?.id,
          sku_code: sku.sku_code || '',
          spec_value: sku.spec_value,
          price: sku.price,
          stock: sku.stock,
          image: sku.image || '',
        }),
      );
      await this.skuRepository.save(skus);
    }

    return { id: (savedProduct as any).id || savedProduct[0]?.id, message: '商品创建成功' };
  }

  async update(data: {
    id: number;
    category_id?: number;
    name?: string;
    subtitle?: string;
    cover_image?: string;
    content?: string;
    price?: number;
    original_price?: number;
    status?: number;
    images?: string;
    sku_list?: { id?: number; sku_code?: string; spec_value: string; price: number; stock: number; image?: string }[];
  }) {
    const { id, sku_list, ...productData } = data;

    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new Error('商品不存在');
    }

    // 如果传了 images，转为 JSON 字符串存储
    if (data.images !== undefined) {
      (productData as any).images = data.images ? JSON.stringify(data.images) : undefined;
    }

    await this.productRepository.update({ id }, productData);

    if (sku_list) {
      const existingSkus = await this.skuRepository.find({ where: { product_id: id } });
      const existingIds = existingSkus.map((s) => s.id);
      const updateIds = sku_list.filter((s) => s.id).map((s) => s.id!);

      const toDelete = existingIds.filter((eid) => !updateIds.includes(eid));
      if (toDelete.length > 0) {
        await this.skuRepository.delete(toDelete);
      }

      for (const sku of sku_list) {
        if (sku.id && existingIds.includes(sku.id)) {
          await this.skuRepository.update(
            { id: sku.id },
            {
              sku_code: sku.sku_code || '',
              spec_value: sku.spec_value,
              price: sku.price,
              stock: sku.stock,
              image: sku.image || '',
            },
          );
        } else {
          await this.skuRepository.save(
            this.skuRepository.create({
              product_id: id,
              sku_code: sku.sku_code || '',
              spec_value: sku.spec_value,
              price: sku.price,
              stock: sku.stock,
              image: sku.image || '',
            }),
          );
        }
      }
    }

    return { message: '商品更新成功' };
  }

  async delete(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new Error('商品不存在');
    }

    await this.skuRepository.delete({ product_id: id });
    await this.productRepository.delete({ id });

    return { message: '商品删除成功' };
  }

  async toggleStatus(id: number, status: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new Error('商品不存在');
    }

    await this.productRepository.update({ id }, { status });

    return { message: '状态更新成功' };
  }
}
