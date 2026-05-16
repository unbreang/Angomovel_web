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

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  // ── POST /api/v1/auth/registar ──
  @Post('registar')
  async registar(@Body() dto: RegisterDto) {
    return this.authService.registar(dto);
  }

  // ── POST /api/v1/auth/login ──
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ── GET /api/v1/auth/perfil ── (rota protegida)
  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  async perfil(@Request() req) {
    return {
      mensagem: 'Token válido',
      utilizador: req.user,
    };
  }
}