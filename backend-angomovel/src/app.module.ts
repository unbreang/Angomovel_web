import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // 👈
import { APP_GUARD } from '@nestjs/core';                             // 👈
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReservasModule } from './reservas/reservas.module';
import { User } from './users/entities/user.entity';
import { Reserva } from './reservas/entities/reservas.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host:     config.get<string>('DB_HOST', 'localhost'),
        port:     config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'admin'),
        password: config.get<string>('DB_PASSWORD', 'password123'),
        database: config.get<string>('DB_NAME', 'angomovel'),
        entities: [User, Reserva],
        synchronize: true,
        logging: false,
      }),
    }),

    ThrottlerModule.forRoot([{  
      ttl: 60000,
      limit: 10,
    }]),

    AuthModule,
    UsersModule,
    ReservasModule,
  ],

  providers: [          
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}