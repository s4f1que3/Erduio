import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { INestApplication } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';


async function bootstrap() {

  const app: INestApplication = await NestFactory.create(AppModule);

    const corsOptions: CorsOptions = {
      origin: ['http://localhost:3001'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      allowedHeaders: 'Content-Type,Authorization'
    }
    app.enableCors(corsOptions)


    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true, 
      transform: true, 
      disableErrorMessages: true,
      validationError: {target: false, value: false},
      stopAtFirstError: true
    }))
    

    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "connect-src": ["'self'", "https://*.supabase.co"],
        }
      }
    }))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
