import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

// Guardamos os tokens de recuperação em memória (simples e funcional)
const tokensRecuperacao = new Map<string, { email: string; expira: number }>();

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  // ── Registar ──
  async registar(dto: RegisterDto) {
    const user = await this.usersService.criar({
      ...dto,
      role: dto.role || UserRole.CLIENTE,
    });

    const token = this.gerarToken(user.id, user.email, user.role);

    // Enviar email de boas-vindas (não bloqueia se falhar)
    this.emailService.enviarBoasVindas(user.email, user.nome).catch(() => {});

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
    const user = await this.usersService.encontrarPorEmail(dto.email);

    if (!user) throw new UnauthorizedException('Email ou senha incorrectos');
    if (!user.ativo) throw new UnauthorizedException('Conta desactivada.');

    const senhaCorrecta = await user.verificarSenha(dto.senha);
    if (!senhaCorrecta) throw new UnauthorizedException('Email ou senha incorrectos');

    const token = this.gerarToken(user.id, user.email, user.role);

    return {
      mensagem: 'Login efectuado com sucesso!',
      token,
      utilizador: {
        id:            user.id,
        nome:          user.nome,
        email:         user.email,
        role:          user.role,
        foto:          user.foto,
        especialidade: user.especialidade,
        provincia:     user.provincia,
        nome_empresa:  user.nome_empresa,
        plano:         user.plano,
      },
    };
  }

  // ── Recuperar senha — passo 1: enviar email ──
  async pedirRecuperacaoSenha(email: string): Promise<{ mensagem: string }> {
    const user = await this.usersService.encontrarPorEmail(email);

    if (!user) {
      // Por segurança não revelamos se o email existe ou não
      return { mensagem: 'Se este email existir receberás um link de recuperação.' };
    }

    // Gerar token único
    const token  = crypto.randomBytes(32).toString('hex');
    const expira = Date.now() + 30 * 60 * 1000; // 30 minutos

    tokensRecuperacao.set(token, { email: user.email, expira });

    // Enviar email
    await this.emailService.enviarRecuperacaoSenha(user.email, user.nome, token);

    return { mensagem: 'Se este email existir receberás um link de recuperação.' };
  }

  // ── Recuperar senha — passo 2: redefinir senha ──
  async redefinirSenha(token: string, novaSenha: string): Promise<{ mensagem: string }> {
    const dados = tokensRecuperacao.get(token);

    if (!dados) throw new BadRequestException('Token inválido ou já utilizado.');
    if (Date.now() > dados.expira) {
      tokensRecuperacao.delete(token);
      throw new BadRequestException('Token expirado. Pede um novo link de recuperação.');
    }

    if (novaSenha.length < 6) throw new BadRequestException('A senha deve ter pelo menos 6 caracteres.');

    // Encontrar utilizador e actualizar senha
    const user = await this.usersService.encontrarPorEmail(dados.email);
    if (!user) throw new NotFoundException('Utilizador não encontrado.');

    const senhaHash = await bcrypt.hash(novaSenha, 12);
    await this.usersService.atualizar(user.id, { senha: senhaHash } as any);

    // Invalidar token após uso
    tokensRecuperacao.delete(token);

    return { mensagem: 'Senha redefinida com sucesso! Podes fazer login.' };
  }

  // ── Gerar token JWT ──
  private gerarToken(id: string, email: string, role: UserRole): string {
    return this.jwtService.sign({ sub: id, email, role });
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