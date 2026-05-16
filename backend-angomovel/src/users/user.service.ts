import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ── Criar utilizador ──
  async criar(dto: CreateUserDto): Promise<User> {
    // Verificar se email já existe
    const existe = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existe) {
      throw new ConflictException('Este email já está registado');
    }

    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  // ── Encontrar por email (com senha para auth) ──
  async encontrarPorEmail(email: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.senha')
      .where('user.email = :email', { email })
      .getOne();
  }

  // ── Encontrar por ID ──
  async encontrarPorId(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilizador não encontrado');
    return user;
  }

  // ── Listar todos os guias ──
  async listarGuias(): Promise<User[]> {
    return this.userRepo.find({
      where: { role: UserRole.GUIA, ativo: true },
      select: [
        'id', 'nome', 'email', 'telefone', 'foto',
        'especialidade', 'provincia', 'preco_por_dia',
        'idiomas', 'bio', 'avaliacao', 'criado_em',
      ],
    });
  }

  // ── Listar todas as empresas ──
  async listarEmpresas(): Promise<User[]> {
    return this.userRepo.find({
      where: { role: UserRole.EMPRESA, ativo: true },
      select: [
        'id', 'nome', 'email', 'telefone',
        'nome_empresa', 'nif', 'tipo_empresa',
        'plano', 'criado_em',
      ],
    });
  }

  // ── Actualizar utilizador ──
  async atualizar(id: string, dados: Partial<User>): Promise<User> {
    await this.encontrarPorId(id);
    await this.userRepo.update(id, dados);
    return this.encontrarPorId(id);
  }

  // ── Desactivar utilizador ──
  async desativar(id: string): Promise<{ mensagem: string }> {
    await this.encontrarPorId(id);
    await this.userRepo.update(id, { ativo: false });
    return { mensagem: 'Utilizador desactivado com sucesso' };
  }
}