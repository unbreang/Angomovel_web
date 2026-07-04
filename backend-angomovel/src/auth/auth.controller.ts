import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/roles.decorator';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  // ── POST /api/v1/auth/registar ──
  @Public()
  @Post('registar')
  async registar(@Body() dto: RegisterDto) {
    return this.authService.registar(dto);
  }

  // ── POST /api/v1/auth/login ──
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ── POST /api/v1/auth/recuperar-senha ──
  @Public()
  @Post('recuperar-senha')
  @HttpCode(HttpStatus.OK)
  async recuperarSenha(@Body() body: { email: string }) {
    return this.authService.pedirRecuperacaoSenha(body.email);
  }

  // ── POST /api/v1/auth/redefinir-senha ──
  @Public()
  @Post('redefinir-senha')
  @HttpCode(HttpStatus.OK)
  async redefinirSenha(@Body() body: { token: string; nova_senha: string }) {
    return this.authService.redefinirSenha(body.token, body.nova_senha);
  }

  // ── GET /api/v1/auth/perfil ──
  @Get('perfil')
  async perfil(@Request() req) {
    return {
      mensagem: 'Token válido',
      utilizador: req.user,
    };
  }
}