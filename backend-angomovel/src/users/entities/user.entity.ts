import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';

export enum UserRole {
  CLIENTE  = 'cliente',
  GUIA     = 'guia',
  EMPRESA  = 'empresa',
}

export enum Genero {
  MASCULINO   = 'masculino',
  FEMININO    = 'feminino',
  NAO_BINARIO = 'nao-binario',
  NAO_DIZER   = 'prefiro-nao-dizer',
}

export enum EstadoGuia {
  PENDENTE     = 'pendente',     // cadastrado, aguarda activação
  ACTIVO       = 'activo',       // empresa activou, aparece no app
  INACTIVO     = 'inactivo',     // empresa desactivou
  DISPONIVEL   = 'disponivel',   // activo e sem reservas em curso
  INDISPONIVEL = 'indisponivel', // em actividade com cliente
}

@Entity('users')
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  senha: string;

  @Column({ nullable: true, length: 20 })
  telefone: string;

  @Column({ nullable: true })
  idade: number;

  @Column({ type: 'enum', enum: Genero, nullable: true })
  genero: Genero;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENTE })
  role: UserRole;

  @Column({ nullable: true })
  foto: string;

  @Column({ default: true })
  ativo: boolean;

  // ── Campos do GUIA ──
  @Column({ nullable: true })
  especialidade: string;

  @Column({ nullable: true })
  provincia: string;

  @Column({ nullable: true })
  preco_por_dia: number;

  @Column({ type: 'simple-array', nullable: true })
  idiomas: string[];

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true, default: 0, type: 'float' })
  avaliacao: number;

  @Column({ nullable: true, default: 0 })
  total_avaliacoes: number;

  @Column({
    type: 'enum',
    enum: EstadoGuia,
    default: EstadoGuia.PENDENTE,
    nullable: true,
  })
  estado_guia: EstadoGuia;

  // Empresa que activou este guia
  @Column({ nullable: true })
  empresa_id: string;

  @Column({ nullable: true })
  empresa_nome: string;

  // ── Campos da EMPRESA ──
  @Column({ nullable: true })
  nome_empresa: string;

  @Column({ nullable: true })
  nif: string;

  @Column({ nullable: true })
  tipo_empresa: string;

  @Column({ nullable: true })
  plano: string;

  @Column({ nullable: true })
  plano_preco: number;

  @CreateDateColumn()
  criado_em: Date;

  @UpdateDateColumn()
  atualizado_em: Date;

  @BeforeInsert()
  async hashSenha() {
    if (this.senha) {
      this.senha = await bcrypt.hash(this.senha, 12);
    }
  }

  async verificarSenha(senhaPlana: string): Promise<boolean> {
    return bcrypt.compare(senhaPlana, this.senha);
  }
}