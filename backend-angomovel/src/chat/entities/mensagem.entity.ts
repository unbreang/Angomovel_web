import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('mensagens')
export class Mensagem {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ID da reserva a que pertence o chat
  @Column()
  reserva_id: string;

  // Quem enviou
  @Column()
  remetente_id: string;

  @Column()
  remetente_nome: string;

  @Column()
  remetente_role: string; // 'cliente' ou 'guia'

  // Conteúdo
  @Column({ type: 'text' })
  conteudo: string;

  // Lida ou não
  @Column({ default: false })
  lida: boolean;

  @CreateDateColumn()
  criado_em: Date;
}