import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AvaliacoesService } from './avaliacoes.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/roles.decorator';

@Controller('avaliacoes')
@UseGuards(JwtAuthGuard)
export class AvaliacoesController {

  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  // ── POST /api/v1/avaliacoes ── criar avaliação
  @Post()
  async criar(@Request() req, @Body() dto: CreateAvaliacaoDto) {
    return this.avaliacoesService.criar(req.user.id, dto);
  }

  // ── GET /api/v1/avaliacoes/destino/:id ── listar por destino (público)
  @Public()
  @Get('destino/:id')
  async listarPorDestino(@Param('id') id: string) {
    return this.avaliacoesService.listarPorDestino(id);
  }

  // ── GET /api/v1/avaliacoes/minhas ── avaliações do utilizador
  @Get('minhas')
  async minhasAvaliacoes(@Request() req) {
    return this.avaliacoesService.listarPorUtilizador(req.user.id);
  }

  // ── PATCH /api/v1/avaliacoes/:id ── editar avaliação
  @Patch(':id')
  async editar(
    @Param('id') id: string,
    @Request() req,
    @Body() dados: Partial<CreateAvaliacaoDto>,
  ) {
    return this.avaliacoesService.editar(id, req.user.id, dados);
  }

  // ── DELETE /api/v1/avaliacoes/:id ── remover avaliação
  @Delete(':id')
  async remover(@Param('id') id: string, @Request() req) {
    return this.avaliacoesService.remover(id, req.user.id);
  }

  // ── PATCH /api/v1/avaliacoes/:id/util ── marcar como útil (público)
  @Public()
  @Patch(':id/util')
  async marcarUtil(@Param('id') id: string) {
    return this.avaliacoesService.marcarUtil(id);
  }

  // ── GET /api/v1/avaliacoes ── todas (admin)
  @Public()
  @Get()
  async listarTodas() {
    return this.avaliacoesService.listarTodas();
  }
}