import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve admin static files (built from server/admin) with SPA fallback
  const adminDistPath = join(__dirname, '..', '..', 'admin', 'dist');
  app.useStaticAssets(adminDistPath, {
    index: false,
  });

  // SPA fallback: non-API routes -> index.html
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/.')) {
      return next();
    }
    res.sendFile(join(adminDistPath, 'index.html'));
  });

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Global transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server running on http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
