import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // ── Registar novo utilizador ──
  async registar(dto: RegisterDto) {
    // Criar o utilizador
    const user = await this.usersService.criar({
      ...dto,
      role: dto.role || UserRole.CLIENTE,
    });

    // Gerar token JWT
    const token = this.gerarToken(user.id, user.email, user.role);

    return {
      mensagem: 'Conta criada com sucesso! 🇦🇴',
      token,
      utilizador: {
        id:    user.id,
        nome:  user.nome,
        email: user.email,
        role:  user.role,
        foto:  user.foto,
      },
    };
  }

  // ── Login ──
  async login(dto: LoginDto) {
    // Encontrar utilizador por email (com senha)
    const user = await this.usersService.encontrarPorEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Email ou senha incorrectos');
    }

    if (!user.ativo) {
      throw new UnauthorizedException('Conta desactivada. Contacta o suporte.');
    }

    // Verificar senha
    const senhaCorrecta = await user.verificarSenha(dto.senha);
    if (!senhaCorrecta) {
      throw new UnauthorizedException('Email ou senha incorrectos');
    }

    // Gerar token JWT
    const token = this.gerarToken(user.id, user.email, user.role);

    return {
      mensagem: 'Login efectuado com sucesso!',
      token,
      utilizador: {
        id:           user.id,
        nome:         user.nome,
        email:        user.email,
        role:         user.role,
        foto:         user.foto,
        especialidade:user.especialidade,
        provincia:    user.provincia,
        nome_empresa: user.nome_empresa,
        plano:        user.plano,
      },
    };
  }

  // ── Gerar token JWT ──
  private gerarToken(id: string, email: string, role: UserRole): string {
    const payload = { sub: id, email, role };
    return this.jwtService.sign(payload);
  }

  // ── Verificar token ──
  async verificarToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}