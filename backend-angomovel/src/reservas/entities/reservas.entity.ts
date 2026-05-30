import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EstadoReserva {
  PENDENTE   = 'pendente',   // cliente enviou pedido
  ACEITE     = 'aceite',     // guia aceitou
  RECUSADA   = 'recusada',   // guia recusou
  EM_CURSO   = 'em_curso',   // actividade a decorrer
  CONCLUIDA  = 'concluida',  // actividade terminada
  CANCELADA  = 'cancelada',  // cliente cancelou
}

export enum MetodoPagamento {
  DINHEIRO     = 'dinheiro',
  TRANSFERENCIA = 'transferencia',
  MULTICAIXA   = 'multicaixa',
  CARTAO       = 'cartao',
}

@Entity('reservas')
export class Reserva {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Quem reservou ──
  @Column()
  cliente_id: string;

  @Column()
  cliente_nome: string;

  @Column()
  cliente_email: string;

  @Column({ nullable: true })
  cliente_telefone: string;

  // ── Guia reservado ──
  @Column()
  guia_id: string;

  @Column()
  guia_nome: string;

  @Column({ nullable: true })
  guia_email: string;

  // ── Detalhes da reserva ──
  @Column({ type: 'date' })
  data_entrada: Date;

  @Column({ type: 'date' })
  data_saida: Date;

  @Column({ nullable: true, default: 1 })
  num_pessoas: number;

  @Column({ type: 'simple-array', nullable: true })
  rotas: string[]; // destinos que o cliente quer visitar

  @Column({ nullable: true, type: 'text' })
  observacoes: string;

  // ── Pagamento ──
  @Column({
    type: 'enum',
    enum: MetodoPagamento,
    default: MetodoPagamento.DINHEIRO,
  })
  metodo_pagamento: MetodoPagamento;

  @Column({ nullable: true, type: 'float' })
  valor_total: number;

  // ── Estado ──
  @Column({
    type: 'enum',
    enum: EstadoReserva,
    default: EstadoReserva.PENDENTE,
  })
  estado: EstadoReserva;

  @Column({ nullable: true, type: 'text' })
  motivo_recusa: string;

  // ── Avaliação após conclusão ──
  @Column({ nullable: true, type: 'float' })
  avaliacao: number;

  @Column({ nullable: true, type: 'text' })
  comentario: string;

  @CreateDateColumn()
  criado_em: Date;

  @UpdateDateColumn()
  atualizado_em: Date;
}