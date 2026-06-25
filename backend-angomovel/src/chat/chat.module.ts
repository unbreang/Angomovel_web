import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Mensagem } from './entities/mensagem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mensagem])],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}