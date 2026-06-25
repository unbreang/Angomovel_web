import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('avaliacoes')
export class Avaliacao {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Destino avaliado
  @Column()
  destino_id: string; // ID ou nome do destino

  @Column()
  destino_nome: string;

  // Quem avaliou
  @Column()
  utilizador_id: string;

  @Column()
  utilizador_nome: string;

  // Avaliação
  @Column({ type: 'float' })
  nota: number; // 1 a 5

  @Column({ nullable: true, type: 'text' })
  comentario: string;

  // Útil (likes)
  @Column({ default: 0 })
  util: number;

  @CreateDateColumn()
  criado_em: Date;
}