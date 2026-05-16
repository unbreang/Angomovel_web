import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Request,
  Patch,
  Body,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard) // todas as rotas requerem autenticação
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  // ── GET /api/v1/users/perfil ── ver o próprio perfil
  @Get('perfil')
  async meuPerfil(@Request() req) {
    return this.usersService.encontrarPorId(req.user.id);
  }

  // ── PATCH /api/v1/users/perfil ── actualizar o próprio perfil
  @Patch('perfil')
  async atualizarPerfil(@Request() req, @Body() dados: any) {
    return this.usersService.atualizar(req.user.id, dados);
  }

  // ── GET /api/v1/users/guias ── listar todos os guias (público)
  @Get('guias')
  async listarGuias() {
    return this.usersService.listarGuias();
  }

  // ── GET /api/v1/users/empresas ── listar todas as empresas
  @Get('empresas')
  async listarEmpresas() {
    return this.usersService.listarEmpresas();
  }

  // ── GET /api/v1/users/:id ── ver utilizador por ID
  @Get(':id')
  async verUtilizador(@Param('id') id: string) {
    return this.usersService.encontrarPorId(id);
  }

  // ── DELETE /api/v1/users/:id ── desactivar utilizador (só admin)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPRESA)
  async desativar(@Param('id') id: string) {
    return this.usersService.desativar(id);
  }
}