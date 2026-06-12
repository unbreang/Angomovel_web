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
  import { Public } from '../auth/decorators/roles.decorator';

  @Public()
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
  // ── PATCH /api/v1/users/:id/ativar ── empresa activa guia
@Patch(':id/ativar')
async ativarGuia(@Param('id') id: string, @Request() req) {
    return this.usersService.ativarGuia(id, req.user.id);
}

// ── PATCH /api/v1/users/:id/desativar ── empresa desactiva guia
@Patch(':id/desativar')
async desativarGuia(@Param('id') id: string, @Request() req) {
    return this.usersService.desativarGuia(id, req.user.id);
}

// ── GET /api/v1/users/guias/todos ── todos os guias (para empresa)
@Get('guias/todos')
async todosGuias() {
    return this.usersService.listarTodosGuias();
}

// ── GET /api/v1/users/guias/empresa ── guias da minha empresa
@Get('guias/empresa')
async guiasDaEmpresa(@Request() req) {
    return this.usersService.listarGuiasDaEmpresa(req.user.id);
}
}