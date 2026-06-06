import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AfterSale } from './entities/after-sale.entity';
import { AfterSaleController } from './after-sale.controller';
import { AfterSaleService } from './after-sale.service';

@Module({
  imports: [TypeOrmModule.forFeature([AfterSale])],
  controllers: [AfterSaleController],
  providers: [AfterSaleService],
  exports: [AfterSaleService],
})
export class AfterSaleModule {}
