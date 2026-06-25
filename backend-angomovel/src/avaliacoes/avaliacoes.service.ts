import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Avaliacao } from './entities/avaliacao.entity';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AvaliacoesService {

  constructor(
    @InjectRepository(Avaliacao)
    private readonly avaliacaoRepo: Repository<Avaliacao>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ── Criar avaliação ──
  async criar(userId: string, dto: CreateAvaliacaoDto): Promise<Avaliacao> {

    // Verificar se já avaliou este destino
    const jaAvaliou = await this.avaliacaoRepo.findOne({
      where: { destino_id: dto.destino_id, utilizador_id: userId },
    });

    if (jaAvaliou) {
      throw new ConflictException('Já avaliaste este destino. Podes editar a tua avaliação.');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilizador não encontrado');

    const avaliacao = this.avaliacaoRepo.create({
      destino_id:       dto.destino_id,
      destino_nome:     dto.destino_nome,
      utilizador_id:    userId,
      utilizador_nome:  user.nome,
      nota:             dto.nota,
      comentario:       dto.comentario,
    });

    return this.avaliacaoRepo.save(avaliacao);
  }

  // ── Listar avaliações de um destino ──
  async listarPorDestino(destinoId: string): Promise<{
    avaliacoes: Avaliacao[];
    media: number;
    total: number;
  }> {
    const avaliacoes = await this.avaliacaoRepo.find({
      where: { destino_id: destinoId },
      order: { criado_em: 'DESC' },
    });

    const media = avaliacoes.length
      ? parseFloat((avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length).toFixed(1))
      : 0;

    return { avaliacoes, media, total: avaliacoes.length };
  }

  // ── Avaliações do utilizador ──
  async listarPorUtilizador(userId: string): Promise<Avaliacao[]> {
    return this.avaliacaoRepo.find({
      where: { utilizador_id: userId },
      order: { criado_em: 'DESC' },
    });
  }

  // ── Editar avaliação ──
  async editar(id: string, userId: string, dados: Partial<CreateAvaliacaoDto>): Promise<Avaliacao> {
    const avaliacao = await this.avaliacaoRepo.findOne({ where: { id } });
    if (!avaliacao) throw new NotFoundException('Avaliação não encontrada');
    if (avaliacao.utilizador_id !== userId) throw new NotFoundException('Não tens permissão');

    Object.assign(avaliacao, dados);
    return this.avaliacaoRepo.save(avaliacao);
  }

  // ── Remover avaliação ──
  async remover(id: string, userId: string): Promise<{ mensagem: string }> {
    const avaliacao = await this.avaliacaoRepo.findOne({ where: { id } });
    if (!avaliacao) throw new NotFoundException('Avaliação não encontrada');
    if (avaliacao.utilizador_id !== userId) throw new NotFoundException('Não tens permissão');

    await this.avaliacaoRepo.remove(avaliacao);
    return { mensagem: 'Avaliação removida com sucesso' };
  }

  // ── Marcar como útil ──
  async marcarUtil(id: string): Promise<Avaliacao> {
    const avaliacao = await this.avaliacaoRepo.findOne({ where: { id } });
    if (!avaliacao) throw new NotFoundException('Avaliação não encontrada');

    avaliacao.util += 1;
    return this.avaliacaoRepo.save(avaliacao);
  }

  // ── Últimas avaliações (para o admin) ──
  async listarTodas(): Promise<Avaliacao[]> {
    return this.avaliacaoRepo.find({
      order: { criado_em: 'DESC' },
      take: 50,
    });
  }
}