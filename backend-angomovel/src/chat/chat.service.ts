import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Mensagem } from './entities/mensagem.entity';

@Injectable()
export class ChatService {

  constructor(
    @InjectRepository(Mensagem)
    private readonly mensagemRepo: Repository<Mensagem>,
  ) {}

  // ── Guardar mensagem ──
  async guardarMensagem(dados: {
    reserva_id: string;
    remetente_id: string;
    remetente_nome: string;
    remetente_role: string;
    conteudo: string;
  }): Promise<Mensagem> {
    const mensagem = this.mensagemRepo.create(dados);
    return this.mensagemRepo.save(mensagem);
  }

  // ── Obter histórico de mensagens de uma reserva ──
  async obterMensagens(reserva_id: string): Promise<Mensagem[]> {
    return this.mensagemRepo.find({
      where: { reserva_id },
      order: { criado_em: 'ASC' },
    });
  }

  // ── Marcar mensagens como lidas ──
  async marcarComoLidas(reserva_id: string, user_id: string): Promise<void> {
    await this.mensagemRepo.update(
      { reserva_id, remetente_id: Not(user_id), lida: false },
      { lida: true },
    );
  }

  // ── Contar mensagens não lidas ──
  async contarNaoLidas(reserva_id: string, user_id: string): Promise<number> {
    return this.mensagemRepo.count({
      where: {
        reserva_id,
        remetente_id: Not(user_id),
        lida: false,
      },
    });
  }
}