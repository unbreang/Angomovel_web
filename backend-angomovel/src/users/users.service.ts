import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, EstadoGuia } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

 async criar(dto: CreateUserDto): Promise<User> {
    const existe = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existe) throw new ConflictException('Este email já está registado');

    const user = new User();
    Object.assign(user, dto);

    if (dto.role === UserRole.GUIA) {
        user.estado_guia = EstadoGuia.PENDENTE;
    }

    return this.userRepo.save(user);
}
CD 
  async encontrarPorEmail(email: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.senha')
      .where('user.email = :email', { email })
      .getOne();
  }

  async encontrarPorId(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilizador não encontrado');
    return user;
  }

  async listarGuias(): Promise<User[]> {
    return this.userRepo.find({
      where: { role: UserRole.GUIA, ativo: true, estado_guia: EstadoGuia.DISPONIVEL },
      select: [
        'id', 'nome', 'email', 'telefone', 'foto',
        'especialidade', 'provincia', 'preco_por_dia',
        'idiomas', 'bio', 'avaliacao', 'total_avaliacoes',
        'estado_guia', 'empresa_nome', 'criado_em',
      ],
    });
  }

  async listarTodosGuias(): Promise<User[]> {
    return this.userRepo.find({
      where: { role: UserRole.GUIA, ativo: true },
      select: [
        'id', 'nome', 'email', 'telefone', 'foto',
        'especialidade', 'provincia', 'preco_por_dia',
        'idiomas', 'bio', 'avaliacao', 'estado_guia',
        'empresa_id', 'empresa_nome', 'criado_em',
      ],
    });
  }

  async listarGuiasDaEmpresa(empresaId: string): Promise<User[]> {
    return this.userRepo.find({
      where: { role: UserRole.GUIA, empresa_id: empresaId },
      select: [
        'id', 'nome', 'email', 'telefone', 'foto',
        'especialidade', 'provincia', 'preco_por_dia',
        'idiomas', 'bio', 'avaliacao', 'estado_guia', 'criado_em',
      ],
    });
  }

  async ativarGuia(guiaId: string, empresaId: string): Promise<User> {
    const guia = await this.encontrarPorId(guiaId);
    if (guia.role !== UserRole.GUIA) throw new ForbiddenException('Este utilizador não é um guia');
    const empresa = await this.encontrarPorId(empresaId);
    await this.userRepo.update(guiaId, {
      estado_guia:  EstadoGuia.DISPONIVEL,
      empresa_id:   empresaId,
      empresa_nome: empresa.nome_empresa || empresa.nome,
    });
    return this.encontrarPorId(guiaId);
  }

  async desativarGuia(guiaId: string, empresaId: string): Promise<User> {
    const guia = await this.encontrarPorId(guiaId);
    if (guia.role !== UserRole.GUIA) throw new ForbiddenException('Este utilizador não é um guia');
    if (guia.empresa_id && guia.empresa_id !== empresaId) throw new ForbiddenException('Este guia pertence a outra empresa');
    await this.userRepo.update(guiaId, { estado_guia: EstadoGuia.INACTIVO });
    return this.encontrarPorId(guiaId);
  }

  async listarEmpresas(): Promise<User[]> {
    return this.userRepo.find({
      where: { role: UserRole.EMPRESA, ativo: true },
      select: ['id', 'nome', 'email', 'telefone', 'nome_empresa', 'nif', 'tipo_empresa', 'plano', 'criado_em'],
    });
  }

  async atualizar(id: string, dados: Partial<User>): Promise<User> {
    await this.encontrarPorId(id);
    await this.userRepo.update(id, dados);
    return this.encontrarPorId(id);
  }

  async desativar(id: string): Promise<{ mensagem: string }> {
    await this.encontrarPorId(id);
    await this.userRepo.update(id, { ativo: false });
    return { mensagem: 'Utilizador desactivado com sucesso' };
  }
}