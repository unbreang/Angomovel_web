import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvaliacoesService } from './avaliacoes.service';
import { AvaliacoesController } from './avaliacoes.controller';
import { Avaliacao } from './entities/avaliacao.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Avaliacao, User])],
  controllers: [AvaliacoesController],
  providers: [AvaliacoesService],
  exports: [AvaliacoesService],
})
export class AvaliacoesModule {}