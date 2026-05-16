import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';

// ── Tipos de utilizador ──
export enum UserRole {
  CLIENTE  = 'cliente',
  GUIA     = 'guia',
  EMPRESA  = 'empresa',
}

// ── Género ──
export enum Genero {
  MASCULINO       = 'masculino',
  FEMININO        = 'feminino',
  NAO_BINARIO     = 'nao-binario',
  NAO_DIZER       = 'prefiro-nao-dizer',
}

@Entity('users')
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // nunca retorna a senha nas queries
  senha: string;

  @Column({ nullable: true, length: 20 })
  telefone: string;

  @Column({ nullable: true })
  idade: number;

  @Column({
    type: 'enum',
    enum: Genero,
    nullable: true,
  })
  genero: Genero;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENTE,
  })
  role: UserRole;

  @Column({ nullable: true })
  foto: string;

  @Column({ default: true })
  ativo: boolean;

  // ── Campos específicos do GUIA ──
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

  @Column({ nullable: true, default: 0 })
  avaliacao: number;

  // ── Campos específicos da EMPRESA ──
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

  // ── Hash da senha antes de guardar ──
  @BeforeInsert()
  async hashSenha() {
    if (this.senha) {
      this.senha = await bcrypt.hash(this.senha, 12);
    }
  }

  // ── Verificar senha ──
  async verificarSenha(senhaPlana: string): Promise<boolean> {
    return bcrypt.compare(senhaPlana, this.senha);
  }
}