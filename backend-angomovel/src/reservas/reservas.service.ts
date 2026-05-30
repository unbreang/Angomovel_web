import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva, EstadoReserva } from './entities/reservas.entity';
import { User, EstadoGuia, UserRole } from '../users/entities/user.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';

@Injectable()
export class ReservasService {

  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepo: Repository<Reserva>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ── 1. Cliente cria reserva ──
  async criarReserva(clienteId: string, dto: CreateReservaDto): Promise<Reserva> {

    // Verificar se guia existe e está disponível
    const guia = await this.userRepo.findOne({
      where: { id: dto.guia_id, role: UserRole.GUIA },
    });

    if (!guia) throw new NotFoundException('Guia não encontrado');

    if (guia.estado_guia === EstadoGuia.INDISPONIVEL) {
      throw new BadRequestException('Este guia está indisponível de momento');
    }

    if (guia.estado_guia === EstadoGuia.INACTIVO || guia.estado_guia === EstadoGuia.PENDENTE) {
      throw new BadRequestException('Este guia não está activo na plataforma');
    }

    // Verificar cliente
    const cliente = await this.userRepo.findOne({ where: { id: clienteId } });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    // Calcular valor total
    const entrada = new Date(dto.data_entrada);
    const saida   = new Date(dto.data_saida);
    const dias    = Math.ceil((saida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));

    if (dias <= 0) throw new BadRequestException('Data de saída deve ser posterior à entrada');

    const valorTotal = (guia.preco_por_dia || 0) * dias;

    // Criar reserva
    const reserva = this.reservaRepo.create({
      cliente_id:       clienteId,
      cliente_nome:     cliente.nome,
      cliente_email:    cliente.email,
      cliente_telefone: cliente.telefone,
      guia_id:          dto.guia_id,
      guia_nome:        guia.nome,
      guia_email:       guia.email,
      data_entrada:     entrada,
      data_saida:       saida,
      num_pessoas:      dto.num_pessoas || 1,
      rotas:            dto.rotas || [],
      observacoes:      dto.observacoes,
      metodo_pagamento: dto.metodo_pagamento,
      valor_total:      valorTotal,
      estado:           EstadoReserva.PENDENTE,
    });

    return this.reservaRepo.save(reserva);
  }

  // ── 2. Guia aceita reserva ──
  async aceitarReserva(reservaId: string, guiaId: string): Promise<Reserva> {
    const reserva = await this.encontrarReserva(reservaId);

    if (reserva.guia_id !== guiaId) throw new ForbiddenException('Não tens permissão');
    if (reserva.estado !== EstadoReserva.PENDENTE) throw new BadRequestException('Reserva já foi processada');

    // Actualizar estado da reserva
    reserva.estado = EstadoReserva.ACEITE;
    await this.reservaRepo.save(reserva);

    // Marcar guia como indisponível
    await this.userRepo.update(guiaId, { estado_guia: EstadoGuia.INDISPONIVEL });

    return reserva;
  }

  // ── 3. Guia recusa reserva ──
  async recusarReserva(reservaId: string, guiaId: string, motivo?: string): Promise<Reserva> {
    const reserva = await this.encontrarReserva(reservaId);

    if (reserva.guia_id !== guiaId) throw new ForbiddenException('Não tens permissão');
    if (reserva.estado !== EstadoReserva.PENDENTE) throw new BadRequestException('Reserva já foi processada');

    reserva.estado        = EstadoReserva.RECUSADA;
    reserva.motivo_recusa = motivo || 'Guia indisponível';

    return this.reservaRepo.save(reserva);
  }

  // ── 4. Iniciar actividade ──
  async iniciarActividade(reservaId: string, guiaId: string): Promise<Reserva> {
    const reserva = await this.encontrarReserva(reservaId);

    if (reserva.guia_id !== guiaId) throw new ForbiddenException('Não tens permissão');
    if (reserva.estado !== EstadoReserva.ACEITE) throw new BadRequestException('Reserva não está aceite');

    reserva.estado = EstadoReserva.EM_CURSO;
    await this.reservaRepo.save(reserva);

    await this.userRepo.update(guiaId, { estado_guia: EstadoGuia.INDISPONIVEL });

    return reserva;
  }

  // ── 5. Concluir actividade ──
  async concluirActividade(reservaId: string, guiaId: string): Promise<Reserva> {
    const reserva = await this.encontrarReserva(reservaId);

    if (reserva.guia_id !== guiaId) throw new ForbiddenException('Não tens permissão');
    if (reserva.estado !== EstadoReserva.EM_CURSO) throw new BadRequestException('Actividade não está em curso');

    reserva.estado = EstadoReserva.CONCLUIDA;
    await this.reservaRepo.save(reserva);

    // Guia volta a disponível
    await this.userRepo.update(guiaId, { estado_guia: EstadoGuia.DISPONIVEL });

    return reserva;
  }

  // ── 6. Cliente cancela reserva ──
async cancelarReserva(reservaId: string, clienteId: string): Promise<Reserva> {
    const reserva = await this.encontrarReserva(reservaId);

    if (reserva.cliente_id !== clienteId) throw new ForbiddenException('Não tens permissão');

    if ([EstadoReserva.EM_CURSO, EstadoReserva.CONCLUIDA].includes(reserva.estado)) {
      throw new BadRequestException('Não é possível cancelar uma reserva em curso ou concluída');
    }

    // Guardar estado anterior antes de alterar
    const estadoAnterior = reserva.estado;
    reserva.estado = EstadoReserva.CANCELADA;

    // Se estava aceite, libertar o guia
    if (estadoAnterior === EstadoReserva.ACEITE) {
      await this.userRepo.update(reserva.guia_id, { estado_guia: EstadoGuia.DISPONIVEL });
    }

    return this.reservaRepo.save(reserva);
}

  // ── 7. Avaliar guia após conclusão ──
  async avaliarGuia(reservaId: string, clienteId: string, avaliacao: number, comentario?: string): Promise<Reserva> {
    const reserva = await this.encontrarReserva(reservaId);

    if (reserva.cliente_id !== clienteId) throw new ForbiddenException('Não tens permissão');
    if (reserva.estado !== EstadoReserva.CONCLUIDA) throw new BadRequestException('Só podes avaliar após conclusão');
    if (reserva.avaliacao) throw new BadRequestException('Já avaliaste esta reserva');

    reserva.avaliacao   = avaliacao;
    reserva.comentario  = comentario || '';
    await this.reservaRepo.save(reserva);

    // Actualizar média do guia
    const reservasGuia = await this.reservaRepo.find({
      where: { guia_id: reserva.guia_id, estado: EstadoReserva.CONCLUIDA },
    });

    const avaliacoes  = reservasGuia.filter(r => r.avaliacao).map(r => r.avaliacao);
    const media       = avaliacoes.reduce((a, b) => a + b, 0) / avaliacoes.length;

    await this.userRepo.update(reserva.guia_id, {
      avaliacao: parseFloat(media.toFixed(1)),
      total_avaliacoes: avaliacoes.length,
    });

    return reserva;
  }

  // ── 8. Listar reservas do cliente ──
  async reservasCliente(clienteId: string): Promise<Reserva[]> {
    return this.reservaRepo.find({
      where: { cliente_id: clienteId },
      order: { criado_em: 'DESC' },
    });
  }

  // ── 9. Listar reservas do guia ──
  async reservasGuia(guiaId: string): Promise<Reserva[]> {
    return this.reservaRepo.find({
      where: { guia_id: guiaId },
      order: { criado_em: 'DESC' },
    });
  }

  // ── 10. Ver reserva por ID ──
  async encontrarReserva(id: string): Promise<Reserva> {
    const reserva = await this.reservaRepo.findOne({ where: { id } });
    if (!reserva) throw new NotFoundException('Reserva não encontrada');
    return reserva;
  }
}