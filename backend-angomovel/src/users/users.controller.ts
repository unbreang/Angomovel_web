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
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Public } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  @Get('perfil')
  async meuPerfil(@Request() req) {
    return this.usersService.encontrarPorId(req.user.id);
  }

  @Patch('perfil')
  async atualizarPerfil(@Request() req, @Body() dados: any) {
    return this.usersService.atualizar(req.user.id, dados);
  }

  @Public()
  @Get('guias')
  async listarGuias() {
    return this.usersService.listarGuias();
  }

  @Get('guias/todos')
  async todosGuias() {
    return this.usersService.listarTodosGuias();
  }

  @Get('guias/empresa')
  async guiasDaEmpresa(@Request() req) {
    return this.usersService.listarGuiasDaEmpresa(req.user.id);
  }

  @Get('empresas')
  async listarEmpresas() {
    return this.usersService.listarEmpresas();
  }

  @Patch(':id/ativar')
  async ativarGuia(@Param('id') id: string, @Request() req) {
    return this.usersService.ativarGuia(id, req.user.id);
  }

  @Patch(':id/desativar')
  async desativarGuia(@Param('id') id: string, @Request() req) {
    return this.usersService.desativarGuia(id, req.user.id);
  }

  @Get(':id')
  async verUtilizador(@Param('id') id: string) {
    return this.usersService.encontrarPorId(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPRESA)
  async desativar(@Param('id') id: string) {
    return this.usersService.desativar(id);
  }
}